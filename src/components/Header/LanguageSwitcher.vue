<template>
  <div class="relative w-24 h-8 bg-stroke dark:bg-gray-800 rounded-[22px] p-[3px] shadow-inner">
    <button
      @click="toggleLanguage"
      class="relative flex items-center gap-3 w-full h-full px-4"
      :aria-label="currentLanguage.name"
    >
      <!-- Vietnamese Language Option -->
      <div 
        class="absolute flex items-center gap-3 transition-all duration-500"
        :class="[
          currentLanguage.code === 'vi' ? 'opacity-100' : 'opacity-0 translate-x-8',
        ]"
      >
        <div class="w-6 h-6 rounded-full overflow-hidden shadow-md">
          <img 
            :src="languages[0].flag"
            :alt="languages[0].name"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <span class="text-gray-600 dark:text-gray-300 text-base font-medium tracking-wide">
          {{ languages[0].code.toUpperCase() }}
        </span>
      </div>

      <!-- English Language Option -->
      <div 
        class="absolute flex items-center gap-3 transition-all duration-500"
        :class="[
          currentLanguage.code === 'en' ? 'opacity-100' : 'opacity-0 -translate-x-8',
        ]"
      >
        <div class="w-6 h-6 rounded-full overflow-hidden shadow-md">
          <img 
            :src="languages[1].flag"
            :alt="languages[1].name"
            class="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <span class="text-gray-600 dark:text-gray-300 text-base font-medium tracking-wide">
          {{ languages[1].code.toUpperCase() }}
        </span>
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useLanguage } from '@/composables/useLanguage'

const { currentLanguage, toggleLanguage, languages } = useLanguage()
</script>

<style scoped>
.shadow-inner {
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.1),
              inset -2px -2px 5px rgba(255, 255, 255, 0.8);
}

/* Dark mode adjustments */
:dark .shadow-inner {
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.2),
              inset -2px -2px 5px rgba(255, 255, 255, 0.05);
}

/* Smooth transition for language switch */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 500ms;
}

/* Accessibility improvements */
button:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 2px;
}

/* Optimize performance */
img {
  will-change: transform;
  transform: translateZ(0);
}
</style> 