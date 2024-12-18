<template>
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center">
        <slot name="title"></slot>
        <div v-if="$slots.subtitle" class="ml-4 text-gray-500">
          <slot name="subtitle"></slot>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <slot name="extra"></slot>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  // Component chỉ cần xử lý slots nên không cần logic bổ sung
  </script>