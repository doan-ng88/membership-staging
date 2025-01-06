import { defineStore } from 'pinia'
import { membershipAPI } from '@/api/services/membershipApi'
import { pointEarningUsageHistoryService } from '@/api/services/pointEarningUsageHistoryService'
import type { PointEarningUsageHistory } from '@/api/services/pointEarningUsageHistoryService'

interface Member {
  membershipWebsiteId: number;
  membershipId: number;
  email: string;
  birthday: string;
  fullName: string;
  mainPhoneNumber: string;
  points: number;
  level: number;
  levelName: string;
  isJoinSky007: boolean;
  registeredTime: string;
  levelUpdateTime: string;
  websiteId: number;
  levelId: number;
  totalOrder: number;
  amountNextLevel: number;
  defaultAddress: string;
}

interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

interface ApiError {
  message: string;
  code: number;
}

export const usePointRewardStore = defineStore('pointReward', {
  state: () => ({
    members: [] as Member[],
    earningUsageHistory: [] as PointEarningUsageHistory[],
    loading: false,
    error: null as string | null,
    pagination: {
      pageIndex: 1,
      pageSize: 100,
      totalCount: 0
    }
  }),

  actions: {
    async fetchMembers() {
      this.loading = true
      try {
        const response = await membershipAPI.getList() as ApiResponse<Member[]>
        if (response.code === 200) {
          this.members = response.data
        }
      } catch (error: any) {
        console.error('Error fetching members:', error)
        this.error = error.message || 'Không thể tải danh sách thành viên'
      } finally {
        this.loading = false
      }
    },

    async fetchEarningUsageHistory(membershipWebsiteId: number) {
      this.loading = true
      try {
        console.log('Store: Fetching history for ID:', membershipWebsiteId)
        const response = await pointEarningUsageHistoryService.getHistory(membershipWebsiteId)
        console.log('Store: Raw response:', response)
        
        if (response.code === 200) {
          this.earningUsageHistory = Array.isArray(response.data) ? response.data : []
          console.log('Store: Updated history:', {
            length: this.earningUsageHistory.length,
            data: this.earningUsageHistory
          })
        } else {
          console.error('Store: Error response:', response)
          throw new Error(response.message || 'Failed to fetch history')
        }
      } catch (error) {
        console.error('Store: Error:', error)
        this.error = (error as ApiError).message || 'Không thể tải lịch sử điểm'
        this.earningUsageHistory = []
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})