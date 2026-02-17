import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { ShoppingBag, Plus, LayoutDashboard, LogIn, MessageSquare, ShoppingCart, Calendar, Users, Trophy, Store, Sun, Moon, ChevronDown, User, LogOut } from 'lucide-react'
import { UserRole, useUser } from '@/shared/contexts/UserContext'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/shared/components/ui/dropdown-menu'
import Logo from '@/shared/components/Logo'
import { useEffect } from 'react'

const SUBAPPS = [
  { path: '/', label: 'Marketplace', icon: Store },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/leasings', label: 'Leasings', icon: Store },
  { path: '/common-room', label: 'Common Room', icon: MessageSquare },
  { path: '/clubs', label: 'Clubs', icon: Users },
  { path: '/sports', label: 'Sports', icon: Trophy },
] as const

const MARKETPLACE_PATHS = ['/', '/sell', '/dashboard', '/cart']

const marketplaceNavItems = [
  { path: '/', label: 'Explore', icon: ShoppingBag, showIn: ['buyer', 'seller'] as UserRole[] },
  { path: '/sell', label: 'Sell', icon: Plus, showIn: ['seller'] as UserRole[] },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, showIn: ['seller'] as UserRole[] },
  { path: '/messages', label: 'Messages', icon: MessageSquare, showIn: ['buyer', 'seller'] as UserRole[] },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, setRole, isSeller, isBuyer, user, logout } = useUser()
  const { theme, toggleTheme } = useTheme()

  const currentSubapp = SUBAPPS.find(s => s.path === '/' ? location.pathname === '/' : location.pathname.startsWith(s.path)) ?? SUBAPPS[0]
  const isMarketplace = MARKETPLACE_PATHS.some(p => p === '/' ? location.pathname === '/' : location.pathname.startsWith(p))
  const navItems = marketplaceNavItems.filter(item => item.showIn.includes(role))

  useEffect(() => {
    if (location.pathname === '/cart' && isSeller) navigate('/dashboard')
  }, [location.pathname, isSeller, navigate])

  useEffect(() => {
    if (location.pathname === '/cart' && !isBuyer) setRole('buyer')
  }, [location.pathname, isBuyer, setRole])

  const handleRoleChange = (newRole: 'buyer' | 'seller') => {
    if (location.pathname === '/cart' && newRole === 'seller') {
      setRole(newRole)
      navigate('/dashboard')
    } else {
      setRole(newRole)
    }
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Single top bar: [Logo] Everything UMass - [Subapp v]  |  [Avatar v] */}
      <header className="border-b border-border bg-card relative z-10">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Logo + Everything UMass - Subapp dropdown (text trigger) */}
            <div className="flex items-center gap-2 min-w-0">
              <Link to="/" className="flex items-center shrink-0" aria-label="Home">
                <Logo />
              </Link>
              <span className="font-semibold text-foreground shrink-0">Everything UMass</span>
              <span className="text-muted-foreground shrink-0 hidden sm:inline">–</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 shrink-0 text-foreground font-medium hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1 py-0.5"
                  >
                    {currentSubapp.label}
                    <ChevronDown className="h-4 w-4 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {SUBAPPS.map(({ path, label }) => (
                    <DropdownMenuItem key={path} onSelect={() => navigate(path)}>
                      {label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Right: Profile / Login dropdown only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                {user ? (
                  <button type="button" className="rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.pictureUrl} alt={user.name} />
                      <AvatarFallback>{user.name ? user.name[0] : '?'}</AvatarFallback>
                    </Avatar>
                  </button>
                ) : (
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Log in
                  </Button>
                )}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[12rem]">
                {user ? (
                  <>
                    <DropdownMenuLabel className="font-normal flex flex-col gap-0.5">
                      <span className="font-semibold truncate">{user.name || 'User'}</span>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => navigate('/profile/me')}>
                      <User className="h-4 w-4 mr-2" />
                      Profile & settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => navigate('/messages')}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Messages
                    </DropdownMenuItem>
                    {isBuyer && (
                      <DropdownMenuItem onSelect={() => navigate('/cart')}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Cart
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => toggleTheme()}>
                      {theme === 'dark' ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                      {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => logout()} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onSelect={() => navigate('/login')}>
                    <LogIn className="h-4 w-4 mr-2" />
                    Log in
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Marketplace sub-nav: Explore, Sell, Dashboard, Cart, Buyer | Seller */}
        {isMarketplace && (
          <nav className="border-t border-border/50">
            <div className="container mx-auto px-4 py-2 flex flex-wrap items-center gap-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === path ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
              {isBuyer && (
                <Link
                  to="/cart"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors md:hidden ${
                    location.pathname === '/cart' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Cart
                </Link>
              )}
              <div className="flex items-center border border-border rounded-lg overflow-hidden ml-auto">
                <button
                  onClick={() => handleRoleChange('buyer')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    isBuyer ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  Buyer
                </button>
                <button
                  onClick={() => handleRoleChange('seller')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors border-l border-border ${
                    isSeller ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  Seller
                </button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {children}
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-3">
          <div className="text-center text-xs text-muted-foreground">
            <p className="font-medium">&copy; 2025 Everything UMass. Built for students, by students.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
