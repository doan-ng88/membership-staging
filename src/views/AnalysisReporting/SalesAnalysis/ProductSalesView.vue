<template>
  <default-layout>
    <div class="flex-1 p-6 bg-gray-50">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-800">{{ t('productSales.title') }}</h2>
        <p class="text-gray-600 mt-1">{{ t('productSales.subtitle') }}</p>
      </div>

      <!-- Brand Selection -->
      <!-- <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div class="flex items-center">
          <label for="brandSelection" class="text-sm font-medium text-gray-700 mr-4">
            {{ t('productSales.filters.brand.label') }}
          </label>
          <select 
            v-model="selectedBrand" 
            id="brandSelection" 
            class="w-1/3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option v-for="brand in brands" :key="brand.value" :value="brand.value">
              {{ t(`productSales.filters.brand.options.${brand.key}`) }}
            </option>
          </select>
        </div>
      </div> -->

      <!-- Sales Analysis Sections -->
      <div class="space-y-6">
        <category-sales 
          v-model:selectedCategory="selectedCategory"
          :selected-brand="selectedBrand"
        />

        <product-sales
          v-model:selectedProduct="selectedProduct"
          :selected-brand="selectedBrand"
          :all-products="allProducts"
        />

        <!-- <sales-trends
          v-model:selectedTimeRange="selectedTimeRange"
          :selected-brand="selectedBrand"
        /> -->
      </div>
    </div>
  </default-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useI18nGlobal } from '@/i18n'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import CategorySales from '@/components/SalesAnalysis/CategorySales.vue'
import ProductSales from '@/components/SalesAnalysis/ProductSales.vue'
import SalesTrends from '@/components/SalesAnalysis/SalesTrends.vue'

const { t } = useI18nGlobal()

// State management
const selectedBrand = ref('sky007')
const selectedCategory = ref('electronics')
const selectedProduct = ref('Laptop')
const selectedTimeRange = ref(6)

// Brand options
const brands = [
  { value: '1', key: 'sky007', label: t('productSales.filters.brand.options.sky007') },
  { value: '2', key: 'hince', label: t('productSales.filters.brand.options.hince') },
  { value: '3', key: 'mixsoon', label: t('productSales.filters.brand.options.mixsoon') }
]

// Product options - using translation keys
const allProducts = [
  'laptop',
  'smartphone',
  'tablet',
  'smartwatch',
  'camera'
].map(key => t(`productSales.products.${key}`))
</script>
