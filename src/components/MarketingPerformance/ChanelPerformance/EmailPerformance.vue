<template>
  <div class="bg-white rounded-lg shadow-sm p-6 w-full">
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-gray-600">Email Marketing Performance</h3>
      <p class="text-sm text-gray-600 mt-1">Analysis of email marketing campaign effectiveness</p>
    </div>

    <!-- Performance Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Open Rate Card -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700">Email Open Rate</h4>
            <p class="text-xs text-gray-500 mt-1">Total emails opened</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {{ ((statistics?.opened / statistics?.delivered) * 100).toFixed(1) }}%
          </span>
        </div>
        
        <div class="relative">
          <apexchart
            type="radialBar"
            height="240"
            :options="openRateChartOptions"
            :series="[((statistics?.opened / statistics?.delivered) * 100).toFixed(1)]"
          />
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ ((statistics?.opened / statistics?.delivered) * 100).toFixed(1) }}%</div>
            <div class="text-xs text-gray-500">Open rate</div>
          </div>
        </div>
      </div>

      <!-- Delivery Rate Card -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700">Delivery Success Rate</h4>
            <p class="text-xs text-gray-500 mt-1">Total emails sent</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {{ ((statistics?.delivered / statistics?.recipients) * 100).toFixed(1) }}%
          </span>
        </div>
        
        <div class="relative">
          <apexchart
            type="radialBar"
            height="240"
            :options="deliveryRateChartOptions"
            :series="[((statistics?.delivered / statistics?.recipients) * 100).toFixed(1)]"
          />
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ ((statistics?.delivered / statistics?.recipients) * 100).toFixed(1) }}%</div>
            <div class="text-xs text-gray-500">Delivery rate</div>
          </div>
        </div>
      </div>

      <!-- Click Rate Card -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700">Click Rate</h4>
            <p class="text-xs text-gray-500 mt-1">Total emails clicked</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {{ ((statistics?.clicked / statistics?.delivered) * 100).toFixed(1) }}%
          </span>
        </div>
        
        <div class="relative">
          <apexchart
            type="radialBar"
            height="240"
            :options="clickRateChartOptions"
            :series="[((statistics?.clicked / statistics?.delivered) * 100).toFixed(1)]"
          />
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ ((statistics?.clicked / statistics?.delivered) * 100).toFixed(1) }}%</div>
            <div class="text-xs text-gray-500">Click rate</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  selectedBrand: String,
  statistics: Object
})

// Chart Options giữ nguyên như cũ
const openRateChartOptions = {
  chart: {
    type: 'radialBar',
    sparkline: {
      enabled: true
    }
  },
  colors: ['#10B981'],
  plotOptions: {
    radialBar: {
      hollow: {
        size: '70%',
      },
      track: {
        background: '#E5E7EB',
      },
      dataLabels: {
        show: false
      }
    }
  },
  stroke: {
    lineCap: 'round'
  }
}

const deliveryRateChartOptions = {
  chart: {
    type: 'radialBar',
    sparkline: {
      enabled: true
    }
  },
  colors: ['#3B82F6'],
  plotOptions: {
    radialBar: {
      hollow: {
        size: '70%',
      },
      track: {
        background: '#E5E7EB',
      },
      dataLabels: {
        show: false
      }
    }
  },
  stroke: {
    lineCap: 'round'
  }
}

// Thêm options cho click rate chart
const clickRateChartOptions = {
  chart: {
    type: 'radialBar',
    sparkline: {
      enabled: true
    }
  },
  colors: ['#8B5CF6'], // Purple color for click rate
  plotOptions: {
    radialBar: {
      hollow: {
        size: '70%',
      },
      track: {
        background: '#E5E7EB',
      },
      dataLabels: {
        show: false
      }
    }
  },
  stroke: {
    lineCap: 'round'
  }
}
</script>
