import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '@/shared/contexts/UserContext'

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setRole, setUser } = useUser()

  useEffect(() => {
    const token = searchParams.get('token')
    const id = searchParams.get('id')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const pictureUrl = searchParams.get('pictureUrl')

    if (token) {
      localStorage.setItem('token', token)
      if (id) localStorage.setItem('userId', id)
      if (email) localStorage.setItem('userEmail', email)
      if (name) localStorage.setItem('userName', name)
      if (pictureUrl) localStorage.setItem('userPictureUrl', pictureUrl)

      // Update user context immediately
      setUser({
        id: id || '',
        name: name || '',
        email: email || '',
        pictureUrl: pictureUrl || undefined,
      })
      setRole('seller')
      navigate('/')
    } else {
      navigate('/')
    }
  }, [])

  return <div className="p-8 text-center">Signing you in...</div>
}
