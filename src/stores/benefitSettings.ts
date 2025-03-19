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
    },

    getLevelsByWebsite: (state) => (websiteId: number) => {
      return state.levelSettings.filter(level => level.websiteId === websiteId)
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

    async checkDuplicateName(name: string, websiteId: number, levelId?: number) {
      console.log('Store: Checking duplicate websiteId', websiteId)
      console.log('Store: Checking duplicate levelId', levelId)
      try {
        const existingLevel = this.levelSettings.find(level => 
          level.websiteId === websiteId && 
          level.levelId !== levelId &&
          level.Name.toLowerCase() === name.toLowerCase()
        )
        return !!existingLevel
      } catch (error) {
        console.error('Error checking duplicate name:', error)
        throw error
      }
    },

    async checkDuplicateRank(rank: number, websiteId: number, levelId?: number) {

      try {
        const existingLevel = this.levelSettings.find(level => 
          level.websiteId === websiteId && 
          level.levelId !== levelId &&
          level.rank === rank
        )
        return !!existingLevel
      } catch (error) {
        console.error('Error checking duplicate rank:', error)
        throw error
      }
    },

    async addLevel(levelData: Omit<LevelSetting, 'levelId'>) {
      this.isLoading = true
      this.error = null

      try {
        const [isDuplicateName, isDuplicateRank] = await Promise.all([
          this.checkDuplicateName(levelData.Name, levelData.websiteId),
          this.checkDuplicateRank(levelData.rank, levelData.websiteId)
        ])

        if (isDuplicateName) {
          this.error = `Tên cấp bậc "${levelData.Name}" đã tồn tại cho website này`
          return false
        }

        if (isDuplicateRank) {
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
        const [isDuplicateName, isDuplicateRank] = await Promise.all([
          this.checkDuplicateName(levelData.Name, levelData.websiteId, levelData.levelId),
          this.checkDuplicateRank(levelData.rank, levelData.websiteId, levelData.levelId)
        ])

        if (isDuplicateName) {
          this.error = `Tên cấp bậc "${levelData.Name}" đã tồn tại cho website này`
          return false
        }

        if (isDuplicateRank) {
          this.error = `Rank ${levelData.rank} đã tồn tại cho website này`
          return false
        }

        await levelService.updateLevel(levelData)
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
        
        this.levelSettings = this.levelSettings.filter(level => level.levelId !== levelId)
        
        await this.fetchLevelSettings()
        
        return true
      } catch (error: any) {
        console.error('Store: Delete error', error)
        this.error = error instanceof ApiError ? error.message : 'Có lỗi xảy ra khi xóa cấp bậc'
        return false
      } finally {
        this.isLoading = false
      }
    },

    updateLocalBenefit(updatedBenefit: LevelSetting) {
      const index = this.levelSettings.findIndex(b => b.levelId === updatedBenefit.levelId);
      if (index !== -1) {
        this.levelSettings[index] = { ...updatedBenefit };
      }
    }
  }
}) 