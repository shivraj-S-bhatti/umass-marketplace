import React, { useState } from 'react'
import { Search, Filter, X, LayoutGrid, LayoutList } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { CATEGORIES, CONDITIONS, STATUSES } from '@/shared/lib/constants/constants'
import type { SearchFilters as SearchFiltersType } from '@/features/marketplace/components/SearchFilters'
import { useListingsView } from '@/shared/contexts/ListingsViewContext'

interface TwoTierNavbarProps {
  onSearch: (filters: SearchFiltersType) => void
  initialFilters?: SearchFiltersType
  isLoading?: boolean
}

export default function TwoTierNavbar({ onSearch, initialFilters, isLoading = false }: TwoTierNavbarProps) {
  const { view, setView } = useListingsView()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters || {
    query: '',
    category: '',
    condition: [],
    minPrice: undefined,
    maxPrice: undefined,
    status: '',
  })

  // Sync with initialFilters when they change
  React.useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    const clearedFilters: SearchFiltersType = {
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
    <div className="border-b border-border bg-card">
      {/* Tier 1: Search Bar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <select
              className="h-10 px-3 rounded-lg border border-input bg-card text-sm font-medium min-w-[100px] text-foreground"
              value={filters.category || ''}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="">All</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex-1 relative">
              <Input
                placeholder="Search listings..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                onKeyPress={handleKeyPress}
                className="w-full pr-12"
              />
              <Button
                size="icon"
                onClick={handleSearch}
                disabled={isLoading}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 min-w-[32px] rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center border border-border rounded-lg overflow-hidden" role="group" aria-label="Listings view">
              <button
                type="button"
                onClick={() => setView('compact')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  view === 'compact' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                title="Compact view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Compact</span>
              </button>
              <button
                type="button"
                onClick={() => setView('sparse')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors border-l border-border ${
                  view === 'sparse' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
                title="Sparse view"
              >
                <LayoutList className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Sparse</span>
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Hide' : 'Show'} Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={handleClear} className="whitespace-nowrap">
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Advanced Filters */}
      {showFilters && (
        <div className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Condition Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Condition</Label>
                <div className="flex flex-wrap gap-1.5">
                  {CONDITIONS.map((condition) => {
                    const isSelected = filters.condition.includes(condition)
                    return (
                      <button
                        key={condition}
                        onClick={() => {
                          if (isSelected) {
                            setFilters({ ...filters, condition: filters.condition.filter((c: string) => c !== condition) })
                          } else {
                            setFilters({ ...filters, condition: [...filters.condition, condition] })
                          }
                        }}
                        className={`px-2 py-1 rounded-lg text-xs font-medium border border-border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-card hover:bg-secondary'
                        }`}
                      >
                        {condition}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-1.5">
                <Label className="text-xs">Min Price</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Price</Label>
                <Input
                  type="number"
                  placeholder="999.99"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="h-8 text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <select
                  className="flex h-8 w-full rounded-lg border border-input bg-card px-2 text-xs font-medium text-foreground"
                  value={filters.status || ''}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <option value="">All Status</option>
                  {STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

