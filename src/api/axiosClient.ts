// src/api/axiosClient.ts
import axios from 'axios'

const axiosClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  withCredentials: true
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
    return response.data
  },
  (error) => {
    // Xử lý lỗi chung ở đây (401, 403, etc.)
    return Promise.reject(error)
  }
)

export default axiosClient