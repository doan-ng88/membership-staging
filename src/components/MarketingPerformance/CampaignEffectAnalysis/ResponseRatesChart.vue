<template>
  <div class="mb-12 bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-2xl font-semibold text-gray-800">Tỷ Lệ Phản Hồi Của Khách Hàng</h3>
      
      <!-- Time Range Selection -->
      <div class="mt-4 flex items-center space-x-4">
        <label for="responseTimeRange" class="text-gray-700 font-medium">
          Chọn Khoảng Thời Gian:
        </label>
        <select
          :value="selectedTimeRange"
          @input="(event) => $emit('update:timeRange', Number((event.target as HTMLSelectElement).value))"
          id="responseTimeRange"
          class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option v-for="range in timeRanges" :key="range.value" :value="range.value">
            {{ range.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Response Rate Statistics -->
    <div class="grid grid-cols-4 gap-6 p-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-blue-600 text-sm font-semibold">Tỷ Lệ Mở Email</h4>
        <p class="text-2xl font-bold text-blue-800 mt-2">
          {{ currentStats.openRate.toFixed(1) }}%
        </p>
        <p class="text-sm text-blue-600 mt-1">
          <span :class="openRateTrend >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ Math.abs(openRateTrend) }}%
            <i :class="openRateTrend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </span>
          so với kỳ trước
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="text-green-600 text-sm font-semibold">Tỷ Lệ Click</h4>
        <p class="text-2xl font-bold text-green-800 mt-2">
          {{ currentStats.clickRate.toFixed(1) }}%
        </p>
        <p class="text-sm text-green-600 mt-1">
          <span :class="clickRateTrend >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ Math.abs(clickRateTrend) }}%
            <i :class="clickRateTrend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </span>
          so với kỳ trước
        </p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h4 class="text-purple-600 text-sm font-semibold">Tỷ Lệ Chuyển Đổi</h4>
        <p class="text-2xl font-bold text-purple-800 mt-2">
          {{ currentStats.conversionRate.toFixed(1) }}%
        </p>
        <p class="text-sm text-purple-600 mt-1">
          <span :class="conversionRateTrend >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ Math.abs(conversionRateTrend) }}%
            <i :class="conversionRateTrend >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </span>
          so với kỳ trước
        </p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h4 class="text-orange-600 text-sm font-semibold">Tỷ Lệ Hủy Đăng Ký</h4>
        <p class="text-2xl font-bold text-orange-800 mt-2">
          {{ currentStats.unsubscribeRate.toFixed(1) }}%
        </p>
        <p class="text-sm text-orange-600 mt-1">
          <span :class="unsubscribeRateTrend <= 0 ? 'text-green-500' : 'text-red-500'">
            {{ Math.abs(unsubscribeRateTrend) }}%
            <i :class="unsubscribeRateTrend <= 0 ? 'fas fa-arrow-down' : 'fas fa-arrow-up'"></i>
          </span>
          so với kỳ trước
        </p>
      </div>
    </div>

    <!-- Response Rates Chart -->
    <div class="p-6">
      <div class="flex justify-end space-x-4 mb-4">
        <button 
          v-for="metric in metrics" 
          :key="metric.value"
          @click="toggleMetric(metric.value)"
          :class="[
            'px-3 py-1 rounded-full text-sm font-medium',
            selectedMetrics.includes(metric.value)
              ? 'bg-blue-100 text-blue-800'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          ]"
        >
          {{ metric.label }}
        </button>
      </div>
      <apexchart
        type="area"
        height="380"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

const props = defineProps<{
  selectedTimeRange: number
}>()

defineEmits<{
  (e: 'update:timeRange', value: number): void
}>()

interface ResponseStats {
  openRate: number
  clickRate: number
  conversionRate: number
  unsubscribeRate: number
}

interface TimeSeriesData {
  date: string
  openRate: number
  clickRate: number
  conversionRate: number
  unsubscribeRate: number
}

const timeRanges = [
  { value: 6, label: '6 Tháng Gần Nhất' },
  { value: 12, label: '12 Tháng Gần Nhất' },
  { value: 24, label: '24 Tháng Gần Nhất' }
]

const metrics = [
  { value: 'openRate', label: 'Tỷ lệ mở email' },
  { value: 'clickRate', label: 'Tỷ lệ click' },
  { value: 'conversionRate', label: 'Tỷ lệ chuyển đổi' },
  { value: 'unsubscribeRate', label: 'Tỷ lệ hủy đăng ký' }
]

const selectedMetrics = ref(['openRate', 'clickRate'])

const toggleMetric = (metric: string) => {
  const index = selectedMetrics.value.indexOf(metric)
  if (index === -1) {
    selectedMetrics.value.push(metric)
  } else {
    selectedMetrics.value.splice(index, 1)
  }
}

// Giả lập dữ liệu theo thời gian
const generateTimeSeriesData = (months: number): TimeSeriesData[] => {
  const data: TimeSeriesData[] = []
  const now = new Date()
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    data.push({
      date: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
      openRate: 20 + Math.random() * 20,
      clickRate: 10 + Math.random() * 15,
      conversionRate: 5 + Math.random() * 10,
      unsubscribeRate: 1 + Math.random() * 2
    })
  }
  return data
}

const timeSeriesData = computed(() => 
  generateTimeSeriesData(props.selectedTimeRange)
)

// Tính toán các chỉ số hiện tại và xu hướng
const currentStats = computed(() => {
  const data = timeSeriesData.value
  const current = data[data.length - 1]
  return {
    openRate: current.openRate,
    clickRate: current.clickRate,
    conversionRate: current.conversionRate,
    unsubscribeRate: current.unsubscribeRate
  }
})

const calculateTrend = (metric: keyof ResponseStats): number => {
  const data = timeSeriesData.value
  const current = data[data.length - 1][metric]
  const previous = data[data.length - 2][metric]
  return ((current - previous) / previous * 100)
}

const openRateTrend = computed(() => calculateTrend('openRate'))
const clickRateTrend = computed(() => calculateTrend('clickRate'))
const conversionRateTrend = computed(() => calculateTrend('conversionRate'))
const unsubscribeRateTrend = computed(() => calculateTrend('unsubscribeRate'))

// Cấu hình biểu đồ
const series = computed(() => {
  const data = timeSeriesData.value
  return selectedMetrics.value.map(metric => ({
    name: metrics.find(m => m.value === metric)?.label || '',
    data: data.map(item => item[metric as keyof TimeSeriesData] as number)
  }))
})

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'area',
    fontFamily: 'Inter, sans-serif',
    toolbar: {
      show: true,
      tools: {
        download: false,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true
      }
    },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800
    }
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  colors: ['#4F46E5', '#10B981', '#8B5CF6', '#F59E0B'],
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.4,
      opacityTo: 0.1,
      stops: [0, 90, 100]
    }
  },
  dataLabels: {
    enabled: false
  },
  grid: {
    borderColor: '#f1f1f1',
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0
    }
  },
  xaxis: {
    categories: timeSeriesData.value.map(item => item.date),
    labels: {
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: {
    labels: {
      formatter: function(val: number) {
        return val.toFixed(1) + '%'
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      }
    }
  },
  legend: {
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '14px',
    markers: {
      width: 8,
      height: 8,
      radius: 12
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function(val: number) {
        return val.toFixed(1) + '%'
      }
    }
  }
}))
</script>
