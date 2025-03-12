<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">{{ t('zaloCampaignList.title') }}</h2>
        </template>
        <template #extra>
          <a-button type="primary" @click="handleAdd">
            <template #icon><PlusOutlined /></template>
            {{ t('zaloCampaignList.buttons.add') }}
          </a-button>
        </template>
      </PageHeader>

      <div class="mb-6">
        <div class="bg-white p-4 rounded shadow">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('zaloCampaignList.filters.status.label') }}</label>
              <a-select
                v-model:value="filters.status"
                style="width: 100%"
                :placeholder="t('zaloCampaignList.filters.status.placeholder')"
                @change="handleSearch"
              >
                <a-select-option value="">{{ t('zaloCampaignList.filters.status.options.all') }}</a-select-option>
                <a-select-option value="Created">{{ t('zaloCampaignList.filters.status.options.pending') }}</a-select-option>
                  <a-select-option value="Processing">{{ t('zaloCampaignList.filters.status.options.processing') }}</a-select-option>
                <a-select-option value="Completed">{{ t('zaloCampaignList.filters.status.options.completed') }}</a-select-option>
                <a-select-option value="Failed">{{ t('zaloCampaignList.filters.status.options.failed') }}</a-select-option>
              </a-select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('zaloCampaignList.filters.search.label') }}</label>
              <a-input
                v-model:value="filters.search"
                :placeholder="t('zaloCampaignList.filters.search.placeholder')"
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
            <a-button @click="handleReset">{{ t('zaloCampaignList.buttons.reset') }}</a-button>
            <a-button type="primary" @click="handleSearch">{{ t('zaloCampaignList.buttons.search') }}</a-button>
          </div>
        </div>
      </div>

      <a-table
        :columns="columns"
        :data-source="campaigns"
        :loading="loading"
        :pagination="tablePagination"
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
                {{ t('zaloCampaignList.buttons.edit') }}
              </a-button>
              <a-button type="link" danger @click="handleDelete(record)">
                <template #icon><DeleteOutlined /></template>
                {{ t('zaloCampaignList.buttons.delete') }}
              </a-button>
            </a-space>
          </template>
        </template>
      </a-table>

      <a-modal
        v-model:visible="showDeleteConfirm"
        :title="t('zaloCampaignList.delete.title')"
        @ok="confirmDelete"
        @cancel="showDeleteConfirm = false"
        :ok-button-props="{ loading: deleting }"
      >
        <p>{{ t('zaloCampaignList.delete.message', { campaignName: selectedCampaign?.campaignName }) }}</p>
      </a-modal>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useI18nGlobal } from '@/i18n'
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import dayjs from 'dayjs'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { zaloAppPushApi } from '@/api/services/zaloAppPushApi'  

const { t } = useI18nGlobal()
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

const columns = computed(() => [
  {
    title: t('zaloCampaignList.table.columns.name'),
    dataIndex: 'campaignName',
    key: 'campaignName',
  },
  {
    title: t('zaloCampaignList.table.columns.status'),
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: t('zaloCampaignList.table.columns.totalRecipients'),
    dataIndex: 'total',
    key: 'total',
  },
  {
    title: t('zaloCampaignList.table.columns.remaining'),
    dataIndex: 'remaining',
    key: 'remaining',
  },
  {
    title: t('zaloCampaignList.table.columns.startDate'),
    dataIndex: 'startDate',
    key: 'startDate',
    render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
  },
  {
    title: t('zaloCampaignList.table.columns.endDate'),
    dataIndex: 'dueDate',
    key: 'dueDate',
    render: (text: string) => text ? dayjs(text).format('DD/MM/YYYY') : '-'
  },
  {
    title: t('zaloCampaignList.table.columns.actions'),
    key: 'action',
    fixed: 'right',
    width: 150
  }
])

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

const tablePagination = computed(() => ({
  ...pagination,
  showTotal: (total: number) => t('zaloCampaignList.table.pagination.total', { total })
}))

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

const deleting = ref(false)
const showDeleteConfirm = ref(false)
const selectedCampaign = ref<ZaloCampaign | null>(null)

const fetchAppPushCampaigns = async () => {
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

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/membership/get/get-campaign-list`, {
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
    message.error(error.message || t('zaloCampaign.messages.error.load'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchAppPushCampaigns()
}

const handleReset = () => {
  filters.status = ''
  filters.search = ''
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.current = pag.current || 1
  pagination.pageSize = pag.pageSize || 10
  fetchAppPushCampaigns()
}

const handleAdd = () => {
  router.push('/app-push/campaigns-zalo-oa/create-zalo-campaign')
}

const handleEdit = (campaign: ZaloCampaign) => {
  router.push(`/zalo/campaigns/${campaign.campaignId}/edit`)
}

const handleDelete = async (campaign: ZaloCampaign) => {
  selectedCampaign.value = campaign
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!selectedCampaign.value) return
  try {
    deleting.value = true
    await zaloAppPushApi.deleteAppPushCampaign(selectedCampaign.value.campaignId)
    message.success(t('zaloCampaign.messages.success.delete'))
    await fetchAppPushCampaigns()
  } catch (error) {
    console.error('Error deleting campaign:', error)
    message.error(t('zaloCampaign.messages.error.delete'))
  } finally {
    deleting.value = false
    showDeleteConfirm.value = false
  }
}

onMounted(() => {
  fetchAppPushCampaigns()
})
</script> 