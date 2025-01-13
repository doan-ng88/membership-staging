import { websites } from "@/api/types/website";

export interface MailCampaign {
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

export interface MailCampaignFilters {
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

export interface PaginationParams {
  pageIndex: number;
  pageSize: number;
  searchParams?: SearchParams[];
}

export interface ApiResponse<T> {
    data: T[];
    pagination: {
      pageIndex: number;
      pageSize: number;
      totalCount: number;
    };
}