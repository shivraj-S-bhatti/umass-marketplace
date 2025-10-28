import { Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Plus, LayoutDashboard, LogIn } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import LogoIcon from '@/assets/logo-icon.svg'

// Layout component for UMass Marketplace
// Provides consistent navigation and page structure across the application
interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { isSeller, setRole } = useUser()

  // Navigation items for sellers
  const sellerNavItems = [
    { path: '/', label: 'Explore', icon: ShoppingBag },
    { path: '/sell', label: 'Sell', icon: Plus },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]

  // Navigation items for buyers (without Sell and Dashboard)
  const buyerNavItems = [
    { path: '/', label: 'Explore', icon: ShoppingBag },
  ]

  const navItems = isSeller ? sellerNavItems : buyerNavItems

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <img src={LogoIcon} alt="UMass Marketplace Logo" className="h-10 w-10" />
              <span className="text-xl font-bold">UMass Marketplace</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === path
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Link>
              ))}
            </nav>

            {/* Login Button */}
            <Button variant="outline" size="sm" asChild>
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <nav className="md:hidden mt-4 flex space-x-2">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 UMass Marketplace. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
