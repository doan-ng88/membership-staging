<template>
  <div class="campaign-tab">
    <a-form layout="vertical" :model="filterForm">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Campaign Name">
            <a-input-search
              v-model:value="filterForm.name"
              placeholder="Search campaign name"
              @search="handleSearch"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Status">
            <a-select 
              v-model:value="filterForm.status" 
              placeholder="Select status"
              allowClear
              optionFilterProp="label"
            >
              <a-select-option 
                v-for="status in statusOptions" 
                :key="status.value"
                :value="status.value"
                :label="status.label"
              >
                {{ status.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Website">
            <a-select 
              v-model:value="filterForm.websiteId" 
              placeholder="Select website"
              allowClear
              optionFilterProp="label"
            >
              <a-select-option 
                v-for="website in websiteOptions" 
                :key="website.id"
                :value="website.id"
                :label="website.name"
              >
                {{ website.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
      <div class="flex justify-end mb-4">
        <a-space>
          <a-button @click="handleResetFilters">Reset Filters</a-button>
          <a-button type="primary" @click="handleSearch">Search</a-button>
        </a-space>
      </div>
    </a-form>

    <div class="mb-4 flex justify-between items-center">
      <span class="text-gray-600">
        Selected: {{ selectedCampaigns.length }} campaigns
      </span>
      <a-button 
        v-if="selectedCampaigns.length > 0"
        type="link" 
        @click="clearSelection"
      >
        Clear Selection
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="campaigns"
      :loading="loading"
      :pagination="pagination"
      :row-selection="rowSelection"
      :row-key="(record) => record.id"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'status'">
          <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'startDate'">
          {{ formatDate(record.startDate) }}
        </template>
        <template v-else-if="column.dataIndex === 'endDate'">
          {{ formatDate(record.endDate) }}
        </template>
        <template v-else-if="column.dataIndex === 'websiteName'">
          {{ record.websiteName }}
        </template>
      </template>
      
      <template #emptyText>
        <div class="text-center py-8">
          <p class="text-gray-500">No campaigns found</p>
          <p class="text-sm text-gray-400">Try adjusting your search filters</p>
        </div>
      </template>
    </a-table>

    <div class="flex justify-end py-4">
      <a-space>
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button 
          type="primary" 
          @click="handleSendPush"
          :disabled="selectedCampaigns.length === 0"
        >
          Send App Push
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { appCampaignService } from '../api/appPushCampaignApi'
import dayjs from 'dayjs'
import { useI18nGlobal } from '@/i18n'
import type { 
  AppCampaign,
  AppCampaignPagination,
  AppCampaignFilter
} from '../types/appPushCampaign.types'

const { t } = useI18nGlobal()

const emit = defineEmits<{
  (e: 'select', campaigns: AppCampaign[]): void
  (e: 'send', campaigns: AppCampaign[]): void
  (e: 'cancel'): void
}>()

// Reactive states
const campaigns = ref<AppCampaign[]>([])
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])
const selectedCampaigns = ref<AppCampaign[]>([])

const pagination = ref<AppCampaignPagination>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50']
})

const filterForm = reactive<AppCampaignFilter>({
  name: '',
  status: undefined,
  websiteId: undefined
})

const statusOptions = ref([
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'FAILED', label: 'Failed' }
])

const websiteOptions = ref([
  { id: 1, name: 'Hince' },
  { id: 2, name: 'BBIA' },
  { id: 3, name: 'Mixsoon' }
])

// Table columns
const columns = [
  {
    title: 'Campaign Name',
    dataIndex: 'name',
    width: 200,
    sorter: true
  },
  {
    title: 'Website',
    dataIndex: 'websiteName',
    width: 120
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    width: 120,
    sorter: true
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    width: 120,
    sorter: true
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 120
  },
  {
    title: 'Recipients',
    dataIndex: 'totalRecipients',
    width: 100
  }
]

// Row selection config
const rowSelection = reactive({
  selectedRowKeys,
  onChange: (keys: string[], rows: AppCampaign[]) => {
    selectedRowKeys.value = keys
    selectedCampaigns.value = rows
    emit('select', rows)
  }
})

// Fetch campaigns from API
const fetchCampaigns = async () => {
  try {
    loading.value = true
    
    const searchParams: Array<{key: string, value: any}> = []
    
    if (filterForm.name) {
      searchParams.push({ 
        key: 'name', 
        value: filterForm.name,
        operator: 'CONTAINS'
      })
    }
    
    if (filterForm.status) {
      searchParams.push({
        key: 'status',
        value: filterForm.status,
        operator: 'EQUALS'
      })
    }
    
    if (filterForm.websiteId) {
      searchParams.push({
        key: 'websiteId',
        value: filterForm.websiteId,
        operator: 'EQUALS'
      })
    }

    const response = await appCampaignService.getAppCampaignList({
      pageIndex: pagination.value.current || 1,
      pageSize: pagination.value.pageSize || 10,
      searchParams
    })

    if (response.code === 200) {
      campaigns.value = response.data
      pagination.value = {
        ...pagination.value,
        current: response.pagination.pageIndex,
        pageSize: response.pagination.pageSize,
        total: response.pagination.totalCount
      }
      updateSelectionAfterFetch()
    }
  } catch (error) {
    console.error('[CampaignTab] Error fetching campaigns:', error)
    message.error(t('appPushCampaign.messages.error.fetchFailed'))
    campaigns.value = []
    pagination.value.total = 0
  } finally {
    loading.value = false
  }
}

// Helpers
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('DD/MM/YYYY')
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    DRAFT: 'blue',
    ACTIVE: 'green',
    COMPLETED: 'geekblue',
    FAILED: 'red'
  }
  return colors[status] || 'default'
}

const updateSelectionAfterFetch = () => {
  if (selectedRowKeys.value.length > 0) {
    const validKeys = selectedRowKeys.value.filter(key => 
      campaigns.value.some(campaign => campaign.id === key)
    )
    selectedRowKeys.value = validKeys
    selectedCampaigns.value = campaigns.value.filter(
      campaign => validKeys.includes(campaign.id)
    )
  }
}

// Event handlers
const handleSearch = () => {
  pagination.value.current = 1
  fetchCampaigns()
}

const handleResetFilters = () => {
  filterForm.name = ''
  filterForm.status = undefined
  filterForm.websiteId = undefined
  handleSearch()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = {
    ...pagination.value,
    current: pag.current || 1,
    pageSize: pag.pageSize || 10
  }
  fetchCampaigns()
}

const clearSelection = () => {
  selectedRowKeys.value = []
  selectedCampaigns.value = []
  emit('select', [])
}

const handleSendPush = () => {
  if (!selectedCampaigns.value.length) {
    message.error('Please select at least one campaign')
    return
  }
  emit('send', selectedCampaigns.value)
}

const handleCancel = () => {
  clearSelection()
  emit('cancel')
}

// Lifecycle
onMounted(() => {
  fetchCampaigns()
})

// Expose methods
defineExpose({
  refresh: fetchCampaigns,
  clearSelection
})
</script>

<style scoped>
.campaign-tab {
  @apply bg-white p-6 rounded-lg shadow-md;
}

.ant-tag {
  @apply uppercase text-xs font-medium;
}
</style> 