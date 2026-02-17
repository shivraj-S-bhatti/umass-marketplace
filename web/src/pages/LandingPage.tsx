import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Store, Calendar, MessageSquare, Users, Trophy, ArrowRight } from 'lucide-react'
import { useUser } from '@/shared/contexts/UserContext'

/** Landing: hero card with mascot, UMass palette, sign-in/explore CTA */
export default function LandingPage() {
  const { user } = useUser()

  const features = [
    {
      icon: Store,
      title: 'Marketplace',
      description: 'Buy and sell with verified UMass students. Zero fees, campus proximity, and real-time distance tracking.',
      path: user ? '/' : '/login',
    },
    {
      icon: Calendar,
      title: 'Event Hub',
      description: 'Discover campus events, parties, workshops, and gatherings. Create and promote your own events.',
      path: '/events',
    },
    {
      icon: MessageSquare,
      title: 'Common Room',
      description: 'Join discussions, ask questions, and connect with your UMass community in organized forums.',
      path: '/common-room',
    },
    {
      icon: Users,
      title: 'Clubs',
      description: 'Find and join student organizations. Manage your club, recruit members, and share updates.',
      path: '/clubs',
    },
    {
      icon: Trophy,
      title: 'Sports',
      description: 'Organize pickup games, join intramural teams, and find your next basketball or soccer match.',
      path: '/sports',
    },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Hero – scaled down ~20% */}
      <section className="py-6 md:py-10 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center">
          {/* Hero card: no bottom padding so mascot sits flush */}
          <Card className="relative w-full max-w-2xl border border-border overflow-visible !p-0">
            <CardContent className="pt-5 sm:pt-6 md:pt-8 px-5 sm:px-6 md:px-8 pb-0">
              {/* Text – centered */}
              <div className="text-center space-y-3">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
                  Everything UMass,<br />
                  <span className="text-primary">We've Got You</span>
                </h1>
                <p className="text-sm md:text-base text-muted-foreground max-w-md mx-auto leading-relaxed uppercase tracking-wide">
                  Buy sell share organize, all in one verified student only community.
                </p>
              </div>

              {/* Mascot */}
              <div className="flex justify-center mt-3">
                <img
                  src="/mascot.png"
                  alt="Sam the Minuteman – UMass mascot"
                  className="w-40 sm:w-48 md:w-60 lg:w-64 h-auto block"
                />
              </div>
            </CardContent>
          </Card>

          {/* CTA below card */}
          <div className="flex flex-col items-center gap-2 mt-6">
            <Button size="lg" className="text-sm px-8" asChild>
              <Link to={user ? '/' : '/login'}>
                {user ? 'Explore Marketplace' : 'Sign in with Google'}
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </Button>
            {!user && (
              <p className="text-sm text-muted-foreground">
                Use your UMass email to get started
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2">
          Everything You Need for Campus Life
        </h2>
        <p className="text-muted-foreground text-center mb-6 max-w-2xl mx-auto text-sm">
          One platform. One community. Everything UMass.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border border-border hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1.5 rounded-lg border border-border bg-secondary/50">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4 min-h-[3rem]">
                    {feature.description}
                  </CardDescription>
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" asChild>
                    <Link to={feature.path}>
                      Learn More
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border bg-card py-8 md:py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border border-border bg-secondary/20">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl md:text-3xl mb-2 font-bold">
                Ready to Join the UMass Community?
              </CardTitle>
              <CardDescription className="text-sm md:text-base">
                Connect with thousands of verified UMass students. Buy, sell, organize, and engage—all in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="text-sm px-6" asChild>
                <Link to={user ? '/' : '/login'}>
                  {user ? 'Explore Marketplace' : 'Sign In with UMass Email'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/">Browse Marketplace</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
