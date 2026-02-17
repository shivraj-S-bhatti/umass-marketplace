import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/shared/components/ui/button'
import { ShoppingBag, Plus, LayoutDashboard, LogIn, MessageSquare, ShoppingCart, Store, Home, Link2, Sun, Moon, ChevronDown, User, LogOut } from 'lucide-react'
import { UserRole, useUser } from '@/shared/contexts/UserContext'
import { useTheme } from '@/shared/contexts/ThemeContext'
import { useLoginModal } from '@/shared/contexts/LoginModalContext'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/shared/components/ui/dropdown-menu'
import { useToast } from '@/shared/hooks/use-toast'
import { useEffect, useState } from 'react'
import { getPlatformStats } from '@/features/marketplace/api/api'

function PlatformStats() {
  const [stats, setStats] = useState({ totalStudents: 456, onlineNow: 3 })

  useEffect(() => {
    getPlatformStats()
      .then(setStats)
      .catch(() => {})
  }, [])

  return (
    <span className="inline-flex rounded-full bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground whitespace-nowrap">
      {stats.totalStudents} students • {stats.onlineNow} online
    </span>
  )
}

const SUBAPPS = [
  { path: '/', label: 'Home', icon: Home, disabled: false },
  { path: '/marketplace', label: 'Marketplace', icon: Store, disabled: false },
  { path: '/directory', label: 'Links', icon: Link2, disabled: false },
  { path: '/leasings', label: 'Leasing', icon: Home, disabled: true },
] as const

const MARKETPLACE_PATHS = ['/marketplace', '/sell', '/dashboard', '/cart']

const marketplaceNavItems = [
  { path: '/marketplace', label: 'Explore', icon: ShoppingBag, showIn: ['buyer', 'seller'] as UserRole[] },
  { path: '/sell', label: 'Sell', icon: Plus, showIn: ['seller'] as UserRole[] },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, showIn: ['seller'] as UserRole[] },
]

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { role, setRole, isSeller, isBuyer, user, logout } = useUser()
  const { theme, toggleTheme } = useTheme()
  const { openLoginModal } = useLoginModal()
  const { toast } = useToast()

  const currentSubapp = SUBAPPS.find(s =>
    s.path === '/' ? location.pathname === '/' : location.pathname.startsWith(s.path)
  ) ?? SUBAPPS[0]
  const isMarketplace = MARKETPLACE_PATHS.some(p => location.pathname.startsWith(p))
  const navItems = marketplaceNavItems.filter(item => item.showIn.includes(role))

  useEffect(() => {
    if (location.pathname === '/cart' && isSeller) navigate('/dashboard')
  }, [location.pathname, isSeller, navigate])

  useEffect(() => {
    if (location.pathname === '/cart' && !isBuyer) setRole('buyer')
  }, [location.pathname, isBuyer, setRole])

  return (
    <div className="min-h-screen bg-background relative flex flex-col">
      {/* Header: Logo (brand/home) | App switcher (navigation) | Avatar */}
      <header className="border-b border-border bg-card relative z-10">
        <div className="w-full max-w-[1600px] mx-auto pl-3 pr-4 py-2.5 sm:pl-4">
          <div className="flex items-center justify-between gap-3 min-w-0">
            {/* Left group: Logo (brand/home) + App switcher (navigation) – left aligned */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
              <Link
                to="/"
                className="flex items-center gap-2 shrink-0 rounded-lg px-1 py-1.5 sm:px-2 focus:outline-none focus:ring-2 focus:ring-primary/40 hover:opacity-90 min-w-0"
                aria-label="Everything UMass – Home"
              >
                <img src="/UMass_Seal.png" alt="" className="h-8 w-8 sm:h-9 sm:w-9 object-contain shrink-0" />
                <span className="hidden sm:inline font-graduate text-lg sm:text-xl text-foreground whitespace-nowrap tracking-tight">
                  Everything UMass
                </span>
              </Link>

              {/* App switcher – visually lighter (smaller font, neutral border), pill-style trigger */}
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 shrink-0 text-sm text-muted-foreground hover:text-foreground border border-border rounded-full pl-3 pr-2 py-1.5 bg-secondary/50 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <span className="font-medium">{currentSubapp.label}</span>
                  {currentSubapp.disabled && (
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Soon</span>
                  )}
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[11rem]">
                {SUBAPPS.map(({ path, label, icon: Icon, disabled }) => (
                  <DropdownMenuItem
                    key={path}
                    disabled={disabled}
                    onSelect={() => {
                      if (disabled) {
                        toast({ title: 'Coming soon', description: 'Leasing launches soon!' })
                      } else {
                        navigate(path)
                      }
                    }}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {label}
                    {disabled && (
                      <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
                        Coming soon
                      </span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>

            {/* Right: stats pill + auth */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <PlatformStats />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button type="button" className="rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.pictureUrl} alt={user.name} />
                      <AvatarFallback>{user.name ? user.name[0] : '?'}</AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[12rem]">
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
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" size="sm" onClick={openLoginModal}>
                <LogIn className="h-4 w-4 mr-1.5" />
                Log in
              </Button>
            )}
            </div>
          </div>
        </div>

        {/* Marketplace sub-nav: same left alignment as main header */}
        {isMarketplace && (
          <nav className="border-t border-border/50">
            <div className="w-full max-w-[1600px] mx-auto pl-3 pr-4 py-2 flex flex-wrap items-center gap-2 sm:pl-4">
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
            <p className="font-medium">A project to build things for the UMass student community.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
