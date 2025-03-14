<template>
  <div class="membership-tab">
    <a-form layout="vertical" :model="filterForm">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-form-item label="Search">
            <a-input-search
              v-model:value="filterForm.search"
              placeholder="Search by name, email, phone..."
              @search="handleSearch"
              allowClear
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Level">
            <a-select 
              v-model:value="filterForm.level" 
              placeholder="Select level"
              allowClear
              optionFilterProp="label"
            >
              <a-select-option 
                v-for="level in levelOptions" 
                :key="level.value" 
                :value="level.value"
                :label="level.label"
              >
                {{ level.label }}
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
        Selected: {{ selectedMembers.length }} members
      </span>
      <a-button 
        v-if="selectedMembers.length > 0"
        type="link" 
        @click="clearSelection"
      >
        Clear Selection
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :data-source="members"
      :loading="loading"
      :pagination="pagination"
      :row-selection="rowSelection"
      :row-key="(record) => record.membershipWebsiteId"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'levelName'">
          <a-tag :color="getLevelColor(record.levelName)">{{ record.levelName }}</a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'registeredTime'">
          {{ formatDate(record.registeredTime) }}
        </template>
        <template v-else-if="column.dataIndex === 'phoneNumber'">
          {{ record.phoneNumber || record.mainPhoneNumber }}
        </template>
      </template>
      
      <template #emptyText>
        <div class="text-center py-8">
          <p class="text-gray-500">No members found</p>
          <p class="text-sm text-gray-400">Try adjusting your search filters</p>
        </div>
      </template>
    </a-table>

    <!-- Footer buttons -->
    <div class="flex justify-end py-4">
      <a-space>
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button 
          type="primary" 
          :loading="sending" 
          :disabled="selectedMembers.length === 0"
          @click="showSendMailModal"
        >
          Send by Membership
        </a-button>
      </a-space>
    </div>

    <!-- Send Mail Modal -->
    <!-- <SendTemplateMailModal
      v-model:open="sendMailModalVisible"
      :template="selectedTemplate"
      :selectedMembers="selectedMembers"
      mode="membership"
      @success="handleSendMailSuccess"
      @cancel="handleSendMailCancel"
      @removeMember="handleRemoveMember"
    /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { membershipAPI } from '@/api/services/membershipApi'
import SendTemplateMailModal from '../SendTemplateMailModal.vue'
import dayjs from 'dayjs'
import { useI18nGlobal } from '@/i18n'
import type { 
  MembershipTabMember,
  ApiMember,
  MemberListResponse,
  MembershipTabPagination,
  MembershipTabFilter
} from '@/features/zalo-campaign/types/zalo-membershipTab.types'

const emit = defineEmits<{
  (e: 'select', members: MembershipTabMember[]): void
  (e: 'send', members: MembershipTabMember[]): void
  (e: 'cancel'): void
}>()

const { t } = useI18nGlobal()

const members = ref<MembershipTabMember[]>([])
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])
const selectedMembers = ref<MembershipTabMember[]>([])
const pagination = ref<MembershipTabPagination>({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ['10', '20', '50'],
})

const filterForm = reactive<MembershipTabFilter>({
  search: '',
  level: undefined,
  websiteId: undefined
})

const sendMailModalVisible = ref(false)
const selectedTemplate = ref(null)
const sending = ref(false)

const levelOptions = ref([
  { value: 'Gold', label: 'Gold' },
  { value: 'Silver', label: 'Silver' },
  { value: 'Bronze', label: 'Bronze' }
])

const websiteOptions = ref([
  { id: 1, name: 'Hince' },
  { id: 2, name: 'BBIA' },
  { id: 3, name: 'Mixsoon' }
])

const columns = [
  {
    title: 'Customer Name',
    dataIndex: 'fullName',
    width: 200,
    sorter: true
  },
  {
    title: 'Email',
    dataIndex: 'email',
    width: 200
  },
  {
    title: 'Phone',
    dataIndex: 'phoneNumber',
    width: 150
  },
  {
    title: 'Level',
    dataIndex: 'levelName',
    width: 120
  },
  {
    title: 'Website',
    dataIndex: 'websiteName',
    width: 120
  },
  {
    title: 'Join Date',
    dataIndex: 'registeredTime',
    width: 120,
    sorter: true
  }
]

const rowSelection = reactive({
  selectedRowKeys,
  onChange: (keys: string[], rows: MembershipTabMember[]) => {
    selectedRowKeys.value = keys
    selectedMembers.value = rows
  }
})

// Format date helper
const formatDate = (dateString?: string) => {
  if (!dateString) return '-'
  return dayjs(dateString).format('DD/MM/YYYY')
}

