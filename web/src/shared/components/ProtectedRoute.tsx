import { Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useUser } from '@/shared/contexts/UserContext'
import { useLoginModal } from '@/shared/contexts/LoginModalContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSeller?: boolean
}

export default function ProtectedRoute({ children, requireSeller = false }: ProtectedRouteProps) {
  const { isAuthenticated, isSeller } = useUser()
  const { openLoginModal } = useLoginModal()

  useEffect(() => {
    if (!isAuthenticated) openLoginModal()
  }, [isAuthenticated, openLoginModal])

  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  if (requireSeller && !isSeller) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

