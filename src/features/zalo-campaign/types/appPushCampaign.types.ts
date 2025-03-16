import { websites } from "@/api/types/website";

export interface AppPushCampaign {
  id: string | number;
  name: string;
  websiteId: number;
  websiteName: string;
  description: string;
  startDate: string;
  endDate: string;
  status: CampaignStatus;
  priorityLevel: PriorityLevel;
  total: number;
  remaining: number;
  isServiceEmail: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export type CampaignStatus = 'Created' | 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Closed' | 'Cancelled';
export type PriorityLevel = 'High' | 'Medium' | 'Low' | 'Not Set'; 

export interface AppPushCampaignFilters {
  searchText?: string;
  status?: string;
  dateRange?: [string, string];
}

export interface SearchParams {
  key: string;
  value: string;
}

export const getWebsiteName = (websiteId: number): string => {
  const website = websites.find(w => w.websiteId === websiteId);
  return website?.name || 'N/A';
}; 

export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
  key: string;
  value: string | number | boolean;
}

export interface AppPushCampaignPaginationParams {
  pageIndex: number;
  pageSize: number;
  sort?: SortParams;
  searchParams?: SearchParams[];
}

export interface ApiAppPushCampaignResponse<T> {
  data: T[];
  code?: number;
  status?: string;
  message?: string;
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

// Thêm interface cho raw API response data
export interface ApiAppPushCampaignData {
  campaignId: number;
  campaignName: string;
  websiteName: string;
  websiteId: number;
  description?: string;
  startDate: string;
  dueDate: string;
  status: CampaignStatus;
  priorityLevel: PriorityLevel;
  total: number;
  remaining: number;
  isServiceEmail: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number | string;
}