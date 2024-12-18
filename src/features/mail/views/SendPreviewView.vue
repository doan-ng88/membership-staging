<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">Gửi Email</h2>
        </template>
        <template #extra>
          <a-space>
            <a-button @click="router.back()">
              Quay lại
            </a-button>
            <a-button type="primary" :loading="sending" @click="handleSend">
              Gửi Email
            </a-button>
          </a-space>
        </template>
      </PageHeader>

      <div class="grid grid-cols-2 gap-6">
        <!-- Preview Template -->
        <div class="bg-white dark:bg-dark-2 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Xem trước Template
          </h3>
          <div 
            class="border dark:border-dark-5 rounded-lg p-4 min-h-[500px] prose dark:prose-invert max-w-none"
            v-html="template?.body"
          ></div>
        </div>

        <!-- Select Recipients -->
        <div class="bg-white dark:bg-dark-2 rounded-lg shadow p-6">
          <h3 class="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Chọn người nhận
          </h3>

          <a-tabs v-model:activeKey="activeTab">
            <!-- Campaign Tab -->
            <a-tab-pane key="campaign" tab="Campaign">
              <div class="py-4">
                <a-form layout="vertical">
                  <a-form-item label="Chọn Campaign">
                    <a-select
                      v-model:value="selectedCampaign"
                      placeholder="Chọn campaign"
                      :loading="loadingCampaigns"
                      @change="handleCampaignChange"
                    >
                      <a-select-option 
                        v-for="campaign in campaigns" 
                        :key="campaign.id" 
                        :value="campaign.id"
                      >
                        {{ campaign.name }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </a-form>

                <div v-if="selectedCampaign" class="mt-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">Danh sách người nhận</span>
                    <span class="text-sm text-gray-500">
                      {{ recipientCount }} người nhận
                    </span>
                  </div>
                  <a-table
                    :columns="columns"
                    :data-source="recipients"
                    :pagination="{ pageSize: 5 }"
                    size="small"
                  />
                </div>
              </div>
            </a-tab-pane>

            <!-- Membership Tab -->
            <a-tab-pane key="membership" tab="Membership">
              <div class="py-4">
                <a-form layout="vertical">
                  <a-form-item label="Tìm kiếm thành viên">
                    <a-input-search
                      v-model:value="searchText"
                      placeholder="Tìm theo tên, email, phone..."
                      @search="handleSearch"
                    />
                  </a-form-item>
                </a-form>

                <a-table
                  :columns="columns"
                  :data-source="members"
                  :pagination="{ pageSize: 5 }"
                  :row-selection="{ 
                    selectedRowKeys: selectedMemberKeys,
                    onChange: handleSelectionChange 
                  }"
                  size="small"
                />
              </div>
            </a-tab-pane>

            <!-- Upload Tab -->
            <a-tab-pane key="upload" tab="Upload File">
              <div class="py-4">
                <a-upload-dragger
                  v-model:fileList="fileList"
                  name="file"
                  :multiple="false"
                  :before-upload="beforeUpload"
                  @change="handleFileChange"
                >
                  <p class="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p class="ant-upload-text">
                    Click hoặc kéo thả file vào đây
                  </p>
                  <p class="ant-upload-hint">
                    Hỗ trợ file .xlsx, .xls, .csv
                  </p>
                </a-upload-dragger>

                <div v-if="uploadedRecipients.length > 0" class="mt-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">Danh sách người nhận từ file</span>
                    <span class="text-sm text-gray-500">
                      {{ uploadedRecipients.length }} người nhận
                    </span>
                  </div>
                  <a-table
                    :columns="columns"
                    :data-source="uploadedRecipients"
                    :pagination="{ pageSize: 5 }"
                    size="small"
                  />
                </div>
              </div>
            </a-tab-pane>
          </a-tabs>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { mailTemplateService, type MailTemplate } from '@/services/mailTemplateService'
import * as XLSX from 'xlsx'

const router = useRouter()
const route = useRoute()
const templateId = route.params.id

// Template data
const template = ref<MailTemplate>()
const sending = ref(false)

// Tab control
const activeTab = ref('campaign')

// Campaign states
const campaigns = ref([])
const selectedCampaign = ref()
const loadingCampaigns = ref(false)
const recipients = ref([])
const recipientCount = ref(0)

// Membership states
const searchText = ref('')
const members = ref([])
const selectedMemberKeys = ref<string[]>([])

// Upload states
const fileList = ref<any[]>([])
const uploadedRecipients = ref([])

// Table columns
const columns = [
  {
    title: 'Tên',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phone',
    key: 'phone',
  }
]

// Load template data
const loadTemplate = async () => {
  try {
    const response = await mailTemplateService.getTemplate(Number(templateId))
    template.value = response.data
  } catch (error) {
    console.error('Error loading template:', error)
    message.error('Không thể tải template')
  }
}

// Campaign methods
const loadCampaigns = async () => {
  try {
    loadingCampaigns.value = true
    // TODO: Implement API call
    campaigns.value = []
  } catch (error) {
    console.error('Error loading campaigns:', error)
    message.error('Không thể tải danh sách campaign')
  } finally {
    loadingCampaigns.value = false
  }
}

const handleCampaignChange = async (value: number) => {
  try {
    // TODO: Load campaign members
    recipients.value = []
    recipientCount.value = 0
  } catch (error) {
    console.error('Error loading campaign members:', error)
    message.error('Không thể tải danh sách thành viên')
  }
}

// Membership methods
const handleSearch = async () => {
  try {
    // TODO: Implement search API
    members.value = []
  } catch (error) {
    console.error('Error searching members:', error)
    message.error('Không thể tìm kiếm thành viên')
  }
}

const handleSelectionChange = (selectedRowKeys: string[]) => {
  selectedMemberKeys.value = selectedRowKeys
}

// Upload methods
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel' ||
                 file.type === 'text/csv'
  if (!isExcel) {
    message.error('Chỉ hỗ trợ file Excel hoặc CSV!')
    return false
  }
  return true
}

const handleFileChange = (info: any) => {
  const { file } = info
  if (file.status !== 'uploading') {
    const reader = new FileReader()
    reader.onload = (e) => {
      const data = e.target?.result
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      const recipients = XLSX.utils.sheet_to_json(worksheet)
      uploadedRecipients.value = recipients
    }
    reader.readAsArrayBuffer(file.originFileObj)
  }
}

// Send email
const handleSend = async () => {
  try {
    sending.value = true
    let recipients: any[] = []

    switch (activeTab.value) {
      case 'campaign':
        if (!selectedCampaign.value) {
          message.error('Vui lòng chọn campaign!')
          return
        }
        recipients = recipientCount.value
        break
      
      case 'membership':
        if (selectedMemberKeys.value.length === 0) {
          message.error('Vui lòng chọn ít nhất một thành viên!')
          return
        }
        recipients = selectedMemberKeys.value
        break
      
      case 'upload':
        if (uploadedRecipients.value.length === 0) {
          message.error('Vui lòng upload file danh sách người nhận!')
          return
        }
        recipients = uploadedRecipients.value
        break
    }

    // TODO: Call send mail API
    await new Promise(resolve => setTimeout(resolve, 1000))
    message.success('Gửi email thành công!')
    router.push('/mail/templates')
  } catch (error) {
    console.error('Error sending email:', error)
    message.error('Có lỗi xảy ra khi gửi email')
  } finally {
    sending.value = false
  }
}

onMounted(async () => {
  await loadTemplate()
  await loadCampaigns()
})
</script>

<style scoped>
.prose {
  max-width: none;
}

.prose img {
  margin: 0;
}
</style> 