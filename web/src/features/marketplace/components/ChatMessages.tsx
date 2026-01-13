import { useEffect, useRef, useState } from 'react'
import { Message as MessageComponent } from '@/shared/components/ui/message'
import { Input } from '@/shared/components/ui/input'
import { Button } from '@/shared/components/ui/button'
import { useChat } from '@/shared/contexts/ChatContext'
import { useUser } from '@/shared/contexts/UserContext'

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
          {messages.map(message => {
            // Normalize message content: some messages may be JSON strings like {"content":"..."}
            let displayContent = ''
            try {
              if (typeof message.content === 'string') {
                const trimmed = message.content.trim()
                if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
                  const parsed = JSON.parse(trimmed)
                  if (parsed && typeof parsed === 'object' && 'content' in parsed) {
                    displayContent = String(parsed.content)
                  } else {
                    // If it's an object without content, show a readable string
                    displayContent = JSON.stringify(parsed)
                  }
                } else {
                  displayContent = message.content
                }
              } else if (message.content && typeof message.content === 'object') {
                displayContent = 'content' in message.content ? String((message.content as any).content) : JSON.stringify(message.content)
              } else {
                displayContent = String(message.content)
              }
            } catch (err) {
              // Fallback: show raw content if parsing fails
              displayContent = String(message.content)
            }

            return (
              <MessageComponent
                key={message.id}
                content={displayContent}
                sender={message.sender}
                createdAt={message.createdAt}
                isOwn={message.sender.id === user?.id}
              />
            )
          })}
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