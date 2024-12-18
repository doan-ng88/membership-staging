<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-gray-800">Sales Trends Analysis</h3>
      <p class="text-sm text-gray-600 mt-1">Analyze sales trends over different time periods</p>
    </div>

    <!-- Time Range Selection -->
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700 mb-2">
        Select Time Range
      </label>
      <select 
        :value="selectedTimeRange"
        @change="$emit('update:selectedTimeRange', $event.target.value)"
        class="w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
      >
        <option v-for="range in timeRanges" :key="range.value" :value="range.value">
          {{ range.label }}
        </option>
      </select>
    </div>

    <!-- Trends Chart -->
    <div class="mb-6">
      <apexchart
        type="line"
        height="350"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>

    <!-- Trends Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (USD)</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="trend in trendsData" :key="trend.month">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ trend.month }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ trend.quantity }}</td>
            <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatCurrency(trend.revenue) }}</td> -->
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
// import { formatCurrency } from '@/utils/formatters'

const props = defineProps({
  selectedBrand: String,
  selectedTimeRange: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['update:selectedTimeRange'])

const timeRanges = [
  { value: 6, label: 'Last 6 Months' },
  { value: 12, label: 'Last 12 Months' },
  { value: 24, label: 'Last 24 Months' }
]

const trendsData = ref([])

// ApexCharts Options
const chartOptions = {
  chart: {
    type: 'line',
    toolbar: {
      show: false
    }
  },
  stroke: {
    curve: 'smooth',
    width: 3
  },
  markers: {
    size: 4,
    strokeWidth: 2,
    hover: {
      size: 6
    }
  },
  xaxis: {
    type: 'category',
    categories: [],
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
        text: 'Quantity'
      }
    },
    {
      opposite: true,
      title: {
        text: 'Revenue (USD)'
      }
    }
  ],
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: function (val, { seriesIndex }) {
        if (seriesIndex === 1) {
          return `$ ${val.toLocaleString()}`
        }
        return val
      }
    }
  },
  grid: {
    borderColor: '#f1f1f1'
  },
  colors: ['#8B5CF6', '#EC4899']
}

const chartSeries = computed(() => [
  {
    name: 'Quantity',
    data: trendsData.value.map(item => item.quantity)
  },
  {
    name: 'Revenue',
    data: trendsData.value.map(item => item.revenue)
  }
])

// Update chart data when time range changes
watch(() => props.selectedTimeRange, async (newTimeRange) => {
  const response = await fetchTrendsData(newTimeRange)
  trendsData.value = response
  chartOptions.xaxis.categories = response.map(item => item.month)
})

// Mock API call
async function fetchTrendsData(timeRange) {
  // Replace with actual API call
  const sampleData = {
    6: [
      { month: 'Jan', quantity: 100, revenue: 100000 },
      { month: 'Feb', quantity: 150, revenue: 150000 },
      // ... more data
    ],
    // ... other time ranges
  }
  return sampleData[timeRange] || []
}
</script>
