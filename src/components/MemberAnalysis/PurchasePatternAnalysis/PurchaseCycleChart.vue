<template>
  <div class="mb-12 bg-white p-6 rounded shadow">
    <h3 class="text-2xl font-semibold mb-4">Phân tích chu kỳ mua hàng</h3>
    <div class="mb-4 flex items-center gap-4">
      <div class="flex items-center">
        <label for="websiteSelect" class="text-gray-700 font-medium mr-4">Website:</label>
        <a-select
          v-model:value="selectedWebsiteId"
          style="width: 200px"
          @change="handleWebsiteChange"
        >
          <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
            {{ web.name }}
          </a-select-option>
        </a-select>
      </div>
      <div class="flex items-center">
        <label for="cycleTimeRange" class="text-gray-700 font-medium mr-4">Chọn khoảng thời gian:</label>
        <a-range-picker
          v-model:value="dateRange"
          class="w-1/3"
          :disabled-date="disabledDate"
          @change="handleDateChange"
        />
      </div>
    </div>
    
    <!-- Thống kê tổng quan -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-blue-700">Tổng số đơn hàng</h5>
        <p class="text-2xl font-bold text-blue-900 mt-2">
          {{ totalOrders }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">Số lượng sản phẩm</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ totalQuantity }}
        </p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-purple-700">Trung bình đơn hàng/tháng</h5>
        <p class="text-2xl font-bold text-purple-900 mt-2">
          {{ avgOrdersPerMonth }}
        </p>
      </div>
    </div>

    <apexchart
      type="bar"
      height="350"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { websites } from '@/api/types/website'

export default defineComponent({
  name: 'PurchaseCycleChart',
  
  components: {
    apexchart: VueApexCharts
  },

  props: {
    brand: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const authStore = useAuthStore()
    const loading = ref(false)
    const purchaseData = ref<any[]>([])
    
    const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
      dayjs().startOf('year'),
      dayjs().endOf('year')
    ])

    const selectedWebsiteId = ref(2)

    // Computed properties
    const monthlyStats = computed(() => {
      const stats = new Map()
      purchaseData.value
        .sort((a, b) => a.month - b.month)
        .forEach(item => {
          if (!stats.has(item.month)) {
            stats.set(item.month, {
              orders: 0,
              quantity: 0,
              products: []
            })
          }
          const monthStat = stats.get(item.month)
          monthStat.orders += item.order_count
          monthStat.quantity += item.total_quantity
          if (item.product_name) {
            monthStat.products.push(item.product_name)
          }
        })
      return stats
    })

    const series = computed(() => [{
      name: 'Số đơn hàng',
      data: Array.from(monthlyStats.value.values()).map(stat => stat.orders)
    }])

    const chartOptions = computed(() => ({
      chart: {
        type: 'bar',
        toolbar: {
          show: true
        }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true
      },
      xaxis: {
        categories: Array.from(monthlyStats.value.keys())
          .sort((a, b) => a - b)
          .map(month => `Tháng ${month}`),
        title: {
          text: 'Tháng'
        }
      },
      yaxis: {
        title: {
          text: 'Số lượng đơn hàng'
        }
      },
      colors: ['#4299E1'],
      title: {
        text: 'Phân tích chu kỳ mua hàng theo tháng',
        align: 'center'
      },
      tooltip: {
        fixed: {
          enabled: true,
          position: 'topLeft',
          offsetX: 0,
          offsetY: 0
        },
        y: {
          formatter: function(value: number, { dataPointIndex }: any) {
            const monthData = Array.from(monthlyStats.value.values())[dataPointIndex]
            const products = monthData.products
              .slice(0, 5)
              .join('\n')
            return `${value}: ${products}`
          }
        },
        style: {
          zIndex: 10000
        }
      }
    }))

    // Computed tổng hợp
    const totalOrders = computed(() => 
      Array.from(monthlyStats.value.values()).reduce((sum, stat) => sum + stat.orders, 0)
    )

    const totalQuantity = computed(() => 
      Array.from(monthlyStats.value.values()).reduce((sum, stat) => sum + stat.quantity, 0)
    )

    const avgOrdersPerMonth = computed(() => 
      (totalOrders.value / monthlyStats.value.size).toFixed(1)
    )

    // Methods
    const fetchPurchaseData = async () => {
      try {
        loading.value = true
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/membership/get/purchase-cycle-analysis`,
          {
            websiteId: selectedWebsiteId.value,
            startDate: dateRange.value[0].format('YYYY-MM-DD'),
            endDate: dateRange.value[1].format('YYYY-MM-DD')
          },
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`
            }
          }
        )
        purchaseData.value = response.data
      } catch (error) {
        console.error('Error fetching purchase data:', error)
        message.error('Không thể tải dữ liệu chu kỳ mua hàng')
      } finally {
        loading.value = false
      }
    }

    const handleDateChange = () => {
      fetchPurchaseData()
    }

    const handleWebsiteChange = () => {
      fetchPurchaseData()
    }

    const disabledDate = (current: dayjs.Dayjs) => {
      return current && current > dayjs().endOf('day')
    }

    // Watchers
    watch(() => props.brand, () => {
      fetchPurchaseData()
    })

    watch(() => selectedWebsiteId.value, () => {
      fetchPurchaseData()
    })

    // Lifecycle
    onMounted(() => {
      fetchPurchaseData()
    })

    return {
      dateRange,
      loading,
      series,
      chartOptions,
      totalOrders,
      totalQuantity,
      avgOrdersPerMonth,
      handleDateChange,
      disabledDate,
      selectedWebsiteId,
      websites,
      handleWebsiteChange
    }
  }
})
</script>
