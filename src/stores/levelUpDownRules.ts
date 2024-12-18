import { defineStore } from 'pinia'
import { levelUpDownRulesApi } from '@/api/services/levelUpDownRulesApi'
import type { LevelSetting } from '@/api/types/levelUpDownRules'

interface State {
  levelSettings: LevelSetting[]
  isLoading: boolean
  error: string | null
}

export const useLevelSettingStore = defineStore('levelSetting', {
  state: (): State => ({
    levelSettings: [] as LevelSetting[],
    isLoading: false,
    error: null
  }),

  getters: {
    getLevelsByWebsite: (state) => (websiteId: number) => {
      return state.levelSettings.filter(level => level.websiteId === websiteId);
    }
  },

  actions: {
    async fetchLevelSettings() {
      this.isLoading = true;
      try {
        const response = await levelUpDownRulesApi.getLevelSettings();
        // console.log('Store received data:', response);
        
        if (response.data) {
          this.levelSettings = response.data;
          // console.log('Store updated levelSettings:', this.levelSettings);
        }
      } catch (error: any) {
        // console.error('Store Error:', error);
        this.error = error.message || 'Có lỗi xảy ra khi tải dữ liệu';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async updateLevel(data: LevelSetting) {
      this.isLoading = true;
      try {
        const response = await levelUpDownRulesApi.updateLevel(data);
        
        if (response.success) {
          const index = this.levelSettings.findIndex(level => level.levelId === data.levelId);
          if (index !== -1) {
            this.levelSettings[index] = { ...data };
          }
          
          await this.fetchLevelSettings();
          return true;
        }
        return false;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteLevel(levelId: number) {
      this.isLoading = true;
      try {
        await levelUpDownRulesApi.deleteLevel(levelId);
        await this.fetchLevelSettings();
        return true;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    async createLevelSetting(data: Omit<LevelSetting, 'levelId'>) {
      this.isLoading = true;
      try {
        const response = await levelUpDownRulesApi.createLevel(data);
        if (response.success) {
          // Refresh lại danh sách sau khi thêm mới
          await this.fetchLevelSettings();
          return true;
        }
        return false;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      } finally {
        this.isLoading = false;
      }
    }
  }
})
