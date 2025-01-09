<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">{{ t('zaloTemplate.title') }}</h2>

      <!-- Filters -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('zaloTemplate.filters.status.label') }}</label>
            <a-select
              v-model:value="filters.status"
              style="width: 100%"
              :placeholder="t('zaloTemplate.filters.status.placeholder')"
              @change="handleSearch"
            >
              <a-select-option value="0">{{ t('zaloTemplate.filters.status.options.all') }}</a-select-option>
              <a-select-option value="1">{{ t('zaloTemplate.filters.status.options.approved') }}</a-select-option>
              <a-select-option value="2">{{ t('zaloTemplate.filters.status.options.pending') }}</a-select-option>
              <a-select-option value="3">{{ t('zaloTemplate.filters.status.options.rejected') }}</a-select-option>
              <a-select-option value="4">{{ t('zaloTemplate.filters.status.options.disabled') }}</a-select-option>
            </a-select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('zaloTemplate.filters.search.label') }}</label>
            <a-input
              v-model:value="filters.search"
              :placeholder="t('zaloTemplate.filters.search.placeholder')"
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
          <a-button @click="handleReset">{{ t('zaloTemplate.filters.buttons.reset') }}</a-button>
          <a-button type="primary" @click="handleSearch">{{ t('zaloTemplate.filters.buttons.search') }}</a-button>
        </div>
      </div>

      <!-- Template Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="template in templates" :key="template.templateId" 
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow h-[600px]">
          <!-- Preview iframe -->
          <div class="aspect-w-16 aspect-h-9 h-[450px]">
            <iframe
              v-if="template.previewUrl"
              :src="template.previewUrl"
              class="w-full h-full border-none"
              sandbox="allow-same-origin allow-scripts"
              loading="lazy"
            ></iframe>
            <div v-else class="flex items-center justify-center h-full bg-gray-200">
              <FileImageOutlined class="text-4xl text-gray-400" />
            </div>
          </div>
          
          <div class="p-4">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-medium truncate flex-1">{{ template.templateName }}</h3>
              <a-tag :color="getStatusColor(template.status)">
                {{ getStatusText(template.status) }}
              </a-tag>
            </div>
            
            <div class="text-sm text-gray-500">
              ID: {{ template.templateId }}
            </div>
            
            <div class="text-sm text-gray-500">
              {{ formatDate(template.createdTime) }}
            </div>

            <div class="mt-4 flex justify-end space-x-2">
                
              <a-button type="link" size="small" @click="viewTemplate(template)">
                <template #icon><EyeOutlined /></template>
                {{ t('zaloTemplate.template.actions.view') }}
              </a-button>
              <a-button type="link" size="small" @click="editTemplate(template)">
                <template #icon><EditOutlined /></template>
                {{ t('zaloTemplate.template.actions.edit') }}
              </a-button>
                            <!-- <a-button 
                type="link" 
                size="small" 
                @click="sendTemplate(template)"
                :disabled="template.status !== 'ENABLE'"
              >
                <template #icon><SendOutlined /></template>
                Gửi
              </a-button> -->
              <a-button 
                type="link" 
                size="small" 
                @click="sendTemplate(template)"
              >
                <template #icon><SendOutlined /></template>
                {{ t('zaloTemplate.template.actions.send') }}
              </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- Preview Modal -->
      <a-modal
        v-model:open="previewModal.visible"
        :title="previewModal.template?.templateName"
        :footer="null"
        width="800px"
      >
        <iframe
          v-if="previewModal.template?.previewUrl"
          :src="previewModal.template.previewUrl"
          class="w-full"
          style="height: 600px; border: none;"
          sandbox="allow-same-origin allow-scripts"
        ></iframe>
      </a-modal>

      <!-- Phân trang -->
      <div class="mt-6 flex justify-center">
        <a-pagination
          v-model:current="pagination.current"
          :total="pagination.total"
          :pageSize="pagination.pageSize"
          :showTotal="(total: any, range: any[]) => `${range[0]}-${range[1]} của ${total} mục`"
          :showSizeChanger="true"
          :pageSizeOptions="['10', '20', '50']"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
        />
      </div>
    </div>

    <!-- Send Template Drawer -->
    <a-drawer
      v-model:open="showSendDrawer"
      title="{{ t('zaloTemplate.drawer.title') }}"
      placement="right"
      width="80%"
      :destroyOnClose="true"
      @close="handleCloseSendDrawer"
    >
      <div class="flex items-center justify-between border-gray-200 mb-4">
        <div class="flex-1">
          <a-tabs v-model:activeKey="activeKey">
            <a-tab-pane key="campaign" tab="{{ t('zaloTemplate.drawer.tabs.campaign') }}" />
            <a-tab-pane key="membership" tab="{{ t('zaloTemplate.drawer.tabs.membership') }}" />
          </a-tabs>
        </div>

        <div class="flex gap-2 pr-4">
          <a-upload
            accept=".xlsx,.xls"
            :showUploadList="false"
            :beforeUpload="handleExcelUpload"
          >
            <a-button class="flex items-center">
              <FileExcelOutlined class="flex-shrink-0" />
              <span class="ml-2">{{ t('zaloTemplate.drawer.upload.button') }}</span>
            </a-button>
          </a-upload>
        </div>
      </div>

      <div class="px-4">
        <div v-if="activeKey === 'campaign'">
          <CampaignTab ref="campaignTabRef" @select="handleCampaignSelected" @send="handleShowSendZaloModal" />
        </div>
        <div v-else>
          <MembershipTab ref="membershipTabRef" @selected="handleMembershipSelected" />
        </div>
      </div>
