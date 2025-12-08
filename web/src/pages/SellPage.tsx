// ...existing code... (removed unused useState import)
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createListing } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useState } from 'react'
import { MapPin, Loader2, Download } from 'lucide-react'
import { createBulkListings } from '@/lib/api'
import { CATEGORIES, CONDITIONS } from '@/lib/constants'
import { parseExcelFile, validateTemplateFormat, validateExcelStructure, downloadTemplate, convertToCreateListingForm } from '@/lib/excelTemplate'
import LocationMapSelector from '@/components/LocationMapSelector'

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

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setImagePreview(base64String)
        setValue('imageUrl', base64String)
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
    onSuccess: (data) => {
      console.log('✅ Create listing success:', data)
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

  console.log('🔍 Form errors:', errors)
  console.log('🔍 Mutation state:', { 
    isPending: createListingMutation.isPending, 
    isError: createListingMutation.isError,
    error: createListingMutation.error 
  })

  const onSubmit = (data: CreateListingForm) => {
    console.log('📝 Form submitted with data:', data)
    console.log('📍 Location state:', { useLocation, latitude, longitude })
    const finalData = {
      ...data,
      ...(useLocation && latitude && longitude
        ? { latitude, longitude }
        : {}),
      // Convert datetime-local to ISO 8601 format
      ...(data.mustGoBy ? { mustGoBy: new Date(data.mustGoBy).toISOString() } : {}),
    }
    console.log('🔄 Final data being sent to API:', finalData)
    console.log('🔄 Calling createListingMutation.mutate...')
    createListingMutation.mutate(finalData)
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="max-w-2xl mx-auto">
      <div className="text-center py-4 mb-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Sell an Item</h1>
        <p className="text-base text-muted-foreground">
          List your item for sale to fellow UMass students 🍂
        </p>
      </div>
      <div className="mb-4 flex justify-end">
        <BulkUploadModal />
      </div>
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
          <form onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log('❌ Form validation errors:', errors)
          })} className="space-y-4">
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
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                {imageFile && (
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
                    className="h-32 w-32 object-cover rounded-md border border-input"
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
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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
                onClick={() => console.log('🖱️ Create Listing button clicked!')}
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
        console.log('First converted listing:', convertedListings[0])
        console.log('ImageUrl in first listing:', convertedListings[0].imageUrl)
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
        <Button variant="outline">Got a lot to sell? Bulk Upload via Excel</Button>
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
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
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