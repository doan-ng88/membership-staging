import axiosInstance from '../config/axios';

export interface PointTransaction {
  orderId: number
  dateRecord: string
  action: string
  point: number
  totalPoint: number
  productId: number
}

export interface PointHistoryResponse {
  code: number
  data: PointTransaction[]
  message: string
  status: string
}

export class PointHistoryApi {
  async getPointHistory(membershipWebsiteId: number): Promise<PointHistoryResponse> {
    try {
      const response = await axiosInstance.get(`/membership/get/get-point-transaction-history`, {
        params: {
          membershipwebsite_id: membershipWebsiteId
        }
      })
      return response.data
    } catch (error) {
      console.error('Error fetching point history:', error)
      throw error
    }
  }
}

export const pointHistoryApi = new PointHistoryApi() 