// src/features/call-campaign/types/campaign.types.ts
export interface Campaign {
  id: number | string;
  name: string;
  websiteId: number;
  startDate: string;
  endDate: string;
  status: string;
  CampaignName: string;
  Description: string;
  Issue: string;
  PriorityLevel: 'High' | 'Medium' | 'Low' | 'Not Set';
  Status: 'Created' | 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed' | 'Cancelled';
  IsPrivated: boolean;
  isServiceCall: boolean;
  isAppPush: boolean;
  isServiceEmail: boolean;
}

export interface CampaignFilters {
  searchText?: string;
  status?: string;
  website?: string | number;
  dateRange?: [string, string];
}

export interface PaginationParams {
  sortField?: string;
  sortType?: 'ASC' | 'DESC';
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