<template>
  <div class="flex-1 p-6 bg-gray-50">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Product Sales Analytics</h2>
      <p class="text-gray-600 mt-1">Track and analyze your product sales performance</p>
    </div>

    <!-- Brand Selection -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex items-center">
        <label for="brandSelection" class="text-sm font-medium text-gray-700 mr-4">
          Brand Selection
        </label>
        <select 
          v-model="selectedBrand" 
          id="brandSelection" 
          class="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option v-for="brand in brands" :key="brand.value" :value="brand.value">
            {{ brand.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Sales Analysis Sections -->
    <div class="space-y-6">
      <category-sales-section 
        :selected-brand="selectedBrand"
        :selected-category="selectedCategory"
        @update:category="selectedCategory = $event"
      />

      <product-sales-section
        :selected-brand="selectedBrand"
        :selected-product="selectedProduct"
        :all-products="allProducts"
        @update:product="selectedProduct = $event"
      />

      <sales-trends-section
        v-model:selectedTimeRange="selectedTimeRange"
        :selected-brand="selectedBrand"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import CategorySalesSection from '@/components/SalesAnalysis/CategorySales.vue'
import ProductSalesSection from '@/components/SalesAnalysis/ProductSales.vue'
import SalesTrendsSection from '@/components/SalesAnalysis/SalesTrends.vue'

const selectedBrand = ref('sky007')
const selectedCategory = ref('electronics')
const selectedProduct = ref('Laptop')
const selectedTimeRange = ref(6)

const brands = [
  { value: 'sky007', label: 'Sky007, BBIA' },
  { value: 'hince', label: 'Hince' },
  { value: 'mixsoon', label: 'Mixsoon' }
]

const allProducts = [
  'Laptop', 'Smartphone', 'Tablet', 'Smartwatch', 'Camera'
]
</script>

<style scoped>
/* Add any component-specific styles here */
</style>
