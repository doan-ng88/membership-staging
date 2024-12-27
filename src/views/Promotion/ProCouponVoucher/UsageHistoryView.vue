<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Lịch Sử Sử Dụng Mã Giảm Giá</h2>

      <!-- Bộ lọc -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <a-select
              v-model:value="filters.websiteId"
              style="width: 100%"
              placeholder="Chọn website"
              @change="handleSearch"
            >
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <a-select
              v-model:value="filters.status"
              style="width: 100%"
              placeholder="Chọn trạng thái"
              @change="handleSearch"
            >
              <a-select-option value="">Tất cả</a-select-option>
              <a-select-option value="publish">Đang hoạt động</a-select-option>
              <a-select-option value="draft">Nháp</a-select-option>
              <a-select-option value="trash">Đã xóa</a-select-option>
            </a-select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm</label>
            <a-input
              v-model:value="filters.search"
              placeholder="Nhập mã giảm giá"
              @pressEnter="handleSearch"
              allowClear
            >
              <template #suffix>
                <SearchOutlined />
              </template>
            </a-input>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
            <a-range-picker
              v-model:value="filters.dateRange"
              style="width: 100%"
              @change="handleSearch"
              :placeholder="['Từ ngày', 'Đến ngày']"
            />
          </div>
        </div>

        <div class="flex justify-end mt-4 space-x-2">
          <a-button @click="handleReset">
            Đặt lại
          </a-button>
          <a-button type="primary" @click="handleSearch">
            Tìm kiếm
          </a-button>
        </div>
      </div>

      <!-- Bảng dữ liệu -->
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
              {{ getStatusText(record.status) }}
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
                Chi tiết
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </DefaultLayout>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, render, h } from 'vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import { Tag, Space, Button } from 'ant-design-vue'
import type { TablePaginationConfig, TableColumnType } from 'ant-design-vue'
import dayjs from 'dayjs'
import { message } from 'ant-design-vue'
import { useAuthStore } from '@/stores/auth'
import { websites } from '@/api/types/website'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

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

const columns: TableColumnType<Coupon>[] = [
  {
    title: 'Mã giảm giá',
    dataIndex: 'code',
    key: 'code',
    sorter: true,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    sorter: true,
    customRender: ({ record }) => h(Tag, {
      color: getStatusColor(record.status || '')
    }, () => getStatusText(record.status || ''))
  },
  {
    title: 'Loại giảm giá',
    key: 'discount_type',
    dataIndex: 'discount_type',
    sorter: true,
    customRender: ({ text }) => h(Tag, {
      color: getDiscountTypeConfig(text).color
    }, () => getDiscountTypeConfig(text).label)
  },
  {
    title: 'Giá trị',
    key: 'discount',
    customRender: ({ record }) => h('span', {
      style: {
        color: record.discount_type ? getDiscountTypeConfig(record.discount_type).color : 'inherit',
        fontWeight: 'bold'
      }
    }, formatDiscount(record.discount_type, record.amount))
  },
  {
    title: 'Giới hạn đơn hàng',
    key: 'order_limit',
    customRender: ({ record }) => 
      `${formatCurrency(record.minimum_amount)} - ${formatCurrency(record.maximum_amount)}`
  },
  {
    title: 'Thời gian',
    key: 'date_range',
    customRender: ({ record }) => {
      console.log('start_date:', record.start_date) // Debug
      console.log('expiry_date:', record.expiry_date) // Debug
      const start = formatDate(record.start_date)
      const end = formatDate(record.expiry_date)
      return `${start} - ${end}`
    }
  },
  {
    title: 'Usage',
    key: 'usage',
    customRender: ({ record }) => 
      `${record.times_used || 0}/${record.usage_limit || '∞'} (${record.usage_limit_per_user}/user)`
  },
  {
    title: 'Thao tác',
    key: 'action',
    customRender: ({ record }) => h('div', [
      h(Button, { 
        type: 'link',
        onClick: () => viewDetails(record)
      }, () => 'Chi tiết')
    ])
  }
]

// Pagination config
const pagination = reactive<TablePaginationConfig>({
  total: 0,
  current: 1,
  pageSize: 10,
  showSizeChanger: true,
  showTotal: (total) => `Tổng ${total} mã giảm giá`
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
    message.error('Không thể tải danh sách mã giảm giá')
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
  const texts = {
    publish: 'Đang hoạt động',
    draft: 'Nháp',
    trash: 'Đã xóa'
  }
  return texts[status as keyof typeof texts] || status
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
</style>
