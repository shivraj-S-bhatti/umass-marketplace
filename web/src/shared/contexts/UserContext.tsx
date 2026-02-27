import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { apiClient } from '@/features/marketplace/api/api'

interface User {
  id: string
  name: string
  email: string
  pictureUrl?: string
  createdAt?: string
  /** Set by backend at login via OAuth redirect param; persisted in localStorage. */
  superuser?: boolean
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isAuthenticated: boolean
  isSuperuser: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    const userPictureUrl = localStorage.getItem('userPictureUrl')
    const userSuperuser = localStorage.getItem('userSuperuser') === 'true'
    console.log('[Superuser] init from storage: userSuperuser=', userSuperuser)

    if (userId && userEmail) {
      return {
        id: userId,
        name: userName || '',
        email: userEmail,
        pictureUrl: userPictureUrl || undefined,
        superuser: userSuperuser,
      }
    }
    return null
  })

  const superuserSyncedRef = useRef(false)
  useEffect(() => {
    if (!user?.id || superuserSyncedRef.current) return
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) return
    superuserSyncedRef.current = true
    apiClient
      .getUser(user.id)
      .then((apiUser) => {
        console.log('[Superuser] re-sync from API: superuser=', apiUser.superuser)
        setUserState((prev) =>
          prev ? { ...prev, superuser: !!apiUser.superuser } : null
        )
        localStorage.setItem('userSuperuser', String(!!apiUser.superuser))
      })
      .catch(() => {
        superuserSyncedRef.current = false
      })
  }, [user?.id])

  const setUser = (newUser: User | null) => {
    if (newUser) {
      console.log('[Superuser] setUser superuser=', !!newUser.superuser)
      localStorage.setItem('userId', newUser.id)
      localStorage.setItem('userName', newUser.name)
      localStorage.setItem('userEmail', newUser.email)
      if (newUser.pictureUrl) {
        localStorage.setItem('userPictureUrl', newUser.pictureUrl)
      }
      localStorage.setItem('userSuperuser', String(!!newUser.superuser))
    } else {
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userPictureUrl')
      localStorage.removeItem('userSuperuser')
    }
    setUserState(newUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPictureUrl')
    localStorage.removeItem('userSuperuser')
    setUserState(null)
  }

  const isAuthenticated = user !== null
  const isSuperuser = !!user?.superuser

  return (
    <UserContext.Provider value={{ user, setUser, logout, isAuthenticated, isSuperuser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within UserProvider')
  }
  return context
}
