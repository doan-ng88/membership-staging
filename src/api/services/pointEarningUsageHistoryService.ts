import axiosInstance from '../config/axios';

interface PointEarningUsageHistory {
  orderId: number;
  dateRecord: string;
  action: string;
  point: number;
  totalPoint: number;
  productId: number;
}

interface PointEarningUsageHistoryResponse {
  code: number;
  data: PointEarningUsageHistory[] | null;
  message: string;
  status: string;
}

export const pointEarningUsageHistoryService = {
  async getHistory(membershipWebsiteId: number): Promise<PointEarningUsageHistoryResponse> {
    try {
      console.log('Calling API with membershipWebsiteId:', membershipWebsiteId)
      
      const response = await axiosInstance.get('/membership/get/get-point-transaction-history', {
        params: {
          membershipwebsite_id: membershipWebsiteId
        }
      })
      
      console.log('Raw API Response:', response.data)
      
      const responseData = {
        ...response.data,
        data: response.data.data || []
      }
      
      console.log('Processed response data:', responseData)
      return responseData
      
    } catch (error: any) {
      console.error('Service error:', error)
      return {
        code: error.response?.status || 500,
        data: [],
        message: error.message || 'Error fetching data',
        status: 'ERROR'
      }
    }
  }
}

export type { PointEarningUsageHistory, PointEarningUsageHistoryResponse } 