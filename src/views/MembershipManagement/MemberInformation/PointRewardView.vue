<template>
    <DefaultLayout>
      <div class="point-reward mx-auto max-w-1200 px-4">
        <h1 class="text-2xl font-bold text-center mb-6">{{ t('pointReward.title') }}</h1>
  
        <!-- Manual Point Adjustment Card -->
        <div class="bg-white rounded-lg shadow-lg mb-6">
          <div class="p-4">
            <h2 class="text-lg font-semibold text-gray-800 mb-4">{{ t('pointReward.manualAdjustment.title') }}</h2>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- Membership Website ID -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pointReward.manualAdjustment.fields.customerId.label') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="adjustment.membershipWebsiteId"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  :placeholder="t('pointReward.manualAdjustment.fields.customerId.placeholder')"
                />
              </div>
  
              <!-- Points -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pointReward.manualAdjustment.fields.points.label') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model.number="adjustment.points"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  :placeholder="t('pointReward.manualAdjustment.fields.points.placeholder')"
                />
              </div>
  
              <!-- Reason -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  {{ t('pointReward.manualAdjustment.fields.reason.label') }} <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="adjustment.reason"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
  
            <!-- Action Buttons -->
            <div class="mt-4 flex justify-end space-x-2">
              <button
                @click="resetForm"
                type="button"
                class="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
              >
                {{ t('pointReward.manualAdjustment.reset') }}
              </button>
              <button
                @click="adjustPoints"
                :disabled="loading"
                class="px-3 py-1.5 bg-blue-600 text-sm text-white rounded hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
              >
                <a-spin v-if="loading" :size="small" class="mr-1" />
                <span>{{ t('pointReward.manualAdjustment.button') }}</span>
              </button>
            </div>
          </div>
        </div>
  
        <!-- Lịch sử điểm thưởng -->
        <div class="bg-white rounded-lg shadow">
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-semibold text-gray-800">{{ t('pointReward.history.title') }}</h2>
            </div>

            <!-- Filters Section -->
            <div class="flex flex-wrap items-end gap-4">
              <!-- Transaction Type Filter -->
              <div class="min-w-[200px]">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">
                  {{ t('pointReward.history.filters.type.label') }}
                </label>
                <a-select
                  v-model:value="filters.type"
                  class="w-full"
                  :options="Object.entries(transactionTypes).map(([key, value]) => ({
                    value: key,
                    label: t(`pointReward.history.filters.type.options.${key}`)
                  }))"
                  :placeholder="t('pointReward.history.filters.type.placeholder')"
                />
              </div>

              <!-- Date Range Filter -->
              <div class="flex-grow max-w-[350px]">
                <label class="block text-sm font-medium text-gray-600 mb-1.5">
                  {{ t('pointReward.history.filters.date.label') }}
                </label>
                <a-range-picker
                  v-model:value="dateRange"
                  class="w-full"
                  :placeholder="['Start date', 'End date']"
                  format="DD/MM/YYYY"
                  :allowClear="true"
                />
              </div>

              <!-- Filter Buttons -->
              <div class="flex gap-2">
                <a-button
                  @click="resetFilters"
                  class="border-gray-300 text-gray-600 hover:text-gray-800"
                >
                  <template #icon>
                    <reload-outlined />
                  </template>
                  {{ t('pointReward.history.filters.reset') }}
                </a-button>
                <a-button
                  type="primary"
                  @click="applyFilters"
                  :loading="loading"
                >
                  <template #icon>
                    <search-outlined />
                  </template>
                  {{ t('pointReward.history.filters.button') }}
                </a-button>
              </div>
            </div>
          </div>
  
          <!-- Bảng lịch sử -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th v-for="header in ['date', 'type', 'points', 'description', 'expiry']" 
                      :key="header" 
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {{ t(`pointReward.history.table.headers.${header}`) }}
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
                {{ t('pointReward.history.pagination.showing', { 
                  from: pagination.from, 
                  to: pagination.to, 
                  total: pagination.total 
                }) }}
              </div>
              <div class="flex space-x-2">
                <button
                  @click="changePage(pagination.currentPage - 1)"
                  :disabled="pagination.currentPage === 1"
                  class="px-3 py-1 border rounded"
                  :class="pagination.currentPage === 1 ? 'bg-gray-100' : 'hover:bg-gray-50'"
                >
                  {{ t('pointReward.history.pagination.previous') }}
                </button>
                <button
                  @click="changePage(pagination.currentPage + 1)"
                  :disabled="pagination.currentPage === pagination.totalPages"
                  class="px-3 py-1 border rounded"
                  :class="pagination.currentPage === pagination.totalPages ? 'bg-gray-100' : 'hover:bg-gray-50'"
                >
                  {{ t('pointReward.history.pagination.next') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { message } from 'ant-design-vue'
  import DefaultLayout from '@/layouts/DefaultLayout.vue'
  import { useI18nGlobal } from '@/i18n'
  import { membershipAPI } from '@/api/services/membershipApi'
  import type { Dayjs } from 'dayjs'
  import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
  
  const { t } = useI18nGlobal()
  
  // State for point adjustment
  interface PointAdjustment {
    membershipWebsiteId: string
    points: number
    type: 'add' | 'subtract'
    reason: string
  }
  
  const adjustment = reactive<PointAdjustment>({
    membershipWebsiteId: '',
    points: 0,
    type: 'add',
    reason: ''
  })
  
  const loading = ref(false)
  
  const adjustPoints = async () => {
    if (!adjustment.membershipWebsiteId || !adjustment.points || !adjustment.reason) {
      message.error('Please fill in all required fields')
      return
    }
  
    try {
      loading.value = true
      await membershipAPI.updateMembershipPoint({
        membershipWebsiteId: Number(adjustment.membershipWebsiteId),
        points: adjustment.points,
        reason: adjustment.reason
      })
      message.success(t('pointReward.manualAdjustment.success'))
      resetForm()
    } catch (error) {
      console.error('Error adjusting points:', error)
      message.error('Failed to adjust points')
    } finally {
      loading.value = false
    }
  }
  
  // Define transaction types
  const transactionTypes = {
    all: 'All',
    earn: 'Earned',
    use: 'Used',
    expire: 'Expired',
    adjust: 'Adjusted'
  }
  
  // Define filters state
  const filters = reactive({
    type: 'all'
  })
  
  const pagination = reactive({
    currentPage: 1,
    totalPages: 5,
    total: 100,
    from: 1,
    to: 20
  })
  
  // Mock data
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
  
  // Methods
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
    return t(`pointReward.history.filters.type.options.${type}`)
  }
  
  // Date range state
  const dateRange = ref<[Dayjs, Dayjs]>()
  
  const resetFilters = () => {
    filters.type = 'all'
    dateRange.value = undefined
  }
  
  const applyFilters = async () => {
    try {
      loading.value = true
      const [startDate, endDate] = dateRange.value || [null, null]
      
      console.log('Applying filters:', {
        type: filters.type,
        startDate: startDate?.format('YYYY-MM-DD'),
        endDate: endDate?.format('YYYY-MM-DD')
      })
      
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulated API call
    } catch (error) {
      message.error('Failed to apply filters')
    } finally {
      loading.value = false
    }
  }
  
  const changePage = (page: number) => {
    pagination.currentPage = page
  }
  
  const resetForm = () => {
    Object.assign(adjustment, {
      membershipWebsiteId: '',
      points: 0,
      reason: ''
    })
  }
  </script>
  
  <style scoped>
  .point-reward {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
  }
  
  input:focus {
    outline: none;
  }

  /* Add these styles to match the design */
  .ant-picker {
    padding: 4px 11px;
    border-radius: 6px;
  }

  .ant-picker:hover {
    border-color: #1890ff;
  }

  .ant-picker-focused {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }

  :deep(.ant-select-selector) {
    height: 32px !important;
    padding: 0 11px !important;
  }

  :deep(.ant-picker) {
    height: 32px;
    padding: 0 11px;
  }

  :deep(.ant-select:not(.ant-select-disabled):hover .ant-select-selector),
  :deep(.ant-picker:hover),
  :deep(.ant-btn:hover) {
    border-color: #1890ff;
  }

  :deep(.ant-select-focused:not(.ant-select-disabled).ant-select:not(.ant-select-customize-input) .ant-select-selector),
  :deep(.ant-picker-focused) {
    border-color: #1890ff;
    box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
  }
  </style> 
  