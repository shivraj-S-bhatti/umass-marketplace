import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { apiClient } from '@/features/marketplace/api/api'
import { Chat, Message, User } from '@/shared/types'
import { useToast } from '@/shared/hooks/use-toast'

// Helper function to convert API User to App User
function transformUser(apiUser: { id: string; name: string; pictureUrl?: string }): User {
  return {
    id: apiUser.id,
    name: apiUser.name,
    email: '', // API doesn't provide email, but our type requires it
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
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChat] = useState<Chat | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreMessages, setHasMoreMessages] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const latestMessageTimeRef = useRef<number>(0)

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (activeChat) {
      loadMessages(true)
    } else {
      // Reset messages when no active chat
      setMessages([])
      setCurrentPage(0)
      latestMessageTimeRef.current = 0
    }
  }, [activeChat])

  // Poll for new messages when a chat is active
  useEffect(() => {
    if (!activeChat) {
      latestMessageTimeRef.current = 0
      return
    }

    // Poll interval: check for new messages every 2 seconds
    const pollInterval = setInterval(async () => {
      try {
        // Fetch the latest page of messages (page 0, which contains the newest messages)
        const response = await apiClient.getChatMessages(activeChat.id, 0, 20)
        
        if (response.content.length === 0) return

        const transformedMessages = await Promise.all(
          response.content.map(msg => transformMessage(msg, activeChat.id))
        )

        // Get the latest message timestamp from ref
        const latestMessageTime = latestMessageTimeRef.current

        // Find new messages (messages created after our latest message)
        const newMessages = transformedMessages
          .reverse() // Reverse to get chronological order (oldest first)
          .filter(msg => {
            const msgTime = new Date(msg.createdAt).getTime()
            // Only include messages newer than our latest
            return msgTime > latestMessageTime
          })

        if (newMessages.length > 0) {
          // Add new messages to the end of the list
          setMessages(prev => {
            // Get existing message IDs to avoid duplicates
            const existingMessageIds = new Set(prev.map(m => m.id))
            const uniqueNewMessages = newMessages.filter(msg => !existingMessageIds.has(msg.id))
            
            if (uniqueNewMessages.length > 0) {
              // Update the latest message timestamp ref
              const newestMessage = uniqueNewMessages[uniqueNewMessages.length - 1]
              latestMessageTimeRef.current = new Date(newestMessage.createdAt).getTime()
              
              // Update the last message in the chat list
              setChats(prevChats =>
                prevChats.map(chat =>
                  chat.id === activeChat.id
                    ? { ...chat, lastMessage: newestMessage }
                    : chat
                )
              )
              
              return [...prev, ...uniqueNewMessages]
            }
            return prev
          })
        }
      } catch (error) {
        // Silently fail polling errors to avoid spam in console
        console.error('Failed to poll for new messages:', error)
      }
    }, 2000) // Poll every 2 seconds

    // Cleanup interval on unmount or when activeChat changes
    return () => {
      clearInterval(pollInterval)
    }
  }, [activeChat])

  async function transformChat(chat: any): Promise<Chat> {
    return {
      id: chat.id,
      listingId: chat.listing.id,
      listing: {
        ...chat.listing,
        condition: chat.listing.condition || 'Unknown',
        seller: transformUser(chat.seller) // use seller field from API
      },
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
      if (!token) {
        return
      }
      
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

      // Backend returns messages in DESC (newest first) per page.
      // For chat UI we want chronological order (oldest first -> newest last).
      // Reverse the messages within the page so they are oldest->newest for that page.
      const ordered = transformedMessages.slice().reverse()

      if (reset) {
        // For initial load, show the most recent page (reversed so oldest of that page is first)
        setMessages(ordered)
        // Update the latest message timestamp ref
        if (ordered.length > 0) {
          latestMessageTimeRef.current = new Date(ordered[ordered.length - 1].createdAt).getTime()
        }
      } else {
        // When loading older pages, prepend them above the current messages
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

  async function sendMessage(content: string) {
    if (!activeChat) return

    try {
      const apiMessage = await apiClient.sendMessage(activeChat.id, content)
      const transformedMessage = await transformMessage(apiMessage, activeChat.id)
      // New outgoing message should appear at the end (bottom)
      setMessages(prev => [...prev, transformedMessage])
      
      // Update the latest message timestamp ref
      latestMessageTimeRef.current = new Date(transformedMessage.createdAt).getTime()
      
      // Update the last message in the chat list
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

  async function startChat(listingId: string) {
    try {
      const apiChat = await apiClient.startChat(listingId)
      const transformedChat = await transformChat(apiChat)
      setChats(prev => {
        if (prev.some(c => c.id === transformedChat.id)) {
          return prev
        }
        return [transformedChat, ...prev]
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