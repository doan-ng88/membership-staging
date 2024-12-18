<template>
  <div class="mb-12">
    <h3 class="text-2xl font-semibold mb-4">Mẫu Hành Vi Theo Cấp Bậc</h3>
    <div class="mb-4 flex items-center">
      <label class="text-gray-700 font-medium mr-4">Chọn Tiêu Chí:</label>
      <div class="flex space-x-4">
        <label 
          v-for="metric in BEHAVIOR_METRICS"
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

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { BEHAVIOR_METRICS } from '@/data/analysisMemberData'
import type { BehaviorMetric } from '@/types/memberAnalysis'

export default defineComponent({
  name: 'BehaviorChart',

  props: {
    brand: {
      type: String,
      required: true
    }
  },

  setup(props) {
    const selectedMetrics = ref<BehaviorMetric[]>(['averagePurchase'])

    const series = computed(() => 
      selectedMetrics.value.map(metric => ({
        name: BEHAVIOR_METRICS.find(m => m.value === metric)?.label || '',
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
        categories: ['Bạc', 'Vàng', 'Kim Cương']
      },
      yaxis: {
        min: 0,
        tickAmount: 5
      },
      colors: ['#4FD1C5', '#9F7AEA', '#F6AD55'],
      title: {
        text: 'Mẫu Hành Vi Theo Cấp Bậc',
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

    return {
      selectedMetrics,
      BEHAVIOR_METRICS,
      series,
      chartOptions
    }
  }
})
</script>
