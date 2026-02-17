import React, { useState } from 'react'
import { Search, LayoutGrid, LayoutList, ChevronDown } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { CATEGORIES, CONDITIONS, STATUSES } from '@/shared/lib/constants/constants'
import type { SearchFilters as SearchFiltersType, SortOption } from '@/features/marketplace/components/SearchFilters'
import { useListingsView } from '@/shared/contexts/ListingsViewContext'

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price low–high' },
  { value: 'price_desc', label: 'Price high–low' },
  { value: 'distance', label: 'Distance' },
]

interface TwoTierNavbarProps {
  onSearch: (filters: SearchFiltersType) => void
  initialFilters?: SearchFiltersType
  isLoading?: boolean
}

export default function TwoTierNavbar({ onSearch, initialFilters, isLoading = false }: TwoTierNavbarProps) {
  const { view, setView } = useListingsView()
  const [filters, setFilters] = useState<SearchFiltersType>(initialFilters || {
    query: '',
    category: '',
    condition: [],
    minPrice: undefined,
    maxPrice: undefined,
    status: '',
    sort: 'newest',
  })
  const [priceOpen, setPriceOpen] = useState(false)
  const [conditionOpen, setConditionOpen] = useState(false)

  React.useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const handleSearch = () => {
    onSearch(filters)
  }

  const handleClear = () => {
    const cleared: SearchFiltersType = {
      query: '',
      category: '',
      condition: [],
      minPrice: undefined,
      maxPrice: undefined,
      status: '',
      sort: filters.sort ?? 'newest',
    }
    setFilters(cleared)
    onSearch(cleared)
  }

  const hasActiveFilters = !!(
    filters.query ||
    filters.category ||
    filters.condition.length > 0 ||
    filters.minPrice != null ||
    filters.maxPrice != null ||
    filters.status
  )

  const applyAndClose = (next: SearchFiltersType) => {
    setFilters(next)
    onSearch(next)
    setPriceOpen(false)
    setConditionOpen(false)
  }

  const priceLabel =
    filters.minPrice != null || filters.maxPrice != null
      ? [filters.minPrice != null ? `$${filters.minPrice}` : '', filters.maxPrice != null ? `$${filters.maxPrice}` : ''].filter(Boolean).join(' – ')
      : 'Price'

  return (
    <div className="border-b border-border bg-card">
      {/* Row 1: Search + Sort + View toggle */}
      <div className="container mx-auto px-4 py-2 w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="flex-1 relative min-w-0 flex items-center gap-2">
            <Input
              placeholder="Search listings..."
              value={filters.query}
              onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSearch()
              }}
              className="w-full pr-11"
            />
            <Button
              size="icon"
              onClick={handleSearch}
              disabled={isLoading}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <select
              className="h-10 px-3 rounded-lg border border-border bg-input text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-w-[140px]"
              value={filters.sort ?? 'newest'}
              onChange={(e) => {
                const next = { ...filters, sort: e.target.value as SortOption }
                setFilters(next)
                onSearch(next)
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <div className="flex border border-border rounded-lg overflow-hidden" role="group" aria-label="Listings view">
              <button
                type="button"
                onClick={() => setView('compact')}
                className={`p-2 transition-colors ${view === 'compact' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                title="Compact view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setView('sparse')}
                className={`p-2 border-l border-border transition-colors ${view === 'sparse' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                title="Sparse view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Filter chips (horizontal scroll) */}
      <div className="container mx-auto px-4 pb-2 w-full max-w-full min-w-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin py-1">
          {/* Category chip (dropdown, portaled) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 ${
                  filters.category
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary-hover'
                    : 'bg-secondary border-border text-foreground hover:bg-surface-3'
                }`}
              >
                {filters.category || 'Category'}
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              <DropdownMenuItem onSelect={() => applyAndClose({ ...filters, category: '' })}>
                All
              </DropdownMenuItem>
              {CATEGORIES.map((cat) => (
                <DropdownMenuItem key={cat} onSelect={() => applyAndClose({ ...filters, category: cat })}>
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Price range chip (dropdown, portaled, controlled) */}
          <DropdownMenu open={priceOpen} onOpenChange={setPriceOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 ${
                  filters.minPrice != null || filters.maxPrice != null
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary-hover'
                    : 'bg-secondary border-border text-foreground hover:bg-surface-3'
                }`}
              >
                {priceLabel}
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[200px] p-3" onCloseAutoFocus={(e) => e.preventDefault()}>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="flex-1 h-9 rounded border border-input bg-background px-2 text-sm"
                />
                <span className="text-muted-foreground">–</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
                  className="flex-1 h-9 rounded border border-input bg-background px-2 text-sm"
                />
              </div>
              <Button size="sm" className="w-full mt-2" onClick={() => { applyAndClose(filters); setPriceOpen(false); }}>
                Apply
              </Button>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Condition chip (multi-select, portaled, controlled) */}
          <DropdownMenu open={conditionOpen} onOpenChange={setConditionOpen}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 ${
                  filters.condition.length > 0
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary-hover'
                    : 'bg-secondary border-border text-foreground hover:bg-surface-3'
                }`}
              >
                {filters.condition.length > 0 ? `${filters.condition.length} selected` : 'Condition'}
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px] py-1">
              {CONDITIONS.map((cond) => {
                const isSelected = filters.condition.includes(cond)
                return (
                  <button
                    key={cond}
                    type="button"
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-secondary ${isSelected ? 'bg-primary/10 text-primary font-medium' : ''}`}
                    onClick={() => {
                      const next = isSelected
                        ? filters.condition.filter((c) => c !== cond)
                        : [...filters.condition, cond]
                      setFilters({ ...filters, condition: next })
                      onSearch({ ...filters, condition: next })
                    }}
                  >
                    {cond} {isSelected ? '✓' : ''}
                  </button>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status chip (dropdown, portaled) */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0 ${
                  filters.status
                    ? 'bg-primary text-primary-foreground border-primary hover:bg-primary-hover'
                    : 'bg-secondary border-border text-foreground hover:bg-surface-3'
                }`}
              >
                {filters.status || 'Status'}
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[140px]">
              <DropdownMenuItem onSelect={() => applyAndClose({ ...filters, status: '' })}>
                All
              </DropdownMenuItem>
              {STATUSES.map((status) => (
                <DropdownMenuItem key={status} onSelect={() => applyAndClose({ ...filters, status })}>
                  {status}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground underline"
            >
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
