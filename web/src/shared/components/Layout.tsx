import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { ShoppingBag, Plus, LayoutDashboard, LogIn, MessageSquare, ShoppingCart, Calendar, Users, Trophy, Store, Sun, Moon } from 'lucide-react'
import { UserRole, useUser } from '@/shared/contexts/UserContext'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import Logo from '@/shared/components/Logo'
import { useEffect } from 'react'

// Layout component for Everything UMass
// Provides consistent navigation and page structure across the application
interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, setRole, isSeller, isBuyer, user } = useUser()
  const { theme, toggleTheme } = useTheme()

  // Navigation items - same for both modes, but will show/hide based on mode
  const allNavItems = [
    { path: '/', label: 'Explore', icon: ShoppingBag, showIn: ['buyer', 'seller'] as UserRole[] },
    { path: '/sell', label: 'Sell', icon: Plus, showIn: ['seller'] as UserRole[] },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, showIn: ['seller'] as UserRole[] },
    // { path: '/design-playground', label: 'Design', icon: Palette, showIn: ['buyer', 'seller'] as UserRole[] }, // Hidden for demo
    { path: '/messages', label: 'Messages', icon: MessageSquare, showIn: ['buyer', 'seller'] as UserRole[] },
  ]

  // Filter nav items based on current mode
  const navItems = allNavItems.filter(item => item.showIn.includes(role))

  // Handle role change and cart access logic
  useEffect(() => {
    // If user is on cart page and switches to seller mode, redirect to dashboard
    if (location.pathname === '/cart' && isSeller) {
      navigate('/dashboard')
    }
  }, [role, location.pathname, isSeller, navigate])

  // Handle cart access - auto-switch to buyer if accessing cart via URL
  useEffect(() => {
    if (location.pathname === '/cart' && !isBuyer) {
      setRole('buyer')
    }
  }, [location.pathname, isBuyer, setRole])

  // Handle role toggle with redirect logic
  const handleRoleChange = (newRole: 'buyer' | 'seller') => {
    // If switching from buyer to seller while on cart, redirect to dashboard
    if (location.pathname === '/cart' && newRole === 'seller') {
      setRole(newRole)
      navigate('/dashboard')
    } else {
      setRole(newRole)
    }
  }

  // Top-tier navigation items for future enhancements
  const topTierNavItems = [
    { path: '/', label: 'Marketplace', icon: Store },
    { path: '/events', label: 'Event Hub', icon: Calendar },
    { path: '/common-room', label: 'Common Room', icon: MessageSquare },
    { path: '/clubs', label: 'Clubs', icon: Users },
    { path: '/sports', label: 'Sports', icon: Trophy },
  ]

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Top-tier nav */}
      <nav className="border-b border-border bg-card relative z-10">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="flex items-center justify-center gap-1 md:gap-2 overflow-x-auto">
            {topTierNavItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path || 
                (path === '/' && location.pathname === '/') ||
                (path !== '/' && location.pathname.startsWith(path))
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-3 w-3 md:h-4 md:w-4" />
                  <span className="hidden sm:inline">{label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Header - Tier 2 */}
      <header className="border-b border-border bg-card relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Logo />

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-2">
              {/* Shopping Cart (Buyer only) */}
              {isBuyer && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mr-2"
                  asChild
                >
                  <Link to="/cart">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Cart
                  </Link>
                </Button>
              )}

              {/* Navigation Links */}
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Right Side: User Info or Login + Toggle */}
            <div className="flex items-center space-x-3">
              {/* Buyer/Seller Toggle */}
              <div className="hidden md:flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => handleRoleChange('buyer')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    isBuyer
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Buyer
                </button>
                <button
                  onClick={() => handleRoleChange('seller')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-border ${
                    isSeller
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Seller
                </button>
              </div>

              {user ? (
                <Link to="/login">
                  <Avatar className="cursor-pointer border border-border">
                    <AvatarImage src={user.pictureUrl} alt={user.name} />
                    <AvatarFallback>{user.name ? user.name[0] : '?'}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-3 space-y-2">
            {/* Navigation Links (Mobile) */}
            <div className="flex flex-wrap gap-2">
              {/* Shopping Cart (Buyer only, Mobile) */}
              {isBuyer && (
                <Link
                  to="/cart"
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === '/cart'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>Cart</span>
                </Link>
              )}
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            {/* Theme + Buyer/Seller (Mobile) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-border bg-transparent text-muted-foreground hover:text-foreground"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="flex items-center border border-border rounded-lg overflow-hidden flex-1">
                <button
                  onClick={() => handleRoleChange('buyer')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                    isBuyer
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground'
                  }`}
                >
                  Buyer
                </button>
                <button
                  onClick={() => handleRoleChange('seller')}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition-colors border-l border-border ${
                    isSeller
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-transparent text-muted-foreground'
                  }`}
                >
                  Seller
                </button>
              </div>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content - will be wrapped by pages that need sidebar */}
      <main className="relative z-10 flex-1 flex flex-col min-h-0">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto relative z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="text-center text-xs text-muted-foreground">
            <p className="font-medium">&copy; 2025 Everything UMass. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
