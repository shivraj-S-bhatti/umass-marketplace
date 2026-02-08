import React, { useState, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { updateListing, getListing } from '@/features/marketplace/api/api'
import { useToast } from '@/shared/hooks/use-toast'
import { Save, ArrowLeft, MapPin, Loader2 } from 'lucide-react'
import { CATEGORIES, CONDITIONS, UPLOAD_IMAGE_MAX_KB } from '@/shared/lib/constants/constants'
import { compressImage } from '@/shared/lib/utils/imageCompression'
import LocationMapSelector from '@/features/marketplace/components/LocationMapSelector'

// Edit listing form schema
const editListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').max(999999.99, 'Price must be less than $999,999.99'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  condition: z.string().max(50, 'Condition must be less than 50 characters').optional(),
  imageUrl: z.string().max(1000000, 'Image data is too large').optional(),
  mustGoBy: z.string().optional(),
})

type EditListingForm = z.infer<typeof editListingSchema>

export default function EditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [useLocation, setUseLocation] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [showMapSelector, setShowMapSelector] = useState(false)

  // Fetch existing listing data
  const { data: listing, isLoading: isFetching } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => getListing(id!),
    enabled: !!id,
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<EditListingForm>({
    resolver: zodResolver(editListingSchema),
  })

  // Pre-populate form when listing data is loaded
  useEffect(() => {
    if (listing) {
      // Convert ISO 8601 date to datetime-local format
      const mustGoByValue = listing.mustGoBy 
        ? new Date(listing.mustGoBy).toISOString().slice(0, 16)
        : ''
      reset({
        title: listing.title,
        description: listing.description || '',
        price: listing.price,
        category: listing.category || '',
        condition: listing.condition || '',
        imageUrl: listing.imageUrl || '',
        mustGoBy: mustGoByValue,
      })
      if (listing.imageUrl) {
        setImagePreview(listing.imageUrl)
      }
      // Pre-populate location if it exists
      if (listing.latitude != null && listing.longitude != null) {
        setUseLocation(true)
        setLatitude(listing.latitude)
        setLongitude(listing.longitude)
      }
    }
  }, [listing, reset])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create preview and compress for small storage
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        const compressed = await compressImage(base64String, UPLOAD_IMAGE_MAX_KB)
        setImagePreview(compressed)
        setValue('imageUrl', compressed)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setValue('imageUrl', '')
  }

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
          description: "You can still update the listing without location.",
          variant: "destructive",
        })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const updateListingMutation = useMutation({
    mutationFn: (data: EditListingForm) => updateListing(id!, data),
    onSuccess: () => {
      toast({
        title: 'Success!',
        description: 'Your listing has been updated successfully.',
      })
      queryClient.invalidateQueries({ queryKey: ['listings'] })
      navigate('/dashboard')
    },
    onError: (error: Error) => {
      console.error('❌ Update listing error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update listing. Please try again.',
        variant: 'destructive',
      })
    },
  })

  const onSubmit = (data: EditListingForm) => {
    // Clean up the data before sending - convert empty strings to null/undefined for optional fields
    const locationData = useLocation && latitude && longitude
      ? { latitude, longitude }
      : { latitude: null, longitude: null }
    
    // Always include mustGoBy - convert datetime-local to ISO 8601 format, or empty string if empty
    // Backend logic: if != null, then if empty string sets to null (clears), otherwise parses the date
    // We send empty string (not null) so backend knows to update the field
    const mustGoByValue = data.mustGoBy && data.mustGoBy.trim() 
      ? new Date(data.mustGoBy).toISOString() 
      : '' // Send empty string to clear, not null (null would skip the update)
    
    const cleanedData = {
      ...data,
      description: data.description?.trim() || undefined,
      category: data.category?.trim() || undefined,
      condition: data.condition?.trim() || undefined,
      imageUrl: data.imageUrl?.trim() || undefined,
      mustGoBy: mustGoByValue, // Always include (empty string or ISO date)
      // Include location
      ...locationData,
    }
    
    updateListingMutation.mutate(cleanedData)
  }

  if (isFetching) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
          <p className="text-muted-foreground mb-8">Loading...</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Listing Not Found</h1>
          <p className="text-muted-foreground mb-8">The listing you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Listing</h1>
        <p className="text-muted-foreground">Update your listing details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Save className="h-5 w-5 mr-2" />
            Edit Listing
          </CardTitle>
          <CardDescription>Update the information below to modify your listing</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              <div className="flex items-center gap-2">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveImage}
                  >
                    Remove
                  </Button>
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
                      setShowMapSelector(false)
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
                <div className="ml-7 mt-2 space-y-3">
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
                        // Ensure useLocation is enabled when location is selected
                        if (!useLocation) {
                          setUseLocation(true)
                        }
                      }}
                      initialLat={latitude ?? undefined}
                      initialLng={longitude ?? undefined}
                      height="300px"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={updateListingMutation.isPending}
                className="flex-1"
              >
                {updateListingMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={updateListingMutation.isPending}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

