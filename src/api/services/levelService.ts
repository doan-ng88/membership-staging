// # API methods cho level management

import axiosInstance from '../config/axios'
import type { LevelSetting } from '@/data/benefits'
import type { ApiResponse } from '@/api/types/responses'
import { useAuthStore } from '@/stores/auth'

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

export const levelService = {
  async getLevelSettings(): Promise<ApiResponse<LevelSetting[]>> {
    try {
      const response = await axiosInstance.get('membership/get/get-level-setting')
      return response.data
    } catch (error) {
      console.error('Error getting levels:', error)
      throw error
    }
  },

  async checkNameExists(websiteId: number, name: string, excludeLevelId?: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/membership/get/get-level-setting')
      const levels = response.data.data
      return levels.some((level: LevelSetting) => 
        level.websiteId === websiteId && 
        level.Name.toLowerCase() === name.toLowerCase() &&
        level.levelId !== excludeLevelId
      )
    } catch (error) {
      console.error('Error checking name:', error)
      throw error
    }
  },

  async checkRankExists(websiteId: number, rank: number, excludeLevelId?: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/membership/get/get-level-setting')
      const levels = response.data.data
      return levels.some((level: LevelSetting) => 
        level.websiteId === websiteId && 
        level.rank === rank &&
        level.levelId !== excludeLevelId
      )
    } catch (error) {
      console.error('Error checking rank:', error)
      throw error
    }
  },

  async addLevel(data: Omit<LevelSetting, 'levelId'>): Promise<ApiResponse<LevelSetting>> {
    try {
      const rankExists = await this.checkRankExists(data.websiteId, data.rank)
      if (rankExists) {
        throw new ApiError(400, `Rank ${data.rank} đã tồn tại cho website này`)
      }

      const response = await axiosInstance.post('/membership/update/level-setting-add-level', {
        Name: data.Name,
        websiteId: data.websiteId,
        thresholdAmount: data.thresholdAmount,
        rewardRate: data.rewardRate,
        redeemRate: data.redeemRate,
        durationExpired: data.durationExpired,
        rank: data.rank,
        discountPerOrder: data.discountPerOrder
      })
      return response.data
    } catch (error: any) {
      console.error('Error adding level:', error)
      throw error
    }
  },

  async updateLevel(data: LevelSetting): Promise<ApiResponse<LevelSetting>> {
    try {
      console.log('Updating level with ID:', data.levelId)
      console.log('Update data:', data)

      const [nameExists, rankExists] = await Promise.all([
        this.checkNameExists(data.websiteId, data.Name, data.levelId),
        this.checkRankExists(data.websiteId, data.rank, data.levelId)
      ])

      if (nameExists) {
        throw new ApiError(400, `Tên cấp bậc "${data.Name}" đã tồn tại`)
      }

      if (rankExists) {
        throw new ApiError(400, `Thứ hạng ${data.rank} đã tồn tại`)
      }

      const response = await axiosInstance.post(
        `membership/update/level-setting-update-level`, 
        {
          levelId: data.levelId,
          Name: data.Name,
          websiteId: data.websiteId,
          thresholdAmount: data.thresholdAmount,
          rewardRate: data.rewardRate,
          redeemRate: data.redeemRate,
          durationExpired: data.durationExpired,
          rank: data.rank,
          discountPerOrder: data.discountPerOrder
        }
      )
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật cấp bậc'
      )
    }
  },

  async deleteLevel(levelId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/membership/update/level-setting-delete-level/${levelId}`)
      return response.data
    } catch (error: any) {
      console.error('Error deleting level:', error)
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Có lỗi xảy ra khi xóa cấp bậc'
      )
    }
  },

  async getRankStatistics(websiteId: string, params: { startDate: string, endDate: string }) {
    const authStore = useAuthStore()
    try {
      const response = await axiosInstance.post(
        `/membership/get/get-rank-statistics/${websiteId}`, 
        {
          startDate: params.startDate,
          endDate: params.endDate
        },
        {
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching rank statistics:', error)
      throw error
    }
  },
} 