<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="mb-6">
      <h3 class="text-lg font-medium text-gray-900">Phân tích doanh số theo sản phẩm</h3>
      <p class="text-sm text-gray-500 mt-1">Theo dõi hiệu suất của từng sản phẩm</p>
    </div>

    <!-- Filter Section -->
    <div class="mb-6 flex flex-wrap gap-4">
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Chọn sản phẩm
        </label>
        <a-select
          v-model:value="selectedProduct"
          show-search
          :options="productOptions"
          placeholder="Chọn sản phẩm"
          class="w-full"
          :filter-option="filterOption"
        />
      </div>
      
      <div class="flex-1 min-w-[200px]">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Thời gian
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
        <h5 class="text-sm font-medium text-blue-700">Tổng đơn hàng</h5>
        <p class="text-2xl font-bold text-blue-900 mt-2">
          {{ selectedProductStats?.total_orders || 0 }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">Đơn hoàn thành</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ selectedProductStats?.completed_orders || 0 }}
        </p>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-yellow-700">Đơn đang xử lý</h5>
        <p class="text-2xl font-bold text-yellow-900 mt-2">
          {{ selectedProductStats?.processing_orders || 0 }}
        </p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-purple-700">Tổng số lượng</h5>
        <p class="text-2xl font-bold text-purple-900 mt-2">
          {{ selectedProductStats?.total_quantity || 0 }}
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">Trạng thái đơn hàng</h4>
        <VueApexCharts
          type="pie"
          height="350"
          :options="orderStatusChartOptions"
          :series="orderStatusSeries"
        />
      </div>
      
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">Top 10 sản phẩm bán chạy</h4>
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
import dayjs from 'dayjs'

// Data & State
const loading = ref(false)
const productStats = ref<any[]>([])
const selectedProduct = ref<string>()
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().startOf('year'),
  dayjs().endOf('year')
])

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

const orderStatusChartOptions = {
  labels: ['Hoàn thành', 'Đang xử lý', 'Chờ xử lý', 'Đã hủy'],
  colors: ['#52c41a', '#1890ff', '#faad14', '#ff4d4f'],
  legend: {
    position: 'bottom'
  }
}

const topProductsSeries = computed(() => [{
  name: 'Số lượng bán',
  data: productStats.value
    .sort((a, b) => b.total_quantity - a.total_quantity)
    .slice(0, 10)
    .map(p => p.total_quantity)
}])

const topProductsChartOptions = computed(() => ({
  chart: {
    type: 'bar'
  },
  plotOptions: {
    bar: {
      horizontal: true
    }
  },
  xaxis: {
    categories: productStats.value
      .sort((a, b) => b.total_quantity - a.total_quantity)
      .slice(0, 10)
      .map(p => p.product_name)
  },
  colors: ['#1890ff']
}))

// Methods
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf('day')
}

const fetchProductStats = async () => {
  const authStore = useAuthStore()
  try {
    loading.value = true
    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-product-stats`,
      {
        websiteId: 2,
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
    message.error('Không thể tải dữ liệu thống kê sản phẩm')
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