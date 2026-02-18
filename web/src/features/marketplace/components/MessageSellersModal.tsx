import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Copy, Mail } from 'lucide-react'
import { useToast } from '@/shared/hooks/use-toast'
import { formatPrice } from '@/shared/lib/utils/utils'
import type { CartItem } from '@/shared/contexts/CartContext'

export interface SellerGroup {
  sellerId: string
  sellerName: string
  sellerEmail: string
  items: CartItem[]
}

export function buildMessageForSeller(items: CartItem[]): string {
  const itemList = items
    .map((i) => `${i.title} (${formatPrice(i.price)})`)
    .join(', ')
  return `Hey! I'm interested in these items: ${itemList}. Are they still available? When/where can I pick up?`
}

interface MessageSellersModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sellerGroups: SellerGroup[]
}

export function MessageSellersModal({ open, onOpenChange, sellerGroups }: MessageSellersModalProps) {
  const { toast } = useToast()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">Message sellers</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Review and edit the message below for each seller, then copy or open in email.
        </p>
        <div className="space-y-4 mt-2">
          {sellerGroups.map((group) => (
            <SellerMessageBlock
              key={group.sellerId}
              group={group}
              onCopy={() => {
                toast({
                  title: 'Copied',
                  description: 'Paste into WhatsApp or email.',
                })
              }}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SellerMessageBlock({
  group,
  onCopy,
}: {
  group: SellerGroup
  onCopy: () => void
}) {
  const defaultMessage = buildMessageForSeller(group.items)
  const [message, setMessage] = useState(defaultMessage)
  useEffect(() => {
    setMessage(defaultMessage)
  }, [defaultMessage])

  const handleCopy = () => {
    navigator.clipboard.writeText(message)
    onCopy()
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(`Interest in your listings`)
    const body = encodeURIComponent(message)
    window.location.href = `mailto:${group.sellerEmail}?subject=${subject}&body=${body}`
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <p className="text-sm font-semibold">Seller: {group.sellerName || 'Unknown'}</p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full min-h-[80px] rounded-md border border-input bg-card px-3 py-2 text-sm resize-y"
        placeholder="Message to seller..."
      />
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
          <Copy className="h-3.5 w-3.5" />
          Copy message
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={handleEmail} className="gap-1.5">
          <Mail className="h-3.5 w-3.5" />
          Open in Email
        </Button>
      </div>
    </div>
  )
}

