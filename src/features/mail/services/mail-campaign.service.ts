import type { MailCampaign, PaginationParams, ApiResponse } from '../types/mail-campaign.types';
import axios from 'axios';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/stores/auth';

export class MailCampaignService {
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

  async getMailCampaignList(params: PaginationParams): Promise<ApiResponse<MailCampaign>> {
    try {
      const response = await this.api.post('/membership/get/get-campaign-list', {
        ...params,
        searchParams: [
          { key: 'isServiceEmail', value: 'true' },
          ...(params.searchParams || [])
        ]
      });

      return {
        data: response.data.data.map(this.transformCampaign),
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
    console.log('Raw campaign data:', data);
    return {
      id: data.campaignId,
      name: data.campaignName,
      websiteId: Number(data.websiteId),
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

  async sendMail(data: any) {
    try {
      console.log('Request data:', data)
      const response = await this.api.post('/membership/mail/send-mail', data)
      console.log('Response:', response)
      return response.data
    } catch (error: any) {
      console.error('Error sending mail:', error)
      console.error('Error response:', error.response?.data)
      throw error
    }
  }

  async getCampaignDetail(campaignId: number) {
    try {
      console.log('Calling API for campaign:', campaignId)
      const response = await this.api.get(`/membership/get/get-campaign/${campaignId}`)
      console.log('Raw API Response:', response)
      return response
    } catch (error) {
      console.error('Error fetching campaign detail:', error)
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data
      })
      throw error
    }
  }
}

export const mailCampaignService = new MailCampaignService(); 