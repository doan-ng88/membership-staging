export interface MembershipTabMember {
  membershipWebsiteId: string | number
  membershipId?: number
  email: string
  fullName: string
  phoneNumber: string
  points?: number
  level?: number
  levelName: string
  websiteName?: string
  registeredTime?: string
  latestOrder?: {
    orderId: number
    orderIdWebsite?: number
    totalAmount: number
    createTime: string
    orderStatus?: string
    paymentMethod?: string
    earnPoints?: number
  }
}

export interface ApiMember {
  membershipWebsiteId: number
  membershipId: number
  email: string
  birthday?: string
  fullName: string
  mainPhoneNumber: string
  points: number
  level: number
  levelName: string
  isJoinSky007?: boolean
  registeredTime: string
  levelUpdateTime?: string
  websiteId: number
  levelId?: number
  totalOrder?: number
  amountNextLevel?: number
  defaultAddress?: string
  latestOrder?: {
    orderId: number
    orderIdWebsite: number
    totalAmount: number
    createTime: string
    orderStatus: string
    paymentMethod: string
    earnPoints: number
  }
}

export interface MemberListResponse {
  code: number
  status: string
  message: string
  data: ApiMember[]
  pageIndex: number
  pageSize: number
  totalCount: number
}

// Thêm các types liên quan đến pagination và filter
export interface MembershipTabPagination {
  current: number
  pageSize: number
  total: number
  showSizeChanger: boolean
  pageSizeOptions: string[]
}

export interface MembershipTabFilter {
  search: string
  level?: string
  websiteId?: number
}

export type DateFormatter = (dateString?: string) => string

// Thêm interface cho params request
export interface MemberListParams {
  sortField: string
  sortType: string
  pageSize: number
  pageIndex: number
  searchParams: Array<{key: string, value: any}>
}