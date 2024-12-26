<template>
  <div class="mb-12 bg-white p-6 rounded shadow">
    <h3 class="text-2xl font-semibold mb-4">Product Preference Analysis</h3>
    <div class="mb-4 flex items-center gap-4">
      <!-- Website Selection -->
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

      <!-- Date Range -->
      <div class="flex items-center">
        <label for="dateRange" class="text-gray-700 font-medium mr-4">Date Range:</label>
        <a-range-picker
          v-model:value="dateRange"
          class="w-2/3"
          :disabled-date="disabledDate"
          @change="handleDateChange"
        />
      </div>
    </div>

    <!-- Overview Statistics -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-blue-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-blue-700">Total Products</h5>
        <p class="text-2xl font-bold text-blue-900 mt-2">
          {{ totalProducts }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">Total Orders</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ totalOrders }}
        </p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-purple-700">Average Quantity/Order</h5>
        <p class="text-2xl font-bold text-purple-900 mt-2">
          {{ avgQuantityPerOrder }}
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

interface ProductPreference {
  product_id: number;
  product_name: string;
  total_quantity: number;
  total_orders: number;
  avg_quantity: number;
  percentage: number;
}

export default defineComponent({
  name: 'ProductPreferenceChart',
  
  components: {
    apexchart: VueApexCharts
  },

  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const productData = ref<ProductPreference[]>([])
    const selectedWebsiteId = ref(2)
    
    const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
      dayjs().startOf('year'),
      dayjs().endOf('year')
    ])

    // Computed properties
    const totalProducts = computed(() => productData.value.length)
    
    const totalOrders = computed(() => 
      productData.value.reduce((sum, item) => sum + item.total_orders, 0)
    )

    const avgQuantityPerOrder = computed(() => {
      const totalQuantity = productData.value.reduce((sum, item) => sum + item.total_quantity, 0)
      return totalOrders.value ? (totalQuantity / totalOrders.value).toFixed(2) : '0'
    })

    const series = computed(() => [{
      name: 'Sales Quantity',
      data: productData.value.map(item => item.total_quantity)
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
          horizontal: true,
          columnWidth: '55%',
          endingShape: 'rounded'
        }
      },
      dataLabels: {
        enabled: true
      },
      xaxis: {
        categories: productData.value.map(item => item.product_name),
        title: {
          text: 'Products'
        }
      },
      yaxis: {
        title: {
          text: 'Sales Quantity'
        }
      },
      colors: ['#4299E1'],
      title: {
        text: 'Top 10 Best-Selling Products',
        align: 'center'
      },
      tooltip: {
        y: {
          formatter: function(value: number, { dataPointIndex }: any) {
            const item = productData.value[dataPointIndex]
            return `Quantity: ${value}
Orders: ${item.total_orders}
Avg/Order: ${item.avg_quantity}
Percentage: ${item.percentage}%`
          }
        }
      }
    }))

    // Methods
    const fetchProductPreference = async () => {
      try {
        loading.value = true
        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/membership/get/product-preference`,
          {
            websiteId: selectedWebsiteId.value,
            startDate: dateRange.value[0].format('YYYY-MM-DD'),
            endDate: dateRange.value[1].format('YYYY-MM-DD'),
            limit: 10
          },
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`
            }
          }
        )
        productData.value = response.data
      } catch (error) {
        console.error('Error fetching product preference:', error)
        message.error('Unable to load product preference data')
      } finally {
        loading.value = false
      }
    }

    const handleDateChange = () => {
      fetchProductPreference()
    }

    const handleWebsiteChange = () => {
      fetchProductPreference()
    }

    const disabledDate = (current: dayjs.Dayjs) => {
      return current && current > dayjs().endOf('day')
    }

    // Watchers
    watch(() => selectedWebsiteId.value, () => {
      fetchProductPreference()
    })

    // Lifecycle
    onMounted(() => {
      fetchProductPreference()
    })

    return {
      dateRange,
      loading,
      series,
      chartOptions,
      totalProducts,
      totalOrders, 
      avgQuantityPerOrder,
      handleDateChange,
      disabledDate,
      selectedWebsiteId,
      websites,
      handleWebsiteChange
    }
  }
})
</script>
