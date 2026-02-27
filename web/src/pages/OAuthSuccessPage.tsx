import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '@/shared/contexts/UserContext'

export default function OAuthSuccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setUser } = useUser()

  useEffect(() => {
    const token = searchParams.get('token')
    const error = searchParams.get('error')
    const id = searchParams.get('id')
    const email = searchParams.get('email')
    const name = searchParams.get('name')
    const pictureUrl = searchParams.get('pictureUrl')
    const superuser = searchParams.get('superuser') === 'true'
    console.log('[Superuser] OAuthSuccess email=', email, 'param=', searchParams.get('superuser'), 'parsed=', superuser)

    if (error) {
      navigate('/?auth=cancelled', { replace: true })
      return
    }
    if (token) {
      localStorage.setItem('token', token)
      if (id) localStorage.setItem('userId', id)
      if (email) localStorage.setItem('userEmail', email)
      if (name) localStorage.setItem('userName', name)
      if (pictureUrl) localStorage.setItem('userPictureUrl', pictureUrl)
      localStorage.setItem('userSuperuser', String(superuser))
      console.log('[Superuser] OAuthSuccess wrote localStorage userSuperuser=', superuser)

      setUser({
        id: id || '',
        name: name || '',
        email: email || '',
        pictureUrl: pictureUrl || undefined,
        superuser,
      })
      navigate('/marketplace')
    } else {
      navigate('/marketplace')
    }
  }, [searchParams, navigate, setUser])

  return <div className="p-8 text-center">Signing you in...</div>
}
