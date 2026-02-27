import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUser } from '@/shared/contexts/UserContext'
import { useLoginModal } from '@/shared/contexts/LoginModalContext'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useUser()
  const { openLoginModal } = useLoginModal()

  useEffect(() => {
    if (!isAuthenticated) openLoginModal()
  }, [isAuthenticated, openLoginModal])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
