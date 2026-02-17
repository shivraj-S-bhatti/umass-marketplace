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
      {/* Hero */}
      <section className="py-10 md:py-16 overflow-hidden">
        <div className="container mx-auto px-4 flex flex-col items-center">
          {/* Hero card: no bottom padding so mascot sits flush */}
          <Card className="relative w-full max-w-3xl border border-border overflow-visible !p-0">
            <CardContent className="pt-6 sm:pt-8 md:pt-10 px-6 sm:px-8 md:px-10 pb-0">
              {/* Text – centered */}
              <div className="text-center space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
                  Everything UMass,<br />
                  <span className="text-primary">We've Got You</span>
                </h1>
                <p className="text-base md:text-lg text-muted-foreground max-w-md mx-auto leading-relaxed uppercase tracking-wide">
                  Buy sell share organize, all in one verified student only community.
                </p>
              </div>

              {/* Mascot: block removes inline gap; card uses !p-0 so no bottom gap */}
              <div className="flex justify-center mt-4">
                <img
                  src="/mascot.png"
                  alt="Sam the Minuteman – UMass mascot"
                  className="w-52 sm:w-60 md:w-72 lg:w-80 h-auto block"
                />
              </div>
            </CardContent>
          </Card>

          {/* CTA below card */}
          <div className="flex flex-col items-center gap-3 mt-10">
            <Button size="lg" className="text-base px-10" asChild>
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
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-center mb-2">
          Everything You Need for Campus Life
        </h2>
        <p className="text-muted-foreground text-center mb-10 max-w-2xl mx-auto">
          One platform. One community. Everything UMass.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="border border-border hover:border-primary/50 transition-colors cursor-pointer group"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg border border-border bg-secondary/50">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
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
      <section className="border-t border-border bg-card py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border border-border bg-secondary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl mb-3 font-bold">
                Ready to Join the UMass Community?
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                Connect with thousands of verified UMass students. Buy, sell, organize, and engage—all in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="text-base px-8" asChild>
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
