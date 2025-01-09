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
import { ref, onMounted } from 'vue'
import { useI18nGlobal } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import { message } from 'ant-design-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import CategorySales from '@/components/SalesAnalysis/CategorySales.vue'
import ProductSales from '@/components/SalesAnalysis/ProductSales.vue'
import SalesTrends from '@/components/SalesAnalysis/SalesTrends.vue'

const { t } = useI18nGlobal()
const authStore = useAuthStore()

// State management
const selectedBrand = ref('2') // Default là Sky007
const selectedCategory = ref('')
const selectedProduct = ref('')
const brands = ref([])
const loading = ref(false)

const fetchBrands = async () => {
  try {
    loading.value = true
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/websites`,
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error('Failed to fetch brands')
    }
    const data = await response.json()
    brands.value = data.brands
  } catch (error) {
    console.error('Error fetching brands:', error)
    message.error('Không thể tải danh sách thương hiệu')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchBrands()
})

// Product options - using translation keys
const allProducts = [
  'laptop',
  'smartphone',
  'tablet',
  'smartwatch',
  'camera'
].map(key => t(`productSales.products.${key}`))
</script>
