import { createContext, useContext, useCallback, useState, useEffect } from 'react'

const STORAGE_KEY = 'listingsView'

export type ListingsView = 'compact' | 'sparse'

interface ListingsViewContextValue {
  view: ListingsView
  setView: (view: ListingsView) => void
  toggleView: () => void
}

const ListingsViewContext = createContext<ListingsViewContextValue | null>(null)

function getStoredView(): ListingsView {
  if (typeof window === 'undefined') return 'sparse'
  const stored = localStorage.getItem(STORAGE_KEY) as ListingsView | null
  return stored === 'compact' || stored === 'sparse' ? stored : 'sparse'
}

export function ListingsViewProvider({ children }: { children: React.ReactNode }) {
  const [view, setViewState] = useState<ListingsView>(getStoredView)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view)
  }, [view])

  const setView = useCallback((next: ListingsView) => {
    setViewState(next)
  }, [])

  const toggleView = useCallback(() => {
    setViewState((prev) => (prev === 'compact' ? 'sparse' : 'compact'))
  }, [])

  return (
    <ListingsViewContext.Provider value={{ view, setView, toggleView }}>
      {children}
    </ListingsViewContext.Provider>
  )
}

export function useListingsView(): ListingsViewContextValue {
  const ctx = useContext(ListingsViewContext)
  if (!ctx) throw new Error('useListingsView must be used within ListingsViewProvider')
  return ctx
}
