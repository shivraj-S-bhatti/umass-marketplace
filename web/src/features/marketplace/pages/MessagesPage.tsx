import { ArrowLeft } from 'lucide-react'
import { useUser } from '@/shared/contexts/UserContext'
import { ChatList } from '@/features/marketplace/components/ChatList'
import { ChatMessages } from '@/features/marketplace/components/ChatMessages'
import { useChat } from '@/shared/contexts/ChatContext'
import { cn } from '@/shared/lib/utils/utils'

export function MessagesLayout() {
  const { user } = useUser()
  const { chats, activeChat, setActiveChat } = useChat()

  if (!user) {
    return null
  }

  return (
    <div className="flex justify-center w-full min-h-0 flex-1">
      <div className="grid grid-cols-1 md:grid-cols-[min(400px,100%)_1fr] w-full max-w-5xl h-[calc(100vh-4rem)] divide-x divide-border">
        {/* List: full width on mobile when no chat selected; hidden on mobile when thread open; always visible on desktop */}
        <div className={cn('overflow-y-auto', activeChat && 'hidden md:block')}>
        <ChatList
          chats={chats}
          activeChat={activeChat}
          onChatSelect={setActiveChat}
          currentUser={user}
        />
      </div>
      {/* Thread: on mobile only when a chat is selected; on desktop always show (empty state or messages) */}
      <div className={cn('flex flex-col min-h-0', !activeChat && 'hidden md:flex')}>
        {/* Mobile-only back bar */}
        {activeChat && (
          <div className="flex md:hidden items-center gap-2 p-2 border-b border-border bg-card flex-shrink-0">
            <button
              type="button"
              onClick={() => setActiveChat(null)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors"
              aria-label="Back to conversations"
            >
              <ArrowLeft className="h-5 w-5" />
              Conversations
            </button>
          </div>
        )}
        {activeChat ? (
          <ChatMessages />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground text-center px-4">
            Select a chat to start messaging
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

/** Messages use app-level ChatProvider; no duplicate provider here */
export default function MessagesPage() {
  return <MessagesLayout />
}