// src/features/call-campaign/services/campaign.service.ts
import type { Campaign, PaginationParams, ApiResponse } from '../types/campaign.types';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/stores/auth'; // Import auth store
import { useI18nGlobal } from '@/i18n';
import { getWebsiteName } from '@/api/types/website';

const { t } = useI18nGlobal();
export class CampaignService {
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
        }
        return Promise.reject(error);
      }
    );
  }

  async getCampaignList(params: Partial<PaginationParams> = {}): Promise<ApiResponse<Campaign>> {
    try {
      // Construct request params with defaults
      const requestParams = {
        sortType: params.sortType || 'ASC',
        pageSize: params.pageSize || 10,
        pageIndex: params.pageIndex || 1,
        searchParams: [
          { 
            key: 'isServiceCall',
            value: 'true'
          },
          ...(params.searchParams || [])
        ]
      };

      console.log('Request params:', requestParams);

      const response = await this.api.post('/membership/get/get-campaign-list', requestParams);

      console.log('Raw API Response:', response.data);

      if (!response.data) {
        throw new Error('No data received from API');
      }

      // Transform data
      const campaigns = Array.isArray(response.data.data) 
        ? response.data.data.map(this.transformCampaign)
        : [];

      const result: ApiResponse<Campaign> = {
        data: campaigns,
        pagination: {
          pageIndex: Number(response.data.pageIndex),
          pageSize: Number(response.data.pageSize),
          totalCount: Number(response.data.totalCount)
        }
      };

      console.log('Processed Response:', result);
      return result;

    } catch (error) {
      console.error('Error in getCampaignList:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      } else {
        message.error(t('campaignTabMail.messages.error.fetchFailed'));
      }
      throw error;
    }
  }

  private transformCampaign(campaign: any): Campaign {
    try {
      return {
        id: campaign.campaignId || '',
        name: campaign.campaignName || '',
        description: campaign.description || '',
        startDate: campaign.startDate || '',
        endDate: campaign.dueDate || '',
        status: campaign.status || '',
        priorityLevel: campaign.priorityLevel || 'Not Set',
        issue: campaign.issue || '',
        total: Number(campaign.total) || 0,
        remaining: Number(campaign.remaining) || 0,
        isServiceCall: Boolean(campaign.isServiceCall),
        isAppPush: Boolean(campaign.isAppPush),
        isServiceEmail: Boolean(campaign.isServiceEmail),
        isPrivated: Boolean(campaign.isPrivated),
        createdAt: campaign.createdAt || '',
        updatedAt: campaign.updatedAt || '',
        createdBy: campaign.createdBy || '',
        websiteId: campaign.websiteId,
        websiteName: getWebsiteName(campaign.websiteId),
        CampaignName: campaign.campaignName || '',
        Status: campaign.status || ''
      };
    } catch (error) {
      console.error('Error transforming campaign:', error);
      return {
        id: '',
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        status: '',
        priorityLevel: 'Not Set',
        issue: '',
        total: 0,
        remaining: 0,
        isServiceCall: false,
        isAppPush: false,
        isServiceEmail: false,
        isPrivated: false,
        createdAt: '',
        updatedAt: '',
        createdBy: '',
        websiteId: 0,
        websiteName: '',
        CampaignName: '',
        Status: 'Created'
      };
    }
  }

  async deleteCallCampaign(campaignId: number) {
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
      console.error('Error in deleteCallCampaign:', error);
      throw error;
    }
  }
}

export const campaignService = new CampaignService();