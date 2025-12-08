import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2 } from 'lucide-react'
import { StickerBadge } from '@/components/ui/sticker-badge'
import { useCart } from '@/contexts/CartContext'
import { useNavigate } from 'react-router-dom'

// Cart Page - Shopping cart for buyers
// Allows users to manage items in their cart
export default function CartPage() {
  const { items, removeFromCart, cartTotal } = useCart()
  const navigate = useNavigate()

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numPrice)
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Shopping Cart</h1>
          <p className="text-base text-muted-foreground">
            Review your items before checkout
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Start shopping to add items to your cart
              </p>
              <Button onClick={() => navigate('/')}>
                Browse Listings
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <ShoppingCart className="h-8 w-8 text-muted-foreground opacity-50" />
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                          <div className="flex items-center gap-2">
                            <StickerBadge variant="price" className="text-base">
                              {formatPrice(item.price)}
                            </StickerBadge>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive w-fit mt-4"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      </div>

                      {/* Item Price */}
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total ({items.length} items)</span>
                  <span className="font-bold">{formatPrice(cartTotal)}</span>
                </div>
                <div className="border-t-2 border-foreground pt-3 flex justify-between">
                  <span className="font-bold text-lg">Amount</span>
                  <StickerBadge variant="price" className="text-xl">
                    {formatPrice(cartTotal)}
                  </StickerBadge>
                </div>
                <Button className="w-full mt-4" size="lg">
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
                  Continue Shopping
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

