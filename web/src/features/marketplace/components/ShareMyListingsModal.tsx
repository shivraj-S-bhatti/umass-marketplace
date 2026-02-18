import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { useToast } from '@/shared/hooks/use-toast'
import { slugifyName } from '@/shared/lib/utils/utils'
import { Copy, Share2, Download } from 'lucide-react'

const SHARE_MESSAGE = "Hey! I'm selling a few things — here's the link: {url}"

export interface ShareMyListingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: { id: string; name?: string | null }
  listingCount?: number
  firstListingImageUrl?: string | null
}

function buildShareUrl(userId: string, userName: string | null | undefined): string {
  if (typeof window === 'undefined') return ''
  const slug = slugifyName(userName)
  return `${window.location.origin}/u/${userId}/${slug}`
}

export function ShareMyListingsModal({
  open,
  onOpenChange,
  user,
  listingCount = 0,
  firstListingImageUrl,
}: ShareMyListingsModalProps) {
  const { toast } = useToast()
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const url = buildShareUrl(user.id, user.name)
  const messageWithUrl = SHARE_MESSAGE.replace('{url}', url)

  useEffect(() => {
    if (!open || !url) return
    QRCode.toDataURL(url, { width: 200, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [open, url])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url)
    toast({ title: 'Link copied', description: 'Share link copied to clipboard.' })
  }

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(messageWithUrl)
    toast({ title: 'Message copied', description: 'Ready to paste in a chat.' })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${user.name || 'My'}'s listings`,
          text: messageWithUrl,
          url,
        })
        .then(() => {
          toast({ title: 'Shared', description: 'Thanks for sharing!' })
          onOpenChange(false)
        })
        .catch(() => {})
    } else {
      handleCopyLink()
    }
  }

  const handleDownloadQr = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = 'my-listings-qr.png'
    a.click()
    toast({ title: 'QR downloaded', description: 'PNG saved.' })
  }

  const displayName = user.name || 'My'
  const itemLabel = listingCount === 1 ? '1 item' : `${listingCount} items`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md flex flex-col max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>Share my listings</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-2">
          {/* Preview block */}
          <div className="flex gap-4 rounded-lg border border-border bg-muted/30 p-3">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-muted">
              {firstListingImageUrl ? (
                <img
                  src={firstListingImageUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl text-muted-foreground">
                  📦
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground truncate">
                {displayName}&apos;s listings
              </p>
              <p className="text-sm text-muted-foreground">
                {itemLabel} on Everything UMass
              </p>
            </div>
          </div>

          {/* Share URL */}
          <div className="rounded-lg border border-border bg-muted/20 px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground mb-1">Link</p>
            <p className="text-sm text-foreground break-all select-all" title={url}>
              {url}
            </p>
          </div>

          {/* Message template */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">
              Message (copy and paste)
            </p>
            <p className="text-sm text-foreground mb-2 rounded border border-border bg-muted/20 p-2 break-words">
              {messageWithUrl}
            </p>
            <Button variant="outline" size="sm" onClick={handleCopyMessage} className="w-full sm:w-auto">
              <Copy className="h-4 w-4 mr-2" />
              Copy message
            </Button>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCopyLink} size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy link
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share…
            </Button>
          </div>

          {/* QR */}
          {qrDataUrl && (
            <div className="flex flex-col items-center gap-2 pt-2 border-t border-border">
              <img
                src={qrDataUrl}
                alt="QR code for share link"
                className="rounded border border-border bg-white p-1"
                width={200}
                height={200}
              />
              <Button variant="ghost" size="sm" onClick={handleDownloadQr}>
                <Download className="h-4 w-4 mr-2" />
                Download QR
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
