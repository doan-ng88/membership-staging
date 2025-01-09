<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900">{{ t('productSales.category.title') }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ t('productSales.category.subtitle') }}</p>
      
      <!-- Filter Section -->
      <div class="mt-4 flex items-center justify-between">
        <!-- Brand Selection -->
        <div class="flex items-center">
          <label class="text-sm font-medium text-gray-700 mr-2">{{ t('productSales.category.filters.brand') }}</label>
          <a-select 
            v-model:value="selectedBrandValue"
            @change="handleBrandChange" 
            class="w-48"
            placeholder="Select brand"
          >
            <a-select-option v-for="brand in defaultBrands" 
                             :key="brand.value" 
                             :value="brand.value"
            >
              {{ t(`productSales.filters.brand.options.${brand.key}`) }}
            </a-select-option>
          </a-select>
        </div>

        <!-- Date Range -->
        <div class="flex items-center">
          <label class="text-sm font-medium text-gray-700 mr-2">{{ t('productSales.category.filters.dateRange') }}</label>
          <a-range-picker
            v-model:value="dateRange"
            format="YYYY-MM-DD"
            :disabled-date="disabledDate"
            @change="handleDateChange"
            class="w-72"
          />
        </div>
      </div>
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Revenue Chart -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('productSales.category.charts.revenue.title') }}</h4>
        <VueApexCharts
          type="bar"
          height="400"
          :options="revenueChartOptions"
          :series="revenueSeries"
        />
      </div>

      <!-- Order Status Chart -->
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('productSales.category.charts.orders.title') }}</h4>
        <VueApexCharts
          type="bar"
          height="400"
          :options="orderStatusOptions"
          :series="orderStatusSeries"
        />
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-blue-700">{{ t('productSales.category.metrics.revenue.title') }}</h5>
        <p class="text-2xl font-bold text-blue-900 mt-2">
          {{ formatCurrency(totalRevenue) }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">{{ t('productSales.category.metrics.orders.title') }}</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ totalOrders }}
        </p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-purple-700">{{ t('productSales.category.metrics.completion.title') }}</h5>
        <p class="text-2xl font-bold text-purple-900 mt-2">
          {{ completionRate }}%
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import { useI18nGlobal } from '@/i18n'

interface Brand {
  value: string;
  key: string;
  label: string;
}
// Props và Emits
const props = defineProps<{
  selectedBrand: string
  brands: Brand[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedBrand', value: string): void
}>()

const { t } = useI18nGlobal()

// Định nghĩa brands mặc định với đầy đủ key
const defaultBrands: Brand[] = [
  { value: '1', key: 'sky007', label: 'Sky007' },
  { value: '2', key: 'bbia', label: 'BBIA' },
  { value: '3', key: 'hince', label: 'Hince' },
  { value: '4', key: 'mixsoon', label: 'Mixsoon' },
]

// Data & State
const loading = ref(false)
const categoryStats = ref<any[]>([])
const selectedBrandValue = ref(props.selectedBrand || '1')
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().startOf('month'),
  dayjs().endOf('day')
])

// Computed Properties
const totalRevenue = computed(() => 
  categoryStats.value.reduce((sum, stat) => sum + stat.total_revenue, 0)
)

const totalOrders = computed(() => 
  categoryStats.value.reduce((sum, stat) => sum + stat.total_orders, 0)
)

const completionRate = computed(() => {
  const completed = categoryStats.value.reduce((sum, stat) => sum + stat.completed_orders, 0)
  return totalOrders.value ? Math.round((completed / totalOrders.value) * 100) : 0
})

// Methods
const disabledDate = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf('day')
}

const handleDateChange = () => {
  fetchCategoryStats()
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const fetchCategoryStats = async () => {
  const authStore = useAuthStore()
  try {
    loading.value = true
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-category-stats`,
      {
        websiteId: parseInt(selectedBrandValue.value),
        startDate: dateRange.value[0].format('YYYY-MM-DD'),
        endDate: dateRange.value[1].format('YYYY-MM-DD')
      },
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    categoryStats.value = response.data.stats
  } catch (error: any) {
    console.error('Error fetching category stats:', error)
    message.error(t('productSales.category.errors.loadFailed'))
  } finally {
    loading.value = false
  }
}

// Watchers
watch(selectedBrandValue, () => {
  fetchCategoryStats()
})

watch(dateRange, () => {
  fetchCategoryStats()
}, { deep: true })

// Computed properties - chỉ tính toán khi categoryStats thay đổi
const sortedRevenueStats = computed(() => 
  [...categoryStats.value].sort((a, b) => b.total_revenue - a.total_revenue)
)

const sortedOrderStats = computed(() => 
  [...categoryStats.value].sort((a, b) => b.total_orders - a.total_orders)
)

const revenueSeries = computed(() => [{
  name: 'Revenue',
  data: sortedRevenueStats.value.map(item => item.total_revenue)
}])

const revenueChartOptions = computed(() => ({
  chart: {
    type: 'bar'
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (value: number) => `${(value/1000000).toFixed(1)}M`
  },
  xaxis: {
    categories: sortedRevenueStats.value.map(item => item.category_name),
    labels: {
      rotate: -45,
      style: {
        fontSize: '12px'
      }
    }
  },
  yaxis: {
    title: {
      text: t('productSales.category.charts.revenue.yaxis')
    },
    labels: {
      formatter: (value: number) => `${(value/1000000).toFixed(0)}M`
    }
  },
  colors: ['#1890ff']
}))

const orderStatusSeries = computed(() => {
  return [
    {
      name: t('productSales.category.charts.orders.status.completed'),
      data: sortedOrderStats.value.map(stat => stat.completed_orders)
    },
    {
      name: t('productSales.category.charts.orders.status.processing'),
      data: sortedOrderStats.value.map(stat => stat.processing_orders)
    },
    {
      name: t('productSales.category.charts.orders.status.onHold'),
      data: sortedOrderStats.value.map(stat => stat.on_hold_orders)
    },
    {
      name: t('productSales.category.charts.orders.status.cancelled'),
      data: sortedOrderStats.value.map(stat => stat.cancelled_orders)
    }
  ]
})

const orderStatusOptions = computed(() => ({
  chart: {
    type: 'bar',
    stacked: true
  },
  plotOptions: {
    bar: {
      horizontal: true
    }
  },
  colors: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'],
  xaxis: {
    categories: sortedOrderStats.value.map(stat => stat.category_name)
  },
  yaxis: {
    title: {
      text: t('productSales.category.charts.orders.yaxis')
    }
  },
  legend: {
    position: 'bottom'
  },
  dataLabels: {
    enabled: true
  }
}))

const handleBrandChange = (value: string) => {
  selectedBrandValue.value = value;
  emit('update:selectedBrand', value);
}

// Lifecycle
onMounted(() => {
  fetchCategoryStats()
})
</script>
