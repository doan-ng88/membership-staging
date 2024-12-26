<template>
  <div class="min-h-screen relative">
    <!-- Background Image -->
    <div 
      class="absolute inset-0 bg-cover bg-center bg-no-repeat blur-sm"
      style="background-image: url('../../../public/images/login-bg.png')"
    ></div>
    
    <!-- Content -->
    <div class="relative min-h-screen flex flex-col items-center justify-center p-4">
      <!-- Register Form -->
      <div class="w-full max-w-md">
        <h1 class="text-white text-4xl tracking-widest text-center mb-16">NEW ACCOUNT</h1>
        
        <form @submit.prevent="handleSubmit" class="space-y-8">
          <div class="relative">
            <input
              type="text"
              v-model="name"
              required
              class="w-full bg-transparent border-b-2 border-cyan-400 text-white px-2 py-3 focus:outline-none placeholder-gray-300/50"
              placeholder="name"
            />
          </div>

          <div class="relative">
            <input
              type="email"
              v-model="email"
              required
              class="w-full bg-transparent border-b-2 border-cyan-400 text-white px-2 py-3 focus:outline-none placeholder-gray-300/50"
              placeholder="email"
            />
          </div>

          <div class="relative">
            <input
              type="password"
              v-model="password"
              required
              class="w-full bg-transparent border-b-2 border-cyan-400 text-white px-2 py-3 focus:outline-none placeholder-gray-300/50"
              placeholder="password"
            />
          </div>

          <!-- Register Button -->
          <div class="flex justify-center mt-16">
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-16 h-16 rounded-full bg-cyan-400 hover:bg-cyan-500 flex items-center justify-center transition-all duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <!-- Back to Login Link -->
          <div class="flex justify-center mt-8">
            <router-link to="/login" class="text-white hover:text-cyan-400 tracking-wider">
              BACK TO LOGIN
            </router-link>
          </div>

          <div v-if="error" class="text-red-400 text-center mt-4">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const authStore = useAuthStore();
    const name = ref('');
    const email = ref('');
    const password = ref('');
    const error = ref('');

    const handleSubmit = async () => {
      try {
        error.value = '';
        await authStore.register({
          name: name.value,
          email: email.value,
          password: password.value
        });
      } catch (err: any) {
        error.value = err.response?.data?.message || 'Registration failed';
      }
    };

    return {
      authStore,
      name,
      email,
      password,
      error,
      handleSubmit
    };
  }
});
</script>