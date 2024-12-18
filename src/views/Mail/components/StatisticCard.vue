<template>
  <div class="bg-gray-50 rounded-lg p-4">
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-sm font-medium text-gray-700">{{ title }}</h4>
      <component :is="icon" :class="[color, 'text-xl']" />
    </div>
    <div class="text-2xl font-bold">{{ value }}</div>
  </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue'
import * as Icons from '@ant-design/icons-vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'text-gray-500'
  }
})
</script>
