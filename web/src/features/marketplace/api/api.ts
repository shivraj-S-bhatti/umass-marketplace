// API Client for Everything UMass
// Provides typed API calls to the Spring Boot backend with error handling

export interface Message {
  id: string
  chatId?: string
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
  listingId: string
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
  updatedAt?: string
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
  mustGoBy?: string
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
  mustGoBy?: string
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

export interface Review {
  id: string
  buyerId: string
  buyerName: string
  buyerPictureUrl?: string
  sellerId: string
  rating: number
  comment?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReviewRequest {
  sellerId: string
  rating: number
  comment?: string
}

export interface ReviewsResponse {
  content: Review[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface SellerReviewStats {
  sellerId: string
  averageRating: number
  totalReviews: number
}

export interface User {
  id: string
  name: string
  email: string
  pictureUrl?: string
  createdAt?: string // Made optional to match UserContext User type
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
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

    if (!response.ok) {
      // Try to extract error message from response body
      let errorMessage = `API Error: ${response.status} ${response.statusText}`
      try {
        const errorData = await response.json()
        if (errorData.message) {
          errorMessage = errorData.message
        } else if (errorData.error) {
          errorMessage = errorData.error
        }
      } catch {
        // If response is not JSON, use default error message
      }
      throw new Error(errorMessage)
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

  // Get listings by seller ID (paginated)
  async getListingsBySeller(sellerId: string, page = 0, size = 12): Promise<ListingsResponse> {
    return this.request<ListingsResponse>(`/api/listings/seller/${sellerId}?page=${page}&size=${size}`)
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
      body: JSON.stringify({ listings: data }),
    })
  }

  // Update an existing listing
  async updateListing(id: string, data: CreateListingRequest): Promise<Listing> {
    return this.request<Listing>(`/api/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  // Delete a listing
  async deleteListing(id: string): Promise<void> {
    return this.request<void>(`/api/listings/${id}`, { method: 'DELETE' })
  }

  // Get listing statistics
  async getListingStats(): Promise<ListingStats> {
    return this.request<ListingStats>('/api/listings/stats')
  }

  // Get listing statistics for a specific seller
  async getListingStatsBySeller(sellerId: string): Promise<ListingStats> {
    return this.request<ListingStats>(`/api/listings/seller/${sellerId}/stats`)
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

  // Review-related endpoints
  async createReview(data: CreateReviewRequest): Promise<Review> {
    return this.request<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async getReviewsBySeller(sellerId: string, page = 0, size = 10): Promise<ReviewsResponse> {
    return this.request<ReviewsResponse>(`/api/reviews/seller/${sellerId}?page=${page}&size=${size}`)
  }

  async getSellerReviewStats(sellerId: string): Promise<SellerReviewStats> {
    return this.request<SellerReviewStats>(`/api/reviews/seller/${sellerId}/stats`)
  }

  async hasUserReviewedSeller(sellerId: string): Promise<boolean> {
    return this.request<boolean>(`/api/reviews/seller/${sellerId}/has-reviewed`)
  }

  // User-related endpoints
  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/api/users/${userId}`)
  }

  // Platform stats
  async getPlatformStats(): Promise<{ totalStudents: number; onlineNow: number }> {
    return this.request<{ totalStudents: number; onlineNow: number }>(`/api/stats/platform`)
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Create bound methods to avoid 'this' context issues
export const createListing = (data: CreateListingRequest) => apiClient.createListing(data)
export const updateListing = (id: string, data: CreateListingRequest) => apiClient.updateListing(id, data)
export const getListings = (page = 0, size = 12) => apiClient.getListings({ page, size })
export const getListing = (id: string) => apiClient.getListing(id)
export const getListingsBySeller = (sellerId: string, page = 0, size = 12) => apiClient.getListingsBySeller(sellerId, page, size)
export const getListingStats = () => apiClient.getListingStats()
export const healthCheck = () => apiClient.healthCheck()
export const createBulkListings = (data: CreateListingRequest[]) => apiClient.createBulkListings(data)
export const createReview = (data: CreateReviewRequest) => apiClient.createReview(data)
export const getReviewsBySeller = (sellerId: string, page = 0, size = 10) => apiClient.getReviewsBySeller(sellerId, page, size)
export const getSellerReviewStats = (sellerId: string) => apiClient.getSellerReviewStats(sellerId)
export const hasUserReviewedSeller = (sellerId: string) => apiClient.hasUserReviewedSeller(sellerId)
export const getUser = (userId: string) => apiClient.getUser(userId)
export const getPlatformStats = () => apiClient.getPlatformStats()
