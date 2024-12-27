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
      :pagination="pagination"
      :row-selection="rowSelection"
      :row-key="(record) => record.membershipWebsiteId"
      @change="handleTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'levelName'">
          <a-tag :color="getLevelColor(record.levelName)">{{ record.levelName }}</a-tag>
        </template>
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
      v-model:visible="sendMailModalVisible"
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
import { ref, reactive, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import type { TablePaginationConfig } from 'ant-design-vue'
import { membershipAPI } from '@/api/services/membershipApi'
import SendTemplateMailModal from '../SendTemplateMailModal.vue'
import type { Member } from '@/types/profile'

const emit = defineEmits<{
  (e: 'select', members: Member[]): void
  (e: 'send', members: any[]): void  // Thêm emit send
  (e: 'cancel'): void
}>()

const members = ref<Member[]>([])
const loading = ref(false)
const selectedRowKeys = ref<string[]>([])
const selectedMembers = ref<any[]>([])
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

const columns = [
  {
    title: 'Customer Name',
    dataIndex: 'fullName',
    width: 200
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
    slots: { customRender: 'level' },
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
    width: 120
  }
]

const rowSelection = reactive({
  selectedRowKeys,
  onChange: (keys: string[], rows: any[]) => {
    selectedRowKeys.value = keys
    selectedMembers.value = rows
  }
})

const fetchMembers = async () => {
  try {
    loading.value = true
    const searchParams = []
    
    if (filterForm.search) {
      searchParams.push({
        key: 'search',
        value: filterForm.search
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

    const response = await membershipAPI.getList(
      'MembershipsWebsitesId',
      'ASC',
      pagination.value.pageSize,
      pagination.value.current,
      searchParams
    )

    if (response) {
      members.value = response.data || []
      pagination.value.total = response.totalCount || 0
    }
  } catch (error) {
    console.error('Error fetching members:', error)
    message.error('Failed to load members')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.value.current = 1
  fetchMembers()
}

const handleTableChange = (pag: TablePaginationConfig) => {
  pagination.value = pag
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
  // 1. Cập nhật selectedRowKeys để uncheck trong table
  selectedRowKeys.value = memberIds
  // 2. Cập nhật selectedMembers dựa trên memberIds
  selectedMembers.value = members.value.filter(
    member => memberIds.includes(String(member.membershipWebsiteId))
  )
  // 3. Emit event để cập nhật parent
  emit('select', selectedMembers.value)
}

// Đảm bảo watch được kích hoạt khi selectedRowKeys thay đổi
watch(selectedRowKeys, (newKeys) => {
  rowSelection.selectedRowKeys = newKeys
}, { deep: true })

// Đảm bảo emit khi selectedMembers thay đổi
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