import axios from 'axios';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/stores/auth';
import { getWebsiteName } from '@/api/types/website';

interface Campaign {
  campaignId: string | number;
  campaignName: string;
  description: string;
  startDate: string;
  dueDate: string;
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
  websiteId: number;
  website: string;
}

interface PaginationParams {
  pageIndex?: number;
  pageSize?: number;
  searchParams?: Array<{ key: string; value: string }>;
}

interface ApiResponse {
  data: Campaign[];
  pageIndex: number;
  pageSize: number;
  totalCount: number;
}

class MailCampaignService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const authStore = useAuthStore();
        const token = authStore.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor 
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore();
          await authStore.logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
    );
  }

  async getCampaignList(params: PaginationParams = {}) {
    try {
      const requestBody = {
        pageIndex: typeof params.pageIndex === 'number' ? params.pageIndex : 0,
        pageSize: Number(params.pageSize) || 10,
        searchParams: params.searchParams || []
      };

      console.log('Service sending request:', requestBody); // Debug log

      const response = await this.api.post<ApiResponse>('/membership/get/get-campaign-list', requestBody);
      
      console.log('Service received response:', response.data); // Debug log

      const transformedData = response.data.data.map(campaign => {
        const websiteId = Number(campaign.websiteId);
        return {
          ...campaign,
          id: Number(campaign.campaignId),
          name: campaign.campaignName,
          websiteId: websiteId,
          website: getWebsiteName(websiteId),
        };
      });

      return {
        data: transformedData,
        pagination: {
          pageIndex: response.data.pageIndex,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount
        }
      };
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }

  private transformCampaign(campaign: Campaign) {
    return {
      id: campaign.campaignId,
      name: campaign.campaignName,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.dueDate,
      status: campaign.status,
      priorityLevel: campaign.priorityLevel,
      issue: campaign.issue,
      total: campaign.total,
      remaining: campaign.remaining,
      isServiceCall: campaign.isServiceCall,
      isAppPush: campaign.isAppPush,
      isServiceEmail: campaign.isServiceEmail,
      isPrivated: campaign.isPrivated,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      createdBy: campaign.createdBy
    };
  }

  createCampaign(data: any) {
    return axios.post('membership/update/create-campaign', data);
  }
}

export const mailCampaignService = new MailCampaignService(); 