<template>
  <DefaultLayout>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center mb-8">{{ t('purchaseHistory.title') }}</h1>

      
      <!-- Brand Selection -->
      <div class="flex justify-between items-center mb-6">
        <div class="flex-1">
          <div class="mb-6">
            <label for="brandSelect" class="block text-sm font-medium text-gray-700">
              <h3 class="text-lg leading-6 font-medium text-gray-900">{{ t('benefit.selectBrand') }}</h3>
            </label>
            <select
              id="brandSelect"
              v-model="selectedBrand"
              class="mt-1 block w-[350px] pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-slate-200"
            >
              <option v-for="brand in brands" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </select>
          </div>
        </div>
        
        <!-- Export Button -->
        <button
          @click="exportToExcel"
          :disabled="!selectedBrand || loading || !orders.length"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="exporting">{{ t('common.exporting') }}</span>
          <span v-else>{{ t('purchaseHistory.common.exportExcel') }}</span>
        </button>
      </div>

      <!-- No brand selected -->
      <div v-if="!selectedBrand" class="text-center py-4 text-gray-600">
        {{ t('purchaseHistory.selectBrandFirst') }}
      </div>

      <!-- Loading state -->
      <div v-else-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2">{{ t('purchaseHistory.loading') }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-4 text-red-600">
        {{ error }}
        <button
          @click="fetchOrders"
          class="mt-2 text-blue-600 hover:text-blue-800 underline"
        >
          {{ t('benefit.error.retry') }}
        </button>
      </div>

      <!-- Data table -->
      <template v-else>
        <table class="w-full border-collapse border border-gray-300 mt-4">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 p-2">{{ t('purchaseHistory.table.headers.orderId') }}</th>
              <th class="border border-gray-300 p-2">{{ t('purchaseHistory.table.headers.date') }}</th>
              <th class="border border-gray-300 p-2">{{ t('purchaseHistory.table.headers.items') }}</th>
              <th class="border border-gray-300 p-2">{{ t('purchaseHistory.table.headers.totalAmount') }}</th>
              <th class="border border-gray-300 p-2">{{ t('purchaseHistory.table.headers.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orders" :key="order.order_id">
              <td class="border border-gray-300 p-2">#{{ order.order_id }}</td>
              <td class="border border-gray-300 p-2">{{ formatDate(order.order_date) }}</td>
              <td class="border border-gray-300 p-2">
                <div v-for="item in order.items" :key="item.product_id" class="mb-1">
                  {{ item.order_item_name }} (x{{ item.product_quantity }})
                </div>
              </td>
              <td class="border border-gray-300 p-2">{{ formatAmount(order.order_total) }}</td>
              <td class="border border-gray-300 p-2">
                <span :class="getStatusClass(order.order_status)">
                  {{ t(`purchaseHistory.status.${order.order_status.replace('wc-', '')}`) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-4 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            {{ t('purchaseHistory.pagination.total', { count: totalOrders }) }}
          </div>
          <a-pagination
            v-model:current="currentPage"
            :total="totalOrders"
            :pageSize="pageSize"
            @change="handlePageChange"
            show-size-changer
            :pageSizeOptions="['10', '20', '50', '100']"
          />
        </div>
      </template>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { formatDate } from '@/utils/date'
import { purchaseApi } from '@/api/services/purchaseApi'
import { message } from 'ant-design-vue'
import { useI18nGlobal } from '@/i18n'
import * as XLSX from 'xlsx'

const { t } = useI18nGlobal()

// State
const brands = ref([
  { id: 1, name: 'Sky007' },
  { id: 2, name: 'Bbia' },
  { id: 3, name: 'Hince' },
  { id: 4, name: 'Mixsoon' }
])
const selectedBrand = ref<number | null>(null)
const orders = ref([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(0)
const exporting = ref(false)

// Methods
const fetchOrders = async () => {
  if (!selectedBrand.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await purchaseApi.getPurchaseHistory(
      selectedBrand.value,
      currentPage.value,
      pageSize.value
    )
    orders.value = response.data || []
    totalOrders.value = response.pagination?.total || 0
  } catch (err) {
    error.value = t('purchaseHistory.error')
    message.error(t('purchaseHistory.error'))
    orders.value = []
  } finally {
    loading.value = false
  }
}

// Watch for brand changes
watch(selectedBrand, () => {
  currentPage.value = 1
  fetchOrders()
})

// Lifecycle
onMounted(() => {
  // Set default brand
  selectedBrand.value = brands.value[0].id
})

const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

const getStatusClass = (status: string) => {
  const classes = {
    'completed': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'cancelled': 'bg-red-100 text-red-800',
    'processing': 'bg-blue-100 text-blue-800'
  }
  return classes[status.toLowerCase()] || 'bg-gray-100 text-gray-800'
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchOrders()
}

const handleSizeChange = (_current: number, size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchOrders()
}

const exportToExcel = async () => {
  if (!orders.value.length) return
  
  exporting.value = true
  try {
    const exportData = orders.value.map(order => ({
      'Mã đơn hàng': `#${order.order_id}`,
      'Ngày': formatDate(order.order_date),
      'Sản phẩm': order.items.map(item => `${item.order_item_name} (x${item.product_quantity})`).join(', '),
      'Tổng tiền': formatAmount(order.order_total),
      'Trạng thái': t(`purchaseHistory.status.${order.order_status.replace('wc-', '')}`)
    }))

    const ws = XLSX.utils.json_to_sheet(exportData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Orders')

    const brandName = brands.value.find(b => b.id === selectedBrand.value)?.name || 'unknown'
    const fileName = `purchase-history-${brandName}-${formatDate(new Date())}.xlsx`
    
    XLSX.writeFile(wb, fileName)
    message.success(t('common.exportSuccess'))
  } catch (err) {
    message.error(t('common.exportError'))
    console.error('Export failed:', err)
  } finally {
    exporting.value = false
  }
}
</script>

<style scoped>
.ant-pagination {
  @apply flex items-center;
}

.ant-pagination-item {
  @apply mx-1;
}

.ant-pagination-item-active {
  @apply bg-blue-600 border-blue-600 text-white;
}

.ant-select-selector {
  @apply h-8 min-w-[90px];
}
</style>