<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">{{ t('couponHistory.title') }}</h2>

      <!-- Filters -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('couponHistory.filters.website.label') }}
            </label>
            <a-select
              v-model:value="filters.websiteId"
              style="width: 100%"
              :placeholder="t('couponHistory.filters.website.placeholder')"
              @change="handleSearch"
            >
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('couponHistory.filters.status.label') }}
            </label>
            <a-select
              v-model:value="filters.status"
              style="width: 100%"
              :placeholder="t('couponHistory.filters.status.placeholder')"
              @change="handleSearch"
            >
              <a-select-option value="">{{ t('couponHistory.filters.status.options.all') }}</a-select-option>
              <a-select-option value="publish">{{ t('couponHistory.filters.status.options.publish') }}</a-select-option>
              <a-select-option value="draft">{{ t('couponHistory.filters.status.options.draft') }}</a-select-option>
              <a-select-option value="trash">{{ t('couponHistory.filters.status.options.trash') }}</a-select-option>
            </a-select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('couponHistory.filters.search.label') }}
            </label>
            <a-input
              v-model:value="filters.search"
              :placeholder="t('couponHistory.filters.search.placeholder')"
              @pressEnter="handleSearch"
              allowClear
            >
              <template #suffix>
                <SearchOutlined />
              </template>
            </a-input>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('couponHistory.filters.dateRange.label') }}
            </label>
            <a-range-picker
              v-model:value="filters.dateRange"
              style="width: 100%"
              @change="handleSearch"
              :placeholder="[
                t('couponHistory.filters.dateRange.placeholder.start'),
                t('couponHistory.filters.dateRange.placeholder.end')
              ]"
            />
          </div>
        </div>

        <div class="flex justify-end mt-4 space-x-2">
          <a-button @click="handleReset">
            {{ t('couponHistory.filters.buttons.reset') }}
          </a-button>
          <a-button type="primary" @click="handleSearch">
            {{ t('couponHistory.filters.buttons.search') }}
          </a-button>
        </div>
      </div>

      <!-- Table -->
      <a-table
        :columns="columns"
        :data-source="coupons"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ t(`couponHistory.table.status.${record.status}`) }}
            </a-tag>
          </template>
          
          <template v-if="column.key === 'discount'">
            {{ formatDiscount(record.discount_type, record.amount) }}
          </template>

          <template v-if="column.key === 'usage'">
            {{ record.times_used }}/{{ record.usage_limit || '∞' }}
          </template>

          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="viewDetails(record)">
                {{ t('couponHistory.table.actions.details') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { SearchOutlined } from '@ant-design/icons-vue'
import { Tag, Space, Button } from 'ant-design-vue'
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { websites } from '@/api/types/website'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const { t } = useI18n()
const authStore = useAuthStore()
const loading = ref(false)
const coupons = ref([])

// Filters state
const filters = reactive({
  websiteId: undefined as number | undefined,
  status: '',
  search: '',
  dateRange: null as any,
})

interface Coupon {
  id: number
  code: string
  description: string
  status: string
  discount_type: string
  amount: number
  start_date: string
  expiry_date: string
  minimum_amount: number
  maximum_amount: number
  usage_limit: number
  usage_limit_per_user: number
  times_used: number
}

type ColumnRenderType = (text: any, record: Coupon) => any;

// Thêm hàm format date
const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  if (dateString.includes('1970')) return '-'
  
  try {
    // Xử lý string date có timezone
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '-'
    return dayjs(date).format('DD/MM/YYYY')
  } catch {
    return '-'
  }
}

interface DiscountTypeConfig {
  label: string
  color: string
}

const discountTypeConfig: Record<string, DiscountTypeConfig> = {
  'fixed_cart': {
    label: 'Order',
    color: 'blue'
  },
  'percent': {
    label: '%',
    color: 'green'
  },
  'fixed_product': {
    label: 'Product',
    color: 'purple'
  }
}

const getDiscountTypeConfig = (type: string): DiscountTypeConfig => {
  return discountTypeConfig[type] || { label: '-', color: 'default' }
}

const columns = computed<TableColumnType<Coupon>[]>(() => [
  {
    title: t('couponHistory.table.columns.code'),
    dataIndex: 'code',
    key: 'code',
    sorter: true,
  },
  {
    title: t('couponHistory.table.columns.status'),
    dataIndex: 'status',
    key: 'status',
    sorter: true,
  },
  {
    title: t('couponHistory.table.columns.discountType'),
    key: 'discount_type',
    dataIndex: 'discount_type',
    sorter: true,
  },
  {
    title: t('couponHistory.table.columns.orderLimit'),
    key: 'order_limit',
    customRender: ({ record }) => 
      `${formatCurrency(record.minimum_amount)} - ${formatCurrency(record.maximum_amount)}`
  },
  {
    title: t('couponHistory.table.columns.time'),
    key: 'date_range',
    customRender: ({ record }) => {
      const start = formatDate(record.start_date)
      const end = formatDate(record.expiry_date)
      return `${start} - ${end}`
    }
  },
  {
    title: t('couponHistory.table.columns.usage'),
    key: 'usage',
    customRender: ({ record }) => 
      `${record.times_used || 0}/${record.usage_limit || '∞'} (${record.usage_limit_per_user}/user)`
  },
  {
    title: t('couponHistory.table.columns.actions'),
    key: 'action',
  }
])

// Pagination config
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => t('couponHistory.table.pagination.total', { total })
})

