import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ShoppingCart, Trash2, Plus, Minus } from 'lucide-react'
import { StickerBadge } from '@/components/ui/sticker-badge'

// Cart Page - Shopping cart for buyers
// TODO: Implement actual cart functionality with backend integration
export default function CartPage() {
  // Placeholder cart items - will be replaced with actual cart state
  const cartItems: Array<{
    id: string
    title: string
    price: number
    quantity: number
    imageUrl?: string
  }> = []

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.0625 // MA state tax (6.25%)
  const total = subtotal + tax

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

        {cartItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-bold mb-2">Your cart is empty</h3>
              <p className="text-muted-foreground mb-6 text-center">
                Start shopping to add items to your cart
              </p>
              <Button asChild>
                <a href="/">Browse Listings</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-3">
              {cartItems.map((item) => (
                <Card key={item.id} className="hover:shadow-comic transition-all">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {/* Item Image */}
                      <div className="w-24 h-24 rounded-comic bg-muted flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover rounded-comic"
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

                        {/* Quantity Controls */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center gap-2 border-2 border-foreground rounded-comic">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none rounded-l-comic"
                              onClick={() => {
                                // TODO: Decrease quantity
                              }}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="px-3 font-bold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-none rounded-r-comic"
                              onClick={() => {
                                // TODO: Increase quantity
                              }}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              // TODO: Remove item from cart
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {formatPrice(item.price * item.quantity)}
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
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (6.25%)</span>
                  <span className="font-bold">{formatPrice(tax)}</span>
                </div>
                <div className="border-t-2 border-foreground pt-3 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <StickerBadge variant="price" className="text-xl">
                    {formatPrice(total)}
                  </StickerBadge>
                </div>
                <Button className="w-full mt-4" size="lg">
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/">Continue Shopping</a>
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

