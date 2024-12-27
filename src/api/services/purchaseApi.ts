import axiosClient from '../axiosClient';

export const purchaseApi = {
  getPurchaseHistory: (params: Record<string, string> = {}) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) {
        searchParams.append(key, value)
      }
    })
    console.log(searchParams.toString())
    return axiosClient.get(`/membership/get/history-orders?${searchParams.toString()}`)
  }
} 