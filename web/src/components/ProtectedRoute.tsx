import { Navigate } from 'react-router-dom'
import { useUser } from '@/contexts/UserContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireSeller?: boolean
}

export default function ProtectedRoute({ children, requireSeller = false }: ProtectedRouteProps) {
  const { isSeller } = useUser()

  if (requireSeller && !isSeller) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

