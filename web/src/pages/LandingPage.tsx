import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Mail, MessageCircle } from 'lucide-react'
import { useUser } from '@/shared/contexts/UserContext'
import { useLoginModal } from '@/shared/contexts/LoginModalContext'

const DISCORD_URL = 'https://discord.gg/Xb4W6FUh'
const GITHUB_ISSUES = 'https://github.com/shivraj-S-bhatti/umass-marketplace/issues'
const GITHUB_BUG = `${GITHUB_ISSUES}/new?template=bug_report.md`
const GITHUB_FEATURE = `${GITHUB_ISSUES}/new?template=feature_request.md`

export default function BentoHomePage() {
  const { isAuthenticated } = useUser()
  const { openLoginModal } = useLoginModal()
  const navigate = useNavigate()
  const handleProtectedNav = (path: string) => {
    if (isAuthenticated) {
      navigate(path)
    } else {
      openLoginModal()
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-4 md:p-6 lg:p-8 gap-4 md:gap-6">
      {/* Hero card: fixed height so it never grows with viewport; mascot always touches bottom */}
      <Card className="border border-border w-full h-[200px] sm:h-[240px] md:h-[280px] shrink-0 relative overflow-hidden !p-0">
        <CardContent className="relative w-full h-full flex items-center p-5 sm:p-6 md:p-8 pb-0">
          {/* Left: text + button — items-center on parent keeps this vertically centered */}
          <div className="flex flex-col space-y-3 text-left pr-36 sm:pr-44 md:pr-56 lg:pr-64">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Everything UMass,{' '}
              <span className="text-primary">We've Got You!</span>
            </h1>
            {!isAuthenticated ? (
              <Button size="lg" className="mt-2 w-fit" onClick={openLoginModal}>
                <Mail className="h-4 w-4 mr-2" />
                Sign in with UMass Email
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Welcome back! Pick a tile below to get started.
              </p>
            )}
          </div>

          {/* Mascot: absolute bottom-right so feet always sit on the card's bottom edge */}
          <div className="absolute bottom-0 right-0 pr-5 sm:pr-6 md:pr-8 flex items-end pointer-events-none">
            <img
              src="/mascot.png"
              alt="Sam the Minuteman"
              className="w-36 sm:w-44 md:w-56 lg:w-64 h-auto object-contain object-bottom block"
            />
          </div>
        </CardContent>
      </Card>

      {/* Bento grid — all tiles same color, buttons bottom-aligned */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 shrink-0">
        {/* Marketplace */}
        <Card
          className="border border-border hover:border-border/80 transition-colors cursor-pointer"
          onClick={() => handleProtectedNav('/marketplace')}
        >
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="font-semibold text-sm">Marketplace</h3>
            <p className="text-xs text-muted-foreground mt-1.5">Buy and sell with verified UMass students.</p>
            <div className="mt-auto pt-3 space-y-2">
              <Button className="w-full h-9" onClick={(e) => { e.stopPropagation(); handleProtectedNav('/marketplace') }}>
                Browse listings
              </Button>
              <button
                onClick={(e) => { e.stopPropagation(); handleProtectedNav('/marketplace/sell') }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                Post an item
              </button>
            </div>
          </CardContent>
        </Card>

        {/* UMass links directory */}
        <Card
          className="border border-border hover:border-border/80 transition-colors cursor-pointer"
          onClick={() => handleProtectedNav('/directory')}
        >
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="font-semibold text-sm">UMass Links Directory</h3>
            <p className="text-xs text-muted-foreground mt-1.5">Useful campus links, curated by students.</p>
            <div className="mt-auto pt-3 space-y-2">
              <Button variant="outline" className="w-full h-9" onClick={(e) => { e.stopPropagation(); handleProtectedNav('/directory') }}>
                Explore links
              </Button>
              <button
                onClick={(e) => { e.stopPropagation(); handleProtectedNav('/directory/submit') }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors w-full text-center"
              >
                Submit a link
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Leasing (coming soon) */}
        <Card className="border border-border">
          <CardContent className="p-4 flex flex-col h-full">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">Leasing</h3>
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full leading-none">Coming soon</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">Sublets and lease transfers, verified.</p>
            <div className="mt-auto pt-3 space-y-2">
              <Button variant="outline" className="w-full h-9" disabled>
                Vote to prioritize
              </Button>
              <div className="h-4" />
            </div>
          </CardContent>
        </Card>

        {/* Contribute */}
        <Card className="border border-border hover:border-border/80 transition-colors">
          <CardContent className="p-4 flex flex-col h-full">
            <h3 className="font-semibold text-sm">Contribute</h3>
            <p className="text-xs text-muted-foreground mt-1.5">Report issues or suggest features.</p>
            <div className="mt-auto pt-3 space-y-2">
              <Button className="w-full h-9" asChild>
                <a href={GITHUB_BUG} target="_blank" rel="noopener noreferrer">
                  Report a bug
                </a>
              </Button>
              <Button variant="outline" className="w-full h-9" asChild>
                <a href={GITHUB_FEATURE} target="_blank" rel="noopener noreferrer">
                  Request a feature
                </a>
              </Button>
              <a
                href={DISCORD_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors pt-1"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Join Discord
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
