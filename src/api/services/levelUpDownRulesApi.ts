import axiosInstance from '../config/axios';
import type { LevelSetting } from '@/api/types/levelUpDownRules';
import type { ApiResponse } from '@/api/types/responses';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export class LevelUpDownRulesApi {
  async getLevelSettings(): Promise<ApiResponse<LevelSetting[]>> {
    try {
      const response = await axiosInstance.get('/membership/get/get-level-setting');
      // console.log('API Response:', response);
      
      return {
        data: response.data.data,
        message: response.data.message || '',
        success: true
      };
    } catch (error) {
      // console.error('Error getting levels:', error);
      throw error;
    }
  }

  async checkNameExists(websiteId: number, name: string, excludeLevelId?: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/api/membership/get/get-level-setting');
      const levels = response.data.data;
      return levels.some((level: LevelSetting) => 
        level.websiteId === websiteId && 
        level.Name.toLowerCase() === name.toLowerCase() &&
        level.levelId !== excludeLevelId
      );
    } catch (error) {
      // console.error('Error checking name:', error);
      throw error;
    }
  }

  async checkRankExists(websiteId: number, rank: number, excludeLevelId?: number): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/api/membership/get/get-level-setting');
      const levels = response.data.data;
      return levels.some((level: LevelSetting) => 
        level.websiteId === websiteId && 
        level.rank === rank &&
        level.levelId !== excludeLevelId
      );
    } catch (error) {
      // console.error('Error checking rank:', error);
      throw error;
    }
  }

  async updateLevel(data: LevelSetting): Promise<ApiResponse<LevelSetting>> {
    try {
      const [nameExists, rankExists] = await Promise.all([
        this.checkNameExists(data.websiteId, data.Name, data.levelId),
        this.checkRankExists(data.websiteId, data.rank, data.levelId)
      ]);

      if (nameExists) {
        throw new ApiError(400, `Tên cấp bậc "${data.Name}" đã tồn tại`);
      }

      if (rankExists) {
        throw new ApiError(400, `Thứ hạng ${data.rank} đã tồn tại`);
      }

      const response = await axiosInstance.post('/api/membership/update/level-setting-update-level', {
        LevelId: data.levelId,
        name: data.Name,
        websiteId: data.websiteId,
        thresholdAmount: data.thresholdAmount,
        durationExpired: data.durationExpired,
        rank: data.rank
      });

      // Đảm bảo response trả về đúng format
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật cấp bậc'
      );
    }
  }

  async deleteLevel(levelId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete('/api/membership/update/level-setting-delete-level', {
        data: { levelId }
      });
      return response.data;
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Có lỗi xảy ra khi xóa cấp bậc'
      );
    }
  }

  async createLevel(data: Omit<LevelSetting, 'levelId'>): Promise<ApiResponse<LevelSetting>> {
    try {
      const [nameExists, rankExists] = await Promise.all([
        this.checkNameExists(data.websiteId, data.Name),
        this.checkRankExists(data.websiteId, data.rank)
      ]);

      if (nameExists) {
        throw new ApiError(400, `Tên cấp bậc "${data.Name}" đã tồn tại`);
      }

      if (rankExists) {
        throw new ApiError(400, `Thứ hạng ${data.rank} đã tồn tại`);
      }

      const response = await axiosInstance.post('/api/membership/update/level-setting-add-level', {
        name: data.Name,
        websiteId: data.websiteId,
        thresholdAmount: data.thresholdAmount,
        durationExpired: data.durationExpired,
        rank: data.rank
      });

      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error: any) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Có lỗi xảy ra khi thêm cấp bậc mới'
      );
    }
  }
}

export const levelUpDownRulesApi = new LevelUpDownRulesApi(); 