<template>
  <div class="relative w-24 h-8 bg-stroke dark:bg-gray-800 rounded-[22px] p-[3px] shadow-inner">
    <button
      @click="toggleLanguage"
      class="relative flex items-center gap-3 w-full h-full px-4"
    >
      <div 
        class="absolute flex items-center gap-3 transition-all duration-500"
        :class="[
          currentLanguage.code === 'vi' ? 'opacity-100' : 'opacity-0 translate-x-8',
        ]"
      >
        <div class="w-6 h-6 rounded-full overflow-hidden shadow-md">
          <img 
            src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/vn.svg"
            alt="Tiếng Việt"
            class="w-full h-full object-cover"
          />
        </div>
        <span class="text-gray-600 dark:text-gray-300 text-base font-medium tracking-wide">VI</span>
      </div>

      <div 
        class="absolute flex items-center gap-3 transition-all duration-500"
        :class="[
          currentLanguage.code === 'en' ? 'opacity-100' : 'opacity-0 -translate-x-8',
        ]"
      >
        <div class="w-6 h-6 rounded-full overflow-hidden shadow-md">
          <img 
            src="https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/gb.svg"
            alt="English"
            class="w-full h-full object-cover"
          />
        </div>
        <span class="text-gray-600 dark:text-gray-300 text-base font-medium tracking-wide">EN</span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLanguage } from '@/composables/useLanguage'

const { currentLanguage, toggleLanguage } = useLanguage()
</script>

<style scoped>
.language-switch-container {
  position: relative;
  width: 80px;
  height: 36px;
  /* background-color: #f3f4f6;
  border-radius: 999px; */
  /* overflow: hidden; */

  /* background-color: rgb(226 232 240 / var(--tw-bg-opacity)); */
  border-radius: 22px;
  padding: 3px;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1),
              inset -2px -2px 5px rgba(255, 255, 255, 0.8);
}

.language-button {
  position: absolute;
  display: flex;
  width: 160px; /* Double the container width */
  height: 100%;
  transition: transform 0.3s ease;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 80px; /* Same as container width */
  height: 100%;
  padding: 0 16px;
  justify-content: center;
}

.slide-en {
  transform: translateX(-80px); /* Negative container width */
}

:dark .language-switch-container {
  background-color: #374151;
}

:dark .language-button:hover {
  background-color: #4b5563;
}
</style> 