<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('transitionAnalysis.title') }}</h3>

    <!-- Filter Section -->
    <div class="mb-6">
      <a-range-picker
        v-model:value="dateRange"
        class="w-full md:w-1/3"
        :disabled-date="disabledDate"
        :placeholder="[
          t('transitionAnalysis.datePicker.placeholder.0'),
          t('transitionAnalysis.datePicker.placeholder.1')
        ]"
      />
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-green-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-green-700">{{ t('transitionAnalysis.stats.upgrades.title') }}</h5>
        <p class="text-2xl font-bold text-green-900 mt-2">
          {{ totalUpgrades }}
        </p>
      </div>
      <div class="bg-yellow-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-yellow-700">{{ t('transitionAnalysis.stats.extensions.title') }}</h5>
        <p class="text-2xl font-bold text-yellow-900 mt-2">
          {{ totalExtends }}
        </p>
      </div>
      <div class="bg-red-50 p-4 rounded-lg">
        <h5 class="text-sm font-medium text-red-700">{{ t('transitionAnalysis.stats.downgrades.title') }}</h5>
        <p class="text-2xl font-bold text-red-900 mt-2">
          {{ totalDowngrades }}
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div v-if="loading" class="flex justify-center items-center h-64">
      <a-spin />
    </div>
    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('transitionAnalysis.charts.transition.title') }}</h4>
        <VueApexCharts
          type="bar"
          height="350"
          :options="downgradeChartOptions"
          :series="downgradeSeries"
        />
      </div>

      <div class="bg-gray-50 p-4 rounded-lg">
        <h4 class="text-sm font-medium text-gray-700 mb-4">{{ t('transitionAnalysis.charts.extension.title') }}</h4>
        <VueApexCharts
          type="bar"
          height="350"
          :options="extendChartOptions"
          :series="extendSeries"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18nGlobal } from '@/i18n'
import VueApexCharts from 'vue3-apexcharts'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

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

interface Website {
  WebsiteId: string;
  Name: string;
}

const props = defineProps<{
  brand: string
}>()

// Data & State
const loading = ref(false)
const levelData = ref<WebsiteData[]>([])
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().startOf('year'),
  dayjs().endOf('year')
])

// Computed
const WEBSITES: Website[] = [
  {
    WebsiteId: "1",
    Name: "Sky007",
  },
  {
    WebsiteId: "2",
    Name: "Bbia",
  },
  {
    WebsiteId: "3",
    Name: "Hince",
  },
  {
    WebsiteId: "4",
    Name: "Mixsoon",
  }
]

const websiteData = computed((): LevelAction[] => {
  const website = WEBSITES.find(w => w.WebsiteId === props.brand)
  if (!website) {
    console.warn('Invalid brand name:', props.brand)
    return []
  }

  const matchedWebsite = levelData.value.find(item => 
    item.websiteID === parseInt(website.WebsiteId)
  )
  
  return matchedWebsite?.data || []
})

const totalUpgrades = computed((): number => {
  const upData = websiteData.value.find(d => d.action === 'up')
  return upData?.details.filter(d => !d.reason.includes('Create membership'))
    .reduce((sum, detail) => sum + detail.count, 0) || 0
})

const totalExtends = computed((): number => {
  const extendData = websiteData.value.find(d => d.action === 'extend')
  return extendData?.details.reduce((sum, detail) => sum + detail.count, 0) || 0
})

const totalDowngrades = computed((): number => {
  const downData = websiteData.value.find(d => d.action === 'down')
  return downData?.details.reduce((sum, detail) => sum + detail.count, 0) || 0
})

const downgradeSeries = computed(() => {
  const downData = websiteData.value.find(d => d.action === 'down')?.details || []
  return [{
    name: t('transitionAnalysis.charts.transition.series'),
    data: downData.map(d => d.count)
  }]
})

const downgradeChartOptions = computed(() => ({
  chart: {
    type: 'bar'
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4,
      dataLabels: {
        position: 'center'
      }
    }
  },
  colors: ['#ff4d4f'],
  dataLabels: {
    enabled: true,
    style: {
      colors: ['#fff']
    }
  },
  xaxis: {
    categories: websiteData.value
      .find(d => d.action === 'down')
      ?.details
      .map(d => {
        const text = d.reason.replace('Downgrade Level from ', '')
        if (text.startsWith('Gold to ')) {
          return 'Gold → Silver'
        }
        if (text.startsWith('Diamond to ')) {
          return 'Diamond → Gold'
        }
        return text.replace(' to ', ' → ')
      }) || []
  }
}))

const extendSeries = computed(() => {
  const extendData = websiteData.value.find(d => d.action === 'extend')?.details || []
  return [{
    name: t('transitionAnalysis.charts.extension.series'),
    data: extendData.map(d => d.count)
  }]
})

const extendChartOptions = computed(() => ({
  chart: {
    type: 'bar'
  },
  plotOptions: {
    bar: {
      horizontal: true,
      borderRadius: 4
    }
  },
  colors: ['#faad14'],
  xaxis: {
    categories: websiteData.value
      .find(d => d.action === 'extend')?.details
      .map(d => d.reason.replace('extend Level from ', '')) || [],
  }
}))

const distributionSeries = computed(() => [
  totalUpgrades.value,
  totalDowngrades.value,
  totalExtends.value
])

const distributionChartOptions = {
  labels: ['Upgrades', 'Downgrades', 'Extensions'],
  colors: ['#52c41a', '#ff4d4f', '#faad14'],
  legend: {
    position: 'bottom'
  }
}

// Methods
const disabledDate = (current: dayjs.Dayjs): boolean => {
  return current && current > dayjs().endOf('day')
}

const fetchLevelData = async (): Promise<void> => {
  const authStore = useAuthStore()
  try {
    loading.value = true
    const response = await axios.post<LevelAnalysisResponse>(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-membership-level-update-history`,
      {
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
    levelData.value = response.data.LevelAnalysis
  } catch (error) {
    console.error('Error fetching level data:', error)
    message.error(t('transitionAnalysis.messages.error.loadData'))
  } finally {
    loading.value = false
  }
}

// Watchers
watch([dateRange, () => props.brand], () => {
  fetchLevelData()
}, { deep: true })

// Lifecycle
onMounted(() => {
  fetchLevelData()
})
</script>
