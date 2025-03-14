// src/api/membershipAPI.ts
import axiosInstance from '../config/axios'

interface LevelInfo {
  levelId: number
  Name: string
  websiteId: number
  rank: number
  thresholdAmount: number
  rewardRate: number
  redeemRate: number
  levelIdWebsite: number
  durationExpired: number
  discountPerOrder: number
  deletedAt: null | string
}

interface LevelResponse {
  code: number
  status: string
  message: string
  data: LevelInfo[]
}

interface MemberListResponse {
  code: number
  status: string
  message: string
  data: Member[] // Danh sách members trực tiếp trong data
  pageIndex: number
  pageSize: number
  totalCount: number
}

export interface Member {
  membershipId: number
  websiteId: number
  fullName: string
  mainPhoneNumber: string
  registeredTime: string
  birthday: string
  levelName: string
}

interface SearchParam {
  key: string
  value: string | number
}

export const membershipAPI = {
  async getList(
    sortField: string = 'MembershipsWebsitesId', 
    sortType: string = 'ASC', 
    pageSize: number = 10, 
    pageIndex: number = 1, 
    searchParams: SearchParam[] = []
  ) {
    const formattedParams = searchParams.map(param => ({
      key: param.key,
      value: param.value.toString()
    }))

    const response = await axiosInstance.post<MemberListResponse>('membership/get/get-membership-list', {
      sortField,
      sortType,
      pageSize,
      pageIndex,
      searchParams: formattedParams,
    })
    return response.data
  },

  async getMemberDetail(userId: number) {
    return axiosInstance.get(`membership/get/member-information-detail?user_id=${userId}`)
  },

  async getCoupons(websiteId: number, pageIndex?: number, pageSize?: number, search?: string, from?: string, to?: string) {
    return axiosInstance.get(`membership/get/coupons/${websiteId}`, {
      params: {
        ...(pageIndex ? {pageIndex} : {}),
        ...(pageSize ? {pageSize} : {}),
        ...(search ? {search} : {}),
        ...(from ? {from} : {}),
        ...(to ? {to} : {}),
      }
    })
  },
  
  async getAdminUsers() {
    return axiosInstance.get('membership/get/admin-role')
  },

  async updateMembership(data: any) {
    return axiosInstance.post('membership/update/membership', data)
  },

  async updateAddress(data: any) {
    return axiosInstance.post('membership/update/address', data)
  },

  getLevelInfo: async () => {
    try {
      const response = await axiosInstance.get<LevelResponse>('membership/get/get-level-infor')
      
      if (Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => a.rank - b.rank)
        return {
          code: 200,
          status: 'success',
          message: 'Success',
          data: sortedData
        }
      }
      
      if (response.data.code === 200) {
        const sortedData = response.data.data.sort((a, b) => a.rank - b.rank)
        return {
          code: 200,
          status: 'success', 
          message: 'Success',
          data: sortedData
        }
      }
      
      return {
        code: 500,
        status: 'error',
        message: 'Invalid response format',
        data: []
      }
      
    } catch (error) {
      console.error('Error in getLevelInfo:', error)
      return {
        code: 500,
        status: 'error',
        message: 'Network error',
        data: []
      }
    }
  },

  updateMembershipPoint: async (data: {
    membershipWebsiteId: number
    points: number
    reason: string
  }) => {
    try {
      const response = await axiosInstance.post('membership/update/update-point-membership', data)
      return response.data
    } catch (error) {
      throw error
    }
  }
}

export const callHistoryAPI = {
  getHistory: (campaignId: number, membershipId: number) => {
    return axiosInstance.get(`/membership/get/call-history/${campaignId}/${membershipId}`);
  },
};
