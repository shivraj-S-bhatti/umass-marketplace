import { useMemo, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { Home, Image, Link2, Plus, Upload, X } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { createListing, type CreateListingRequest, type ListingExternalLink } from '@/features/marketplace/api/api'
import { useToast } from '@/shared/hooks/use-toast'
import { compressImage } from '@/shared/lib/utils/imageCompression'
import { UPLOAD_IMAGE_MAX_KB } from '@/shared/lib/constants/constants'

const MAX_IMAGES = 8
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

const LEASE_ARRANGEMENTS = [
  { value: 'SUBLET', label: 'Sublet' },
  { value: 'LEASE_TRANSFER', label: 'Lease transfer' },
]

const TRANSFER_SCOPES = [
  { value: 'ENTIRE_UNIT', label: 'Entire unit' },
  { value: 'ROOMS_ONLY', label: 'Specific room(s)' },
]

const SPACE_TYPES = [
  { value: 'ENTIRE_UNIT', label: 'Entire unit' },
  { value: 'PRIVATE_ROOM', label: 'Private room' },
  { value: 'SHARED_ROOM', label: 'Shared room' },
  { value: 'CONVERTED_LIVING_ROOM', label: 'Converted living room' },
]

const LAUNDRY_TYPES = [
  { value: 'IN_UNIT', label: 'In-unit washer / dryer' },
  { value: 'ON_SITE', label: 'On-site laundry' },
  { value: 'ON_FLOOR', label: 'Laundry on floor' },
  { value: 'NONE', label: 'No laundry' },
]

const LINK_TYPES: NonNullable<ListingExternalLink['type']>[] = ['OFFICIAL_SITE', 'FLOOR_PLAN', 'APPLICATION', 'OTHER']

type LeasingFormState = {
  title: string
  description: string
  price: string
  leaseArrangement: 'SUBLET' | 'LEASE_TRANSFER'
  transferScope: '' | 'ENTIRE_UNIT' | 'ROOMS_ONLY'
  spaceType: 'ENTIRE_UNIT' | 'PRIVATE_ROOM' | 'SHARED_ROOM' | 'CONVERTED_LIVING_ROOM'
  propertyName: string
  areaLabel: string
  availableFrom: string
  leaseEnd: string
  bedrooms: string
  bathrooms: string
  nearestBusStopName: string
  nearestBusStopWalkMinutes: string
  busRoutesText: string
  includedUtilitiesText: string
  estimatedUtilitiesMonthlyTotal: string
  electricityEstimate: string
  gasEstimate: string
  waterEstimate: string
  internetEstimate: string
  laundryType: 'IN_UNIT' | 'ON_SITE' | 'ON_FLOOR' | 'NONE'
  amenitiesText: string
  cleaningNotes: string
}

function blankLink(): ListingExternalLink {
  return { label: '', url: '', type: 'OTHER' }
}

const DEFAULT_FORM: LeasingFormState = {
  title: '',
  description: '',
  price: '',
  leaseArrangement: 'SUBLET',
  transferScope: '',
  spaceType: 'PRIVATE_ROOM',
  propertyName: '',
  areaLabel: '',
  availableFrom: '',
  leaseEnd: '',
  bedrooms: '',
  bathrooms: '',
  nearestBusStopName: '',
  nearestBusStopWalkMinutes: '',
  busRoutesText: '',
  includedUtilitiesText: '',
  estimatedUtilitiesMonthlyTotal: '',
  electricityEstimate: '',
  gasEstimate: '',
  waterEstimate: '',
  internetEstimate: '',
  laundryType: 'IN_UNIT',
  amenitiesText: '',
  cleaningNotes: '',
}

function splitList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseOptionalNumber(value: string) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function parseBathroomNumber(value: string) {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error(`Failed to read ${file.name}`))
    reader.readAsDataURL(file)
  })
}

