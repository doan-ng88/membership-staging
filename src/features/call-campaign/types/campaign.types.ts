// src/features/call-campaign/types/campaign.types.ts
export interface Campaign {
  CampaignID: number;
  CampaignName: string;
  Description: string;
  StartDate: string | null;
  DueDate: string | null;
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
  createdBy?: string;
  pic?: string;
  dateRange?: {
    start: string;
    end: string;
  };
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