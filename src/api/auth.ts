// Generated by Cursor
import axios from 'axios';
import type { LoginCredentials, RegisterCredentials, AuthResponse } from '@/types/auth';

const API_URL = '/api/membership'; // URL API của bạn

// Tạo instance axios với base URL
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true
});

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/login',
        credentials
      );
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post<AuthResponse>(
        '/register',
        credentials
      );
      return response.data;
    } catch (error: any) {
      console.error('Register API error:', error);
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/logout');
    } catch (error: any) {
      // Nếu API logout không tồn tại hoặc gặp lỗi, 
      // vẫn xóa token ở client side
      console.warn('Logout API failed:', error);
      throw error;
    }
  }
};

// Axios interceptor để thêm token vào header
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptor để xử lý lỗi
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    //fix bug cursor
    return Promise.reject(error);
  }
);

export default axiosInstance;
// End Generated by Cursor