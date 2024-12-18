<template>
  <div class="mb-12 bg-white p-6 rounded shadow">
    <h3 class="text-2xl font-semibold mb-4">Customer Value Analysis</h3>
    <div class="mb-4 flex items-center">
      <label for="customerSegment" class="text-gray-700 font-medium mr-4">Select Customer Segment:</label>
      <select 
        v-model="selectedCustomerSegment"
        id="customerSegment"
        class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2"
      >
        <option 
          v-for="segment in CUSTOMER_SEGMENTS"
          :key="segment.value"
          :value="segment.value"
        >
          {{ segment.label }}
        </option>
      </select>
    </div>
    <apexchart
      type="pie"
      height="350"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { 
  CUSTOMER_SEGMENTS, 
  getCustomerValueData 
} from '@/data/analysisMemberData'
import type { CustomerSegment } from '@/types/memberAnalysis'

export default defineComponent({
  name: 'CustomerValueChart',
  
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
    const selectedCustomerSegment = ref<CustomerSegment>('medium')

    const series = computed(() => 
      getCustomerValueData(selectedCustomerSegment.value).datasets[0].data
    )

    const chartOptions = computed(() => ({
      chart: {
        type: 'pie',
        toolbar: {
          show: true
        },
        height: 350
      },
      labels: getCustomerValueData(selectedCustomerSegment.value).labels,
      colors: ['#FF9F40'],
      title: {
        text: 'Customer Value by Segment',
        align: 'center'
      },
      responsive: [{
        breakpoint: 480,
        options: {
          chart: {
            width: 300
          },
          legend: {
            position: 'bottom'
          }
        }
      }]
    }))

    watch(selectedCustomerSegment, () => {
      // Ở đây có thể thêm logic để fetch dữ liệu mới từ API dựa trên selectedCustomerSegment và brand
      console.log('Selected Customer Segment changed:', selectedCustomerSegment.value)
    })

    watch(() => props.brand, () => {
      // Implement API call khi brand thay đổi
      console.log('Brand changed:', props.brand)
    })

    return {
      selectedCustomerSegment,
      CUSTOMER_SEGMENTS,
      series,
      chartOptions
    }
  }
})
</script>
