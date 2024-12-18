<template>
  <div class="mb-12">
    <h3 class="text-2xl font-semibold mb-4">Phân Tích Đóng Góp Của Kênh</h3>
    
    <!-- Time Range Selection -->
    <div class="mb-4 flex items-center">
      <label for="contributionTimeRange" class="text-gray-700 font-medium mr-4">
        Chọn Khoảng Thời Gian:
      </label>
      <select 
        v-model="selectedTimeRange" 
        id="contributionTimeRange" 
        class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2"
      >
        <option v-for="range in timeRanges" :key="range.value" :value="range.value">
          {{ range.label }}
        </option>
      </select>
    </div>

    <!-- Contribution Chart -->
    <div class="bg-white shadow rounded p-4">
      <apexchart
        type="pie"
        height="400"
        :options="contributionChartOptions"
        :series="contributionData"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  selectedBrand: String,
  selectedTimeRange: Number
})

const emit = defineEmits(['update:timeRange'])

const selectedTimeRange = ref(6)
const timeRanges = [
  { value: 6, label: '6 Tháng Gần Nhất' },
  { value: 12, label: '12 Tháng Gần Nhất' },
  { value: 24, label: '24 Tháng Gần Nhất' }
]

// Chart Data
const contributionData = ref([30, 25, 20, 15, 10])

// Contribution Chart Options
const contributionChartOptions = {
  chart: {
    type: 'pie'
  },
  labels: ['Email', 'SMS', 'Social Media', 'Direct Mail', 'Other'],
  colors: ['#2196F3', '#4CAF50', '#FFC107', '#9C27B0', '#FF5722'],
  title: {
    text: 'Đóng Góp Của Các Kênh Marketing',
    align: 'center'
  },
  legend: {
    position: 'bottom'
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 200
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
}

// Watch for time range changes
watch(selectedTimeRange, (newTimeRange) => {
  // Simulate data update based on time range
  contributionData.value = [
    Math.floor(Math.random() * 40) + 10,
    Math.floor(Math.random() * 30) + 10,
    Math.floor(Math.random() * 20) + 5,
    Math.floor(Math.random() * 15) + 5,
    Math.floor(Math.random() * 10) + 2
  ]
  
  emit('update:timeRange', newTimeRange)
})
</script>
