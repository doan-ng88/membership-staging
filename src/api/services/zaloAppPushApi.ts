import axios from 'axios'
import axiosInstance from '../config/axios'
import { useAuthStore } from '@/stores/auth'

export const zaloAppPushApi = {
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
  },

  // delete apppush campaign
  deleteAppPushCampaign: async (campaignId: number) => {
    const response = await axiosInstance.delete(`/membership/delete/campaign/${campaignId}`,
      {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`
        }
      }
    )
    return response.data
  },

  updateAppPushCampaign: async (campaignId: number, payload: any) => {
    const response = await axios.put(
      `${import.meta.env.VITE_API_BASE_URL}/membership/update/update-campaign/${campaignId}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`
        }
      }
    )
    return response.data
  }
} 