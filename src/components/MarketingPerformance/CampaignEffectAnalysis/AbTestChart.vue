<template>
  <div class="mb-12 bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-2xl font-semibold text-gray-800">Kết Quả A/B Test</h3>
      
      <!-- Test Version Selection -->
      <div class="mt-4 flex items-center space-x-6">
        <label class="text-gray-700 font-medium">Chọn Phiên Bản Test:</label>
        <div class="flex space-x-4">
          <label v-for="variant in variants" :key="variant.value" 
                 class="inline-flex items-center cursor-pointer">
            <input
              type="radio"
              :value="variant.value"
              :checked="selectedVariant === variant.value"
              @change="$emit('update:variant', variant.value)"
              class="form-radio h-5 w-5 text-blue-600 focus:ring-blue-500"
            >
            <span class="ml-2 text-gray-700">{{ variant.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- A/B Test Statistics -->
    <div class="grid grid-cols-4 gap-6 p-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-blue-600 text-sm font-semibold">Số Lượng Người Dùng</h4>
        <p class="text-2xl font-bold text-blue-800 mt-2">
          {{ formatNumber(currentTestData.users) }}
        </p>
        <p class="text-sm text-blue-600 mt-1">Tổng số người tham gia test</p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="text-green-600 text-sm font-semibold">Tỷ Lệ Chuyển Đổi</h4>
        <p class="text-2xl font-bold text-green-800 mt-2">
          {{ currentTestData.conversionRate.toFixed(1) }}%
        </p>
        <p class="text-sm text-green-600 mt-1">
          <span :class="Number(conversionTrend) >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ Math.abs(Number(conversionTrend)) }}%
            <i :class="Number(conversionTrend) >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </span>
          so với phiên bản khác
        </p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h4 class="text-purple-600 text-sm font-semibold">Giá Trị Trung Bình</h4>
        <p class="text-2xl font-bold text-purple-800 mt-2">
          {{ formatCurrency(currentTestData.averageValue) }}
        </p>
        <p class="text-sm text-purple-600 mt-1">Giá trị trung bình/conversion</p>
      </div>

      <div class="bg-orange-50 rounded-lg p-4">
        <h4 class="text-orange-600 text-sm font-semibold">Độ Tin Cậy</h4>
        <p class="text-2xl font-bold text-orange-800 mt-2">
          {{ currentTestData.confidence }}%
        </p>
        <p class="text-sm text-orange-600 mt-1">Độ tin cậy thống kê</p>
      </div>
    </div>

    <!-- A/B Test Chart -->
    <div class="p-6">
      <apexchart
        type="bar"
        height="380"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

const props = defineProps<{
  selectedVariant: string
}>()

defineEmits<{
  (e: 'update:variant', value: string): void
}>()

interface TestData {
  users: number
  conversions: number
  conversionRate: number
  averageValue: number
  confidence: number
}

const variants = [
  { value: 'variantA', label: 'Phiên Bản A' },
  { value: 'variantB', label: 'Phiên Bản B' }
]

const testData: Record<string, TestData> = {
  'variantA': {
    users: 10000,
    conversions: 1500,
    conversionRate: 15.0,
    averageValue: 250000,
    confidence: 95
  },
  'variantB': {
    users: 10000,
    conversions: 2000,
    conversionRate: 20.0,
    averageValue: 280000,
    confidence: 97
  }
}

const currentTestData = computed(() => 
  testData[props.selectedVariant] || testData['variantA']
)

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value)
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const conversionTrend = computed(() => {
  const currentRate = testData[props.selectedVariant].conversionRate
  const otherVariant = props.selectedVariant === 'variantA' ? 'variantB' : 'variantA'
  const otherRate = testData[otherVariant].conversionRate
  return ((currentRate - otherRate) / otherRate * 100).toFixed(1)
})

const series = computed(() => ([
  {
    name: 'Số lượng chuyển đổi',
    data: [testData.variantA.conversions, testData.variantB.conversions]
  },
  {
    name: 'Giá trị trung bình',
    data: [testData.variantA.averageValue, testData.variantB.averageValue]
  }
]))

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Inter, sans-serif',
    toolbar: {
      show: false
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 8,
      dataLabels: {
        position: 'top'
      }
    }
  },
  colors: ['#4F46E5', '#10B981'],
  dataLabels: {
    enabled: true,
    formatter: function(val: number, opts) {
      const seriesName = opts.w.config.series[opts.seriesIndex].name
      return seriesName === 'Số lượng chuyển đổi' 
        ? formatNumber(val)
        : formatCurrency(val)
    },
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ['#304758']
    }
  },
  xaxis: {
    categories: ['Phiên Bản A', 'Phiên Bản B'],
    position: 'bottom',
    labels: {
      style: {
        fontSize: '14px'
      }
    },
    axisBorder: {
      show: false
    },
    axisTicks: {
      show: false
    }
  },
  yaxis: [
    {
      title: {
        text: 'Số lượng chuyển đổi',
        style: {
          fontSize: '14px'
        }
      },
      labels: {
        formatter: function(val: number) {
          return formatNumber(val)
        }
      }
    },
    {
      opposite: true,
      title: {
        text: 'Giá trị trung bình',
        style: {
          fontSize: '14px'
        }
      },
      labels: {
        formatter: function(val: number) {
          return formatCurrency(val)
        }
      }
    }
  ],
  legend: {
    position: 'top',
    horizontalAlign: 'center',
    fontSize: '14px'
  },
  grid: {
    borderColor: '#f1f1f1'
  }
}))
</script>