<!-- 
      <template #footer>
        <div class="flex justify-end gap-2">
          <a-button @click="handleCloseSendDrawer">Hủy</a-button>
          <a-button 
            type="primary" 
            :loading="sending" 
            @click="handleShowSendZaloModal"
            :disabled="!selectedCampaigns.length"
          >
            <template #icon><SendOutlined /></template>
            Tiếp tục
          </a-button>
        </div>
      </template> -->
    </a-drawer>

    <!-- Thêm SendTemplateZaloModal -->
    <SendTemplateZaloModal
      v-model:open="showSendZaloModal"
      :template="currentTemplate"
      :selected-campaigns="selectedCampaigns"
      mode="campaign"
      @success="handleSendSuccess"
      @cancel="handleSendCancel"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { SearchOutlined, EyeOutlined, EditOutlined, FileImageOutlined, FileExcelOutlined, SendOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { TablePaginationConfig } from 'ant-design-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import CampaignTab from '@/features/mail/components/SendMail/CampaignTab.vue'
import MembershipTab from '@/features/mail/components/SendMail/MembershipTab.vue'
import SendTemplateZaloModal from '@/features/mail/components/SendTemplateZaloModel.vue'
import { useI18nGlobal } from '@/i18n'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18nGlobal()

const authStore = useAuthStore()

interface ZaloTemplate {
  templateId: number
  templateName: string
  createdTime: number
  status: 'ENABLE' | 'PENDING_REVIEW' | 'REJECT' | 'DISABLE'
  templateQuality: string
  previewUrl: string
}

interface PaginationResponse {
  code: string
  result: string
  message: string
  currentPage: number
  pageSize: number
  totalCount: number
  source: {
    error: number
    message: string
    data: ZaloTemplate[]
    metadata: {
      total: number
    }
  }
}

const templates = ref<ZaloTemplate[]>([])
const loading = ref(false)
const currentTemplate = ref<ZaloTemplate | null>(null)

const filters = reactive({
  status: '0',
  search: ''
})


const handleSendSuccess = () => {
  showSendZaloModal.value = false
  message.success('Gửi tin nhắn thành công')
  handleCloseSendDrawer()
}

const handleSendCancel = () => {
  showSendZaloModal.value = false
}

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const previewModal = reactive({
  visible: false,
  template: null as ZaloTemplate | null
})

const activeKey = ref('campaign')
const showSendDrawer = ref(false)
const sending = ref(false)
const selectedItems = ref<any[]>([])
const selectedCampaigns = ref<any[]>([])
const showSendZaloModal = ref(false)
const templateData = ref<any>(null)

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'ENABLE': 'success',
    'PENDING_REVIEW': 'processing',
    'REJECT': 'error',
    'DISABLE': 'default'
  }
  return colors[status] || 'default'
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    'ENABLE': 'Approved',
    'PENDING_REVIEW': 'Pending Review',
    'REJECT': 'Rejected',
    'DISABLE': 'Disabled'
  }
  return texts[status] || status
}

