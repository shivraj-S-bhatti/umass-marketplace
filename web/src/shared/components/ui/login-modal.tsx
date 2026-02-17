import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './dialog'
import { Button } from './button'
import { Mail } from 'lucide-react'
import { useLoginModal } from '@/shared/contexts/LoginModalContext'

export function LoginModal() {
  const { isOpen, closeLoginModal } = useLoginModal()

  const handleGoogleLogin = () => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
    window.location.href = `${base}/oauth2/authorization/google`
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) closeLoginModal() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">Sign in to Everything UMass</DialogTitle>
          <DialogDescription className="text-center">
            Use your UMass email to get started.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Button onClick={handleGoogleLogin} className="w-full" size="lg">
            <Mail className="h-4 w-4 mr-2" />
            Sign in with UMass Email
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Only @umass.edu email addresses are allowed.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
