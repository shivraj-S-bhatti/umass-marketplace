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
import { Plus, DollarSign } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Papa from 'papaparse'
import { useState } from 'react'
import { createBulkListings } from '@/lib/api'
import { CATEGORIES, CONDITIONS } from '@/lib/constants'

// Sell Page - form for creating new marketplace listings
// Allows users to post items for sale with validation and error handling
const createListingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  price: z.number().min(0.01, 'Price must be greater than 0').max(999999.99, 'Price must be less than $999,999.99'),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  condition: z.string().max(50, 'Condition must be less than 50 characters').optional(),
})

type CreateListingForm = z.infer<typeof createListingSchema>

export default function SellPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateListingForm>({
    resolver: zodResolver(createListingSchema),
  })

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

  console.log('🔍 Form errors:', errors)
  console.log('🔍 Mutation state:', { 
    isPending: createListingMutation.isPending, 
    isError: createListingMutation.isError,
    error: createListingMutation.error 
  })

  const onSubmit = (data: CreateListingForm) => {
    console.log('📝 Form submitted with data:', data)
    console.log('🔄 Calling createListingMutation.mutate...')
    createListingMutation.mutate(data)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sell an Item</h1>
        <p className="text-muted-foreground">
          List your item for sale to fellow UMass students
        </p>
      </div>
      <div className="mb-6 flex justify-end">
        <BulkUploadModal />
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Create New Listing
          </CardTitle>
          <CardDescription>
            Fill out the form below to list your item for sale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit, (errors) => {
            console.log('❌ Form validation errors:', errors)
          })} className="space-y-6">
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
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="999999.99"
                  placeholder="0.00"
                  className="pl-10"
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
  )
}

function BulkUploadModal() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [isOpen, setIsOpen] = useState(false)

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

  const handleSubmit = () => {
    if (!file) {
      toast({ title: 'No File', description: 'Please select a CSV file.', variant: 'destructive' })
      return
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsedData = results.data as any[]
        const validListings: CreateListingForm[] = []
        const invalidRows: string[] = []

        parsedData.forEach((row, index) => {
          const listing = {
            title: row.title?.trim() || '',
            description: row.description?.trim() || '',
            price: parseFloat(row.price) || 0,
            category: row.category?.trim() || '',
            condition: row.condition?.trim() || '',
          }

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
            description: invalidRows.join('\n'),
            variant: 'destructive',
          })
        }

        if (validListings.length > 0) {
          createBulkListingsMutation.mutate(validListings)
        } else {
          toast({ title: 'No Valid Listings', description: 'No valid rows found in CSV.', variant: 'destructive' })
        }
      },
      error: (error) => {
        toast({ title: 'CSV Parse Error', description: error.message, variant: 'destructive' })
      },
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Got a lot to sell? Bulk Uplaod via CSV</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bulk Upload Listings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="csvFile">Upload CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <p className="text-sm text-muted-foreground mt-2">
              CSV format: Headers - title,description,price,category,condition. Price as number (e.g., 99.99).
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={createBulkListingsMutation.isPending || !file}
          >
            {createBulkListingsMutation.isPending ? 'Uploading...' : 'Upload Bulk Listings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}