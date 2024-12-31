<template>
  <div class="min-h-screen relative">
    <!-- Background Image with stronger blur -->
    <div 
      class="absolute inset-0 bg-cover bg-center bg-no-repeat blur-md brightness-50"
      :style="{ backgroundImage: loginBg }"
    ></div>
    
    <!-- Content with backdrop filter -->
    <div class="relative min-h-screen flex flex-col items-center justify-center p-4">
      <!-- Login Form Container with glass effect -->
      <div class="w-full max-w-md bg-black/30 backdrop-blur-sm p-8 rounded-lg shadow-xl">
        <h1 class="text-white text-4xl font-bold tracking-widest text-center mb-12">LOGIN</h1>
        
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <!-- Email Input -->
          <div class="relative">
            <label class="text-gray-300 text-sm mb-1 block">Username</label>
            <input
              type="email"
              v-model="email"
              required
              class="w-full bg-white/10 border-b-2 border-cyan-400 text-white px-4 py-3 rounded-t-lg focus:outline-none focus:border-cyan-300 placeholder-gray-400"
              placeholder="Enter your username"
            />
          </div>

          <!-- Password Input with toggle -->
          <div class="relative">
            <label class="text-gray-300 text-sm mb-1 block">Password</label>
            <div class="relative">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="password"
                required
                class="w-full bg-white/10 border-b-2 border-cyan-400 text-white px-4 py-3 rounded-t-lg focus:outline-none focus:border-cyan-300 placeholder-gray-400"
                placeholder="Enter your password"
              />
              <button 
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
              >
                <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Login Button -->
          <div class="flex justify-center mt-12">
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-16 h-16 rounded-full bg-cyan-500 hover:bg-cyan-600 flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-cyan-500/50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Links with improved visibility -->
          <div class="flex flex-col items-center space-y-4 mt-8">
            <router-link 
              to="/register" 
              class="text-white hover:text-cyan-400 tracking-wider font-medium transition-colors duration-300"
            >
              NEW ACCOUNT
            </router-link>
            <a 
              href="#" 
              class="text-white hover:text-cyan-400 tracking-wider font-medium transition-colors duration-300"
            >
              FORGOT PASSWORD
            </a>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="text-red-400 text-center mt-4 p-3 bg-red-900/50 rounded">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import loginBgImage from '@/assets/images/login-bg.png'

const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const error = ref('')
const loginBg = ref(`url(${loginBgImage})`)
const showPassword = ref(false)

const handleSubmit = async () => {
  try {
    error.value = ''
    await authStore.login({
      email: email.value,
      password: password.value
    })
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed'
  }
}
</script>
