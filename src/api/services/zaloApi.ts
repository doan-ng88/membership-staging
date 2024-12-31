import axiosInstance from '../config/axios'

export const zaloApi = {
  getTemplates() {
    return axiosInstance.get('/api/membership/zalo/templates')
  },

  createCampaign(data: {
    name: string
    description: string
    scheduleTime: string
    templateId: number
    recipients: any[]
  }) {
    return axiosInstance.post('/api/membership/zalo/campaigns', data)
  },

  getCampaigns(params?: any) {
    return axiosInstance.get('/api/membership/zalo/campaigns', { params })
  }
} 