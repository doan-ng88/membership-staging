<template>
  <DefaultLayout>
    <div class="flex-1 p-6 overflow-auto">
      <h2 class="text-3xl font-bold mb-6">Purchase Pattern Analysis</h2>

      <!-- Brand Selection -->
      <div class="mb-8 flex items-center bg-white p-6 rounded shadow">
        <label for="brandSelection" class="text-gray-700 font-medium mr-4">Select Brand:</label>
        <select 
          v-model="selectedBrand"
          id="brandSelection"
          class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option 
            v-for="option in BRAND_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <PurchaseCycleChart :brand="selectedBrand" />
      <ProductPreferenceChart :brand="selectedBrand" />
      <!-- <CustomerValueChart :brand="selectedBrand" /> -->
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { BRAND_OPTIONS } from '@/data/analysisMemberData'
import PurchaseCycleChart from '@/components/MemberAnalysis/PurchasePatternAnalysis/PurchaseCycleChart.vue'
import ProductPreferenceChart from '@/components/MemberAnalysis/PurchasePatternAnalysis/ProductPreferenceChart.vue'
import CustomerValueChart from '@/components/MemberAnalysis/PurchasePatternAnalysis/CustomerValueChart.vue'

export default defineComponent({
  name: 'PurchasePatternAnalysisView',

  components: {
    DefaultLayout,
    PurchaseCycleChart,
    ProductPreferenceChart,
    CustomerValueChart
  },

  setup() {
    const selectedBrand = ref(BRAND_OPTIONS[0].value)

    watch(selectedBrand, (newBrand) => {
      // Ở đây có thể thêm logic để fetch dữ liệu mới khi brand thay đổi
      console.log('Selected brand changed:', newBrand)
    })

    return {
      selectedBrand,
      BRAND_OPTIONS
    }
  }
})
</script>