export default function LeasingSellPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState<LeasingFormState>(DEFAULT_FORM)
  const [links, setLinks] = useState<ListingExternalLink[]>([{ label: '', url: '', type: 'OFFICIAL_SITE' }])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const activeLinkCount = useMemo(
    () => links.filter((link) => link.label.trim() || link.url.trim()).length,
    [links]
  )

  const createListingMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      toast({
        title: 'Lease post created',
        description: 'Your leasing post is live and ready to share.',
      })
      queryClient.invalidateQueries({ queryKey: ['leasing-listings'] })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings'] })
      queryClient.invalidateQueries({ queryKey: ['my-listings-stats'] })
      navigate('/leasings/dashboard')
    },
    onError: (error: Error) => {
      toast({
        title: 'Could not create lease post',
        description: error.message || 'Please review the form and try again.',
        variant: 'destructive',
      })
    },
  })

  const updateField = <K extends keyof LeasingFormState>(key: K, value: LeasingFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const addLink = () => {
    setLinks((prev) => [...prev, blankLink()])
  }

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const updateLink = (index: number, patch: Partial<ListingExternalLink>) => {
    setLinks((prev) => prev.map((link, i) => (i === index ? { ...link, ...patch } : link)))
  }

  const removeImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleImageSelection = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    if (selectedFiles.length === 0) return

    const remainingSlots = MAX_IMAGES - imagePreviews.length
    const nextFiles = selectedFiles.slice(0, remainingSlots)
    if (nextFiles.length < selectedFiles.length) {
      toast({
        title: 'Image limit reached',
        description: `You can upload up to ${MAX_IMAGES} images per lease post.`,
        variant: 'destructive',
      })
    }

    for (const file of nextFiles) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Unsupported file',
          description: `${file.name} is not an image.`,
          variant: 'destructive',
        })
        continue
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: 'Image too large',
          description: `${file.name} is larger than 5MB before compression.`,
          variant: 'destructive',
        })
        continue
      }

      const dataUrl = await fileToDataUrl(file)
      const compressed = await compressImage(dataUrl, UPLOAD_IMAGE_MAX_KB)
      setImagePreviews((prev) => [...prev, compressed].slice(0, MAX_IMAGES))
    }

    event.target.value = ''
  }

  const resetForm = () => {
    setForm(DEFAULT_FORM)
    setLinks([{ label: '', url: '', type: 'OFFICIAL_SITE' }])
    setImagePreviews([])
  }

  const buildRequest = (): CreateListingRequest | null => {
    if (!form.title.trim()) {
      toast({ title: 'Title required', description: 'Add a title for the lease post.', variant: 'destructive' })
      return null
    }

    const parsedPrice = Number(form.price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast({ title: 'Monthly rent required', description: 'Enter a valid monthly rent.', variant: 'destructive' })
      return null
    }

    if (!form.propertyName.trim() || !form.areaLabel.trim()) {
      toast({
        title: 'Location details required',
        description: 'Add both the property/community name and a broad area label.',
        variant: 'destructive',
      })
      return null
    }

    if (!form.availableFrom || !form.leaseEnd) {
      toast({
        title: 'Lease dates required',
        description: 'Add both the available date and lease end date.',
        variant: 'destructive',
      })
      return null
    }

    if (form.leaseArrangement === 'LEASE_TRANSFER' && !form.transferScope) {
      toast({
        title: 'Transfer scope required',
        description: 'Choose whether the transfer is for the whole unit or specific room(s).',
        variant: 'destructive',
      })
      return null
    }

    if (imagePreviews.length === 0) {
      toast({
        title: 'Photos required',
        description: 'Add at least one room or unit photo so people know what they are walking into.',
        variant: 'destructive',
      })
      return null
    }

    const cleanedLinks = links
      .map((link) => ({
        label: link.label.trim(),
        url: link.url.trim(),
        type: link.type || 'OTHER',
      }))
      .filter((link) => link.label || link.url)

    for (const link of cleanedLinks) {
      if (!link.label || !link.url) {
        toast({
          title: 'Incomplete external link',
          description: 'Each saved link needs both a label and a URL.',
          variant: 'destructive',
        })
        return null
      }
      try {
        new URL(link.url)
      } catch {
        toast({
          title: 'Invalid URL',
          description: `${link.url} is not a valid link.`,
          variant: 'destructive',
        })
        return null
      }
    }

    return {
      kind: 'LEASING',
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      price: parsedPrice,
      imageUrls: imagePreviews,
      imageUrl: imagePreviews[0],
      leaseArrangement: form.leaseArrangement,
      transferScope: form.leaseArrangement === 'LEASE_TRANSFER' ? form.transferScope || undefined : undefined,
      spaceType: form.spaceType,
      propertyName: form.propertyName.trim(),
      areaLabel: form.areaLabel.trim(),
      availableFrom: form.availableFrom,
      leaseEnd: form.leaseEnd,
      bedrooms: parseOptionalNumber(form.bedrooms),
      bathrooms: parseBathroomNumber(form.bathrooms),
      nearestBusStopName: form.nearestBusStopName.trim() || undefined,
      nearestBusStopWalkMinutes: parseOptionalNumber(form.nearestBusStopWalkMinutes),
      busRoutes: splitList(form.busRoutesText),
      includedUtilities: splitList(form.includedUtilitiesText),
      estimatedUtilitiesMonthlyTotal: parseOptionalNumber(form.estimatedUtilitiesMonthlyTotal),
      electricityEstimate: parseOptionalNumber(form.electricityEstimate),
      gasEstimate: parseOptionalNumber(form.gasEstimate),
      waterEstimate: parseOptionalNumber(form.waterEstimate),
      internetEstimate: parseOptionalNumber(form.internetEstimate),
      laundryType: form.laundryType,
      amenities: splitList(form.amenitiesText),
      cleaningNotes: form.cleaningNotes.trim() || undefined,
      externalLinks: cleanedLinks.length > 0 ? cleanedLinks : undefined,
    }
  }

  const handleSubmit = () => {
    const request = buildRequest()
    if (!request) return
    createListingMutation.mutate(request)
  }

  return (
    <div className="container mx-auto px-4 py-4 max-w-6xl space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
            <Home className="h-3.5 w-3.5" />
            Leasing
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Post a sublet or transfer</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Share the details students actually need before messaging: room photos, utilities, bus access, amenities, and the shape of the lease itself.
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          Max {MAX_IMAGES} compressed photos, shared messaging, and the same public share flow as marketplace posts.
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Plus className="h-5 w-5" />
            Leasing details
          </CardTitle>
          <CardDescription>
            Keep the public post broad and useful. Save precise unit-level logistics for chat after someone is interested.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="leasing-title">Title *</Label>
              <Input
                id="leasing-title"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Private room in Sugarloaf for summer sublet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leasing-price">Monthly rent *</Label>
              <Input
                id="leasing-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                placeholder="950"
              />
            </div>
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="leasing-description">Description</Label>
              <textarea
                id="leasing-description"
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Call out the vibe of the space, who the current roommates are, furniture included, and anything a student should know before messaging."
                className="flex min-h-[110px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Arrangement *</Label>
              <select
                value={form.leaseArrangement}
                onChange={(e) => updateField('leaseArrangement', e.target.value as LeasingFormState['leaseArrangement'])}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {LEASE_ARRANGEMENTS.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Transfer scope {form.leaseArrangement === 'LEASE_TRANSFER' ? '*' : ''}</Label>
              <select
                value={form.transferScope}
                onChange={(e) => updateField('transferScope', e.target.value as LeasingFormState['transferScope'])}
                disabled={form.leaseArrangement !== 'LEASE_TRANSFER'}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm disabled:opacity-50"
              >
                <option value="">{form.leaseArrangement === 'LEASE_TRANSFER' ? 'Select scope' : 'Not needed for sublets'}</option>
                {TRANSFER_SCOPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Space type *</Label>
              <select
                value={form.spaceType}
                onChange={(e) => updateField('spaceType', e.target.value as LeasingFormState['spaceType'])}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {SPACE_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Laundry</Label>
              <select
                value={form.laundryType}
                onChange={(e) => updateField('laundryType', e.target.value as LeasingFormState['laundryType'])}
                className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              >
                {LAUNDRY_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="propertyName">Property or community *</Label>
              <Input
                id="propertyName"
                value={form.propertyName}
                onChange={(e) => updateField('propertyName', e.target.value)}
                placeholder="Sugarloaf Estates"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="areaLabel">Broad area *</Label>
              <Input
                id="areaLabel"
                value={form.areaLabel}
                onChange={(e) => updateField('areaLabel', e.target.value)}
                placeholder="North Amherst"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                min="0"
                step="1"
                value={form.bedrooms}
                onChange={(e) => updateField('bedrooms', e.target.value)}
                placeholder="2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                min="0"
                step="0.5"
                value={form.bathrooms}
                onChange={(e) => updateField('bathrooms', e.target.value)}
                placeholder="1.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availableFrom">Available from *</Label>
              <Input
                id="availableFrom"
                type="date"
                value={form.availableFrom}
                onChange={(e) => updateField('availableFrom', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="leaseEnd">Lease end *</Label>
              <Input
                id="leaseEnd"
                type="date"
                value={form.leaseEnd}
                onChange={(e) => updateField('leaseEnd', e.target.value)}
              />
            </div>
          </div>

          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Transit and utilities</CardTitle>
              <CardDescription>
                Keep these structured so people can compare options quickly before they DM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nearestBusStopName">Nearest bus stop</Label>
                  <Input
                    id="nearestBusStopName"
                    value={form.nearestBusStopName}
                    onChange={(e) => updateField('nearestBusStopName', e.target.value)}
                    placeholder="Sugarloaf Estates stop"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nearestBusStopWalkMinutes">Walk to stop (minutes)</Label>
                  <Input
                    id="nearestBusStopWalkMinutes"
                    type="number"
                    min="0"
                    step="1"
                    value={form.nearestBusStopWalkMinutes}
                    onChange={(e) => updateField('nearestBusStopWalkMinutes', e.target.value)}
                    placeholder="4"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="busRoutesText">Bus routes</Label>
                  <Input
                    id="busRoutesText"
                    value={form.busRoutesText}
                    onChange={(e) => updateField('busRoutesText', e.target.value)}
                    placeholder="30, 31, B43"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="includedUtilitiesText">Included utilities</Label>
                  <Input
                    id="includedUtilitiesText"
                    value={form.includedUtilitiesText}
                    onChange={(e) => updateField('includedUtilitiesText', e.target.value)}
                    placeholder="Heat, water, internet"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedUtilitiesMonthlyTotal">Estimated monthly utilities total</Label>
                  <Input
                    id="estimatedUtilitiesMonthlyTotal"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.estimatedUtilitiesMonthlyTotal}
                    onChange={(e) => updateField('estimatedUtilitiesMonthlyTotal', e.target.value)}
                    placeholder="80"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="electricityEstimate">Electricity</Label>
                  <Input
                    id="electricityEstimate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.electricityEstimate}
                    onChange={(e) => updateField('electricityEstimate', e.target.value)}
                    placeholder="35"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gasEstimate">Gas</Label>
                  <Input
                    id="gasEstimate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.gasEstimate}
                    onChange={(e) => updateField('gasEstimate', e.target.value)}
                    placeholder="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waterEstimate">Water</Label>
                  <Input
                    id="waterEstimate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.waterEstimate}
                    onChange={(e) => updateField('waterEstimate', e.target.value)}
                    placeholder="15"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internetEstimate">Internet</Label>
                  <Input
                    id="internetEstimate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.internetEstimate}
                    onChange={(e) => updateField('internetEstimate', e.target.value)}
                    placeholder="25"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="text-lg">Amenities and move-in reality</CardTitle>
              <CardDescription>
                Give people the practical details they usually need to ask for one by one.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amenitiesText">Amenities</Label>
                <Input
                  id="amenitiesText"
                  value={form.amenitiesText}
                  onChange={(e) => updateField('amenitiesText', e.target.value)}
                  placeholder="Gym, study room, parking, pool"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cleaningNotes">Cleaning / condition notes</Label>
                <textarea
                  id="cleaningNotes"
                  value={form.cleaningNotes}
                  onChange={(e) => updateField('cleaningNotes', e.target.value)}
                  placeholder="Mention whether the room will be professionally cleaned, whether furniture is staying, and anything the next tenant should plan to handle."
                  className="flex min-h-[96px] w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Image className="h-4 w-4" />
                Room and unit photos
              </CardTitle>
              <CardDescription>
                Add up to {MAX_IMAGES} compressed photos. Room photos matter especially when the space is not being professionally turned over.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelection}
                className="hidden"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload photos
                </Button>
                <p className="text-xs text-muted-foreground">
                  {imagePreviews.length}/{MAX_IMAGES} added
                </p>
              </div>
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {imagePreviews.map((src, index) => (
                    <div key={`${src.slice(0, 24)}-${index}`} className="relative rounded-xl overflow-hidden border border-border bg-background">
                      <img src={src} alt={`Lease photo ${index + 1}`} className="h-36 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute right-2 top-2 inline-flex items-center justify-center rounded-full bg-black/70 p-1 text-white"
                        aria-label={`Remove lease photo ${index + 1}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-muted/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Link2 className="h-4 w-4" />
                Official links
              </CardTitle>
              <CardDescription>
                Add the apartment site, floor plan, or application link so people can verify the official details without leaving your post.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {links.map((link, index) => (
                <div key={index} className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_180px_auto] gap-3 items-end rounded-xl border border-border bg-background p-3">
                  <div className="space-y-2">
                    <Label>Label</Label>
                    <Input
                      value={link.label}
                      onChange={(e) => updateLink(index, { label: e.target.value })}
                      placeholder="Official property site"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL</Label>
                    <Input
                      value={link.url}
                      onChange={(e) => updateLink(index, { url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <select
                      value={link.type || 'OTHER'}
                      onChange={(e) => updateLink(index, { type: e.target.value as ListingExternalLink['type'] })}
                      className="flex h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    >
                      {LINK_TYPES.map((type) => (
                        <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeLink(index)}
                    disabled={links.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-muted-foreground">{activeLinkCount} active link{activeLinkCount === 1 ? '' : 's'}</p>
                <Button type="button" variant="outline" onClick={addLink}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add another link
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={handleSubmit} disabled={createListingMutation.isPending}>
              {createListingMutation.isPending ? 'Posting...' : 'Post lease'}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm} disabled={createListingMutation.isPending}>
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
