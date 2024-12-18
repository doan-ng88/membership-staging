<template>
  <div class="mb-12 bg-white rounded-lg shadow">
    <div class="p-6 border-b border-gray-200">
      <h3 class="text-2xl font-semibold text-gray-800">Phân Tích ROI Chiến Dịch</h3>
      
      <!-- Campaign Selection -->
      <div class="mt-4 flex items-center">
        <label for="campaignSelection" class="text-gray-700 font-medium mr-4">Chọn Chiến Dịch:</label>
        <select 
          :value="selectedCampaign"
          @input="(event) => $emit('update:campaign', (event.target as HTMLSelectElement).value)"
          id="campaignSelection" 
          class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option v-for="campaign in campaigns" :key="campaign.value" :value="campaign.value">
            {{ campaign.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- ROI Statistics Cards -->
    <div class="grid grid-cols-3 gap-6 p-6">
      <div class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-blue-600 text-sm font-semibold">Chi Phí Chiến Dịch</h4>
        <p class="text-2xl font-bold text-blue-800 mt-2">
          {{ formatCurrency(currentCampaignData.cost) }}
        </p>
        <p class="text-sm text-blue-600 mt-1">
          <span :class="Number(costTrend) >= 0 ? 'text-red-500' : 'text-green-500'">
            {{ Math.abs(Number(costTrend)) }}% 
            <i :class="Number(costTrend) >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </span>
          so với chiến dịch trước
        </p>
      </div>

      <div class="bg-green-50 rounded-lg p-4">
        <h4 class="text-green-600 text-sm font-semibold">Doanh Thu</h4>
        <p class="text-2xl font-bold text-green-800 mt-2">
          {{ formatCurrency(currentCampaignData.revenue) }}
        </p>
        <p class="text-sm text-green-600 mt-1">
          <span :class="Number(revenueTrend) >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ Math.abs(Number(revenueTrend)) }}%
            <i :class="Number(revenueTrend) >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </span>
          so với chiến dịch trước
        </p>
      </div>

      <div class="bg-purple-50 rounded-lg p-4">
        <h4 class="text-purple-600 text-sm font-semibold">ROI</h4>
        <p class="text-2xl font-bold text-purple-800 mt-2">
          {{ calculateROI(currentCampaignData) }}%
        </p>
        <p class="text-sm text-purple-600 mt-1">
          <span :class="Number(roiTrend) >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ Math.abs(Number(roiTrend)) }}%
            <i :class="Number(roiTrend) >= 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
          </span>
          so với chiến dịch trước
        </p>
      </div>
    </div>

    <!-- ROI Chart -->
    <div class="p-6">
      <apexchart
        type="donut"
        height="380"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'

const props = defineProps<{
  selectedBrand: string
  selectedCampaign: string
}>()

defineEmits<{
  (e: 'update:campaign', value: string): void
}>()

interface CampaignData {
  cost: number
  revenue: number
  previousCost: number
  previousRevenue: number
}

const campaigns = [
  { value: 'campaign1', label: 'Chiến dịch Tết 2024' },
  { value: 'campaign2', label: 'Chiến dịch Mùa Hè 2023' },
  { value: 'campaign3', label: 'Chiến dịch Black Friday 2023' }
]

const campaignData: Record<string, CampaignData> = {
  'campaign1': { 
    cost: 50000000, 
    revenue: 150000000,
    previousCost: 45000000,
    previousRevenue: 120000000
  },
  'campaign2': { 
    cost: 80000000, 
    revenue: 200000000,
    previousCost: 85000000,
    previousRevenue: 180000000
  },
  'campaign3': { 
    cost: 100000000, 
    revenue: 250000000,
    previousCost: 90000000,
    previousRevenue: 200000000
  }
}

const currentCampaignData = computed(() => 
  campaignData[props.selectedCampaign] || campaignData['campaign1']
)

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const calculateROI = (data: CampaignData): string => {
  return ((data.revenue - data.cost) / data.cost * 100).toFixed(1)
}

// Tính % thay đổi so với chiến dịch trước
const costTrend = computed(() => {
  const data = currentCampaignData.value
  return ((data.cost - data.previousCost) / data.previousCost * 100).toFixed(1)
})

const revenueTrend = computed(() => {
  const data = currentCampaignData.value
  return ((data.revenue - data.previousRevenue) / data.previousRevenue * 100).toFixed(1)
})

const roiTrend = computed(() => {
  const data = currentCampaignData.value
  const currentROI = (data.revenue - data.cost) / data.cost
  const previousROI = (data.previousRevenue - data.previousCost) / data.previousCost
  return ((currentROI - previousROI) / previousROI * 100).toFixed(1)
})

const series = computed(() => {
  const data = currentCampaignData.value
  return [data.cost, data.revenue - data.cost]
})

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'donut',
    fontFamily: 'Inter, sans-serif'
  },
  labels: ['Chi phí', 'Lợi nhuận'],
  colors: ['#4F46E5', '#10B981'],
  legend: {
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '14px'
  },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          name: {
            show: true,
            fontSize: '22px',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 600,
            color: '#2D3748'
          },
          value: {
            show: true,
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#4A5568',
            formatter: function(val: number) {
              return formatCurrency(val)
            }
          },
          total: {
            show: true,
            label: 'Tổng ROI',
            fontSize: '16px',
            fontFamily: 'Inter, sans-serif',
            color: '#2D3748',
            formatter: function(w) {
              return calculateROI(currentCampaignData.value) + '%'
            }
          }
        }
      }
    }
  },
  dataLabels: {
    enabled: false
  },
  responsive: [{
    breakpoint: 480,
    options: {
      chart: {
        width: 320
      },
      legend: {
        position: 'bottom'
      }
    }
  }]
}))
</script>