// Methods
const buildSearchParams = () => {
  const searchParams = []
  
  if (filters.search) {
    searchParams.push({ key: 'search', value: filters.search })
  }
  
  if (filters.status) {
    searchParams.push({ key: 'status', value: filters.status })
  }

  if (filters.dateRange?.[0]) {
    searchParams.push({ 
      key: 'from_date', 
      value: dayjs(filters.dateRange[0]).format('YYYY-MM-DD')
    })
  }

  if (filters.dateRange?.[1]) {
    searchParams.push({ 
      key: 'to_date', 
      value: dayjs(filters.dateRange[1]).format('YYYY-MM-DD')
    })
  }

  return searchParams
}

const fetchCoupons = async (params = {
  sortField: 'id',
  sortType: 'DESC'
}) => {
  if (!filters.websiteId) return

  try {
    loading.value = true
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/coupon-list/${filters.websiteId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authStore.token}`
        },
        body: JSON.stringify({
          pageIndex: pagination.current,
          pageSize: pagination.pageSize,
          ...params,
          searchParams: buildSearchParams()
        })
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch coupons')
    }

    const data = await response.json()
    coupons.value = data.data
    pagination.total = data.totalCount
    pagination.current = data.currentPage
    pagination.pageSize = data.pageSize

  } catch (error) {
    console.error('Error fetching coupons:', error)
    message.error(t('couponHistory.messages.error.load'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchCoupons()
}

const handleReset = () => {
  filters.status = ''
  filters.search = ''
  filters.dateRange = null
  handleSearch()
}

const handleTableChange = (newPagination: TablePaginationConfig, _: any, sorter: any) => {
  pagination.current = newPagination.current || 1
  pagination.pageSize = newPagination.pageSize || 10

  const params: any = {}
  if (sorter.field) {
    params.sortField = sorter.field
    params.sortType = sorter.order === 'ascend' ? 'ASC' : 'DESC'
  }

  fetchCoupons(params)
}

// Helper functions
const getStatusColor = (status: string) => {
  const colors = {
    publish: 'green',
    draft: 'gold',
    trash: 'red'
  }
  return colors[status as keyof typeof colors] || 'default'
}

const getStatusText = (status: string) => {
  return t(`couponHistory.table.status.${status}`) || status
}

const formatDiscount = (type: string, amount: number) => {
  if (!type || !amount) return '-'
  if (type === 'percent') {
    return `${amount}%`
  }
  if (type === 'fixed_cart') {
    return formatCurrency(amount)
  }
  return '-'
}

const viewDetails = (record: any) => {
  // TODO: Implement view details
  console.log('View details:', record)
}

// Thêm helper function format tiền
const formatCurrency = (amount: number) => {
  if (!amount) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Initial fetch
onMounted(() => {
  if (filters.websiteId) {
    fetchCoupons()
  }
})
</script>

<style scoped>
.usage-history {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.usage-history h1 {
  text-align: center;
}

:deep(.ant-select-item-option-content img) {
  object-fit: cover;
  border-radius: 4px;
}
</style>
