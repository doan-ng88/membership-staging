import { defineStore } from 'pinia'
import { pointEarningUsageHistoryService } from '@/api/services/pointEarningUsageHistoryService'
import type { PointEarningUsageHistory, PointEarningUsageHistoryResponse } from '@/api/services/pointEarningUsageHistoryService'
import { membershipAPI } from '@/api/services/membershipApi'

export const usePointRewardStore = defineStore('pointReward', {
  state: () => ({
    earningUsageHistory: [] as PointEarningUsageHistory[],
    loading: false,
    error: null as string | null,
    members: [] as any[]
  }),

  actions: {
    async fetchMembers() {
      try {
        console.log('Store: Fetching members')
        const response = await membershipAPI.getList(
          'MembershipsWebsitesId', 
          'ASC', 
          100,
          1,
          []
        )
        console.log('Store: Members response:', response)

        if (response.code === 200) {
          this.members = response.data || []
          // console.log('Store: Updated members list:', this.members)
        } else {
          throw new Error(response.message || 'Failed to fetch members')
        }
      } catch (error) {
        console.error('Store: Error fetching members:', error)
        this.error = error instanceof Error ? error.message : 'Không thể tải danh sách thành viên'
        this.members = []
        throw error
      }
    },

    async fetchEarningUsageHistory(membershipWebsiteId: number) {
      this.loading = true
      try {
        console.log('Store: Fetching history for ID:', membershipWebsiteId)
        const response = await pointEarningUsageHistoryService.getHistory(membershipWebsiteId)
        console.log('Store: Response from service:', response)

        if (response.code === 200) {
          this.earningUsageHistory = response.data || []
          // console.log('Store: Updated history:', this.earningUsageHistory)
        } else {
          throw new Error(response.message || 'Failed to fetch history')
        }
      } catch (error) {
        console.error('Store: Error:', error)
        this.error = error instanceof Error ? error.message : 'Không thể tải lịch sử điểm'
        this.earningUsageHistory = []
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})