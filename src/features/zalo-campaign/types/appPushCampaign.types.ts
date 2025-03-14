export interface AppCampaign {
  id: string
  name: string
  websiteId: number
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'FAILED'
  startDate: string
  endDate: string
  totalRecipients: number
  sentCount: number
  createdAt: string
}

export interface AppCampaignResponse {
  code: number
  status: string
  message: string
  data: any[]
  pageIndex: number
  pageSize: number
  totalCount: number
}

export interface ApiResponse<T> {
  code: number
  status: string
  message: string
  data: T[]
  pagination: {
    pageIndex: number
    pageSize: number
    totalCount: number
  }
}

export interface PaginationParams {
  sortField?: string
  sortType?: 'ASC' | 'DESC'
  pageIndex?: number
  pageSize?: number
  searchParams?: Array<{
    key: string
    value: any
    operator?: string
  }>
}