import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Store, Calendar, MessageSquare, Users, Trophy, ArrowRight } from 'lucide-react'

// Landing Page – Swiss design, dark mode
export default function LandingPage() {
  const features = [
    {
      icon: Store,
      title: 'Marketplace',
      description: 'Buy and sell with verified UMass students. Zero fees, campus proximity, and real-time distance tracking.',
      path: '/login',
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
      <section className="border-b border-border bg-card py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Everything UMass,<br />
              <span className="text-primary">We've Got You</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your one-stop platform for campus life. Host your clubs, organize events,
              join pickup games, or engage in commerce—all in one verified, student-only community.
            </p>
            <p className="text-sm text-muted-foreground pt-2">
              Sign in with your UMass email to explore the marketplace and use all features.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" className="text-base px-8" asChild>
                <Link to="/login">
                  Sign in with Google
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
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
                <Link to="/login">
                  Sign In with UMass Email
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
