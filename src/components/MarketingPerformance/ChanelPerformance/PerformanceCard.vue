<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ title }}</h3>
        <p class="text-3xl font-bold mt-2">{{ formatValue(value) }}</p>
      </div>
      <div :class="getChangeClass()">
        <span v-if="!isNaN(change)">{{ formatChange(change) }}</span>
        <span v-else>--</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: 'chart'
  }
})

const formatValue = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0'
  return new Intl.NumberFormat('vi-VN').format(val)
}

const formatChange = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '--'
  const prefix = val > 0 ? '+' : ''
  return `${prefix}${Number(val).toFixed(1)}%`
}

const getChangeClass = () => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium'
  
  if (props.change === undefined || props.change === null || isNaN(props.change)) {
    return `${baseClasses} bg-gray-100 text-gray-800`
  }
  
  return props.change > 0
    ? `${baseClasses} bg-green-100 text-green-800`
    : props.change < 0
      ? `${baseClasses} bg-red-100 text-red-800`
      : `${baseClasses} bg-gray-100 text-gray-800`
}
</script>

<style scoped>
.inline-flex {
  display: inline-flex;
}
</style>
