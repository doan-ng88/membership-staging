<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900">{{ t('productSales.product.title') }}</h3>
      <p class="text-sm text-gray-500 mt-1">{{ t('productSales.product.subtitle') }}</p>
    </div>

    <!-- Filter Section -->
    <div class="mb-6 flex flex-wrap gap-4">
      <!-- Brand Selection -->
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('productSales.product.filters.brand') }}
        </label>
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

      <!-- Existing Product Filter -->
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('productSales.product.filters.product') }}
        </label>
        <a-select
          v-model:value="selectedProduct"
          show-search
          :options="productOptions"
          :placeholder="t('productSales.product.filters.placeholder')"
          class="w-full"
          :filter-option="filterOption"
        />
      </div>
      
      <!-- Existing Date Range Filter -->
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          {{ t('productSales.product.filters.dateRange') }}
        </label>
        <a-range-picker
          v-model:value="dateRange"
          class="w-full"
          :disabled-date="disabledDate"
        />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-blue-700">{{ t('productSales.product.metrics.totalOrders.title') }}</h5>
        <p class="text-2xl font-bold text-blue-900 mt-2">
          {{ selectedProductStats?.total_orders || 0 }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">{{ t('productSales.product.metrics.completedOrders.title') }}</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ selectedProductStats?.completed_orders || 0 }}
        </p>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-yellow-700">{{ t('productSales.product.metrics.processingOrders.title') }}</h5>
        <p class="text-2xl font-bold text-yellow-900 mt-2">
          {{ selectedProductStats?.processing_orders || 0 }}
        </p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-purple-700">{{ t('productSales.product.metrics.totalQuantity.title') }}</h5>
        <p class="text-2xl font-bold text-purple-900 mt-2">
          {{ selectedProductStats?.total_quantity || 0 }}
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 gap-6 mb-6">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('productSales.product.charts.orderStatus.title') }}</h4>
        <VueApexCharts
          type="pie"
          height="350"
          :options="orderStatusChartOptions"
          :series="orderStatusSeries"
        />
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('productSales.product.charts.topProducts.title') }}</h4>
        <VueApexCharts
          type="bar"
          height="350"
          :options="topProductsChartOptions"
          :series="topProductsSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { useI18nGlobal } from '@/i18n'
import dayjs from 'dayjs'

const { t } = useI18nGlobal()

// Data & State
const loading = ref(false)
const productStats = ref<any[]>([])
const selectedProduct = ref<string>()
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().startOf('month'),
  dayjs().endOf('day')
])
const websites = ref([])
const selectedWebsite = ref<number>(2)

// Computed
const productOptions = computed(() => 
  productStats.value.map(product => ({
    value: product.product_id,
    label: product.product_name
  }))
)

const selectedProductStats = computed(() => 
  productStats.value.find(p => p.product_id === selectedProduct.value)
)

const orderStatusSeries = computed(() => {
  if (!selectedProductStats.value) return []
  return [
    selectedProductStats.value.completed_orders,
    selectedProductStats.value.processing_orders,
    selectedProductStats.value.on_hold_orders,
    selectedProductStats.value.cancelled_orders
  ]
})

const orderStatusChartOptions = computed(() => ({
  labels: [
    t('productSales.product.charts.orderStatus.labels.completed'),
    t('productSales.product.charts.orderStatus.labels.processing'),
    t('productSales.product.charts.orderStatus.labels.onHold'),
    t('productSales.product.charts.orderStatus.labels.cancelled')
  ],
  colors: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'],
  legend: {
    position: 'bottom'
  }
}))

const topProductsSeries = computed(() => [{
  name: t('productSales.product.charts.topProducts.series.quantity'),
  data: productStats.value
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 10)
    .map(p => ({
      x: p.product_name,
      y: p.total_quantity,
      orders: p.total_orders,
      completed: p.completed_orders || Math.floor(p.total_orders * 0.7),
      processing: p.processing_orders || Math.floor(p.total_orders * 0.2),
      onHold: p.on_hold_orders || Math.floor(p.total_orders * 0.05),
      cancelled: p.cancelled_orders || Math.floor(p.total_orders * 0.05),
      avg: (p.total_quantity / p.total_orders).toFixed(1)
    }))
}])

