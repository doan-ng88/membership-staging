import type { MailCampaign, PaginationParams, ApiResponse } from '../types/mail-campaign.types';
import axios from 'axios';
import { message } from 'ant-design-vue';

export class MailCampaignService {
  private api;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL
    });
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
}

export const mailCampaignService = new MailCampaignService(); 