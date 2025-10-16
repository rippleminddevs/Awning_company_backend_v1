export interface FirebaseMulticastMessage {
  notification: {
    title: string
    body: string
  }
  data?: Record<string, any>
  tokens: string[]
}

export interface PaginationOptions {
  page?: number | string
  perPage?: number | string
}

export interface PaginationParams {
  skip: number
  limit: number
}

export interface PaginationMeta {
  page: number
  perPage: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

export interface PaginatedResponse<T> {
  result: T[]
  pagination: PaginationMeta
}

export interface QuotePaginatedResponse<T> {
  result: T[]
  pagination: PaginationMeta,
  totalAmount?: number
}

export const DEFAULT_PAGINATION_OPTIONS: PaginationOptions = {
  page: 1,
  perPage: 10,
}