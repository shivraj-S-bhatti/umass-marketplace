import { useParams, Navigate } from 'react-router-dom'

/** Deep link for shared listing: /listing/:id -> /marketplace?listing=:id so HomePage can open modal */
export default function ListingRedirectPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return <Navigate to="/marketplace" replace />
  return <Navigate to={`/marketplace?listing=${id}`} replace />
}
