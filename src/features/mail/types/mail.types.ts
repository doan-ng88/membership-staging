export interface Campaign {
  id: string | number;
  name: string;
  description: string;
  startDate: string;
  dueDate: string;
  pic: string;
  members: CampaignMember[];
  websiteId: number | undefined;
  coupons: string[];
  adminUsers: string[];
  status: string;
  priorityLevel: string | number;
  issue: string;
  total: number;
  remaining: number;
  isServiceCall: boolean;
  isAppPush: boolean;
  isServiceEmail: boolean;
  isPrivated: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface CampaignMember {
  id: string;
  fullName: string;
  mainPhoneNumber: string;
  websiteId: number;
}

export interface CampaignFilters {
  searchText?: string;
  status?: string;
  createdBy?: string;
}

export interface PaginationParams {
  pageIndex: number;
  pageSize: number;
  searchParams: SearchParam[];
}

export interface SearchParam {
  key: string;
  value: string;
}

export interface ApiResponse<T> {
  data: T[];
  pagination: {
    pageIndex: number;
    pageSize: number;
    totalCount: number;
  };
} 