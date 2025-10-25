import { useState } from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'

// Search Filters Component for UMass Marketplace
// Provides advanced filtering options for marketplace listings
export interface SearchFilters {
  query: string
  category: string
  condition: string
  minPrice: number | undefined
  maxPrice: number | undefined
  status: string
}

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  initialFilters?: SearchFilters
}

const categories = [
  'Electronics',
  'Furniture', 
  'Clothing',
  'Books',
  'Sports',
  'Home & Garden',
  'Beauty & Health',
  'Other',
]

const conditions = [
  'New',
  'Like New',
  'Good',
  'Fair',
  'Poor',
]

const statuses = [
  'ACTIVE',
  'ON_HOLD',
  'SOLD',
]

export default function SearchFilters({ onSearch, isLoading = false, initialFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    query: '',
    category: '',
    condition: '',
    minPrice: undefined,
    maxPrice: undefined,
    status: '',
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Sync with parent when initialFilters change
  React.useEffect(() => {
    if (initialFilters) {
      console.log('🔍 SearchFilters: Syncing with parent filters:', initialFilters)
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const handleSearch = () => {
    console.log('🔍 SearchFilters: handleSearch called with filters:', filters)
    onSearch(filters)
  }

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: '',
      condition: '',
      minPrice: undefined,
      maxPrice: undefined,
      status: '',
    }
    setFilters(clearedFilters)
    onSearch(clearedFilters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const hasActiveFilters = filters.query || filters.category || filters.condition || 
                         filters.minPrice || filters.maxPrice || filters.status

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Search Marketplace
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Search */}
        <div className="space-y-2">
          <Label htmlFor="search-query">Search Items</Label>
          <div className="flex gap-2">
            <Input
              id="search-query"
              placeholder="Search by title or description..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Filters
          </Button>
          
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={handleClear}>
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Filter */}
            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <select
                id="condition"
                value={filters.condition}
                onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">All Conditions</option>
                {conditions.map((condition) => (
                  <option key={condition} value={condition}>
                    {condition}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">All Statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price</Label>
              <Input
                id="minPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={filters.minPrice || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  minPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price</Label>
              <Input
                id="maxPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="999999.99"
                value={filters.maxPrice || ''}
                onChange={(e) => setFilters({ 
                  ...filters, 
                  maxPrice: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
              />
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button onClick={handleSearch} disabled={isLoading} className="w-full">
                {isLoading ? 'Searching...' : 'Apply Filters'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
