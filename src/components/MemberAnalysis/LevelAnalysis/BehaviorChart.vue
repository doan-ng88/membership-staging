<template>
  <div class="mb-12">
    <h3 class="text-2xl font-semibold mb-4">{{ t('behaviorChart.title') }}</h3>
    <div class="mb-4 flex items-center">
      <label class="text-gray-700 font-medium mr-4">{{ t('behaviorChart.filter.label') }}</label>
      <div class="flex space-x-4">
        <label 
          v-for="metric in behaviorMetrics"
          :key="metric.value"
          class="inline-flex items-center"
        >
          <input 
            type="checkbox"
            :value="metric.value"
            v-model="selectedMetrics"
            class="form-checkbox h-5 w-5 text-blue-600"
          >
          <span class="ml-2">{{ metric.label }}</span>
        </label>
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18nGlobal } from '@/i18n'
import type { BehaviorMetric } from '@/types/memberAnalysis'

const { t } = useI18nGlobal()

const props = defineProps<{
  brand: string
}>()

// Convert BEHAVIOR_METRICS to computed property for i18n support
const behaviorMetrics = computed(() => [
  {
    value: 'averagePurchase',
    label: t('behaviorChart.metrics.averagePurchase')
  },
  {
    value: 'purchaseFrequency',
    label: t('behaviorChart.metrics.purchaseFrequency')
  },
  {
    value: 'returnRate',
    label: t('behaviorChart.metrics.returnRate')
  }
])

const selectedMetrics = ref<BehaviorMetric[]>(['averagePurchase'])

const series = computed(() => 
  selectedMetrics.value.map(metric => ({
    name: behaviorMetrics.value.find(m => m.value === metric)?.label || '',
    data: metric === 'averagePurchase' ? [50, 150, 300] :
          metric === 'purchaseFrequency' ? [5, 10, 20] : [2, 3, 5]
  }))
)

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    stacked: false,
    toolbar: {
      show: true
    }
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: '55%',
      borderRadius: 5
    }
  },
  xaxis: {
    categories: [
      t('behaviorChart.levels.silver'),
      t('behaviorChart.levels.gold'),
      t('behaviorChart.levels.diamond')
    ]
  },
  yaxis: {
    min: 0,
    tickAmount: 5,
    title: {
      text: t('behaviorChart.chart.yaxis')
    }
  },
  colors: ['#4FD1C5', '#9F7AEA', '#F6AD55'],
  title: {
    text: t('behaviorChart.chart.title'),
    align: 'center'
  },
  legend: {
    position: 'top'
  },
  dataLabels: {
    enabled: true
  }
}))

watch(() => props.brand, () => {
  // Implement API call when brand changes
  console.log('Brand changed:', props.brand)
})
</script>
