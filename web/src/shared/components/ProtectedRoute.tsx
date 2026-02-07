import { Navigate } from 'react-router-dom'
import { useUser } from '@/shared/contexts/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSeller?: boolean
}

export default function ProtectedRoute({ children, requireSeller = false }: ProtectedRouteProps) {
  const { isAuthenticated, isSeller } = useUser()

  if (!isAuthenticated) {
    return <Navigate to="/landing" replace />
  }

  if (requireSeller && !isSeller) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

