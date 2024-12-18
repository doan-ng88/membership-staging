
<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Lịch Sử Sử Dụng Mã Giảm Giá</h2>

      <!-- Bộ lọc -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <!-- Website Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <a-select
              v-model:value="filters.websiteId"
              style="width: 100%"
              @change="handleSearch"
            >
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </div>

          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <a-select
              v-model:value="filters.status"
              style="width: 100%"
              @change="handleSearch"
            >
              <a-select-option value="all">Tất cả</a-select-option>
              <a-select-option value="draft">Nháp</a-select-option>
              <a-select-option value="future">Sắp tới</a-select-option>
              <a-select-option value="publish">Đang hoạt động</a-select-option>
            </a-select>
          </div>

          <!-- Date Range -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-1">Thời gian</label>
            <a-range-picker
              v-model:value="filters.dateRange"
              style="width: 100%"
              @change="handleSearch"
            />
          </div>
        </div>
      </div>

      <!-- Data Table -->
      <a-table
        :columns="columns"
        :data-source="coupons"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <!-- Custom Columns -->
        <template #bodyCell="{ column, record }">
          <!-- Status Column -->
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <!-- Discount Column -->
          <template v-if="column.key === 'discount'">
            <span>
              {{ formatDiscount(record.discount_type, record.coupon_amount) }}
            </span>
          </template>

          <!-- Date Column -->
          <template v-if="column.key === 'expiry_date'">
            <span>{{ formatDate(record.expiry_date) }}</span>
          </template>

          <!-- Usage Column -->
          <template v-if="column.key === 'usage'">
            <span>
              {{ record.total_used }}/{{ record.usage_limit || '∞' }}
            </span>
          </template>
        </template>
      </a-table>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import dayjs from 'dayjs'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { websites } from '@/api/types/website'

export default defineComponent({
  name: 'UsageHistoryView',
  
  components: {
    DefaultLayout
  },

  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const coupons = ref([])

    // Filters
    const filters = reactive({
      websiteId: 2,
      status: 'all',
      dateRange: [dayjs().startOf('year'), dayjs().endOf('year')]
    })

    // Table Columns
    const columns = [
      {
        title: 'Mã giảm giá',
        dataIndex: 'code',
        key: 'code'
      },
      {
        title: 'Trạng thái',
        dataIndex: 'status',
        key: 'status'
      },
      {
        title: 'Giảm giá',
        key: 'discount'
      },
      {
        title: 'Ngày hết hạn',
        key: 'expiry_date'
      },
      {
        title: 'Đã sử dụng/Giới hạn',
        key: 'usage'
      }
    ]

    // Pagination
    const pagination = reactive<TablePaginationConfig>({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `Tổng ${total} mã giảm giá`
    })

    // Methods
    const fetchCoupons = async () => {
      try {
        loading.value = true
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/membership/get/coupon-list`,
          {
            params: {
              website_id: filters.websiteId,
              from: filters.dateRange[0].format('YYYY-MM-DD'),
              to: filters.dateRange[1].format('YYYY-MM-DD'),
              page: pagination.current
            },
            headers: {
              Authorization: `Bearer ${authStore.token}`
            }
          }
        )

        const { data, totalCount, currentPage, pageSize } = response.data
        coupons.value = data
        pagination.total = totalCount
        pagination.current = currentPage
        pagination.pageSize = pageSize
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

    const handleTableChange = (newPagination: TablePaginationConfig) => {
      pagination.current = newPagination.current || 1
      fetchCoupons()
    }

    const getStatusColor = (status: string) => {
      const colors = {
        draft: 'gray',
        future: 'blue',
        publish: 'green'
      }
      return colors[status as keyof typeof colors] || 'default'
    }

    const getStatusText = (status: string) => {
      const texts = {
        draft: 'Nháp',
        future: 'Sắp tới',
        publish: 'Đang hoạt động'
      }
      return texts[status as keyof typeof texts] || status
    }

    const formatDiscount = (type: string, amount: number) => {
      if (type === 'percent') {
        return `${amount}%`
      }
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount)
    }

    const formatDate = (timestamp: string) => {
      return timestamp ? dayjs(parseInt(timestamp) * 1000).format('DD/MM/YYYY') : 'N/A'
    }

    onMounted(() => {
      fetchCoupons()
    })

    return {
      loading,
      coupons,
      filters,
      columns,
      pagination,
      websites,
      handleSearch,
      handleTableChange,
      getStatusColor,
      getStatusText,
      formatDiscount,
      formatDate
    }
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
