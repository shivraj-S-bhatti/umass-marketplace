// API Client for UMass Marketplace
// Provides typed API calls to the Spring Boot backend with error handling

export interface Message {
  id: string
  content: string
  sender: {
    id: string
    name: string
    pictureUrl?: string
  }
  createdAt: string
}

export interface Chat {
  id: string
  listing: Listing
  buyer: {
    id: string
    name: string
    pictureUrl?: string
  }
  seller: {
    id: string
    name: string
    pictureUrl?: string
  }
  lastMessage?: Message
  createdAt: string
  updatedAt: string
}

export interface Listing {
  id: string
  title: string
  description?: string
  price: number
  category?: string
  condition?: string
  imageUrl?: string
  latitude?: number | null
  longitude?: number | null
  status: 'ACTIVE' | 'ON_HOLD' | 'SOLD'
  sellerId: string
  sellerName?: string
  sellerEmail?: string
  sellerPictureUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CreateListingRequest {
  title: string
  description?: string
  price: number
  category?: string
  condition?: string
  imageUrl?: string
  status?: 'ACTIVE' | 'ON_HOLD' | 'SOLD'
  latitude?: number | null
  longitude?: number | null
}

export interface ListingsResponse {
  content: Listing[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface ListingStats {
  activeListings: number
  soldListings: number
  onHoldListings: number
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
    
    const token = localStorage.getItem('token');
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...options.headers,
      },
      credentials: 'include', // Important for CORS
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
    condition?: string
    minPrice?: number
    maxPrice?: number
  } = {}): Promise<ListingsResponse> {
    const searchParams = new URLSearchParams()
    
    if (params.page !== undefined) searchParams.set('page', params.page.toString())
    if (params.size !== undefined) searchParams.set('size', params.size.toString())
    if (params.q) searchParams.set('q', params.q)
    if (params.category) searchParams.set('category', params.category)
    if (params.status) searchParams.set('status', params.status)
    if (params.condition) searchParams.set('condition', params.condition)
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

  // Update an existing listing
  async updateListing(id: string, data: CreateListingRequest): Promise<Listing> {
    return this.request<Listing>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Get listing statistics
  async getListingStats(): Promise<ListingStats> {
    return this.request<ListingStats>('/api/listings/stats')
  }

  // Chat-related endpoints
  async startChat(listingId: string): Promise<Chat> {
    return this.request<Chat>(`/api/chats/listing/${listingId}`, {
      method: 'POST'
    })
  }

  async getUserChats(): Promise<Chat[]> {
    return this.request<Chat[]>('/api/chats')
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    return this.request<Message>(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content })
    })
  }

  async getChatMessages(chatId: string, page = 0, size = 20): Promise<{
    content: Message[];
    totalPages: number;
    totalElements: number;
  }> {
    return this.request<{
      content: Message[];
      totalPages: number;
      totalElements: number;
    }>(`/api/chats/${chatId}/messages?page=${page}&size=${size}`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Create bound methods to avoid 'this' context issues
export const createListing = (data: CreateListingRequest) => apiClient.createListing(data)
export const updateListing = (id: string, data: CreateListingRequest) => apiClient.updateListing(id, data)
export const getListings = (page = 0, size = 12) => apiClient.getListings({ page, size })
export const getListing = (id: string) => apiClient.getListing(id)
export const getListingStats = () => apiClient.getListingStats()
export const healthCheck = () => apiClient.healthCheck()
export const createBulkListings = (data: CreateListingRequest[]) => apiClient.createBulkListings(data)
