<template>
  <div class="mb-12 bg-white p-6 rounded shadow">
    <h3 class="text-2xl font-semibold mb-4">{{ t('purchasePattern.productPreference.title') }}</h3>
    <div class="mb-4 flex items-center gap-4">
      <!-- Website Selection -->
      <div class="flex items-center">
        <label for="websiteSelect" class="text-gray-700 font-medium mr-4">{{ t('purchasePattern.productPreference.website') }}:</label>
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
        <label for="dateRange" class="text-gray-700 font-medium mr-4">{{ t('purchasePattern.productPreference.dateRange') }}:</label>
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
        <h5 class="text-sm font-medium text-blue-700">{{ t('purchasePattern.productPreference.stats.totalProducts') }}</h5>
        <p class="text-2xl font-bold text-blue-900 mt-2">
          {{ totalProducts }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">{{ t('purchasePattern.productPreference.stats.totalOrders') }}</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ totalOrders }}
        </p>
      </div>
      <div class="bg-purple-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-purple-700">{{ t('purchasePattern.productPreference.stats.avgQuantityPerOrder') }}</h5>
        <p class="text-2xl font-bold text-purple-900 mt-2">
          {{ avgQuantityPerOrder }}
        </p>
      </div>
    </div>

    <div class="relative">
      <apexchart
        type="bar"
        height="350"
        :options="chartOptions"
        :series="series"
      />
      <div v-if="loading" class="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
        <a-spin size="large" />
      </div>
    </div>
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
import { useI18nGlobal } from '@/i18n'

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
    const { t } = useI18nGlobal()
    const authStore = useAuthStore()
    const loading = ref(false)
    const productData = ref<ProductPreference[]>([])
    const selectedWebsiteId = ref(2)
    
    const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
      dayjs().startOf('month'),
      dayjs().endOf('day')
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
      name: t('purchasePattern.productPreference.chart.series.salesQuantity'),
      data: productData.value.map(item => ({
        x: item.product_name, 
        y: item.total_quantity,
        orders: item.total_orders,
        avg: item.avg_quantity,
        percentage: item.percentage
      }))
    }])

    const chartOptions = computed(() => ({
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
        },
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#FFFFFF',
        foreColor: '#4B5563'
      },
      plotOptions: {
        bar: {
          horizontal: false,
          borderRadius: 6,
          columnWidth: '65%',
          distributed: true,
          dataLabels: {
            position: 'top'
          }
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
        },
        dropShadow: {
          enabled: true,
          top: 1,
          left: 1,
          blur: 2,
          opacity: 0.2
        }
      },
      colors: [
        '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', 
        '#EC4899', '#6366F1', '#14B8A6', '#0EA5E9', 
        '#F43F5E', '#84CC16'
      ],
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
      stroke: {
        width: 1,
        colors: ['#fff']
      },
      xaxis: {
        title: {
          text: t('purchasePattern.productPreference.chart.xaxis'),
          style: {
            fontSize: '14px',
            fontWeight: 600
          }
        },
        categories: productData.value.map(item => item.product_name),
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
          text: t('purchasePattern.productPreference.chart.yaxis'),
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
            value: 0.35
          }
        }
      },
      tooltip: {
        shared: true,
        intersect: false,
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const item = productData.value[dataPointIndex]
          if (!item) return '<div class="p-2">Loading...</div>';
          
          return `
            <div style="min-width: 200px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); border-radius: 8px; overflow: hidden; font-family: 'Inter', sans-serif;">
              <div style="background: ${chartOptions.value.colors[dataPointIndex % chartOptions.value.colors.length]}; padding: 10px 15px; color: white; font-weight: 600; font-size: 14px;">
                ${item.product_name}
              </div>
              <div style="background: white; padding: 15px; border-bottom: 1px solid #E5E7EB;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6B7280; font-size: 13px;">${t('purchasePattern.productPreference.chart.tooltip.quantity')}:</span>
                  <span style="font-weight: 700; color: #2563EB; font-size: 15px; background: #EFF6FF; padding: 2px 8px; border-radius: 4px;">${item.total_quantity.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: #6B7280; font-size: 13px;">${t('purchasePattern.productPreference.chart.tooltip.orders')}:</span>
                  <span style="font-weight: 600; color: #10B981; font-size: 13px; background: #ECFDF5; padding: 2px 8px; border-radius: 4px;">${item.total_orders.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #6B7280; font-size: 13px;">${t('purchasePattern.productPreference.chart.tooltip.avgOrder')}:</span>
                  <span style="font-weight: 600; color: #8B5CF6; font-size: 13px; background: #F5F3FF; padding: 2px 8px; border-radius: 4px;">${item.avg_quantity}</span>
                </div>
              </div>
              <div style="background: #F9FAFB; padding: 8px 15px; font-size: 12px; color: #374151; display: flex; justify-content: space-between;">
                <span>${t('purchasePattern.productPreference.chart.tooltip.percentage')}:</span>
                <span style="font-weight: 600;">${item.percentage}%</span>
              </div>
            </div>
          `;
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
        productData.value = []
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
      handleWebsiteChange,
      t
    }
  }
})
</script>
