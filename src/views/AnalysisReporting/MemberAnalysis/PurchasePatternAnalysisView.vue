<template>
  <DefaultLayout>
    <div class="flex-1 p-6 overflow-auto">
      <h2 class="text-3xl font-bold mb-6">{{ t('purchasePattern.title') }}</h2>

      <!-- Brand Selection -->
      <div class="mb-8 flex items-center bg-white p-6 rounded shadow">
        <label for="brandSelection" class="text-gray-700 font-medium mr-4">
          {{ t('purchasePattern.brand.label') }}
        </label>
        <select 
          v-model="selectedBrand"
          id="brandSelection"
          class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option 
            v-for="option in brandOptions"
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

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18nGlobal } from '@/i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PurchaseCycleChart from '@/components/MemberAnalysis/PurchasePatternAnalysis/PurchaseCycleChart.vue'
import ProductPreferenceChart from '@/components/MemberAnalysis/PurchasePatternAnalysis/ProductPreferenceChart.vue'
import CustomerValueChart from '@/components/MemberAnalysis/PurchasePatternAnalysis/CustomerValueChart.vue'

const { t } = useI18nGlobal()

// Convert BRAND_OPTIONS to computed property for i18n support
const brandOptions = computed(() => [
  {
    value: 'sky007',
    label: t('purchasePattern.brand.options.sky007')
  },
  {
    value: 'bbia',
    label: t('purchasePattern.brand.options.bbia')
  },
  {
    value: 'hince',
    label: t('purchasePattern.brand.options.hince')
  },
  {
    value: 'mixsoon',
    label: t('purchasePattern.brand.options.mixsoon')
  }
])

const selectedBrand = ref(brandOptions.value[0].value)

watch(selectedBrand, (newBrand) => {
  // Logic to fetch new data when brand changes
  console.log('Selected brand changed:', newBrand)
})
</script>
