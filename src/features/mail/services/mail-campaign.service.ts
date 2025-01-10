import type { MailCampaign, PaginationParams, ApiResponse } from '../types/mail-campaign.types';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/stores/auth';
import { getWebsiteName } from '@/api/types/website';

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
      (error) => Promise.reject(error)
    );

    // Add response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const authStore = useAuthStore();
          await authStore.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async getMailCampaignList(params: PaginationParams): Promise<ApiResponse<MailCampaign>> {
    try {
      const requestBody = {
        pageIndex: params.pageIndex || 1,
        pageSize: params.pageSize || 10,
        searchParams: [
          { key: 'isServiceEmail', value: 'true' },
          ...(params.searchParams || [])
        ]
      };

      console.log('Request body:', requestBody);

      const response = await this.api.post('/membership/get/get-campaign-list', requestBody);
      console.log('API Response:', response.data);

      return {
        data: response.data.data.map((item) => this.transformCampaign(item)),
        pagination: {
          pageIndex: Number(response.data.pageIndex),
          pageSize: Number(response.data.pageSize),
          totalCount: Number(response.data.totalCount)
        }
      };
    } catch (error) {
      console.error('Error fetching mail campaigns:', error);
      throw error;
    }
  }

  private transformCampaign(data: any): MailCampaign {
    const websiteId = Number(data.websiteId) || 0;
    return {
      id: data.campaignId,
      name: data.campaignName,
      websiteId: websiteId,
      description: data.description,
      startDate: data.startDate,
      endDate: data.dueDate,
      status: data.status,
      priorityLevel: data.priorityLevel,
      total: data.total,
      remaining: data.remaining,
      isServiceEmail: data.isServiceEmail,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      createdBy: data.createdBy
    };
  }

  async deleteMailCampaign(campaignId: number) {
    const authStore = useAuthStore();
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL}/membership/delete/campaign/${campaignId}`,
        {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in deleteMailCampaign:', error);
      throw error;
    }
  }

  async updateMailCampaign(campaign: any) {
    const authStore = useAuthStore();
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_BASE_URL}/api/mail-campaigns/${campaign.id}`,
        campaign,
        {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error in updateMailCampaign:', error);
      throw error;
    }
  }
}

// Export instance thay vì class
export const mailCampaignService = new MailCampaignService(); 