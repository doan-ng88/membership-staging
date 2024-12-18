
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

      <!-- Existing content - chỉ hiển thị khi không loading và không có error -->
      <template v-else>
        <!-- Section Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold flex items-center">
            Member Purchase History
          </h2>
          <div class="flex items-center space-x-4">
            <input 
              type="text" 
              v-model="searchTerm"
              placeholder="Search Order ID" 
              class="p-2 border rounded-lg"
            >
            <button 
              @click="handleExport"
              class="bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Export Data
            </button>
          </div>
        </div>

        <!-- Table -->
        <table class="w-full border-collapse border border-gray-300">
          <thead class="bg-gray-100">
            <tr>
              <th 
                v-for="header in tableHeaders" 
                :key="header"
                class="border border-gray-300 p-2 text-left"
              >
                {{ header }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in filteredOrders" :key="order.orderId">
              <td class="border border-gray-300 p-2">{{ order.orderId }}</td>
              <td class="border border-gray-300 p-2">{{ order.memberId }}</td>
              <td class="border border-gray-300 p-2">{{ formatDate(order.orderDate) }}</td>
              <td class="border border-gray-300 p-2">{{ order.product }}</td>
              <td class="border border-gray-300 p-2">{{ formatAmount(order.amount) }}</td>
              <td class="border border-gray-300 p-2">
                <span 
                  :class="getStatusClass(order.status)"
                  class="px-3 py-1 rounded-full text-sm text-white"
                >
                  {{ order.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { defineComponent, ref, computed } from 'vue'
import type { PurchaseOrder } from '@/types/profile'
import { purchaseApi } from '@/api/purchaseApi'
import { onMounted } from 'vue'

export default defineComponent({
  components: {
    DefaultLayout
  },

  name: 'PurchaseHistory',

  setup() {
    const searchTerm = ref('')
    const orders = ref([])
    const loading = ref(false)
    const error = ref(null)

    const tableHeaders = [
      'Order ID',
      'Member ID',
      'Order Date',
      'Product',
      'Amount ($)',
      'Shipping Status'
    ]

    const fetchOrders = async () => {
      loading.value = true
      try {
        const response = await purchaseApi.getPurchaseHistory()
        orders.value = response.data
      } catch (err) {
        error.value = 'Failed to load purchase history'
        console.error(err)
      } finally {
        loading.value = false
      }
    }

    const filteredOrders = computed(() => {
      if (!searchTerm.value) return orders.value
      
      return orders.value.filter(order => 
        order.orderId.toLowerCase().includes(searchTerm.value.toLowerCase())
      )
    })

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString()
    }

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    }

    const getStatusClass = (status: string) => {
      const classes = {
        'Shipped': 'bg-blue-600',
        'Pending': 'bg-yellow-500',
        'Not Shipped': 'bg-gray-500'
      }
      return classes[status as keyof typeof classes] || 'bg-gray-500'
    }

    const handleExport = () => {
      // Implement export logic
      console.log('Exporting purchase history...')
    }

    onMounted(() => {
      fetchOrders()
    })

    return {
      searchTerm,
      tableHeaders,
      filteredOrders,
      formatDate,
      formatAmount,
      getStatusClass,
      handleExport,
      loading,
      error
    }
  }
})
</script>
  
  <style scoped>
  .purchase-history {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .purchase-history h1 {
    text-align: center;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    text-align: left;
  }
  
  th {
    background-color: #f9fafb;
  }
  
  tr:nth-child(even) {
    background-color: #f2f2f2;
  }
  
  button:disabled {
    cursor: not-allowed;
  }
  </style>
  <!-- End all code generated by Cursor -->