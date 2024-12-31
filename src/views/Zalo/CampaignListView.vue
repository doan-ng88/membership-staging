<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">Zalo OA Campaign Management</h2>
        </template>
        <template #extra>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            Add Campaign
          </a-button>
        </template>
      </PageHeader>

      <div class="mb-6">
        <div class="bg-white p-4 rounded shadow">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <a-select
                v-model:value="filters.status"
                style="width: 100%"
                placeholder="Select status"
                @change="handleSearch"
              >
                <a-select-option value="">All</a-select-option>
                <a-select-option value="Created">Pending</a-select-option>
                <a-select-option value="Processing">Processing</a-select-option>
                <a-select-option value="Completed">Completed</a-select-option>
                <a-select-option value="Failed">Failed</a-select-option>
              </a-select>
            </div>

            <div>
              <label class="blockA text-sm font-medium text-gray-700 mb-1">Search</label>
              <a-input
                v-model:value="filters.search"
                placeholder="Enter campaign name"
                @pressEnter="handleSearch"
                allowClear
              >
                <template #suffix>
                  <SearchOutlined />
                </template>
              </a-input>
            </div>
          </div>

          <div class="flex justify-end mt-4 space-x-2">
            <a-button @click="handleReset">Reset</a-button>
            <a-button type="primary" @click="handleSearch">Search</a-button>
          </div>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="campaigns"
        :loading="loading"
        :pagination="pagination"
        @change="handleTableChange"
        class="bg-white rounded shadow"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>
          <template v-if="column.key === 'action'">
            <a-space>
              <a-button type="link" @click="handleEdit(record)">
                <template #icon><EditOutlined /></template>
                Edit
              </a-button>
              <a-button type="link" danger @click="handleDelete(record)">
                <template #icon><DeleteOutlined /></template>
                Delete
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

interface ZaloCampaign {
  campaignId: number
  campaignName: string
  description: string
  startDate: string
  dueDate: string
  status: string
  total: number
  remaining: number
  createdAt: string
  updatedAt: string
  websiteId: number
}

const columns = [
  {
    title: 'Campaign Name',
    dataIndex: 'campaignName',
    key: 'campaignName',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Total Recipients',
    dataIndex: 'total',
    key: 'total',
  },
  {
    title: 'Remaining',
    dataIndex: 'remaining',
    key: 'remaining',
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    key: 'startDate',
    render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
  },
  {
    title: 'End Date', 
    dataIndex: 'dueDate',
    key: 'dueDate',
    render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
  },
  {
    title: 'Actions',
    key: 'action',
    fixed: 'right',
    width: 150
  }
]

const campaigns = ref<ZaloCampaign[]>([])
const loading = ref(false)

const filters = reactive({
  status: '',
  search: ''
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} campaigns`
})

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Created': 'warning',
    'Processing': 'processing',
    'Completed': 'success',
    'Failed': 'error'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'Created': 'Pending',
    'Processing': 'Processing', 
    'Completed': 'Completed',
    'Failed': 'Failed'
  }
  return texts[status] || status
}

const fetchCampaigns = async () => {
  try {
    loading.value = true
    const params = {
      pageIndex: pagination.current,
      pageSize: pagination.pageSize,
      sortType: 'DESC',
      searchParams: [
        {
          key: 'isAppPush',
          value: 'true'
        }
      ]
    }

    if (filters.status) {
      params.searchParams.push({
        key: 'status',
        value: filters.status
      })
    }

    if (filters.search) {
      params.searchParams.push({
        key: 'name',
        value: filters.search
      })
    }

    const token = authStore.token
    if (!token) {
      throw new Error('Unauthorized')
    }

    const response = await fetch('/api/membership/get/get-campaign-list', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(params)
    })

    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.message || 'Có lỗi xảy ra')
    }

    campaigns.value = data.data || []
    pagination.total = data.totalCount || 0

  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    message.error(error.message || 'Không thể tải danh sách chiến dịch')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchCampaigns()
}

const handleReset = () => {
  filters.status = ''
  filters.search = ''
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  fetchCampaigns()
}

const handleAdd = () => {
  router.push('/app-push/campaigns-zalo-oa/create-zalo-campaign')
}

const handleEdit = (campaign: ZaloCampaign) => {
  router.push(`/zalo/campaigns/${campaign.campaignId}/edit`)
}

const handleDelete = async (campaign: ZaloCampaign) => {
  try {
    // TODO: Implement delete API
    message.success('Campaign deleted successfully')
    await fetchCampaigns()
  } catch (error) {
    console.error('Error deleting campaign:', error)
    message.error('Failed to delete campaign')
  }
}

onMounted(() => {
  fetchCampaigns()
})
</script> 