<template>
  <DefaultLayout>
    <div class="flex">
      <!-- Main Content -->
    <div class="flex-1 p-6 overflow-auto">
      <h2 class="text-3xl font-bold mb-6">Campaign Effect Analysis</h2>

      <!-- Brand Selection -->
      <div class="mb-8 flex items-center">
        <label for="brandSelection" class="text-gray-700 font-medium mr-4">Chọn Thương Hiệu:</label>
        <select v-model="selectedBrand" id="brandSelection" class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2">
          <option v-for="brand in brands" :key="brand.value" :value="brand.value">
            {{ brand.label }}
          </option>
        </select>
      </div>

      <!-- Campaign ROI Analysis -->
      <campaign-roi-chart 
        :selected-brand="selectedBrand"
        :selected-campaign="selectedCampaign"
        @update:campaign="selectedCampaign = $event"
      />

      <!-- Customer Response Rates -->
      <response-rates-chart 
        :selected-time-range="selectedResponseTimeRange"
        @update:timeRange="selectedResponseTimeRange = $event"
      />

      <!-- A/B Test Results -->
      <ab-test-chart 
        :selected-variant="selectedTestVariant"
        @update:variant="selectedTestVariant = $event"
      />
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import CampaignRoiChart from '@/components/MarketingPerformance/CampaignEffectAnalysis/CampaignRoiChart.vue'
import ResponseRatesChart from '@/components/MarketingPerformance/CampaignEffectAnalysis/ResponseRatesChart.vue'
import AbTestChart from '@/components/MarketingPerformance/CampaignEffectAnalysis/AbTestChart.vue'

// State
const selectedBrand = ref('sky007')
const selectedCampaign = ref('campaign1')
const selectedResponseTimeRange = ref(6)
const selectedTestVariant = ref('variantA')

// Data
const brands = [
  { value: 'sky007', label: 'Sky007, BBIA' },
  { value: 'hince', label: 'Hince' },
  { value: 'mixsoon', label: 'Mixsoon' }
]
</script>
