import { createContext, useContext, useState, ReactNode } from 'react'

export type UserRole = 'buyer' | 'seller'

interface User {
  id: string
  name: string
  email: string
  pictureUrl?: string
  createdAt?: string // Optional to match API User type
}

interface UserContextType {
  user: User | null
  role: UserRole
  setRole: (role: UserRole) => void
  setUser: (user: User | null) => void
  logout: () => void
  isAuthenticated: boolean
  isSeller: boolean
  isBuyer: boolean
  isSuperuser: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize user from localStorage
  const [user, setUserState] = useState<User | null>(() => {
    const userId = localStorage.getItem('userId')
    const userName = localStorage.getItem('userName')
    const userEmail = localStorage.getItem('userEmail')
    const userPictureUrl = localStorage.getItem('userPictureUrl')

    if (userId && userEmail) {
      return {
        id: userId,
        name: userName || '',
        email: userEmail,
        pictureUrl: userPictureUrl || undefined,
      }
    }
    return null
  })

  // Initialize role from localStorage, default to 'buyer' if not found
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('userRole') as UserRole
    return savedRole || 'buyer'
  })

  // Wrap setRole to also save to localStorage
  const setRole = (newRole: UserRole) => {
    localStorage.setItem('userRole', newRole)
    setRoleState(newRole)
  }

  // Wrap setUser to also save to localStorage
  const setUser = (newUser: User | null) => {
    if (newUser) {
      localStorage.setItem('userId', newUser.id)
      localStorage.setItem('userName', newUser.name)
      localStorage.setItem('userEmail', newUser.email)
      if (newUser.pictureUrl) {
        localStorage.setItem('userPictureUrl', newUser.pictureUrl)
      }
    } else {
      localStorage.removeItem('userId')
      localStorage.removeItem('userName')
      localStorage.removeItem('userEmail')
      localStorage.removeItem('userPictureUrl')
    }
    setUserState(newUser)
  }

  // Logout function to clear all user data
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('userName')
    localStorage.removeItem('userEmail')
    localStorage.removeItem('userPictureUrl')
    localStorage.removeItem('userRole')
    setUserState(null)
    setRoleState('buyer')
  }

  const isAuthenticated = user !== null
  const isSeller = role === 'seller'
  const isBuyer = role === 'buyer'
  const superuserEmail = import.meta.env.VITE_SUPERUSER_EMAIL as string | undefined
  const isSuperuser = !!user && !!superuserEmail && user.email.toLowerCase() === superuserEmail.toLowerCase()

  return (
    <UserContext.Provider value={{ user, role, setRole, setUser, logout, isAuthenticated, isSeller, isBuyer, isSuperuser }}>
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

