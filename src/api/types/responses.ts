// # Type definitions cho API responses
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message?: string
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    total: number
    page: number
    pageSize: number
  }
}

export interface ErrorResponse {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
} 