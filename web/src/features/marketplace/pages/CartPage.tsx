import { useMemo, useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Bookmark, Trash2, MessageCircle } from 'lucide-react'
import { useCart } from '@/shared/contexts/CartContext'
import { useNavigate } from 'react-router-dom'
import { formatPrice } from '@/shared/lib/utils/utils'
import { useToast } from '@/shared/hooks/use-toast'
import type { CartItem } from '@/shared/contexts/CartContext'
import { MessageSellersModal, type SellerGroup } from '@/features/marketplace/components/MessageSellersModal'

function groupBySeller(items: CartItem[]): SellerGroup[] {
  const map = new Map<string, { sellerName: string; sellerEmail: string; items: CartItem[] }>()
  for (const item of items) {
    const id = item.sellerId ?? 'unknown'
    const existing = map.get(id)
    const name = item.sellerName ?? 'Unknown'
    const email = item.sellerEmail ?? ''
    if (existing) {
      existing.items.push(item)
    } else {
      map.set(id, { sellerName: name, sellerEmail: email, items: [item] })
    }
  }
  return Array.from(map.entries()).map(([sellerId, v]) => ({
    sellerId,
    sellerName: v.sellerName,
    sellerEmail: v.sellerEmail,
    items: v.items,
  }))
}

export default function CartPage() {
  const { items, removeFromCart } = useCart()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [outreachOpen, setOutreachOpen] = useState(false)

  const sellerGroups = useMemo(() => groupBySeller(items), [items])

  return (
    <div className="container mx-auto px-4 py-4 max-w-4xl">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Saved Items</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Message sellers to arrange pickup.
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => navigate('/marketplace')}>
              Back to marketplace
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="rounded-lg border border-border bg-card flex flex-col items-center justify-center py-12 px-4">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
            <h3 className="text-base font-semibold mb-1">No saved items</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center">
              Save listings you like, then message sellers from here.
            </p>
            <Button onClick={() => navigate('/marketplace')} size="sm">
              Browse Listings
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sellerGroups.map((group) => {
              const groupTotal = group.items.reduce((sum, i) => sum + Number(i.price) * (i.quantity ?? 1), 0)
              const itemCount = group.items.length
              return (
                <div key={group.sellerId} className="rounded-lg border border-border bg-card overflow-hidden">
                  <div className="px-3 py-2 bg-muted/40 border-b border-border flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Seller: {group.sellerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {itemCount} item{itemCount !== 1 ? 's' : ''} · Total ~{formatPrice(groupTotal)}
                    </p>
                  </div>
                  <ul className="divide-y divide-border">
                    {group.items.map((item) => (
                      <li key={item.id} className="flex items-center gap-3 px-3 py-2">
                        <div className="w-16 h-16 rounded-md bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Bookmark className="h-6 w-6 text-muted-foreground opacity-50" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.title}</p>
                          <p className="text-sm text-muted-foreground">{formatPrice(item.price)}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive shrink-0 h-8 w-8"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <div className="px-3 py-2 flex flex-wrap gap-2 border-t border-border bg-muted/20">
                    <Button
                      size="sm"
                      className="gap-1.5"
                      onClick={() => setOutreachOpen(true)}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Message seller
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const body = encodeURIComponent(
                          `Hey! I'm interested in these items: ${group.items.map((i) => `${i.title} (${formatPrice(i.price)})`).join(', ')}. Are they still available? When/where can I pick up?`
                        )
                        window.location.href = `mailto:${group.sellerEmail}?subject=Interest in your listings&body=${body}`
                      }}
                      disabled={!group.sellerEmail}
                    >
                      Email seller
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        const msg = `Hey! I'm interested in these items: ${group.items.map((i) => `${i.title} (${formatPrice(i.price)})`).join(', ')}. Are they still available? When/where can I pick up?`
                        navigator.clipboard.writeText(msg)
                        toast({ title: 'Copied', description: 'Paste into WhatsApp or email.' })
                      }}
                    >
                      Copy message
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <MessageSellersModal
        open={outreachOpen}
        onOpenChange={setOutreachOpen}
        sellerGroups={sellerGroups}
      />
    </div>
  )
}
