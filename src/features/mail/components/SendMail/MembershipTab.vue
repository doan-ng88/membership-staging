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
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item label="Level">
            <a-select v-model:value="filterForm.level" placeholder="Select level">
              <a-select-option value="Gold">Gold</a-select-option>
              <a-select-option value="Silver">Silver</a-select-option>
              <a-select-option value="Bronze">Bronze</a-select-option>
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
      :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        showTotal: (total: number) => t('membershipTabMail.table.pagination.total', { total: total })
      }"
      :row-selection="rowSelection"
      :row-key="(record: Member) => String(record.membershipWebsiteId)"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'levelName'">
          <a-tag :color="getLevelColor(record.levelName)">{{ record.levelName }}</a-tag>
        </template>
      </template>
      <template #websiteName="{ record }">
        <a-tag>{{ getWebsiteName(record.websiteId) }}</a-tag>
      </template>
    </a-table>

    <!-- Footer buttons -->
    <div class="flex justify-end py-4">
      <a-space>
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button 
          type="primary" 
          :loading="sending" 
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
import { useI18nGlobal } from '@/i18n'
import type { TablePaginationConfig } from 'ant-design-vue'
import { membershipAPI } from '@/api/services/membershipApi'
import SendTemplateMailModal from '../SendTemplateMailModal.vue'
import { getWebsiteName } from '@/api/types/website'

const { t } = useI18nGlobal()

// Use any for member types to avoid complex type issues
type Member = any;

const emit = defineEmits<{
  (e: 'select', members: Member[]): void
  (e: 'send', members: Member[]): void
  (e: 'cancel'): void
}>()

const members = ref<Member[]>([])
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])
const selectedMembers = ref<Member[]>([])
const pagination = ref<TablePaginationConfig>({
  current: 1,
  pageSize: 10,
  total: 0
})

const filterForm = reactive({
  search: '',
  level: undefined,
  website: undefined
})

const sendMailModalVisible = ref(false)
const selectedTemplate = ref(null)
const sending = ref(false)

const columns = computed(() => [
  {
    title: t('membershipTabMail.table.columns.name'),
    dataIndex: 'fullName',
    width: 200
  },
  {
    title: t('membershipTabMail.table.columns.phone'),
    dataIndex: 'mainPhoneNumber',
    width: 120
  },
  {
    title: t('membershipTabMail.table.columns.website'),
    dataIndex: 'websiteId',
    slots: { customRender: 'websiteName' },
    width: 120
  },
  {
    title: t('membershipTabMail.table.columns.level'),
    dataIndex: 'levelName',
    width: 100
  },
  {
    title: t('membershipTabMail.table.columns.registeredTime'),
    dataIndex: 'registeredTime',
    width: 150
  }
])

const rowSelection = reactive({
  selectedRowKeys,
  onChange: (keys: string[], rows: Member[]) => {
    selectedRowKeys.value = keys
    selectedMembers.value = rows
  }
})

const fetchMembers = async () => {
  try {
    loading.value = true
    const searchParams = []
    
    if (filterForm.search) {
      const isPhoneNumber = /^\d+$/.test(filterForm.search.trim())
      
      searchParams.push({
        key: isPhoneNumber ? 'mainPhoneNumber' : 'fullName', 
        value: filterForm.search.trim()
      })
    }

    if (filterForm.level) {
      searchParams.push({
        key: 'level',
        value: filterForm.level
      })
    }

    if (filterForm.website) {
      searchParams.push({
        key: 'website',
        value: filterForm.website
      })
    }

    console.log('Search params:', searchParams)
    console.log('Pagination:', pagination.value)

    const response = await membershipAPI.getList(
      'MembershipsWebsitesId',
      'ASC',
      pagination.value.pageSize,
      pagination.value.current,
      searchParams
    )

    if (response && response.data) {
      // Safely assign data while ensuring membershipWebsiteId is present
      members.value = response.data.data || []
      pagination.value.total = response.data.totalCount || 0
      
      if (selectedRowKeys.value.length > 0) {
        const validKeys = selectedRowKeys.value.filter(key => 
          members.value.some(member => String(member.membershipWebsiteId) === String(key))
        )
        selectedRowKeys.value = validKeys
      }
    }
  } catch (error) {
    console.error('Error fetching members:', error)
    message.error(t('membershipTabMail.messages.error.fetchFailed'))
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  fetchMembers()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value.current = pag.current || 1
  pagination.value.pageSize = pag.pageSize || 10
  
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
}

const updateSelection = (memberIds: string[]) => {
  selectedRowKeys.value = memberIds
  selectedMembers.value = members.value.filter(
    member => memberIds.includes(String(member.membershipWebsiteId))
  )
  emit('select', selectedMembers.value)
}

watch(selectedRowKeys, (newKeys) => {
  rowSelection.selectedRowKeys = newKeys
}, { deep: true })

watch(selectedMembers, (newMembers) => {
  emit('select', newMembers)
}, { deep: true })

onMounted(() => {
  fetchMembers()
})

defineExpose({
  updateSelection
})
</script>

<style scoped>
.membership-tab {
  /* Thêm style nếu cần */
}
</style>