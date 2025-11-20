import { useEffect, useRef, useState } from 'react'
import { Message as MessageComponent } from './ui/message'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { useChat } from '@/contexts/ChatContext'
import { useUser } from '@/contexts/UserContext'

export function ChatMessages() {
  const { messages, sendMessage, hasMoreMessages, loadMoreMessages, loading } = useChat()
  const { user } = useUser()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [newMessage, setNewMessage] = useState('')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    await sendMessage(newMessage)
    setNewMessage('')
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {hasMoreMessages && (
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={loadMoreMessages}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Messages'}
          </Button>
        )}
        
        <div className="space-y-4">
          {messages.map(message => (
            <MessageComponent
              key={message.id}
              content={message.content}
              sender={message.sender}
              createdAt={message.createdAt}
              isOwn={message.sender.id === user?.id}
            />
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  )
}