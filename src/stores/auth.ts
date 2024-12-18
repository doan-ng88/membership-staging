import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { LoginCredentials, RegisterCredentials } from '@/types/auth';
import { authApi } from '@/api/auth';
import router from '@/router';

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!token.value);

  // Khôi phục token từ localStorage
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      token.value = storedToken;
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authApi.login(credentials);
      
      token.value = response.token;
      localStorage.setItem('token', response.token);
      
      router.push('/'); // Chuyển hướng về trang chủ
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đăng nhập thất bại';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      loading.value = true;
      error.value = null;
      
      const response = await authApi.register(credentials);
      
      token.value = response.token;
      localStorage.setItem('token', response.token);
      
      router.push('/');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đăng ký thất bại';
      throw error.value;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    try {
      loading.value = true;
      error.value = null;

      // Gọi API logout
      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Logout API error:', error);
        // Tiếp tục xử lý logout ở client side ngay cả khi API fails
      }

      // Luôn xóa token và chuyển về trang login
      token.value = null;
      localStorage.removeItem('token');
      router.push('/login');
      
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đăng xuất thất bại';
      console.error('Logout error:', err);
    } finally {
      loading.value = false;
    }
  };

  return {
    token,
    loading,
    error,
    isAuthenticated,
    initializeAuth,
    login,
    register,
    logout
  };
});
