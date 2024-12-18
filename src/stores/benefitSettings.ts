import { defineStore } from 'pinia'
import { ApiError, levelService } from '@/api/services/levelService'
import { type LevelSetting } from '@/data/benefits'

export const useBenefitStore = defineStore('benefit', {
  state: () => ({
    levelSettings: [] as LevelSetting[],
    isLoading: false,
    error: null as string | null
  }),

  getters: {
    getRanksByWebsite: (state) => (websiteId: number) => {
      return state.levelSettings
        .filter(level => level.websiteId === websiteId)
        .map(level => level.rank)
    }
  },

  actions: {
    async fetchLevelSettings() {
      this.isLoading = true
      try {
        const response = await levelService.getLevelSettings()
        this.levelSettings = response.data
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.isLoading = false
      }
    },

    async addLevel(levelData: Omit<LevelSetting, 'levelId'>) {
      this.isLoading = true
      this.error = null

      try {
        // Kiểm tra rank đã tồn tại
        const existingRanks = this.getRanksByWebsite(levelData.websiteId)
        if (existingRanks.includes(levelData.rank)) {
          this.error = `Rank ${levelData.rank} đã tồn tại cho website này`
          return false
        }

        await levelService.addLevel(levelData)
        await this.fetchLevelSettings()
        return true
      } catch (error: any) {
        this.error = error instanceof ApiError ? error.message : 'Có lỗi xảy ra khi thêm cấp bậc'
        return false
      } finally {
        this.isLoading = false
      }
    },

    async updateLevel(levelData: LevelSetting) {
      this.isLoading = true
      this.error = null
      
      try {
        const response = await levelService.updateLevel(levelData)
        await this.fetchLevelSettings()
        return true
      } catch (error) {
        if (error instanceof ApiError) {
          this.error = error.message
        } else {
          this.error = 'Có lỗi xảy ra khi cập nhật cấp bậc'
        }
        return false
      } finally {
        this.isLoading = false
      }
    },

    async deleteLevel(levelId: number) {
      this.isLoading = true
      this.error = null

      try {
        console.log('Store: Deleting level', levelId)
        await levelService.deleteLevel(levelId)
        
        // Cập nhật state sau khi xóa thành công
        this.levelSettings = this.levelSettings.filter(level => level.levelId !== levelId)
        
        // Hoặc fetch lại data từ server
        await this.fetchLevelSettings()
        
        return true
      } catch (error: any) {
        console.error('Store: Delete error', error)
        this.error = error instanceof ApiError ? error.message : 'Có lỗi xảy ra khi xóa cấp bậc'
        return false
      } finally {
        this.isLoading = false
      }
    }
  }
}) 