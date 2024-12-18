import axios from 'axios';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/stores/auth';

class MailCampaignService {
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

  async getCampaignList(params = {}) {
    try {
      const requestBody = {
        pageIndex: params.pageIndex || 1,
        pageSize: params.pageSize || 40,
        searchParams: params.searchParams || []
      };

      const response = await this.api.post('/membership/get/get-campaign-list', requestBody);
      
      // Bind this context cho transformCampaign
      return {
        data: (response.data.data || []).map(this.transformCampaign.bind(this)),// TODO: fix backend error: return null when no data => return []
        pagination: {
          pageIndex: response.data.pageIndex,
          pageSize: response.data.pageSize,
          totalCount: response.data.totalCount
        }
      };
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      message.error('Không thể tải danh sách chiến dịch');
      throw error;
    }
  }

  transformCampaign(campaign) {
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
}

export const mailCampaignService = new MailCampaignService();