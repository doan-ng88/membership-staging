import axios from 'axios'
import { mockPurchases } from '@/mocks/purchaseData' 

const API_URL = 'https://api.example.com'

export const purchaseApi = {
  getPurchaseHistory() {
    // Sử dụng mock data cho development
    return Promise.resolve({ data: mockPurchases })
    
    // Khi có API thật, uncomment dòng dưới và comment dòng trên
    // return axios.get(`${API_URL}/purchases`)
  }
} 