import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, Mail } from 'lucide-react'

// Login Page - placeholder for OAuth authentication
// Currently shows a placeholder for Google OAuth integration
export default function LoginPage() {
  const handleGoogleLogin = () => {
    // Placeholder for Google OAuth - will be implemented in future milestone
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to UMass Marketplace</CardTitle>
          <CardDescription>
            Sign in with your UMass email to start buying and selling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full"
            size="lg"
          >
            <Mail className="h-4 w-4 mr-2" />
            Sign in with Google
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>
              You'll be redirected to Google to sign in with your UMass email address.
              Only @umass.edu email addresses are allowed.
            </p>
          </div>
          
          <div className="border-t pt-4">
            <div className="text-center text-sm text-muted-foreground">
              <p className="font-medium mb-2">For now, you can:</p>
              <ul className="space-y-1 text-left">
                <li>• Browse all listings without signing in</li>
                <li>• Create listings (will be associated with a dummy account)</li>
                <li>• View your dashboard</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