const topProductsChartOptions = computed(() => ({
  chart: {
    type: 'bar',
    height: 400,
    toolbar: {
      show: true,
      tools: {
        download: true,
        zoom: false,
        pan: false
      }
    },
    animations: {
      enabled: true,
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 6,
      columnWidth: '65%',
      distributed: true,
      dataLabels: {
        position: 'top',
      }
    }
  },
  colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1', '#14B8A6', '#0EA5E9', '#F43F5E', '#84CC16'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.2,
      gradientToColors: undefined,
      inverseColors: false,
      opacityFrom: 0.85,
      opacityTo: 1,
    }
  },
  dataLabels: {
    enabled: true,
    formatter: (val: number) => val.toLocaleString(),
    offsetY: -20,
    style: {
      fontSize: '12px',
      fontWeight: 'bold',
      colors: ['#1F2937']
    }
  },
  states: {
    hover: {
      filter: {
        type: 'darken',
        value: 0.15
      }
    },
    active: {
      allowMultipleDataPointsSelection: false,
      filter: {
        type: 'darken',
        value: 0.35
      }
    }
  },
  xaxis: {
    title: {
      text: t('productSales.product.charts.topProducts.xaxis'),
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    categories: productStats.value
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 10)
      .map(p => p.product_name),
    labels: {
      rotate: -45,
      style: {
        fontSize: '12px',
        fontWeight: 500
      },
      formatter: (value: string) => value.length > 15 ? `${value.substring(0, 12)}...` : value
    },
    axisBorder: {
      show: true,
      color: '#E5E7EB'
    },
    axisTicks: {
      show: true,
      color: '#E5E7EB'
    }
  },
  yaxis: {
    title: {
      text: t('productSales.product.charts.topProducts.yaxis'),
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    labels: {
      formatter: (val: number) => val.toLocaleString(),
      style: {
        fontSize: '12px'
      }
    }
  },
  grid: {
    borderColor: '#F3F4F6',
    strokeDashArray: 4,
    padding: {
      top: 40
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    custom: ({ series, seriesIndex, dataPointIndex }) => {
      const product = productStats.value
        .sort((a, b) => b.total_quantity - a.total_quantity)
        [dataPointIndex]
      
      if (!product) return '<div class="p-2">Loading...</div>';
      
      const completedPercent = Math.round((product.completed_orders || 0) / product.total_orders * 100);
      const processingPercent = Math.round((product.processing_orders || 0) / product.total_orders * 100);
      const onHoldPercent = Math.round((product.on_hold_orders || 0) / product.total_orders * 100);
      const cancelledPercent = Math.round((product.cancelled_orders || 0) / product.total_orders * 100);
      
      return `
        <div class="bg-white shadow-lg rounded-lg p-4 border border-gray-100" style="min-width: 250px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)">
          <div class="flex items-center mb-3 pb-2 border-b border-gray-100">
            <div class="w-3 h-3 rounded-full mr-2" style="background: ${topProductsChartOptions.value.colors[dataPointIndex]}"></div>
            <span class="font-semibold text-sm">${product.product_name}</span>
          </div>
          
          <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.product.charts.topProducts.series.quantity')}:</span>
              <span class="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">${product.total_quantity.toLocaleString()}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.product.charts.topProducts.series.orders')}:</span>
              <span class="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">${product.total_orders.toLocaleString()}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.product.charts.topProducts.series.avgQuantity')}:</span>
              <span class="font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">${(product.total_quantity / product.total_orders).toFixed(1)}</span>
            </div>
            
            <div class="mt-3 pt-2 border-t border-gray-100">
                <div class="text-xs font-medium mb-2">${t('productSales.product.charts.topProducts.series.orderStatus')}:</div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-green-500 h-2.5 rounded-full" style="width: ${completedPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-green-700">${t('productSales.product.charts.topProducts.series.completed')}: ${product.completed_orders || 0}</span>
                <span>${completedPercent}%</span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${processingPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-blue-700">${t('productSales.product.charts.topProducts.series.processing')}: ${product.processing_orders || 0}</span>
                <span>${processingPercent}%</span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-yellow-500 h-2.5 rounded-full" style="width: ${onHoldPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-yellow-700">${t('productSales.product.charts.topProducts.series.onHold')}: ${product.on_hold_orders || 0}</span>
                <span>${onHoldPercent}%</span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-red-500 h-2.5 rounded-full" style="width: ${cancelledPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-red-700">${t('productSales.product.charts.topProducts.series.cancelled')}: ${product.cancelled_orders || 0}</span>
                <span>${cancelledPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      `
    }
  },
  responsive: [{
    breakpoint: 640,
    options: {
      chart: {
        height: 500
      },
      plotOptions: {
        bar: {
          columnWidth: '85%'
        }
      },
      dataLabels: {
        style: {
          fontSize: '10px'
        }
      },
      xaxis: {
        labels: {
          rotate: -90,
          style: {
            fontSize: '10px'
          }
        }
      }
    }
  }]
}))

// Methods
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf('day')
}

interface Brand {
  value: string;
  key: string;
  label: string;
}

const props = defineProps<{
  selectedBrand: string
  brands: Brand[]
}>()

const emit = defineEmits<{
  (e: 'update:selectedBrand', value: string): void
}>()

// Định nghĩa brands mặc định
const defaultBrands: Brand[] = [
  { value: '1', key: 'sky007', label: 'Sky007' },
  { value: '2', key: 'bbia', label: 'BBIA' },
  { value: '3', key: 'hince', label: 'Hince' },
  { value: '4', key: 'mixsoon', label: 'Mixsoon' },
]

const selectedBrandValue = ref(props.selectedBrand || '1')

const handleBrandChange = (value: string) => {
  selectedBrandValue.value = value;
  emit('update:selectedBrand', value);
}

// Thêm watch
watch(selectedBrandValue, () => {
  fetchProductStats()
})

const fetchWebsites = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/websites`,
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error('Failed to fetch websites')
    }
    const data = await response.json()
    websites.value = data.websites
    // Auto select first website
    if (data.websites.length > 0) {
      selectedWebsite.value = data.websites[0].id
    }
  } catch (error) {
    console.error('Error fetching websites:', error)
    message.error('Không thể tải danh sách website')
  }
}

const authStore = useAuthStore()

const fetchProductStats = async () => {
  if (!selectedWebsite.value) return
  
  try {
    loading.value = true
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-product-stats`,
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
    productStats.value = response.data
    if (!selectedProduct.value && productStats.value.length > 0) {
      selectedProduct.value = productStats.value[0].product_id
    }
  } catch (error: any) {
    console.error('Error fetching product stats:', error)
    message.error(t('productSales.product.errors.loadFailed'))
  } finally {
    loading.value = false
  }
}

// Watchers
watch(dateRange, () => {
  fetchProductStats()
}, { deep: true })

// Lifecycle
onMounted(() => {
  fetchProductStats()
})
</script>