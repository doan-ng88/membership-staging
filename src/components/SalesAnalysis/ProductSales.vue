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

    <!-- Order Status Stats Cards -->
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

    <!-- Order Status Chart - Top 10 Best-Selling Products -->
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
  colors: ['#38BDF8', '#A78BFA', '#FB923C', '#F87171'],
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      shadeIntensity: 0.5,
      gradientToColors: ['#0EA5E9', '#8B5CF6', '#F97316', '#EF4444'],
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100]
    }
  },
  chart: {
    fontFamily: 'Inter, system-ui, sans-serif',
    dropShadow: {
      enabled: true,
      color: '#111827',
      top: 0,
      left: 0,
      blur: 3,
      opacity: 0.1
    },
    animations: {
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      }
    },
    background: '#F9FAFB',
    foreColor: '#4B5563'
  },
  plotOptions: {
    pie: {
      donut: {
        size: '55%',
        background: 'transparent',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '22px',
            fontWeight: 600,
            color: '#111827',
            offsetY: -10
          },
          value: {
            show: true,
            fontSize: '26px',
            fontWeight: 700,
            color: '#111827',
            offsetY: 10,
            formatter: function(val: number) {
              return val.toLocaleString()
            }
          },
          // total: {
          //   show: true,
          //   label: t('productSales.product.charts.orderStatus.total'),
          //   // color: '#ffffff',
          //   fontSize: '16px',
          //   fontWeight: 600,
          //   formatter: function(w: any) {
          //     return w.globals.seriesTotals.reduce((a: number, b: number) => {
          //       return a + b
          //     }, 0).toLocaleString()
          //   }
          // }
        }
      },
      customScale: 1,
      offsetX: 0,
      offsetY: 0,
      expandOnClick: true
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
      filter: {
        type: 'darken',
        value: 0.15
      }
    }
  },
  stroke: {
    width: 2,
    colors: ['#F8FAFC']
  },
  dataLabels: {
    enabled: true,
    formatter: function(val: string, opts: any) {
      return parseFloat(val) < 8 ? '' : parseFloat(val).toFixed(1) + '%'
    },
    style: {
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 600,
      colors: ['#FFFFFF']
    },
    dropShadow: {
      enabled: true,
      color: '#000',
      top: 1,
      left: 1,
      blur: 2,
      opacity: 0.3
    }
  },
  legend: {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    floating: false,
    fontSize: '14px',
    fontWeight: 500,
    formatter: function(seriesName: string, opts: any) {
      return seriesName + ":  " + opts.w.globals.series[opts.seriesIndex].toLocaleString()
    },
    offsetY: 10,
    markers: {
      width: 12,
      height: 12,
      strokeWidth: 0,
      strokeColor: '#fff',
      radius: 12
    },
    itemMargin: {
      horizontal: 15,
      vertical: 8
    }
  },
  tooltip: {
    enabled: true,
    theme: 'light',
    style: {
      fontSize: '14px',
      fontFamily: 'Inter, sans-serif'
    },
    custom: function({series, seriesIndex, dataPointIndex, w}: {series: number[], seriesIndex: number, dataPointIndex: number, w: any}) {
      const value = series[seriesIndex]
      const label = w.globals.labels[seriesIndex]
      const total = series.reduce((a: number, b: number) => a + b, 0)
      const percentage = ((value / total) * 100).toFixed(1)
      
      // Bảng màu và CSS cho các trạng thái Order Status
      const statusStyles = {
        [t('productSales.product.charts.orderStatus.labels.completed')]: {
          color: '#0EA5E9',
          bgLight: '#EFF6FF',
          border: '#BFDBFE',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>`
        },
        [t('productSales.product.charts.orderStatus.labels.processing')]: {
          color: '#8B5CF6',
          bgLight: '#F3F4F6',
          border: '#E5E7EB',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"/>
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"/>
                </svg>`
        },
        [t('productSales.product.charts.orderStatus.labels.onHold')]: {
          color: '#F97316',
          bgLight: '#FFF7ED',
          border: '#FFEDD5',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2"/>
                </svg>`
        },
        [t('productSales.product.charts.orderStatus.labels.cancelled')]: {
          color: '#EF4444',
          bgLight: '#FEF2F2',
          border: '#FECACA',
          icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                </svg>`
        }
      }
      
      const style = statusStyles[label]
      
      return `
        <div style="min-width: 200px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05); border-radius: 8px; overflow: hidden; font-family: 'Inter', sans-serif;">
          <div style="background: ${style.color}; padding: 10px 15px; color: white; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
            <span style="display: flex; align-items: center; color: white;">${style.icon}</span>
            ${label}
          </div>
          <div style="background: white; padding: 15px; border-bottom: 1px solid ${style.border};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: #6B7280; font-size: 13px;">${t('productSales.product.charts.orderStatus.labels.quantity')}:</span>
              <span style="font-weight: 700; color: ${style.color}; font-size: 15px;">${value.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6B7280; font-size: 13px;">${t('productSales.product.charts.orderStatus.labels.percentage')}:</span>
              <span style="font-weight: 600; color: #111827; font-size: 13px;">${percentage}%</span>
            </div>
          </div>
          <div style="background: ${style.bgLight}; padding: 8px 15px; font-size: 12px; color: #374151; display: flex; justify-content: space-between;">
            <span>${t('productSales.product.charts.orderStatus.labels.total')}:</span>
            <span style="font-weight: 600;">${total.toLocaleString()}</span>
          </div>
        </div>
      `
    }
  },
  responsive: [{
    breakpoint: 640,
    options: {
      chart: {
        height: 350
      },
  legend: {
        position: 'bottom',
        fontSize: '12px'
      }
  }
  }]
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
    custom: ({ series, seriesIndex, dataPointIndex }: { series: number[], seriesIndex: number, dataPointIndex: number }) => {
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