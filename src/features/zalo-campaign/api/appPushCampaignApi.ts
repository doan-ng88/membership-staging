import type { 
  AppPushCampaignPaginationParams, 
  ApiAppPushCampaignResponse,
  AppPushCampaign,
  ApiAppPushCampaignData
} from '../types/appPushCampaign.types';
import { getWebsiteName } from '../types/appPushCampaign.types';
import axiosInstance from '../../../api/config/axios'
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/stores/auth';
import type { ApiResponse } from '@/types/levelUpDownRules';

export const AppPushCampaignApi = {
  async getAppCampaignList(
    params: AppPushCampaignPaginationParams
  ): Promise<ApiResponse<AppPushCampaign>> {
    try {
      const defaultSearchParams = [
        { key: 'isAppPush', value: 'true' }
      ];

      const requestBody = {
        sortField: 'CreatedAt',
        sortType: params.sort?.order || 'DESC',
        pageSize: params.pageSize || 10,
        pageIndex: params.pageIndex || 1,
        searchParams: [
          ...defaultSearchParams,
          ...(params.searchParams || [])
        ]
      };

      console.log('[AppPush] Request params:', requestBody);

      const response = await axiosInstance.post<ApiAppPushCampaignResponse<ApiAppPushCampaignData>>(
        '/membership/get/get-campaign-list', 
        requestBody
      );

      console.log('[AppPush] Raw API Response:', response.data);

      if (!response.data) {
        throw new Error('Không nhận được dữ liệu từ API');
      }
      
      if (response.data.code !== undefined && response.data.code !== 200) {
        throw new Error(response.data.message || 'Lỗi API: Mã không phải 200');
      }

      const campaigns = Array.isArray(response.data.data) 
        ? response.data.data.map(item => this.transformCampaign(item))
        : [];

      return {
        code: response.data.code || 200,
        status: response.data.status || 'success',
        message: response.data.message || 'Thành công',
        data: campaigns,
        pagination: {
          pageIndex: Number(response.data.pageIndex || params.pageIndex || 1),
          pageSize: Number(response.data.pageSize || params.pageSize || 10),
          totalCount: Number(response.data.totalCount || 0)
        }
      };
    } catch (error) {
      console.error('[AppPush] Error fetching campaigns:', error);
      
      const errorObj = error as any;
      const errorMessage = errorObj.response?.data?.message || errorObj.message || 'Lỗi không xác định';
      message.error(`Lỗi tải campaign: ${errorMessage}`);
      
      if (errorObj.response?.status === 401) {
        const authStore = useAuthStore();
        await authStore.logout();
        window.location.href = '/login';
      }
      
      return {
        code: 500,
        status: 'error',
        message: errorObj.message || 'Lỗi hệ thống',
        data: [],
        pagination: {
          pageIndex: 1,
          pageSize: 10,
          totalCount: 0
        }
      };
    }
  },

  transformCampaign(apiData: any): AppPushCampaign {
    return {
      id: String(apiData.campaignId),
      name: apiData.campaignName,
      websiteId: apiData.websiteId,
      websiteName: apiData.websiteName || getWebsiteName(apiData.websiteId),
      description: apiData.description || '',
      status: apiData.status,
      startDate: apiData.startDate,
      endDate: apiData.dueDate || apiData.endDate,
      priorityLevel: apiData.priorityLevel || 'Not Set',
      total: apiData.total || 0,
      remaining: apiData.remaining || 0,
      isServiceEmail: apiData.isServiceEmail || false,
      createdAt: apiData.createdAt,
      updatedAt: apiData.updatedAt || apiData.createdAt,
      createdBy: String(apiData.createdBy || '')
    };
  },

  async getCampaignDetail(campaignId: number) {
    try {
      const response = await axiosInstance.get(`/membership/get/get-campaign/${campaignId}`);
      return this.transformCampaign(response.data);
    } catch (error) {
      console.error('[AppPush] Error getting campaign detail:', error);
      throw error;
    }
  }
};
  