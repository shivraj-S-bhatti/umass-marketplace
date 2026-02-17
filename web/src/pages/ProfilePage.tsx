import { useUser } from '@/shared/contexts/UserContext'
import { Navigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'

/** Minimal profile/settings placeholder; full profile (avatar, preferences, privacy) per plan */
export default function ProfilePage() {
  const { user } = useUser()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="container max-w-lg mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile & settings</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
          <p>Profile photo, preferences, and privacy settings will be available here. (Placeholder.)</p>
        </CardContent>
      </Card>
    </div>
  )
}
