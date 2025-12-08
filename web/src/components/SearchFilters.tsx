import { useState } from 'react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Filter, X } from 'lucide-react'
import { CONDITIONS, CATEGORIES, STATUSES } from '@/lib/constants'

// Search Filters Component for Everything UMass
// Provides advanced filtering options for listings
export interface SearchFilters {
  query: string
  category: string
  condition: string[]  // Changed to array for multi-select
  minPrice: number | undefined
  maxPrice: number | undefined
  status: string
}

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
  isLoading?: boolean
  initialFilters?: SearchFilters
}

export default function SearchFilters({ onSearch, isLoading = false, initialFilters }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters || {
    query: '',
    category: '',
    condition: [],
    minPrice: undefined,
    maxPrice: undefined,
    status: '',
  })
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Sync with parent when initialFilters change
  React.useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      category: '',
      condition: [],
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

  const hasActiveFilters = filters.query || filters.category || filters.condition.length > 0 || 
                         filters.minPrice || filters.maxPrice || filters.status

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Search className="h-5 w-5 mr-2" />
          Search Listings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Basic Search */}
        <div className="space-y-1.5">
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
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Condition Filter - Multi-select */}
            <div className="space-y-2">
              <Label>Condition</Label>
              <div className="flex flex-wrap gap-2 border border-input rounded-md p-2 min-h-[40px]">
                {CONDITIONS.map((condition) => (
                  <label
                    key={condition}
                    className="flex items-center space-x-2 cursor-pointer text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={filters.condition.includes(condition)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, condition: [...filters.condition, condition] })
                        } else {
                          setFilters({ ...filters, condition: filters.condition.filter(c => c !== condition) })
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
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
                {STATUSES.map((status) => (
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

          </div>
        )}
      </CardContent>
    </Card>
  )
}
