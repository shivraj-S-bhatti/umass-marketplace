import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Listing } from '@/features/marketplace/api/api'

export interface CartItem extends Listing {
  quantity: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (listing: Listing) => void
  removeFromCart: (listingId: string) => void
  updateQuantity: (listingId: string, quantity: number) => void
  clearCart: () => void
  cartTotal: number
  cartCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Load cart from localStorage on initialization
    const savedCart = localStorage.getItem('cart')
    return savedCart ? JSON.parse(savedCart) : []
  })

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addToCart = (listing: Listing) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === listing.id)

      if (existingItem) {
        // If item already in cart, don't add it again
        return prevItems
      } else {
        // Add new item to cart
        return [...prevItems, { ...listing, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (listingId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== listingId))
  }

  const updateQuantity = (listingId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(listingId)
    } else {
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === listingId ? { ...item, quantity } : item
        )
      )
    }
  }

  const clearCart = () => {
    setItems([])
  }

  const cartTotal = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
