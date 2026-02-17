// ...existing code... (removed unused useState import)
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { createListing } from '@/features/marketplace/api/api'
import { useToast } from '@/shared/hooks/use-toast'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog'
import { useState, useRef } from 'react'
import { MapPin, Loader2, Download, Image, X } from 'lucide-react'
import { createBulkListings, type CreateListingRequest } from '@/features/marketplace/api/api'
import { CATEGORIES, CONDITIONS, UPLOAD_IMAGE_MAX_KB } from '@/shared/lib/constants/constants'
import { parseExcelFile, validateTemplateFormat, validateExcelStructure, downloadTemplate, convertToCreateListingForm } from '@/features/marketplace/excelTemplate'
import LocationMapSelector from '@/features/marketplace/components/LocationMapSelector'
import { compressImage } from '@/shared/lib/utils/imageCompression'

// Sell Page - form for creating new marketplace listings
// Allows users to post items for sale with validation and error handling
const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').max(999999.99, 'Price must be less than $999,999.99'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  condition: z.string().max(50, 'Condition must be less than 50 characters').optional(),
  imageUrl: z.string().max(6000000, 'Image data is too large').optional(),
  mustGoBy: z.string().optional(),
})

export type CreateListingForm = z.infer<typeof createListingSchema>

export default function SellPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const imageInputRef = useRef<HTMLInputElement>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [useLocation, setUseLocation] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema),
  })

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please select an image file.',
          variant: 'destructive',
        })
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Image must be less than 5MB.',
          variant: 'destructive',
        })
        return
      }

      setImageFile(file)

      // Create preview and compress image
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        
        // Compress image to fit within size limits
        const compressedBase64 = await compressImage(base64String, UPLOAD_IMAGE_MAX_KB)
        
        setImagePreview(compressedBase64)
        setValue('imageUrl', compressedBase64)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setValue('imageUrl', '')
  }

  const createListingMutation = useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Your listing has been created successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      reset()
      setImageFile(null)
      setImagePreview('')
      navigate('/dashboard')
    },
    onError: (error: Error) => {
      console.error('❌ Create listing error:', error)
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      })
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationLoading(false)
        toast({
          title: "Location captured!",
          description: `Near UMass Amherst (~${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
        })
      },
      () => {
        setLocationLoading(false)
        setUseLocation(false)
        toast({
          title: "Location access denied",
          description: "You can still create the listing without location.",
          variant: "destructive",
        })
      },
      { timeout: 10000 }
    )
  }

  const onSubmit = (data: CreateListingForm) => {
    const finalData = {
      ...data,
      ...(useLocation && latitude && longitude
        ? { latitude, longitude }
        : {}),
      // Convert datetime-local to ISO 8601 format
      ...(data.mustGoBy ? { mustGoBy: new Date(data.mustGoBy).toISOString() } : {}),
    }
    createListingMutation.mutate(finalData)
  }

  return (
    <div className="container mx-auto px-4 py-3">
      <div className="max-w-2xl mx-auto">
      <div className="text-center py-3 mb-3">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Sell an Item</h1>
        <p className="text-base text-muted-foreground">
          List your item for sale to fellow UMass students.
        </p>
      </div>
      <div className="mb-3 flex flex-wrap justify-center gap-4">
        <PhotoBulkUploadModal />
        <BulkUploadModal />
      </div>
      <p className="text-center text-sm text-muted-foreground mb-3">List one item: use the form below.</p>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-2xl">
            <Plus className="h-6 w-6 mr-2" />
            Create New Listing
          </CardTitle>
          <CardDescription className="text-base">
            Fill out the form below to list your item for sale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="e.g., MacBook Pro 13-inch"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                placeholder="Describe your item in detail..."
                className="flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price *</Label>
              <div className="relative">
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999.99"
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                />
              </div>
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('category')}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category.message}</p>
              )}
            </div>

            {/* Condition */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                className="flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register('condition')}
              >
                <option value="">Select condition</option>
                {CONDITIONS.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="text-sm text-destructive">{errors.condition.message}</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="image">Item Image (Optional)</Label>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                  ref={imageInputRef}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="h-10"
                  onClick={() => imageInputRef.current?.click()}
                >
                  {imageFile ? imageFile.name : 'Choose file'}
                </Button>
                {imageFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-10"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
                )}
                {!imageFile && (
                  <span className="text-sm text-muted-foreground">No file chosen</span>
                )}
              </div>
              {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl.message}</p>
              )}
              {imagePreview && (
                <div className="mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-32 w-32 object-cover rounded-lg border border-border"
                  />
                </div>
              )}
            </div>
            {/* Must Go By Date */}
            <div className="space-y-2">
              <Label htmlFor="mustGoBy">Must Go By (Optional)</Label>
              <Input
                id="mustGoBy"
                type="datetime-local"
                {...register('mustGoBy')}
              />
              {errors.mustGoBy && (
                <p className="text-sm text-destructive">{errors.mustGoBy.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Set a deadline for when this item must be sold
              </p>
            </div>

            {/* Location Sharing Toggle */}
            <div className="space-y-3 rounded-lg border border-input bg-muted/20 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="useLocation"
                  checked={useLocation}
                  onChange={(e) => {
                    setUseLocation(e.target.checked)
                    if (!e.target.checked) {
                      setLatitude(null)
                      setLongitude(null)
                    }
                  }}
                className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Share my location with buyers"
                />
                <Label htmlFor="useLocation" className="cursor-pointer font-medium flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Share my location with buyers
                </Label>
              </div>

              {useLocation && (
                <div className="ml-7 mt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={captureLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-2"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Getting your location...
                      </>
                    ) : latitude ? (
                      <>
                        <MapPin className="h-4 w-4" />
                        Location captured
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        Use my current location
                      </>
                    )}
                  </Button>
                  {latitude && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Location set to: {latitude.toFixed(4)}, {longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={createListingMutation.isPending}
                className="flex-1"
              >
                {createListingMutation.isPending ? 'Creating...' : 'Create Listing'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => reset()}
                disabled={createListingMutation.isPending}
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

const MAX_PHOTOS = 15
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB, same as single-listing form

type PerItemDetails = {
  title: string
  price: string
  description: string
  category: string
  condition: string
}

const defaultItemDetails = (): PerItemDetails => ({
  title: '',
  price: '1',
  description: '',
  category: '',
  condition: '',
})

function PhotoBulkUploadModal() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [itemDetails, setItemDetails] = useState<PerItemDetails[]>([])
  const [useLocation, setUseLocation] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [showMapSelector, setShowMapSelector] = useState(false)
  const [mustGoBy, setMustGoBy] = useState<string>('')

  const createBulkListingsMutation = useMutation({
    mutationFn: createBulkListings,
    onSuccess: (data) => {
      toast({ title: 'Success!', description: `${data.length} listings created successfully.` })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      setFiles([])
      setPreviews([])
      setItemDetails([])
      setIsOpen(false)
      navigate('/dashboard')
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create listings. Please try again.', variant: 'destructive' })
    },
  })

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    const valid = selected.filter((f) => f.type.startsWith('image/') && f.size <= MAX_IMAGE_SIZE_BYTES)
    if (valid.length !== selected.length) {
      toast({ title: 'Some files skipped', description: 'Only images under 5MB are allowed.', variant: 'destructive' })
    }
    const combined = [...files, ...valid].slice(0, MAX_PHOTOS)
    setFiles(combined)
    setItemDetails((prev) => {
      const next = [...prev]
      while (next.length < combined.length) next.push(defaultItemDetails())
      return next.slice(0, combined.length)
    })
    if (combined.length > MAX_PHOTOS) {
      toast({ title: 'Limit reached', description: `Showing first ${MAX_PHOTOS} photos.`, variant: 'destructive' })
    }
    Promise.all(
      combined.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      })
    ).then(setPreviews)
    e.target.value = ''
  }

  const removePhoto = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
    setItemDetails((prev) => prev.filter((_, i) => i !== index))
  }

  const updateItemDetail = (index: number, field: keyof PerItemDetails, value: string) => {
    setItemDetails((prev) => {
      const next = [...prev]
      if (next[index]) next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFiles([])
      setPreviews([])
      setItemDetails([])
      setUseLocation(false)
      setLatitude(null)
      setLongitude(null)
      setShowMapSelector(false)
      setMustGoBy('')
    }
    setIsOpen(open)
  }

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Geolocation not supported', description: 'Your browser does not support location.', variant: 'destructive' })
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationLoading(false)
        toast({ title: 'Location captured!', description: 'Applied to all listings.' })
      },
      () => {
        setLocationLoading(false)
        setUseLocation(false)
        toast({ title: 'Location denied', description: 'You can still list without location.', variant: 'destructive' })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const handleSubmit = async () => {
    if (files.length === 0) {
      toast({ title: 'No photos', description: 'Select at least one photo.', variant: 'destructive' })
      return
    }
    const invalid: string[] = []
    itemDetails.forEach((d, i) => {
      if (!d.title.trim()) invalid.push(`Item ${i + 1}: title required`)
      const p = parseFloat(d.price)
      if (!Number.isFinite(p) || p <= 0) invalid.push(`Item ${i + 1}: valid price required`)
    })
    if (invalid.length > 0) {
      toast({ title: 'Please fix errors', description: invalid.slice(0, 5).join('; '), variant: 'destructive' })
      return
    }

    const compressedUrls: string[] = []
    for (let i = 0; i < files.length; i++) {
      const reader = new FileReader()
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(files[i])
      })
      const compressed = await compressImage(dataUrl, UPLOAD_IMAGE_MAX_KB)
      compressedUrls.push(compressed)
    }

    const listings: CreateListingRequest[] = compressedUrls.map((imageUrl, i) => {
      const d = itemDetails[i] ?? defaultItemDetails()
      return {
        title: d.title.trim(),
        price: parseFloat(d.price),
        description: d.description.trim() || undefined,
        category: d.category || undefined,
        condition: d.condition || undefined,
        imageUrl,
        ...(useLocation && latitude != null && longitude != null ? { latitude, longitude } : {}),
        ...(mustGoBy ? { mustGoBy: new Date(mustGoBy).toISOString() } : {}),
      }
    })

    createBulkListingsMutation.mutate(listings)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          List multiple from photos
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List multiple items from photos</DialogTitle>
          <DialogDescription className="sr-only">
            Add photos and fill in details for each item.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Photos (up to {MAX_PHOTOS})</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/30 text-muted-foreground hover:bg-muted/50">
                <Image className="h-6 w-6" />
                <span className="text-xs mt-1">Add</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
              </label>
              {previews.map((src, i) => (
                <div key={i} className="relative">
                  <img src={src} alt={`Item ${i + 1}`} className="h-24 w-24 rounded-lg object-cover border border-border" />
                  <button
                    type="button"
                    onClick={() => removePhoto(i)}
                    className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground hover:bg-destructive/90"
                    aria-label={`Remove photo ${i + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {previews.length > 0 && (
            <div className="space-y-4">
              <Label>Details for each item</Label>
              {previews.map((src, i) => {
                const d = itemDetails[i] ?? defaultItemDetails()
                return (
                  <div key={i} className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                    <div className="flex items-center gap-3 font-medium text-sm">Item {i + 1}</div>
                    <div className="flex gap-4">
                      <div className="shrink-0">
                        <img src={src} alt={`Item ${i + 1}`} className="h-20 w-20 rounded-lg object-cover border border-border" />
                      </div>
                      <div className="flex-1 grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Title *</Label>
                          <Input
                            value={d.title}
                            onChange={(e) => updateItemDetail(i, 'title', e.target.value)}
                            placeholder="e.g. Desk lamp"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Price *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={d.price}
                            onChange={(e) => updateItemDetail(i, 'price', e.target.value)}
                            placeholder="0.00"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <Label className="text-xs">Description</Label>
                          <Input
                            value={d.description}
                            onChange={(e) => updateItemDetail(i, 'description', e.target.value)}
                            placeholder="Optional"
                            className="h-9 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Category</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                            value={d.category}
                            onChange={(e) => updateItemDetail(i, 'category', e.target.value)}
                          >
                            <option value="">Select</option>
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Condition</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                            value={d.condition}
                            onChange={(e) => updateItemDetail(i, 'condition', e.target.value)}
                          >
                            <option value="">Select</option>
                            {CONDITIONS.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-input bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="photoBulkUseLocation"
                checked={useLocation}
                onChange={(e) => {
                  setUseLocation(e.target.checked)
                  if (!e.target.checked) {
                    setLatitude(null)
                    setLongitude(null)
                    setShowMapSelector(false)
                  }
                }}
                className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-ring"
                aria-label="Assign location to all listings"
              />
              <Label htmlFor="photoBulkUseLocation" className="cursor-pointer font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Assign location to all listings
              </Label>
            </div>
            {useLocation && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={captureLocation} disabled={locationLoading} className="flex items-center gap-2">
                    {locationLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Getting location...</> : latitude ? <><MapPin className="h-4 w-4" /> Location captured</> : <><MapPin className="h-4 w-4" /> Use my location</>}
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowMapSelector((s) => !s)} className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {showMapSelector ? 'Hide map' : 'Select on map'}
                  </Button>
                </div>
                {latitude != null && longitude != null && <p className="text-xs text-muted-foreground">Location: {latitude.toFixed(4)}, {longitude.toFixed(4)}</p>}
                {showMapSelector && (
                  <LocationMapSelector onLocationSelect={(lat, lng) => { setLatitude(lat); setLongitude(lng) }} initialLat={latitude ?? undefined} initialLng={longitude ?? undefined} height="300px" />
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="photoBulkMustGoBy">Must go by (optional)</Label>
            <Input id="photoBulkMustGoBy" type="datetime-local" value={mustGoBy} onChange={(e) => setMustGoBy(e.target.value)} />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createBulkListingsMutation.isPending || files.length === 0}
            className="w-full"
          >
            {createBulkListingsMutation.isPending ? 'Creating...' : `Create ${files.length} listing${files.length !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function BulkUploadModal() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [useLocation, setUseLocation] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [showMapSelector, setShowMapSelector] = useState(false)
  const [mustGoBy, setMustGoBy] = useState<string>('')

  const createBulkListingsMutation = useMutation({
    mutationFn: createBulkListings,
    onSuccess: (data) => {
      toast({ title: 'Success!', description: `${data.length} listings created successfully.` })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      setFile(null)
      setIsOpen(false)
      navigate('/dashboard')
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create bulk listings.', variant: 'destructive' })
    },
  })

  const handleSubmit = async () => {
    if (!file) {
      toast({ title: 'No File', description: 'Please select an Excel file.', variant: 'destructive' })
      return
    }

    // Validate file format
    const formatValidation = validateTemplateFormat(file)
    if (!formatValidation.valid) {
      toast({ title: 'Invalid File', description: formatValidation.error, variant: 'destructive' })
      return
    }

    setIsProcessing(true)
    try {
      // Parse Excel file
      const parsedRows = await parseExcelFile(file)
      
      // Validate structure
      const structureValidation = validateExcelStructure(parsedRows)
      if (!structureValidation.valid) {
        toast({ title: 'Invalid Template', description: structureValidation.error, variant: 'destructive' })
        setIsProcessing(false)
        return
      }

      // Convert to CreateListingForm and validate
      const validListings: CreateListingForm[] = []
      const invalidRows: string[] = []

      // Convert parsed rows to CreateListingForm using the conversion function
      const convertedListings = convertToCreateListingForm(parsedRows)
      
      // Debug: Log first listing to check imageUrl
      if (convertedListings.length > 0) {
      }
      
      convertedListings.forEach((listing, index) => {
        const result = createListingSchema.safeParse(listing)
        if (result.success) {
          validListings.push(result.data)
        } else {
          invalidRows.push(`Row ${index + 2}: ${result.error.issues.map(issue => issue.message).join(', ')}`)
        }
      })

      if (invalidRows.length > 0) {
        toast({
          title: 'Validation Errors',
          description: `Found ${invalidRows.length} invalid row(s). First few: ${invalidRows.slice(0, 3).join('; ')}`,
          variant: 'destructive',
        })
      }

      if (validListings.length > 0) {
        // Apply location and mustGoBy to all listings if enabled
        const listingsWithLocation = validListings.map(listing => ({
          ...listing,
          ...(useLocation && latitude && longitude
            ? { latitude, longitude }
            : { latitude: null, longitude: null }
          ),
          ...(mustGoBy ? { mustGoBy: new Date(mustGoBy).toISOString() } : {}),
        }))
        createBulkListingsMutation.mutate(listingsWithLocation)
      } else {
        toast({ title: 'No Valid Listings', description: 'No valid rows found in Excel file.', variant: 'destructive' })
      }
    } catch (error: any) {
      toast({ title: 'Excel Parse Error', description: error.message || 'Failed to parse Excel file', variant: 'destructive' })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadTemplate = () => {
    try {
      downloadTemplate()
      toast({ title: 'Template Downloaded', description: 'Listing template downloaded successfully.' })
    } catch (error) {
      toast({ title: 'Download Error', description: 'Failed to download template.', variant: 'destructive' })
    }
  }

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support location services.',
        variant: 'destructive',
      })
      return
    }
    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude)
        setLongitude(position.coords.longitude)
        setLocationLoading(false)
        toast({
          title: 'Location captured!',
          description: `Near UMass Amherst (~${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)})`,
        })
      },
      () => {
        setLocationLoading(false)
        setUseLocation(false)
        toast({
          title: 'Location access denied',
          description: 'You can still create listings without location.',
          variant: 'destructive',
        })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk upload via Excel</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Listings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="excelFile">Upload Excel File</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>
            <Input
              id="excelFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground mt-2">
              Excel format: Required columns - title, price. Optional - description, category, condition, image, link.
              <br />
              Download the template above to ensure correct format.
            </p>
          </div>
          
          {/* Location Assignment Section */}
          <div className="space-y-3 rounded-lg border border-input bg-muted/20 p-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="bulkUseLocation"
                checked={useLocation}
                onChange={(e) => {
                  setUseLocation(e.target.checked)
                  if (!e.target.checked) {
                    setLatitude(null)
                    setLongitude(null)
                    setShowMapSelector(false)
                  }
                }}
                className="h-4 w-4 rounded border-border bg-card text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-label="Share location with buyers for all listings"
              />
              <Label htmlFor="bulkUseLocation" className="cursor-pointer font-medium flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Assign location to all listings
              </Label>
            </div>

            {useLocation && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={captureLocation}
                    disabled={locationLoading}
                    className="flex items-center gap-2"
                  >
                    {locationLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Getting your location...
                      </>
                    ) : latitude ? (
                      <>
                        <MapPin className="h-4 w-4" />
                        Location captured
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4" />
                        Use my current location
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMapSelector(!showMapSelector)}
                    className="flex items-center gap-2"
                  >
                    <MapPin className="h-4 w-4" />
                    {showMapSelector ? 'Hide Map' : 'Select on Map'}
                  </Button>
                </div>
                
                {latitude && longitude && (
                  <p className="text-xs text-muted-foreground">
                    Location set to: {latitude.toFixed(4)}, {longitude.toFixed(4)}
                  </p>
                )}

                {showMapSelector && (
                  <LocationMapSelector
                    onLocationSelect={(lat: number, lng: number) => {
                      setLatitude(lat)
                      setLongitude(lng)
                    }}
                    initialLat={latitude}
                    initialLng={longitude}
                    height="300px"
                  />
                )}
              </div>
            )}
          </div>

          {/* Must Go By Date */}
          <div className="space-y-2">
            <Label htmlFor="bulkMustGoBy">Must Go By (Optional - applies to all listings)</Label>
            <Input
              id="bulkMustGoBy"
              type="datetime-local"
              value={mustGoBy}
              onChange={(e) => setMustGoBy(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Set a deadline for when all items must be sold
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createBulkListingsMutation.isPending || isProcessing || !file}
          >
            {createBulkListingsMutation.isPending || isProcessing ? 'Processing...' : 'Upload Bulk Listings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}