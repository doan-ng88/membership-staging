<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('memberAnalysis.transitionChart.title') }}</h3>

    <!-- Filter Section -->
    <div class="mb-6 flex flex-wrap gap-4">
      <a-range-picker
        v-model:value="dateRange"
        class="w-full md:w-1/3"
        :disabled-date="disabledDate"
        :placeholder="['Ngày bắt đầu', 'Ngày kết thúc']"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">{{ t('memberAnalysis.transitionChart.upgrade') }}</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ totalUpgrades }}
        </p>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-yellow-700">{{ t('memberAnalysis.transitionChart.extend') }}</h5>
        <p class="text-2xl font-bold text-yellow-900 mt-2">
          {{ totalExtends }}
        </p>
      </div>
      <div class="bg-red-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-red-700">{{ t('memberAnalysis.transitionChart.downgrade') }}</h5>
        <p class="text-2xl font-bold text-red-900 mt-2">
          {{ totalDowngrades }}
        </p>
      </div>
    </div>

    <!-- Chart -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <a-spin />
    </div>
    <div v-else class="bg-gray-50 p-4 rounded-lg">
      <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('memberAnalysis.transitionChart.details') }}</h4>
      <VueApexCharts
        type="bar"
        height="515"
        :options="chartOptions"
        :series="chartSeries"
      />
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
import { useI18nGlobal } from '@/i18n'

const { t } = useI18nGlobal()

// Types
interface LevelDetail {
  reason: string
  count: number
}

interface LevelAction {
  action: 'up' | 'down' | 'extend'
  details: LevelDetail[]
}

interface WebsiteData {
  websiteID: number
  data: LevelAction[]
}

interface LevelAnalysisResponse {
  LevelAnalysis: WebsiteData[]
}

const props = defineProps<{
  brand: string
}>()

// Data & State
const loading = ref(false)
const levelData = ref<WebsiteData[]>([])
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().startOf('month'),
  dayjs().endOf('day')
])

// Computed values
const websiteData = computed(() => {
  // Tìm trong tất cả các website kể cả websiteID = 0
  const allWebsites = levelData.value?.flatMap(w => w) || []
  return allWebsites.find(item => 
    item.websiteID === parseInt(props.brand) || item.websiteID === 0
  )?.data || []
})

const totalUpgrades = computed(() => {
  return websiteData.value
    .flatMap(d => d.action === 'up' 
      ? d.details.filter(d => !d.reason.includes('Create membership')) 
      : []
    )
    .reduce((sum, d) => sum + d.count, 0)
})

const totalDowngrades = computed(() => {
  return websiteData.value
    .find(d => d.action === 'down')
    ?.details.reduce((sum, d) => sum + Math.abs(d.count), 0) || 0
})

const totalExtends = computed(() => {
  return websiteData.value
    .find(d => d.action === 'extend')
    ?.details.reduce((sum, d) => sum + d.count, 0) || 0
})

const chartSeries = computed(() => {
  return ['up', 'down', 'extend'].map(action => {
    const details = websiteData.value.find(d => d.action === action)?.details || []
    return {
      name: action === 'up' ? t('memberAnalysis.transitionChart.upgrade') : action === 'down' ? t('memberAnalysis.transitionChart.downgrade') : t('memberAnalysis.transitionChart.extend'),
      data: details.map(d => Math.abs(d.count))
    }
  })
})

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: true },
    stacked: false,
    height: 450
  },
  plotOptions: {
    bar: {
      horizontal: false,
      borderRadius: 4,
      columnWidth: '70%',
      dataLabels: {
        position: 'top',
        offsetY: -5
      }
    }
  },
  colors: ['#10B981', '#EF4444', '#F59E0B'],
  dataLabels: {
    enabled: true,
    style: {
      colors: ['#1F2937'],
      fontSize: '12px'
    },
    formatter: (val: number) => val || '',
    background: {
      enabled: false
    }
  },
  xaxis: {
    categories: websiteData.value
      .flatMap(d => d.details)
      .map(d => {
        if (d.reason.includes('Upgrade Level from')) {
          return d.reason.replace('Upgrade Level from ', t('memberAnalysis.transitionChart.upgradeFrom'))
        }
        if (d.reason.includes('Downgrade Level from')) {
          return d.reason.replace('Downgrade Level from ', t('memberAnalysis.transitionChart.downgradeFrom'))
        }
        if (d.reason.includes('Extend Level')) {
          return d.reason.replace('Extend Level ', t('memberAnalysis.transitionChart.extendLevel')) + ' tháng'
        }
        return d.reason
      })
      .filter((v, i, a) => a.indexOf(v) === i) // Unique values
  },
  yaxis: {
    title: {
      text: t('memberAnalysis.transitionChart.yAxisTitle'),
      style: {
        fontSize: '14px'
      }
    }
  },
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    itemMargin: {
      // horizontal: 16,
      vertical: 8
    },
    markers: {
      width: 12,
      height: 12,
      radius: 6,
      offsetY: 1
    },
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    onItemClick: {
      toggleDataSeries: true
    }
  },
  tooltip: {
    shared: true,
    intersect: false,
    y: {
      formatter: (val: number) => `${val} thành viên`
    }
  },
  noData: {
    text: t('memberAnalysis.transitionChart.noData'),
    align: 'center',
    style: {
      color: '#6B7280',
      fontSize: '16px'
    }
  },
  responsive: [{
    breakpoint: 768,
    options: {
      chart: {
        height: 500
      },
      dataLabels: {
        style: {
          fontSize: '11px'
        }
      }
    }
  }]
}))

// Methods
const disabledDate = (current: dayjs.Dayjs) => {
  return current > dayjs().endOf('day')
}

const fetchLevelData = async () => {
  const authStore = useAuthStore()
  try {
    loading.value = true
    const response = await axios.post<LevelAnalysisResponse>(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-membership-level-update-history`,
      {
        websiteId: 0, // Luôn request data tổng hợp
        startDate: dateRange.value[0].format('YYYY-MM-DD'),
        endDate: dateRange.value[1].format('YYYY-MM-DD')
      },
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    levelData.value = response.data?.LevelAnalysis || []
    console.log('API Data:', levelData.value)
    
  } catch (error) {
    console.error('Lỗi tải dữ liệu:', error)
    message.error('Không thể tải dữ liệu chuyển đổi')
    levelData.value = []
  } finally {
    loading.value = false
  }
}

// Watchers
watch([dateRange, () => props.brand], fetchLevelData, { immediate: true })

// Lifecycle
onMounted(fetchLevelData)
</script>
