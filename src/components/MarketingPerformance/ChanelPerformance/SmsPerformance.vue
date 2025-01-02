<template>
  <div class="bg-white rounded-lg shadow-sm p-6">
    <div class="mb-6">
      <h3 class="text-xl font-semibold text-gray-600">{{ t('marketingPerformance.sms.title') }}</h3>
      <p class="text-sm text-gray-600 mt-1">{{ t('marketingPerformance.sms.subtitle') }}</p>
    </div>

    <!-- Campaign Selection -->
    <div class="mb-6">
      <label for="smsCampaignSelection" class="block text-sm font-medium text-gray-700 mb-2">
        {{ t('marketingPerformance.sms.campaign.label') }}
      </label>
      <div class="relative">
        <select 
          v-model="selectedCampaign" 
          id="smsCampaignSelection" 
          class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 pl-3 pr-10 py-2"
        >
          <option v-for="campaign in campaigns" :key="campaign.value" :value="campaign.value">
            {{ t(`marketingPerformance.sms.campaign.options.${campaign.key}`) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Performance Metrics Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Delivery Rate Card -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700">{{ t('marketingPerformance.sms.metrics.deliveryRate.title') }}</h4>
            <p class="text-xs text-gray-500 mt-1">{{ t('marketingPerformance.sms.metrics.deliveryRate.subtitle') }}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            +3.2%
          </span>
        </div>
        
        <div class="relative">
          <apexchart
            type="radialBar"
            height="240"
            :options="deliveryRateChartOptions"
            :series="[deliveryRateData[0]]"
          />
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ deliveryRateData[0] }}%</div>
            <div class="text-xs text-gray-500">{{ t('marketingPerformance.sms.metrics.deliveryRate.label') }}</div>
          </div>
        </div>
      </div>

      <!-- Response Rate Card -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="text-sm font-medium text-gray-700">{{ t('marketingPerformance.sms.metrics.responseRate.title') }}</h4>
            <p class="text-xs text-gray-500 mt-1">{{ t('marketingPerformance.sms.metrics.responseRate.subtitle') }}</p>
          </div>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            +1.8%
          </span>
        </div>
        
        <div class="relative">
          <apexchart
            type="radialBar"
            height="240"
            :options="responseRateChartOptions"
            :series="[responseRateData[0]]"
          />
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <div class="text-2xl font-bold text-gray-800">{{ responseRateData[0] }}%</div>
            <div class="text-xs text-gray-500">{{ t('marketingPerformance.sms.metrics.responseRate.label') }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { useI18nGlobal } from '@/i18n'

const { t } = useI18nGlobal()

const props = defineProps({
  selectedBrand: String,
  selectedCampaign: String
})

const emit = defineEmits(['update:campaign'])

const selectedCampaign = ref('smsCampaign1')
const campaigns = [
  { value: 'smsCampaign1', key: 'campaign1' },
  { value: 'smsCampaign2', key: 'campaign2' },
  { value: 'smsCampaign3', key: 'campaign3' }
]

// Chart Data
const deliveryRateData = ref([40, 60])
const responseRateData = ref([15, 85])

// Delivery Rate Chart Options
const deliveryRateChartOptions = {
  chart: {
    type: 'radialBar',
    sparkline: {
      enabled: true
    }
  },
  colors: ['#F97316'], // Orange color
  plotOptions: {
    radialBar: {
      hollow: {
        size: '70%',
      },
      track: {
        background: '#E5E7EB',
      },
      dataLabels: {
        show: false
      }
    }
  },
  stroke: {
    lineCap: 'round'
  }
}

// Response Rate Chart Options
const responseRateChartOptions = {
  chart: {
    type: 'radialBar',
    sparkline: {
      enabled: true
    }
  },
  colors: ['#9333EA'], // Purple color
  plotOptions: {
    radialBar: {
      hollow: {
        size: '70%',
      },
      track: {
        background: '#E5E7EB',
      },
      dataLabels: {
        show: false
      }
    }
  },
  stroke: {
    lineCap: 'round'
  }
}

// Watch for campaign changes
watch(selectedCampaign, (newCampaign) => {
  const roiMapping = {
    'smsCampaign1': { deliveryRate: 40, responseRate: 15 },
    'smsCampaign2': { deliveryRate: 35, responseRate: 12 },
    'smsCampaign3': { deliveryRate: 45, responseRate: 18 }
  }
  
  const data = roiMapping[newCampaign] || { deliveryRate: 0, responseRate: 0 }
  deliveryRateData.value = [data.deliveryRate, 100 - data.deliveryRate]
  responseRateData.value = [data.responseRate, 100 - data.responseRate]
  
  emit('update:campaign', newCampaign)
})
</script>
