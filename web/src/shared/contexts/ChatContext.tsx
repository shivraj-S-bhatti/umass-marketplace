import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { Client } from '@stomp/stompjs'
import { apiClient } from '@/features/marketplace/api/api'
import { Chat, Message, User } from '@/shared/types'
import { useToast } from '@/shared/hooks/use-toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
// Use native STOMP endpoint. SockJS adds /websocket internally; brokerURL should target /ws.
const WS_URL = API_BASE.replace(/^http/, 'ws').replace(/\/$/, '') + '/ws'

function transformUser(apiUser: { id: string; name: string; pictureUrl?: string }): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: '',
    pictureUrl: apiUser.pictureUrl
  }
}

interface ChatContextValue {
  chats: Chat[]
  activeChat: Chat | null
  messages: Message[]
  sendMessage: (content: string) => Promise<void>
  setActiveChat: (chat: Chat | null) => void
  startChat: (listingId: string) => Promise<void>
  loadMoreMessages: () => Promise<void>
  hasMoreMessages: boolean
  loading: boolean
  connected: boolean
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const { toast } = useToast()

  const stompClientRef = useRef<Client | null>(null)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const activeChatRef = useRef<Chat | null>(null)

  // Keep ref in sync with state
  useEffect(() => {
    activeChatRef.current = activeChat
  }, [activeChat])

  // Connect WebSocket on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    let client: Client
    try {
      client = new Client({
        brokerURL: WS_URL,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 10000,
        heartbeatOutgoing: 10000,
        onConnect: () => {
          console.log('WebSocket connected')
          setConnected(true)
        },
        onDisconnect: () => {
          setConnected(false)
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame.headers['message'])
          setConnected(false)
        },
        onWebSocketError: (event) => {
          console.warn('WebSocket connection error, will use REST fallback', event)
          setConnected(false)
        },
      })

      client.activate()
      stompClientRef.current = client
    } catch (err) {
      console.warn('Failed to initialize WebSocket, using REST fallback:', err)
      return
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      client.deactivate()
      stompClientRef.current = null
      setConnected(false)
    }
  }, [])

  // Subscribe to active chat topic
  useEffect(() => {
    // Unsubscribe from previous chat
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
      subscriptionRef.current = null
    }

    if (!activeChat || !stompClientRef.current?.connected) return

    const sub = stompClientRef.current.subscribe(
      `/topic/chat/${activeChat.id}`,
      (stompMessage) => {
        try {
          const msg = JSON.parse(stompMessage.body)
          const incoming: Message = {
            id: msg.id,
            chatId: activeChatRef.current?.id || activeChat.id,
            sender: transformUser(msg.sender),
            content: msg.content,
            sharedListingId: msg.sharedListingId,
            sharedListing: msg.sharedListing,
            createdAt: msg.createdAt,
          }

          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev
            return [...prev, incoming]
          })

          setChats((prev) =>
            prev.map((chat) =>
              chat.id === (activeChatRef.current?.id || activeChat.id)
                ? { ...chat, lastMessage: incoming }
                : chat
            )
          )
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }
    )

    subscriptionRef.current = sub

    return () => {
      sub.unsubscribe()
      subscriptionRef.current = null
    }
  }, [activeChat?.id, connected])

  // Load chats on mount
  useEffect(() => {
    loadChats()
  }, [])

  // Load messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      loadMessages(true)
    } else {
      setMessages([])
      setCurrentPage(0)
    }
  }, [activeChat])

  async function transformChat(chat: any): Promise<Chat> {
    const listing = chat.listing ? {
      ...chat.listing,
      condition: chat.listing.condition || 'Unknown',
      seller: transformUser(chat.seller)
    } : undefined

    return {
      id: chat.id,
      listingId: listing?.id,
      listing,
      buyer: transformUser(chat.buyer),
      seller: transformUser(chat.seller),
      lastMessage: chat.lastMessage ? {
        id: chat.lastMessage.id,
        chatId: chat.id,
        content: chat.lastMessage.content,
        sender: transformUser(chat.lastMessage.sender),
        createdAt: chat.lastMessage.createdAt
      } : undefined,
      createdAt: chat.createdAt
    }
  }

  async function loadChats() {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const apiChats = await apiClient.getUserChats()
      const transformedChats = await Promise.all(apiChats.map(transformChat))
      setChats(transformedChats)
    } catch (error) {
      console.error('Failed to load chats:', error)
      toast({
        title: 'Error',
        description: 'Failed to load chats. Please try again later.',
        variant: 'destructive',
      })
    }
  }

  async function transformMessage(msg: any, chatId: string): Promise<Message> {
    return {
      id: msg.id,
      chatId: chatId,
      sender: transformUser(msg.sender),
      content: msg.content,
      sharedListingId: msg.sharedListingId,
      sharedListing: msg.sharedListing,
      createdAt: msg.createdAt
    }
  }

  async function loadMessages(reset = false) {
    if (!activeChat) return

    try {
      setLoading(true)
      const page = reset ? 0 : currentPage
      const response = await apiClient.getChatMessages(activeChat.id, page)

      const transformedMessages = await Promise.all(
        response.content.map(msg => transformMessage(msg, activeChat.id))
      )

      const ordered = transformedMessages.slice().reverse()

      if (reset) {
        setMessages(ordered)
      } else {
        setMessages(prev => [...ordered, ...prev])
      }

      setHasMoreMessages(page + 1 < response.totalPages)
      setCurrentPage(page + 1)
    } catch (error) {
      console.error('Failed to load messages:', error)
      toast({
        title: 'Error',
        description: 'Failed to load messages. Please try again later.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = useCallback(async (content: string) => {
    if (!activeChat) return

    const client = stompClientRef.current
    if (client?.connected) {
      // Send via WebSocket — the server broadcasts back to /topic/chat/{id}
      client.publish({
        destination: `/app/chat/${activeChat.id}`,
        body: content,
      })
    } else {
      // Fallback to REST if WebSocket is not connected
      try {
        const apiMessage = await apiClient.sendMessage(activeChat.id, content)
        const transformedMessage = await transformMessage(apiMessage, activeChat.id)
        setMessages(prev => {
          if (prev.some(m => m.id === transformedMessage.id)) return prev
          return [...prev, transformedMessage]
        })
        setChats(prev =>
          prev.map(chat =>
            chat.id === activeChat.id
              ? { ...chat, lastMessage: transformedMessage }
              : chat
          )
        )
      } catch (error) {
        console.error('Failed to send message:', error)
        toast({
          title: 'Error',
          description: 'Failed to send message. Please try again.',
          variant: 'destructive',
        })
      }
    }
  }, [activeChat, toast])

  async function startChat(listingId: string) {
    try {
      const apiChat = await apiClient.startChat(listingId)
      const transformedChat = await transformChat(apiChat)
      setChats(prev => {
        const withoutCurrent = prev.filter(c => c.id !== transformedChat.id)
        return [transformedChat, ...withoutCurrent]
      })
      setActiveChat(transformedChat)
    } catch (error) {
      console.error('Failed to start chat:', error)
      toast({
        title: 'Error',
        description: 'Failed to start chat. Please try again.',
        variant: 'destructive',
      })
    }
  }

  const value: ChatContextValue = {
    chats,
    activeChat,
    messages,
    sendMessage,
    setActiveChat,
    startChat,
    loadMoreMessages: () => loadMessages(false),
    hasMoreMessages,
    loading,
    connected,
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider')
  }
  return context
}
