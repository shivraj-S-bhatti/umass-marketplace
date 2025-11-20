import { createContext, useContext, useEffect, useState } from 'react'
import { apiClient } from '../lib/api'
import { Chat, Message, User } from '../types'
import { useToast } from '../hooks/use-toast'

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

  useEffect(() => {
    loadChats()
  }, [])

  useEffect(() => {
    if (activeChat) {
      loadMessages(true)
    }
  }, [activeChat])

  async function transformChat(chat: any): Promise<Chat> {
    return {
      id: chat.id,
      listingId: chat.listing.id,
      listing: {
        ...chat.listing,
        condition: chat.listing.condition || 'Unknown',
        seller: transformUser(chat.participants[1]) // Assuming seller is always second participant
      },
      buyer: transformUser(chat.participants[0]),
      seller: transformUser(chat.participants[1]),
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
        console.log('No auth token found, skipping chat load')
        return
      }
      
      console.log('Loading chats...')
      const apiChats = await apiClient.getUserChats()
      console.log('Received chats:', apiChats)
      
      const transformedChats = await Promise.all(apiChats.map(transformChat))
      console.log('Transformed chats:', transformedChats)
      
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

      if (reset) {
        setMessages(transformedMessages)
      } else {
        setMessages(prev => [...prev, ...transformedMessages])
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
      setMessages(prev => [transformedMessage, ...prev])
      
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