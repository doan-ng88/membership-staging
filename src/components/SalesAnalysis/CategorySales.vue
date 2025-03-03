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
    <div class="grid grid-cols-1 gap-6 mb-6">
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
          :options="categoryOrdersChartOptions"
          :series="categoryOrdersSeries"
        />
      </div>
    </div>

    <!-- Summary Cards
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
    </div> -->
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
    formatter: (value) => `${(value/1000000).toFixed(1)}M`,
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
    categories: sortedRevenueStats.value.map(item => item.category_name),
    labels: {
      rotate: -45,
      style: {
        fontSize: '12px',
        fontWeight: 500
      },
      formatter: (value) => value.length > 15 ? `${value.substring(0, 12)}...` : value
    },
    title: {
      text: t('productSales.category.charts.revenue.xaxis'),
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
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
      text: t('productSales.category.charts.revenue.yaxis'),
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    labels: {
      formatter: (value) => `${(value/1000000).toFixed(0)}M`,
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
    shared: false,
    intersect: true,
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const category = sortedRevenueStats.value[dataPointIndex];
      
      if (!category) return '<div class="p-2">Loading...</div>';
      
      return `
        <div class="bg-white shadow-lg rounded-lg p-4 border border-gray-100" style="min-width: 250px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)">
          <div class="flex items-center mb-3 pb-2 border-b border-gray-100">
            <div class="w-3 h-3 rounded-full mr-2" style="background: ${revenueChartOptions.value.colors[dataPointIndex % 10]}"></div>
            <span class="font-semibold text-sm">${category.category_name}</span>
          </div>
          
          <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.category.charts.revenue.revenue')}:</span>
              <span class="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(category.total_revenue)}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.category.charts.revenue.orders')}:</span>
              <span class="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">${category.total_orders.toLocaleString()}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.category.charts.revenue.avgOrderValue')}:</span>
              <span class="font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">${new Intl.NumberFormat('vi-VN', {
                style: 'currency', 
                currency: 'VND'
              }).format(category.total_revenue / category.total_orders)}</span>
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

const sortedOrderCategoryStats = computed(() => 
  [...categoryStats.value]
    .sort((a, b) => b.total_orders - a.total_orders)
    .slice(0, 10)  // Only show top 10 categories
)

const categoryOrdersSeries = computed(() => [{
  name: t('productSales.category.charts.orders.series.orders'),
  data: sortedOrderCategoryStats.value.map(category => ({
    x: category.category_name,
    y: category.total_orders,
    revenue: category.total_revenue,
    completed: category.completed_orders || 0,
    processing: category.processing_orders || 0,
    onHold: category.on_hold_orders || 0,
    cancelled: category.cancelled_orders || 0
  }))
}])

const categoryOrdersChartOptions = computed(() => ({
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
    formatter: (val) => val.toLocaleString(),
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
      text: t('productSales.category.charts.orders.xaxis'),
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    categories: sortedOrderCategoryStats.value.map(cat => cat.category_name),
    labels: {
      rotate: -45,
      style: {
        fontSize: '12px',
        fontWeight: 500
      },
      formatter: (value) => value.length > 15 ? `${value.substring(0, 12)}...` : value
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
      text: t('productSales.category.charts.orders.yaxis'),
      style: {
        fontSize: '14px',
        fontWeight: 600
      }
    },
    labels: {
      formatter: (val) => val.toLocaleString(),
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
    shared: false,
    intersect: true,
    custom: ({ series, seriesIndex, dataPointIndex, w }) => {
      const category = sortedOrderCategoryStats.value[dataPointIndex];
      
      if (!category) return '<div class="p-2">Loading...</div>';
      
      const total = category.total_orders;
      const completed = category.completed_orders || 0;
      const processing = category.processing_orders || 0;
      const onHold = category.on_hold_orders || 0;
      const cancelled = category.cancelled_orders || 0;
      
      const completedPercent = Math.round((completed / total) * 100);
      const processingPercent = Math.round((processing / total) * 100);
      const onHoldPercent = Math.round((onHold / total) * 100);
      const cancelledPercent = Math.round((cancelled / total) * 100);
      
      const avgOrderValue = category.total_revenue / total;
      
      return `
        <div class="bg-white shadow-lg rounded-lg p-4 border border-gray-100" style="min-width: 250px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1)">
          <div class="flex items-center mb-3 pb-2 border-b border-gray-100">
            <div class="w-3 h-3 rounded-full mr-2" style="background: ${categoryOrdersChartOptions.value.colors[dataPointIndex % 10]}"></div>
            <span class="font-semibold text-sm">${category.category_name}</span>
          </div>
          
          <div class="space-y-3 text-xs">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.category.charts.orders.series.orders')}:</span>
              <span class="font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">${total.toLocaleString()}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.category.charts.orders.series.revenue')}:</span>
              <span class="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">${new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(category.total_revenue)}</span>
            </div>
            
            <div class="flex justify-between items-center">
              <span class="text-gray-600">${t('productSales.category.charts.orders.series.avgOrderValue')}:</span>
              <span class="font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">${new Intl.NumberFormat('vi-VN', {
                style: 'currency', 
                currency: 'VND'
              }).format(avgOrderValue)}</span>
            </div>
            
            <div class="mt-3 pt-2 border-t border-gray-100">
              <div class="text-xs font-medium mb-2">${t('productSales.category.charts.orders.series.orderStatus')}:</div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-green-500 h-2.5 rounded-full" style="width: ${completedPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-green-700">${t('productSales.category.charts.orders.status.completed')}: ${completed}</span>
                <span>${completedPercent}%</span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-blue-500 h-2.5 rounded-full" style="width: ${processingPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-blue-700">${t('productSales.category.charts.orders.status.processing')}: ${processing}</span>
                <span>${processingPercent}%</span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-yellow-500 h-2.5 rounded-full" style="width: ${onHoldPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs mb-2">
                <span class="text-yellow-700">${t('productSales.category.charts.orders.status.onHold')}: ${onHold}</span>
                <span>${onHoldPercent}%</span>
              </div>
              
              <div class="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                <div class="bg-red-500 h-2.5 rounded-full" style="width: ${cancelledPercent}%"></div>
              </div>
              <div class="flex justify-between text-xs">
                <span class="text-red-700">${t('productSales.category.charts.orders.status.cancelled')}: ${cancelled}</span>
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

const handleBrandChange = (value: string) => {
  selectedBrandValue.value = value;
  emit('update:selectedBrand', value);
}

// Lifecycle
onMounted(() => {
  fetchCategoryStats()
})
</script>
