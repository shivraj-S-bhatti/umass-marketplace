import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LogIn, Mail, ShoppingBag, Store } from 'lucide-react'
import { useUser } from '@/contexts/UserContext'
import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import scrapBookImage from '@/assets/scrap_book.png'

// Login Page - placeholder for OAuth authentication
// Currently shows a placeholder for Google OAuth integration
export default function LoginPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout, role, setRole } = useUser()
  const [searchParams] = useSearchParams()
  const { toast } = useToast()

  useEffect(() => {
    const error = searchParams.get('error')
    if (error) {
      toast({
        title: 'Login Error',
        description: error.replace(/\+/g, ' '),
        variant: 'destructive',
      })
    }
  }, [searchParams])

  const handleGoogleLogin = async () => {
    // Redirect browser to the backend OAuth2 authorization endpoint for Google
    // Backend will handle the OAuth handshake and redirect back to the frontend
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    window.location.href = `${base}/oauth2/authorization/google`
  }


  const handleRoleSelection = (newRole: 'buyer' | 'seller') => {
    setRole(newRole)
    navigate('/')
  }

  return (
    <div 
      className="min-h-[calc(100vh-200px)] flex items-center justify-center py-8"
      style={{
        backgroundImage: `url(${scrapBookImage})`,
        backgroundRepeat: 'repeat',
        backgroundSize: 'auto',
      }}
    >
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            {isAuthenticated && user?.pictureUrl ? (
              <img src={user.pictureUrl} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <LogIn className="h-6 w-6 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl">Welcome to UMass Marketplace</CardTitle>
          <CardDescription>
            {isAuthenticated
              ? `Hello, ${user?.name || user?.email}!`
              : 'Sign in with your UMass email to start buying and selling'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isAuthenticated ? (
            <>
              <Button onClick={logout} className="w-full mb-2" size="lg">
                Logout
              </Button>
              <div className="border-t pt-4">
                <p className="text-center text-sm font-medium text-foreground mb-3">
                  Switch role:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant={role === 'buyer' ? 'default' : 'outline'}
                    onClick={() => setRole('buyer')}
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                  >
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <span className="font-medium">Buyer</span>
                  </Button>
                  <Button
                    variant={role === 'seller' ? 'default' : 'outline'}
                    onClick={() => setRole('seller')}
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                  >
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-medium">Seller</span>
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
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
                <p className="text-center text-sm font-medium text-foreground mb-3">
                  Or continue as:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleRoleSelection('buyer')}
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                  >
                    <ShoppingBag className="h-6 w-6 text-primary" />
                    <span className="font-medium">Buyer</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleRoleSelection('seller')}
                    className="flex flex-col items-center justify-center h-24 space-y-2"
                  >
                    <Store className="h-6 w-6 text-primary" />
                    <span className="font-medium">Seller</span>
                  </Button>
                </div>
              </div>
            </>
          )}
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
