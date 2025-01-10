<template>
  <div class="campaign-tab">
    <a-form layout="vertical" :model="filterForm">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Campaign Name">
            <a-input v-model:value="filterForm.name" placeholder="Search campaign name" />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Status">
            <a-select v-model:value="filterForm.status" placeholder="Select status">
              <a-select-option value="Active">Active</a-select-option>
              <a-select-option value="Inactive">Inactive</a-select-option>
              <a-select-option value="Completed">Completed</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Website">
            <a-select v-model:value="filterForm.website" placeholder="Select website">
              <a-select-option value="hince">Hince</a-select-option>
              <a-select-option value="bbia">BBIA</a-select-option>
              <a-select-option value="mixsoon">Mixsoon</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>
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
      :row-selection="{
        type: 'checkbox',
        selectedRowKeys: selectedRowKeys,
        onChange: handleSelectionChange
      }"
      :row-key="(record: Campaign) => record.id"
      @change="handleTableChange"
    >
      <template #websiteName="{ record }">
        <a-tag>{{ record.websiteName }}</a-tag>
      </template>
    </a-table>

    <div class="flex justify-end py-4">
      <a-space>
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button 
          type="primary" 
          @click="handleSendMail"
        >
          Send by Campaign
        </a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { mailCampaignService } from '@/features/mail/services/mail-campaign.service'

interface Campaign {
  id: string
  name: string
  websiteId: string
  websiteName: string
  startDate: string
  endDate: string
  status: string
}

const emit = defineEmits<{
  (e: 'select', campaigns: Campaign[]): void
  (e: 'send', campaigns: Campaign[]): void
  (e: 'cancel'): void
}>()

// States
const campaigns = ref<Campaign[]>([])
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])
const selectedCampaigns = ref<Campaign[]>([])

const pagination = ref<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0
})

const filterForm = reactive({
  name: '',
  status: undefined,
  website: undefined
})

// Table columns
const columns = [
  {
    title: 'Campaign Name',
    dataIndex: 'name',
    width: 200
  },
  {
    title: 'Website',
    dataIndex: 'websiteId',
    slots: { customRender: 'websiteName' },
    width: 120
  },
  {
    title: 'Start Date',
    dataIndex: 'startDate',
    width: 120
  },
  {
    title: 'End Date',
    dataIndex: 'endDate',
    width: 120
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 120
  }
]

// Handlers
const handleSelectionChange = (keys: string[], rows: Campaign[]) => {
  selectedRowKeys.value = keys
  selectedCampaigns.value = rows
  emit('select', rows)
}

const clearSelection = () => {
  selectedRowKeys.value = []
  selectedCampaigns.value = []
  emit('select', [])
}

const updateSelection = (campaigns: Campaign[]) => {
  if (!Array.isArray(campaigns)) {
    throw new Error('Campaigns must be an array')
  }
  selectedCampaigns.value = campaigns
  selectedRowKeys.value = campaigns.map(c => c.id) // Cập nhật selectedRowKeys để uncheck
  emit('select', campaigns) // Emit để cập nhật parent
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = pag
  fetchCampaigns()
}

const handleCancel = () => {
  clearSelection()
  emit('cancel')
}

const handleSendMail = () => {
  if (!selectedCampaigns.value.length) {
    return message.error('Please select at least one campaign')
  }
  emit('send', selectedCampaigns.value)
}

// API call
const fetchCampaigns = async () => {
  try {
    loading.value = true
    const searchParams = []
    
    if (filterForm.name) {
      searchParams.push({ key: 'name', value: filterForm.name })
    }
    
    if (filterForm.status) {
      searchParams.push({ key: 'status', value: filterForm.status })
    }

    if (filterForm.website) {
      searchParams.push({ key: 'websiteId', value: filterForm.website })
    }

    const result = await mailCampaignService.getCampaignList({
      pageIndex: pagination.value.current,
      pageSize: pagination.value.pageSize,
      searchParams
    })

    if (result.data) {
      campaigns.value = result.data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        websiteId: campaign.websiteId,
        websiteName: campaign.websiteName,
        startDate: campaign.startDate,
        endDate: campaign.endDate,
        status: campaign.status
      }))
      pagination.value.total = result.pagination.totalCount
    }
  } catch (error) {
    console.error('Error fetching campaigns:', error)
    message.error('Failed to load campaigns')
  } finally {
    loading.value = false
  }
}

// Initial fetch
fetchCampaigns()

defineExpose({
  updateSelection
})
</script> 