const fetchMembers = async () => {
  try {
    loading.value = true
    
    // Thêm logging để debug
    console.log('Request params:', {
      pageSize: pagination.value.pageSize,
      pageIndex: pagination.value.current
    })

    const searchParams: Array<{key: string, value: any}> = []
    
    if (filterForm.search) {
      searchParams.push({ 
        key: 'search', 
        value: filterForm.search,
        operator: 'CONTAINS' 
      })
    }
    if (filterForm.level) {
      searchParams.push({
        key: 'levelName',
        value: filterForm.level,
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

    const params = {
      sortField: 'MembershipsWebsitesId',
      sortType: 'ASC',
      pageSize: pagination.value.pageSize,
      pageIndex: pagination.value.current,
      searchParams
    }

    const response = await membershipAPI.getList(
      params.sortField,
      params.sortType,
      params.pageSize,
      params.pageIndex,
      params.searchParams
    ) as MemberListResponse

    console.log('API response:', {
      receivedPageSize: response.pageSize, // Kiểm tra giá trị thực tế nhận được
      dataLength: response.data.length
    })

    if (response.code === 200) {
      // Map data từ API sang type của component
      members.value = response.data.map((item: ApiMember) => ({
        membershipWebsiteId: String(item.membershipWebsiteId),
        membershipId: item.membershipId,
        email: item.email,
        fullName: item.fullName,
        phoneNumber: item.mainPhoneNumber,
        points: item.points,
        level: item.level,
        levelName: item.levelName,
        websiteName: getWebsiteName(item.websiteId),
        registeredTime: item.registeredTime,
        latestOrder: item.latestOrder ? {
          orderId: item.latestOrder.orderId,
          orderIdWebsite: item.latestOrder.orderIdWebsite,
          totalAmount: item.latestOrder.totalAmount,
          createTime: item.latestOrder.createTime,
          orderStatus: item.latestOrder.orderStatus,
          paymentMethod: item.latestOrder.paymentMethod,
          earnPoints: item.latestOrder.earnPoints
        } : undefined
      }))

      // Cập nhật pagination từ API response
      pagination.value = {
        ...pagination.value,
        current: response.pageIndex,
        pageSize: response.pageSize,
        total: response.totalCount
      }

      // Cập nhật selection
      updateSelectionAfterFetch()
    }
  } catch (error) {
    handleFetchError(error)
  } finally {
    loading.value = false
  }
}

// Helper functions
const getWebsiteName = (websiteId: number): string => {
  const website = websiteOptions.value.find(w => w.id === websiteId)
  return website?.name || `Website ${websiteId}`
}

const updateSelectionAfterFetch = () => {
  if (selectedRowKeys.value.length > 0) {
    const validKeys = selectedRowKeys.value.filter(key => 
      members.value.some(member => String(member.membershipWebsiteId) === key)
    )
    selectedRowKeys.value = validKeys
    selectedMembers.value = members.value.filter(
      member => validKeys.includes(String(member.membershipWebsiteId))
    )
  }
}

const handleFetchError = (error: unknown) => {
  console.error('Error fetching members:', error)
  message.error('Failed to load members')
}

const handleSearch = () => {
  pagination.value.current = 1
  fetchMembers()
}

const handleResetFilters = () => {
  filterForm.search = ''
  filterForm.level = undefined
  filterForm.websiteId = undefined
  pagination.value.current = 1
  fetchMembers()
}

const handleTableChange = (pag: TablePaginationConfig, filters: any, sorter: any) => {
  console.log('Table change:', pag, filters, sorter)
  
  // Update pagination
  pagination.value = {
    ...pagination.value,
    current: pag.current || 1,
    pageSize: pag.pageSize || 10
  }
  
  // Handle sorting if needed
  // if (sorter.field && sorter.order) {
  //   // Update sorting logic here
  // }
  
  fetchMembers()
}

const clearSelection = () => {
  selectedRowKeys.value = []
  selectedMembers.value = []
  emit('select', [])
}

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    Gold: 'gold',
    Silver: 'silver',
    Bronze: 'brown'
  }
  return colors[level] || 'default'
}

const showSendMailModal = () => {
  if (!selectedMembers.value.length) {
    message.warning('Please select at least one member')
    return
  }
  emit('send', selectedMembers.value)  
  sendMailModalVisible.value = true
}

const handleSendMailSuccess = () => {
  sendMailModalVisible.value = false
  fetchMembers()
  clearSelection()
  message.success('Mail sent successfully')
}

const handleSendMailCancel = () => {
  sendMailModalVisible.value = false
}

const handleCancel = () => {
  clearSelection()
  emit('cancel')
}

const updateSelection = (memberIds: string[]) => {
  selectedRowKeys.value = memberIds
  selectedMembers.value = members.value.filter(
    member => memberIds.includes(String(member.membershipWebsiteId))
  )
  emit('select', selectedMembers.value)
}

// Watchers
watch(selectedRowKeys, (newKeys) => {
  rowSelection.selectedRowKeys = newKeys
}, { deep: true })

watch(selectedMembers, (newMembers) => {
  emit('select', newMembers)
}, { deep: true })

// Lifecycle hooks
onMounted(() => {
  fetchMembers()
})

// Expose methods to parent component
defineExpose({
  updateSelection,
  fetchMembers,
  clearSelection
})
</script>

<style scoped>

/* Thêm style cho empty state */
.ant-empty-description {
  color: #8c8c8c;
}
</style>