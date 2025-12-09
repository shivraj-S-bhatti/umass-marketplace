import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Store, Calendar, MessageSquare, Users, Trophy, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react'

// Landing Page - Hero section showcasing the platform's future vision
// Features: Marketplace, Event Hub, Common Room, Clubs, Sports
export default function LandingPage() {
  const features = [
    {
      icon: Store,
      title: 'Marketplace',
      description: 'Buy and sell with verified UMass students. Zero fees, campus proximity, and real-time distance tracking.',
      path: '/',
      color: 'bg-primary/20 border-primary'
    },
    {
      icon: Calendar,
      title: 'Event Hub',
      description: 'Discover campus events, parties, workshops, and gatherings. Create and promote your own events.',
      path: '/events',
      color: 'bg-accent/30 border-accent'
    },
    {
      icon: MessageSquare,
      title: 'Common Room',
      description: 'Join discussions, ask questions, and connect with your UMass community in organized forums.',
      path: '/common-room',
      color: 'bg-secondary/30 border-secondary'
    },
    {
      icon: Users,
      title: 'Clubs',
      description: 'Find and join student organizations. Manage your club, recruit members, and share updates.',
      path: '/clubs',
      color: 'bg-primary/10 border-primary/50'
    },
    {
      icon: Trophy,
      title: 'Sports',
      description: 'Organize pickup games, join intramural teams, and find your next basketball or soccer match.',
      path: '/sports',
      color: 'bg-accent/20 border-accent/70'
    },
  ]

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
      {/* Hero Section */}
      <section className="relative border-b-4 border-foreground bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 paper-texture py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-comic border-2 border-foreground bg-card mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold">Your All-in-One UMass Hub</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Everything UMass,<br />
              <span className="text-primary">We've Got You</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your one-stop platform for campus life. Host your clubs, organize events, 
              join pickup games, or engage in commerce—all in one verified, student-only community.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button 
                size="lg" 
                className="text-base px-8 py-6 rounded-comic border-2 border-foreground shadow-comic"
                asChild
              >
                <Link to="/">
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Explore Marketplace
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8 py-6 rounded-comic border-2 border-foreground"
                asChild
              >
                <Link to="/login">
                  Get Started
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything You Need for Campus Life</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            One platform. One community. Everything UMass.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card 
                key={feature.title}
                className={`hover:shadow-comic transition-all border-4 ${feature.color} cursor-pointer group`}
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-comic border-2 border-foreground bg-card">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm mb-4 min-h-[3rem]">
                    {feature.description}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-2 border-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    asChild
                  >
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

      {/* CTA Section */}
      <section className="border-t-4 border-foreground bg-card paper-texture py-12 md:py-16">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-4 border-foreground bg-gradient-to-br from-primary/20 to-accent/20">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl md:text-4xl mb-3">
                Ready to Join the UMass Community?
              </CardTitle>
              <CardDescription className="text-base md:text-lg">
                Connect with thousands of verified UMass students. Buy, sell, organize, and engage—all in one place.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="lg" 
                className="text-base px-8 py-6 rounded-comic border-2 border-foreground shadow-comic"
                asChild
              >
                <Link to="/login">
                  Sign In with UMass Email
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-base px-8 py-6 rounded-comic border-2 border-foreground"
                asChild
              >
                <Link to="/">
                  Browse Marketplace
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
