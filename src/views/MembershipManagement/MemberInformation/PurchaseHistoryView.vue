<template>
  <DefaultLayout>
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h1 class="text-2xl font-bold text-center mb-8">Purchase History</h1>

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p class="mt-2">Loading purchase history...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="text-center py-4 text-red-600">
        {{ error }}
      </div>

      <!-- Data table -->
      <template v-else>
        <table class="w-full border-collapse border border-gray-300 mt-4">
          <thead class="bg-gray-100">
            <tr>
              <th class="border border-gray-300 p-2">Order ID</th>
              <th class="border border-gray-300 p-2">Date</th>
              <th class="border border-gray-300 p-2">Items</th>
              <th class="border border-gray-300 p-2">Total Amount</th>
              <th class="border border-gray-300 p-2">Status</th>
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
                  {{ order.order_status.replace('wc-', '') }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="mt-4 flex justify-between items-center">
          <div class="text-sm text-gray-600">
            Total {{ totalOrders }} orders
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
import { ref, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { formatDate } from '@/utils/date'
import { purchaseApi, type MemberOrder } from '@/api/services/purchaseApi'
import { message } from 'ant-design-vue'

// State
const orders = ref<MemberOrder[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)
const totalOrders = ref(0)

// Methods
const fetchOrders = async () => {
  loading.value = true
  try {
    const response = await purchaseApi.getPurchaseHistory(
      2,
      currentPage.value,
      pageSize.value
    )
    orders.value = response.data
    totalOrders.value = response.pagination.total
  } catch (err) {
    error.value = 'Failed to load purchase history'
    message.error('Failed to load purchase history')
    console.error(err)
  } finally {
    loading.value = false
  }
}

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

// Lifecycle
onMounted(() => {
  fetchOrders()
})
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