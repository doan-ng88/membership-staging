import axiosInstance from '../config/axios'
import type { SystemConfig } from '../../types/automaticAdjustment'
import type { ApiResponse } from '../types/responses'
import { ApiError } from '../types/responses' // Thêm import ApiError
    
export class SystemConfigApi {
  // Get current config
  async getConfig(): Promise<ApiResponse<SystemConfig>> {
    try {
      const response = await axiosInstance.get('/api/membership/get-config-system')
      return response.data
    } catch (error: any) {
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Có lỗi xảy ra khi lấy cấu hình',
        error.response?.data?.errors
      )
    }
  }

  // Validate config
  private validateConfig(config: SystemConfig): void {
    if (config.DateBeforeDowngrade < 0) {
      throw new ApiError(400, 'Số ngày phải lớn hơn hoặc bằng 0')
    }
    // Thêm các validation khác nếu cần
  }

  // Update config
  async updateConfig(config: SystemConfig): Promise<ApiResponse<SystemConfig>> {
    try {
      // Validate trước khi gửi request
      this.validateConfig(config)

      const response = await axiosInstance.post('/api/membership/update/set-config-system', {
        DateBeforeDowngrade: config.DateBeforeDowngrade,
        SendMailBeforeDowngrade: config.SendMailBeforeDowngrade,
        SendMailAfterDowngrade: config.SendMailAfterDowngrade,
        SendZaloOABeforeDowngrade: config.SendZaloOABeforeDowngrade,
        SendZaloOAAfterDowngrade: config.SendZaloOAAfterDowngrade,
        Sky007ExpirationPointMonth: config.Sky007ExpirationPointMonth || 0,
        BbiaExpirationPointMonth: config.BbiaExpirationPointMonth || 0,
        HinceExpirationPointMonth: config.HinceExpirationPointMonth || 0,
        MixsoonExpirationPointMonth: config.MixsoonExpirationPointMonth || 0,
        AccessTokenZalo: config.AccessTokenZalo || '',
        RefreshTokenZalo: config.RefreshTokenZalo || '',
        ElasticEmailSender: config.ElasticEmailSender || '',
        ElasticEmailApi: config.ElasticEmailApi || ''
      })

      return response.data
    } catch (error: any) {
      // Xử lý error với type checking
      if (error instanceof ApiError) {
        throw error
      }
      
      throw new ApiError(
        error.response?.status || 500,
        error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật cấu hình',
        error.response?.data?.errors
      )
    }
  }
}

// Export instance
export const systemConfigApi = new SystemConfigApi()