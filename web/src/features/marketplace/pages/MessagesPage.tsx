import { ChatProvider } from '@/shared/contexts/ChatContext'
import { useUser } from '@/shared/contexts/UserContext'
import { ChatList } from '@/features/marketplace/components/ChatList'
import { ChatMessages } from '@/features/marketplace/components/ChatMessages'
import { useChat } from '@/shared/contexts/ChatContext'

export function MessagesLayout() {
  const { user } = useUser()
  const { chats, activeChat, setActiveChat } = useChat()

  if (!user) {
    return null
  }

  return (
    <div className="grid grid-cols-[350px_1fr] h-[calc(100vh-4rem)] divide-x">
      <div className="overflow-y-auto">
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          currentUser={user}
        />
      </div>
      <div className="flex flex-col">
        {activeChat ? (
          <ChatMessages />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <ChatProvider>
      <MessagesLayout />
    </ChatProvider>
  )
}