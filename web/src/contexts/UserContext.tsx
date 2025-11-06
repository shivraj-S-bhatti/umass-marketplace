import { createContext, useContext, useState, ReactNode } from 'react'

export type UserRole = 'buyer' | 'seller'

interface UserContextType {
  role: UserRole
  setRole: (role: UserRole) => void
  isSeller: boolean
  isBuyer: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>('buyer') // Default to buyer view

  const isSeller = role === 'seller'
  const isBuyer = role === 'buyer'

  return (
    <UserContext.Provider value={{ role, setRole, isSeller, isBuyer }}>
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