const formatDate = (timestamp: number) => {
  if (!timestamp) return '-'
  return dayjs(timestamp).format('DD/MM/YYYY HH:mm')
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/placeholder-image.png'
}

const fetchTemplates = async () => {
  try {
    loading.value = true
    
    let url = `${import.meta.env.VITE_API_BASE_URL}/membership/zalo/templates?page=${pagination.current}&pageSize=${pagination.pageSize}`
    
    if (filters.status !== '0') {
      url += `&status=${filters.status}`
    }
    
    if (filters.search) {
      url += `&search=${encodeURIComponent(filters.search)}`
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error('Failed to fetch templates')
    }

    const data: PaginationResponse = await response.json()
    if (data.result === 'Success') {
      templates.value = data.source.data
      pagination.total = data.totalCount
      pagination.current = data.currentPage + 1
      pagination.pageSize = data.pageSize
    } else {
      throw new Error(data.message)
    }
  } catch (error) {
    console.error('Error fetching templates:', error)
    message.error('Không thể tải danh sách template')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchTemplates()
}

const handleReset = () => {
  filters.status = '0'
  filters.search = ''
  handleSearch()
}

const handlePageChange = (page: number, pageSize?: number) => {
  pagination.current = page
  if (pageSize) {
    pagination.pageSize = pageSize
  }
  fetchTemplates()
}

const handleSizeChange = (current: number, size: number) => {
  pagination.current = 1
  pagination.pageSize = size
  fetchTemplates()
}

const viewTemplate = (template: ZaloTemplate) => {
  if (template.previewUrl) {
    previewModal.template = template
    previewModal.visible = true
  } else {
    message.warning('Không có link xem trước cho template này')
  }
}

const editTemplate = (template: ZaloTemplate) => {
  // TODO: Implement edit template
  console.log('Edit template:', template)
}

const sendTemplate = async (template: ZaloTemplate) => {
  try {
    // if (template.status !== 'ENABLE') {
    //   message.warning('Chỉ có thể gửi template đã được duyệt')
    //   return
    // }
    currentTemplate.value = template
    console.log('Selected template:', currentTemplate.value)
    showSendDrawer.value = true
  } catch (error) {
    console.error('Error preparing send template:', error)
    message.error('Không thể chuẩn bị gửi template')
  }
}

// Thêm các hàm xử lý
const handleCloseSendDrawer = () => {
  showSendDrawer.value = false
  activeKey.value = 'campaign'
}

const handleExcelUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('Only Excel files are supported!')
    return false
  }
  return true
}

const handleCampaignSelected = (campaigns: any[]) => {
  console.log('Selected campaigns:', campaigns)
  selectedCampaigns.value = campaigns
  selectedItems.value = campaigns
}

const handleMembershipSelected = (members: any[]) => {
  console.log('Selected members:', members)
  selectedItems.value = members
}

const handleSend = async () => {
  if (!selectedItems.value.length) {
    return message.warning('Please select recipients')
  }

  try {
    sending.value = true
    const sendData = {
      mode: activeKey.value,
      items: selectedItems.value,
    }
    
    console.log('Sending data:', sendData)
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('Template sent successfully')
    showSendDrawer.value = false
  } catch (error) {
    console.error('Error sending template:', error)
    message.error('Failed to send template')
  } finally {
    sending.value = false
  }
}

const handleShowSendZaloModal = () => {
  if (!selectedCampaigns.value.length) {
    return message.warning('Please select at least one campaign')
  }
  showSendZaloModal.value = true
}

onMounted(() => {
  fetchTemplates()
})
</script>

<style scoped>
.aspect-w-16 {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
}

.aspect-w-16 iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* Thêm style cho iframe trong grid */
iframe {
  background: white;
}
</style> 