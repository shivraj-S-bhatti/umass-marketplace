import { User } from '@/shared/types/types'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { cn } from '@/shared/lib/utils/utils'
import { format } from 'date-fns'

interface MessageProps {
  content: string
  sender: User
  createdAt: string
  isOwn: boolean
}

export function Message({ content, sender, createdAt, isOwn }: MessageProps) {
  return (
    <div
      className={cn('flex gap-2 mb-4', {
        'flex-row-reverse': isOwn,
      })}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage src={sender.pictureUrl} alt={sender.name} />
        <AvatarFallback>{sender.name[0]}</AvatarFallback>
      </Avatar>
      <div
        className={cn('flex flex-col max-w-[70%]', {
          'items-end': isOwn,
        })}
      >
        <div
          className={cn('rounded-lg px-3 py-2', {
            'bg-primary text-primary-foreground': isOwn,
            'bg-muted': !isOwn,
          })}
        >
          <p className="text-sm">{content}</p>
        </div>
        <span className="text-xs text-muted-foreground mt-1">
          {format(new Date(createdAt), 'p')}
        </span>
      </div>
    </div>
  )
}