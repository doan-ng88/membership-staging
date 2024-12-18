import axios from 'axios';
import { useAuthStore } from '@/stores/auth';

interface ChannelStatsParams {
  fromDate: string;
  toDate: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const marketingPerformanceService = {
  async getChannelStats(params: ChannelStatsParams) {
    try {
      const authStore = useAuthStore();
      const response = await axios.post(`${API_BASE_URL}/membership/mail/statistics`, {
        fromDate: params.fromDate,
        toDate: params.toDate
      }, {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching channel stats:', error);
      throw error;
    }
  }
}; 