<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 flex items-center justify-center z-50">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <!-- Popup content -->
      <div class="bg-white rounded-lg p-6 shadow-xl relative z-10 max-w-md w-full mx-4">
        <div class="text-center">
          <!-- Success Icon -->
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" 
                    stroke-linejoin="round" 
                    stroke-width="2" 
                    d="M5 13l4 4L19 7">
              </path>
            </svg>
          </div>
          
          <!-- Title -->
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-2">
            {{ title }}
          </h3>
          
          <!-- Message -->
          <div class="text-sm text-gray-500 mb-4">
            {{ message }}
          </div>
          
          <!-- Button -->
          <button 
            @click="$emit('close')"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:text-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean;
  title?: string;
  message: string;
}>()

defineEmits<{
  (e: 'close'): void;
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style> 