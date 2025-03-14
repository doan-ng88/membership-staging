import type { 
    PaginationParams, 
    ApiResponse,
    AppCampaign,
    AppCampaignResponse 
  } from '../types/appPushCampaign.types';
  import axiosInstance from '../../../api/config/axios'
  import { message } from 'ant-design-vue';
  import { useAuthStore } from '@/stores/auth';
  
  class AppCampaignService {
    private api = axiosInstance;
  
    async getAppCampaignList(
      params: PaginationParams
    ): Promise<ApiResponse<AppCampaign>> {
      try {
        const defaultSearchParams = [
          { key: 'isAppPush', value: 'true' }
        ];
  
        const requestBody = {
          sortField: 'CreatedAt',
          sortType: params.sortType || 'DESC',
          pageSize: params.pageSize || 10,
          pageIndex: params.pageIndex || 1,
          searchParams: [
            ...defaultSearchParams,
            ...(params.searchParams || [])
          ]
        };
  
        console.log('[AppPush] Request params:', requestBody);
  
        const response = await this.api.post<AppCampaignResponse>(
          '/membership/get/get-campaign-list', 
          requestBody
        );
  
        console.log('[AppPush] Raw API Response:', response.data);
  
        if (!response.data || response.data.code !== 200) {
          throw new Error(response.data?.message || 'Invalid API response');
        }
  
        const campaigns = Array.isArray(response.data.data) 
          ? response.data.data.map(this.transformCampaign)
          : [];
  
        return {
          code: response.data.code,
          status: response.data.status,
          message: response.data.message,
          data: campaigns,
          pagination: {
            pageIndex: Number(response.data.pageIndex),
            pageSize: Number(response.data.pageSize),
            totalCount: Number(response.data.totalCount)
          }
        };
      } catch (error) {
        console.error('[AppPush] Error fetching campaigns:', error);
        if (axiosInstance.isAxiosError(error)) {
          const errorMessage = error.response?.data?.message || error.message;
          message.error(`Lỗi tải campaign: ${errorMessage}`);
          
          if (error.response?.status === 401) {
            const authStore = useAuthStore();
            await authStore.logout();
            window.location.href = '/login';
          }
        }
        
        return {
          code: 500,
          status: 'error',
          message: 'Lỗi hệ thống',
          data: [],
          pagination: {
            pageIndex: 1,
            pageSize: 10,
            totalCount: 0
          }
        };
      }
    }
  
    private transformCampaign(apiData: any): AppCampaign {
      return {
        id: String(apiData.campaignId),
        name: apiData.campaignName,
        websiteId: apiData.websiteId,
        status: apiData.status,
        startDate: apiData.startDate,
        endDate: apiData.endDate,
        totalRecipients: apiData.total,
        sentCount: apiData.sentCount,
        createdAt: apiData.createdAt
      };
    }
  
    async getCampaignDetail(campaignId: number) {
      try {
        const response = await this.api.get(`/membership/get/get-campaign/${campaignId}`);
        return this.transformCampaign(response.data);
      } catch (error) {
        console.error('[AppPush] Error getting campaign detail:', error);
        throw error;
      }
    }
  }
  
  export const appCampaignService = new AppCampaignService();