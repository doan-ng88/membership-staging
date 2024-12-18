// src/api/axiosClient.ts
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://lxwvj138-8081.asse.devtunnels.ms/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Thêm interceptor để xử lý token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Xử lý response
axiosClient.interceptors.response.use(
  (response) => {
    if (response.data) {
      return response.data
    } else {
      return response
    }
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default axiosClient