
<template>
    <DefaultLayout>
      <div class="point-reward mx-auto max-w-1200 px-4">
        <!-- <BreadcrumbDefault :pageTitle="pageTitle" /> -->
        <h1 class="text-2xl font-bold mb-6">Point Reward Management</h1>
  
        <!-- Thông tin tổng quan -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-700">Total Current Points</h3>
            <p class="text-2xl font-bold text-green-600">{{ totalPoints }}</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-700">Points Expiring Soon</h3>
            <p class="text-2xl font-bold text-red-600">{{ expiringPoints }}</p>
            <p class="text-sm text-gray-500">In next 30 days</p>
          </div>
          <div class="bg-white p-4 rounded-lg shadow">
            <h3 class="text-lg font-semibold text-gray-700">Points Used</h3>
            <p class="text-2xl font-bold text-blue-600">{{ usedPoints }}</p>
            <p class="text-sm text-gray-500">This month</p>
          </div>
        </div>
  
        <!-- Điều chỉnh điểm thủ công -->
        <div class="bg-white p-4 rounded-lg shadow mb-6">
          <h2 class="text-xl font-semibold mb-4">Manual point adjustment</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Customer ID</label>
              <input
                v-model="adjustment.customerId"
                type="text"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter customer ID"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Points</label>
              <input
                v-model="adjustment.points"
                type="number"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter points"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Adjustment Type</label>
              <select
                v-model="adjustment.type"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="add">Add Points</option>
                <option value="subtract">Subtract Points</option>
              </select>
            </div>
          </div>
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700">Adjustment Reason</label>
            <textarea
              v-model="adjustment.reason"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="2"
            ></textarea>
          </div>
          <button
            @click="adjustPoints"
            class="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Apply Adjustment
          </button>
        </div>
  
        <!-- Lịch sử điểm thưởng -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b">
            <h2 class="text-xl font-semibold">Point Earning Usage History</h2>
            <!-- Bộ lọc -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Transaction Type</label>
                <select
                  v-model="filters.type"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="all">All</option>
                  <option value="earn">Earned</option>
                  <option value="use">Used</option>
                  <option value="expire">Expired</option>
                  <option value="adjust">Adjusted</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">From Date</label>
                <input
                  type="date"
                  v-model="filters.startDate"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">To Date</label>
                <input
                  type="date"
                  v-model="filters.endDate"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div class="flex items-end">
                <button
                  @click="applyFilters"
                  class="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 w-full"
                >
                  Filter
                </button>
              </div>
            </div>
          </div>
  
          <!-- Bảng lịch sử -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="history in pointHistory" :key="history.id">
                  <td class="px-6 py-4 whitespace-nowrap">{{ history.date }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="getTypeClass(history.type)">
                      {{ getTypeText(history.type) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap" :class="history.points > 0 ? 'text-green-600' : 'text-red-600'">
                    {{ history.points > 0 ? '+' : '' }}{{ history.points }}
                  </td>
                  <td class="px-6 py-4">{{ history.description }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ history.expiryDate || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <!-- Phân trang -->
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div class="flex justify-between items-center w-full">
              <div class="text-sm text-gray-700">
                Showing {{ pagination.from }}-{{ pagination.to }} of {{ pagination.total }} results
              </div>
              <div class="flex space-x-2">
                <button
                  @click="changePage(pagination.currentPage - 1)"
                  :disabled="pagination.currentPage === 1"
                  class="px-3 py-1 border rounded"
                  :class="pagination.currentPage === 1 ? 'bg-gray-100' : 'hover:bg-gray-50'"
                >
                  Previous
                </button>
                <button
                  @click="changePage(pagination.currentPage + 1)"
                  :disabled="pagination.currentPage === pagination.totalPages"
                  class="px-3 py-1 border rounded"
                  :class="pagination.currentPage === pagination.totalPages ? 'bg-gray-100' : 'hover:bg-gray-50'"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, reactive } from 'vue'
  import { message } from 'ant-design-vue'
  // import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  
  export default defineComponent({
    name: 'PointRewardView',
    components: {
      // BreadcrumbDefault,
      DefaultLayout
    },
    setup() {
      // const pageTitle = ref('Quản Lý Điểm Thưởng')
      const totalPoints = ref(1250)
      const expiringPoints = ref(100)
      const usedPoints = ref(450)
  
      const adjustment = reactive({
        customerId: '',
        points: 0,
        type: 'add',
        reason: ''
      })
  
      const filters = reactive({
        type: 'all',
        startDate: '',
        endDate: ''
      })
  
      const pagination = reactive({
        currentPage: 1,
        totalPages: 5,
        total: 100,
        from: 1,
        to: 20
      })
  
      // Mock data for demonstration
      const pointHistory = ref([
        {
          id: 1,
          date: '2024-03-15',
          type: 'earn',
          points: 100,
          description: 'Purchase',
          expiryDate: '2025-03-15'
        },
        {
          id: 2,
          date: '2024-03-14',
          type: 'use',
          points: -50,
          description: 'Redemption',
          expiryDate: null
        },
        {
          id: 3,
          date: '2024-03-13',
          type: 'adjust',
          points: 25,
          description: 'Manual adjustment',
          expiryDate: '2025-03-13'
        }
      ])
  
      const getTypeClass = (type: string) => {
        const classes = {
          earn: 'text-green-600 bg-green-100',
          use: 'text-blue-600 bg-blue-100',
          expire: 'text-red-600 bg-red-100',
          adjust: 'text-yellow-600 bg-yellow-100'
        }
        return `px-2 py-1 rounded-full text-xs ${classes[type as keyof typeof classes] || ''}`
      }
  
      const getTypeText = (type: string) => {
        const texts = {
          earn: 'Earned',
          use: 'Used',
          expire: 'Expired',
          adjust: 'Adjusted'
        }
        return texts[type as keyof typeof texts] || type
      }
  
      const adjustPoints = () => {
        // TODO: Implement points adjustment logic
        message.success('Đã điều chỉnh điểm thành công')
        // Reset form
        adjustment.customerId = ''
        adjustment.points = 0
        adjustment.reason = ''
      }
  
      const applyFilters = () => {
        // TODO: Implement filter logic
        console.log('Applying filters:', filters)
      }
  
      const changePage = (page: number) => {
        pagination.currentPage = page
        // TODO: Implement pagination logic
      }
  
      return {
        // pageTitle,
        totalPoints,
        expiringPoints,
        usedPoints,
        adjustment,
        filters,
        pointHistory,
        pagination,
        getTypeClass,
        getTypeText,
        adjustPoints,
        applyFilters,
        changePage
      }
    }
  })
  </script>
  
  <style scoped>
  .point-reward {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .point-reward h1 {
    text-align: center;
  }
  </style> 
  