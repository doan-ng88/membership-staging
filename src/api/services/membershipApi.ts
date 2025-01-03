// src/api/membershipAPI.ts
import axiosClient from '../axiosClient';

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

interface MemberResponse {
  code: number
  status: string
  message: string
  data: {
    data: Member[]
    totalCount: number
    pageIndex: number
    pageSize: number
  }
}

interface Member {
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
  getList(
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

    return axiosClient.post<MemberResponse>('/membership/get/get-membership-list', {
      sortField,
      sortType,
      pageSize,
      pageIndex,
      searchParams: formattedParams,
    })
  },

  getMemberDetail(userId: number) {
    return axiosClient.get(`/membership/get/member-information-detail?user_id=${userId}`);
  },

  getCoupons(websiteId:number,pageIndex?: number,pageSize?: number,search?: string,from?: string,to?: string) {
    return axiosClient.get(`/membership/get/coupons/${websiteId}`, {
      params: {
        ...(pageIndex ? {pageIndex} : {}),
        ...(pageSize ? {pageSize} : {}),
        ...(search ? {search} : {}),
        ...(from ? {from} : {}),
        ...(to ? {to} : {}),
      }
    });
  },
  
  getAdminUsers() {
    return axiosClient.get(`/membership/get/admin-role`);
  },


  updateMembership(data: any) {
    return axiosClient.post('/membership/update/membership', data);
  },

  updateAddress(data: any) {
    return axiosClient.post('/membership/update/address', data);
  },

  getLevelInfo: async () => {
    try {
      const url = '/membership/get/get-level-infor'
      console.log('Fetching levels from:', url)
      
      const response = await axiosClient.get<LevelResponse>(url)
      console.log('Raw API Response:', response)
      
      if (Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => a.rank - b.rank)
        console.log('Sorted Levels:', sortedData)
        
        return {
          code: 200,
          status: 'success',
          message: 'Success',
          data: sortedData
        }
      }
      
      if (response.data.code === 200) {
        const sortedData = response.data.data.sort((a, b) => a.rank - b.rank)
        console.log('Sorted Levels:', sortedData)
        
        return {
          code: 200,
          status: 'success', 
          message: 'Success',
          data: sortedData
        }
      }
      
      console.error('Invalid response format:', response.data)
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
      const response = await axiosClient.post('/api/membership/update/update-point-membership', data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  
};
