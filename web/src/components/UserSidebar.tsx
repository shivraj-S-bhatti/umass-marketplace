import React, { useState } from 'react'
import { X, User, MessageCircle, Settings, Heart, Package, History } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useUser } from '@/contexts/UserContext'

/**
 * UserSidebar - Minimal sidebar component for future user features
 * 
 * Future features to add:
 * - User Profile/Settings
 * - Chat/Messaging (buyer-seller communication)
 * - Saved Items/Wishlist
 * - Purchase History (buyers)
 * - Selling Tools (sellers)
 * - Account Management
 */
interface UserSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function UserSidebar({ isOpen, onClose }: UserSidebarProps) {
  const { user, isSeller } = useUser()

  // Future sidebar items - currently disabled/placeholder
  const sidebarItems = [
    {
      label: 'Profile',
      icon: User,
      path: '/profile', // TODO: Create profile page
      enabled: false,
    },
    {
      label: 'Messages',
      icon: MessageCircle,
      path: '/messages', // TODO: Create chat/messaging system
      enabled: false,
      badge: 0, // Future: unread message count
    },
    {
      label: 'Saved Items',
      icon: Heart,
      path: '/saved', // TODO: Create saved items/wishlist
      enabled: false,
    },
    {
      label: 'Purchase History',
      icon: History,
      path: '/history', // TODO: Create purchase history for buyers
      enabled: false,
      showOnlyFor: 'buyer' as const,
    },
    {
      label: 'My Orders',
      icon: Package,
      path: '/orders', // TODO: Create order management for sellers
      enabled: false,
      showOnlyFor: 'seller' as const,
    },
    {
      label: 'Settings',
      icon: Settings,
      path: '/settings', // TODO: Create settings page
      enabled: false,
    },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative
          top-0 right-0
          w-64
          shrink-0
          bg-card border-l-4 md:border-l-0 md:border-r-4 border-foreground paper-texture
          z-50 md:z-auto
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
          h-screen md:h-full
          flex flex-col
        `}
      >
        <div className="flex items-center justify-between p-4 border-b-4 border-foreground">
          <h2 className="text-lg font-bold">Account</h2>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-accent rounded-comic"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {user ? (
            <nav className="space-y-1">
              {sidebarItems
                .filter((item) => {
                  if (item.showOnlyFor === 'buyer' && isSeller) return false
                  if (item.showOnlyFor === 'seller' && !isSeller) return false
                  return true
                })
                .map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.path}
                      to={item.enabled ? item.path : '#'}
                      onClick={(e) => {
                        if (!item.enabled) {
                          e.preventDefault()
                          // TODO: Show "Coming soon" toast
                        }
                      }}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-comic text-sm font-medium transition-colors
                        ${item.enabled
                          ? 'hover:bg-accent text-foreground cursor-pointer'
                          : 'text-muted-foreground cursor-not-allowed opacity-50'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
            </nav>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">Please log in to access account features</p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
