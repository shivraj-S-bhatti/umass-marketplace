import { useState } from 'react'
import { Button } from '@/shared/components/ui/button'
import { Share2, Copy, MessageCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/shared/components/ui/dropdown-menu'
import { useToast } from '@/shared/hooks/use-toast'
import type { Listing } from '@/features/marketplace/api/api'

const SHARE_URL = (path: string) =>
  typeof window !== 'undefined' ? `${window.location.origin}${path}` : ''

export function ShareListingButton({
  listing,
  variant = 'button',
  className,
}: {
  listing: Listing
  variant?: 'icon' | 'button'
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const url = SHARE_URL(`/listing/${listing.id}`)
  const text = `${listing.title} – ${listing.price ? `$${listing.price}` : ''} on Everything UMass`

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied', description: 'Share link copied to clipboard.' })
    setOpen(false)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text,
        url,
      }).then(() => {
        toast({ title: 'Shared', description: 'Thanks for sharing!' })
        setOpen(false)
      }).catch(() => {})
    } else {
      handleCopy()
    }
  }

  const shareTargets = [
    { label: 'Copy link', onClick: handleCopy, icon: Copy },
    {
      label: 'WhatsApp',
      onClick: () => {
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
        setOpen(false)
      },
      icon: MessageCircle,
    },
    {
      label: 'Facebook',
      onClick: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        setOpen(false)
      },
      icon: Share2,
    },
    {
      label: 'Share (device)',
      onClick: handleShare,
      icon: Share2,
    },
  ]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {variant === 'icon' ? (
          <Button variant="ghost" size="icon" aria-label="Share listing">
            <Share2 className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="outline" size="sm" className={className}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {shareTargets.map(({ label, onClick, icon: Icon }) => (
          <DropdownMenuItem key={label} onSelect={onClick}>
            <Icon className="h-4 w-4 mr-2" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
