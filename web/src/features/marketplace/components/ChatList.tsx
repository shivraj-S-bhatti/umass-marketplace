import { Chat, User } from '@/features/marketplace/api/api'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { cn } from '@/shared/lib/utils/utils'
import { format } from 'date-fns'

interface ChatListItemProps {
  chat: Chat
  isActive: boolean
  onClick: () => void
  currentUser: User
}

export function ChatListItem({ chat, isActive, onClick, currentUser }: ChatListItemProps) {
  const otherUser = chat.buyer.id === currentUser.id ? chat.seller : chat.buyer

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-3 w-full p-3 text-left hover:bg-muted/50 transition-colors',
        {
          'bg-muted': isActive,
        }
      )}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={otherUser.pictureUrl} alt={otherUser.name} />
        <AvatarFallback>{otherUser.name[0]}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium truncate">{otherUser.name}</p>
            <p className="text-sm text-muted-foreground truncate">
              {chat.listing?.title || 'Direct conversation'}
            </p>
          </div>
          {chat.lastMessage && (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {format(new Date(chat.lastMessage.createdAt), 'p')}
            </span>
          )}
        </div>
        
        {chat.lastMessage && (
          <p className="text-sm text-muted-foreground truncate mt-1">
            {chat.lastMessage.content}
          </p>
        )}
      </div>
    </button>
  )
}

interface ChatListProps {
  chats: Chat[]
  activeChat: Chat | null
  onChatSelect: (chat: Chat) => void
  currentUser: User
}

export function ChatList({ chats, activeChat, onChatSelect, currentUser }: ChatListProps) {
  if (chats.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No chats yet
      </div>
    )
  }

  return (
    <div className="divide-y">
      {chats.map(chat => (
        <ChatListItem
          key={chat.id}
          chat={chat}
          isActive={activeChat?.id === chat.id}
          onClick={() => onChatSelect(chat)}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}
