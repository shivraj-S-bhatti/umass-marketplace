// API Client for UMass Marketplace
// Provides typed API calls to the Spring Boot backend with error handling
export interface Listing {
  id: string
  title: string
  description?: string
  price: number
  category?: string
  condition?: string
  status: 'ACTIVE' | 'ON_HOLD' | 'SOLD'
  sellerId: string
  sellerName?: string
  createdAt: string
  updatedAt: string
}

export interface CreateListingRequest {
  title: string
  description?: string
  price: number
  category?: string
  condition?: string
}

export interface ListingsResponse {
  content: Listing[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

console.log('🌐 API Base URL:', API_BASE_URL)
console.log('🌐 Environment variables:', import.meta.env)

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
    console.log('🔧 ApiClient initialized with baseUrl:', this.baseUrl)
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    console.log('🚀 API Request:', { url, options })
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    console.log('📡 API Response:', { status: response.status, statusText: response.statusText })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Health check endpoint
  async healthCheck(): Promise<{ status: string }> {
    return this.request('/health')
  }

  // Get listings with pagination and filters
  async getListings(params: {
    page?: number
    size?: number
    q?: string
    category?: string
    status?: string
    minPrice?: number
    maxPrice?: number
  } = {}): Promise<ListingsResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.size !== undefined) searchParams.set('size', params.size.toString())
    if (params.q) searchParams.set('q', params.q)
    if (params.category) searchParams.set('category', params.category)
    if (params.status) searchParams.set('status', params.status)
    if (params.minPrice !== undefined) searchParams.set('minPrice', params.minPrice.toString())
    if (params.maxPrice !== undefined) searchParams.set('maxPrice', params.maxPrice.toString())

    const queryString = searchParams.toString()
    const endpoint = `/api/listings${queryString ? `?${queryString}` : ''}`
    
    return this.request<ListingsResponse>(endpoint)
  }

  // Get a single listing by ID
  async getListing(id: string): Promise<Listing> {
    return this.request<Listing>(`/api/listings/${id}`)
  }

  // Create a new listing
  async createListing(data: CreateListingRequest): Promise<Listing> {
    return this.request<Listing>('/api/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Create new listings in bulk
  async createBulkListings(data: CreateListingRequest[]): Promise<Listing[]> {
    return this.request<Listing[]>('/api/listings/bulk', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Create bound methods to avoid 'this' context issues
export const createListing = (data: CreateListingRequest) => apiClient.createListing(data)
export const getListings = (page = 0, size = 12) => apiClient.getListings({ page, size })
export const getListing = (id: string) => apiClient.getListing(id)
export const healthCheck = () => apiClient.healthCheck()
export const createBulkListings = (data: CreateListingRequest[]) => apiClient.createBulkListings(data)
