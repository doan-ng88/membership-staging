<template>
  <a-modal
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :title="mode === 'campaign' ? 'Send Mail Template by Campaign' : 'Send Mail Template by Membership'"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="send-mail-container">
      <!-- Mail Info Section -->
      <div class="mb-6">
        <a-form layout="vertical">
          <a-form-item 
            label="Mail Sender" 
            required
            :rules="[{ required: true, message: 'Please input mail sender' }]"
          >
            <a-input v-model:value="mailSender" placeholder="testing@sky007.vn" />
          </a-form-item>
          <a-form-item 
            label="Subject" 
            required
            :rules="[{ required: true, message: 'Please input subject' }]"
          >
            <a-input v-model:value="subject" placeholder="Enter subject email" />
          </a-form-item>
        </a-form>
      </div>

      <!-- Campaign Mode Section -->
      <div v-if="mode === 'campaign'" class="p-4 border rounded-lg mb-6">
        <h4 class="font-medium mb-4">Selected Campaigns</h4>
        <div class="overflow-auto max-h-60">
          <a-table
            :columns="campaignColumns"
            :data-source="selectedCampaigns"
            :pagination="false"
            size="small"
            class="text-sm"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'websiteName'">
                <a-tag>{{ record.websiteName }}</a-tag>
              </template>
              <template v-if="column.key === 'status'">
                <a-tag :color="record.status === 'Active' ? 'green' : 'red'">
                  {{ record.status }}
                </a-tag>
              </template>
              <template v-if="column.key === 'action'">
                <a-button 
                  type="link" 
                  class="text-red-500 p-0"
                  @click="handleRemoveCampaign(record)"
                >
                  <DeleteOutlined />
                </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- Membership Mode Section -->
      <div v-if="mode === 'membership'" class="p-4 border rounded-lg mb-6">
        <h4 class="font-medium mb-4">Selected Members</h4>
        <div class="overflow-auto max-h-60">
          <a-table
            :columns="memberColumns"
            :data-source="selectedMembers"
            :pagination="false"
            size="small"
            class="text-sm"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'email'">
                <span class="text-blue-600">{{ record.email }}</span>
              </template>
              <template v-if="column.key === 'action'">
                <a-button 
                  type="link" 
                  class="text-red-500 p-0"
                  @click="handleRemoveMember(record)"
                >
                  <DeleteOutlined />
                </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>

      <!-- Fields Template Mapping Section -->
      <div class="p-4 border rounded-lg mb-6">
        <h4 class="font-medium mb-4">Fields Template Mapping</h4>
        <div v-if="templateFields.length > 0">
          <div v-for="field in templateFields" :key="field" class="mb-3">
            <label class="block text-sm mb-1 font-semibold">{{ field }}</label>
            <a-select
              v-model:value="fieldMapping[field]"
              :options="getMappingOptions(field)"
              placeholder="Select field mapping"
              class="w-full"
            />
          </div>
        </div>
        <div v-else class="text-gray-500">No merge fields found in template</div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-6 flex justify-end gap-2">
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button 
          type="primary" 
          :loading="sending"
          @click="handleSubmit"
        >
          Send Email
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { DeleteOutlined } from '@ant-design/icons-vue'
import { mailCampaignService } from '@/features/mail/services/mail-campaign.service'
import { membershipAPI } from '@/api/services/membershipApi'

interface TemplateData {
  id: number
  content: string
  name: string
}

const props = defineProps<{
  visible: boolean
  template: TemplateData
  mode: 'campaign' | 'membership'
  selectedCampaigns?: any[]
  selectedMembers?: any[] 
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
  (e: 'removeMember', member: any): void
  (e: 'removeCampaign', campaign: any): void
}>()

// Add debug logs
watch(() => props.visible, (newValue) => {
  if (newValue && (!props.template || !props.selectedCampaigns.length)) {
    console.error('Invalid props:', { template: props.template, campaigns: props.selectedCampaigns })
    emit('update:visible', false)
    message.error('Invalid template data or no campaigns selected')
  }
}, { immediate: true })

watch(() => props.template, (newValue) => {
  console.log('Modal template prop:', newValue)
})

// States
const mailSender = ref('testing@sky007.vn')
const subject = ref(props.template?.subject || '')
const selectedCampaign = ref(null)
const sending = ref(false)
const loadingCampaigns = ref(false)

// Member table columns with Tailwind classes
const memberColumns = [
  {
    title: 'Customer Name',
    dataIndex: 'fullName',
    key: 'fullName',
    width: 180,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 180,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: 'Birthday',
    dataIndex: 'birthday',
    key: 'birthday',
    width: 100,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: 'Phone',
    dataIndex: 'phoneNumber',
    key: 'phone',
    width: 120,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    width: 180,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: '',
    key: 'action',
    width: 50,
    className: 'bg-gray-50 px-4 py-2'
  }
]

// Extract fields from template content
const templateFields = computed(() => {
  if (!props.template?.content) return []
  const matches = props.template.content.match(/\{([^}]+)\}/g) || []
  return Array.from(new Set(
    matches.map(match => match)
  ))
})

// Store field mapping values
const fieldMapping = ref<Record<string, string>>({})

// Initialize field mapping when template changes
watch(() => props.template, (newTemplate) => {
  if (newTemplate?.content) {
    const fields = templateFields.value
    fields.forEach((field) => {
      if (!fieldMapping.value[field]) {
        fieldMapping.value[field] = ''
      }
    })
  }
}, { immediate: true })

// Thêm state để lưu campaign data
const campaignData = ref<any>(null)
const availableFields = ref<Array<{label: string, value: string}>>([])

// Load campaign data khi component mounted hoặc khi campaign thay đổi
const fetchCampaignFields = async () => {
  try {
    if (!props.selectedCampaigns?.length) {
      return message.error('No campaign selected')
    }
    
    const campaignId = props.selectedCampaigns[0].id
    console.log('Fetching campaign data for ID:', campaignId)
    
    const response = await mailCampaignService.getCampaignDetail(campaignId)
    console.log('API Response:', response)
    
    if (!response?.data?.campaign) {
      throw new Error('No campaign data received from API')
    }

    campaignData.value = response.data.campaign  // Lấy data từ campaign
    console.log('Campaign Data:', campaignData.value)

    // Tạo danh sách các field có thể mapping từ campaign data
    const fields = []

    if (campaignData.value?.memberships?.[0]) {
      console.log('Membership Data:', campaignData.value.memberships[0])
      
      // Basic fields
      fields.push(
        { label: 'Campaign Name', value: 'campaignName' },
        { label: 'Description', value: 'description' },
        { label: 'Start Date', value: 'startDate' },
        { label: 'Due Date', value: 'dueDate' }
      )

      // Membership fields
      const membershipFields = [
        { label: 'Customer Name', value: 'memberships[0].fullName' },
        { label: 'Email', value: 'memberships[0].email' },
        { label: 'Phone', value: 'memberships[0].phone' },
        { label: 'Address', value: 'memberships[0].address' }
      ]

      // Add membership fields if they exist in the data
      membershipFields.forEach(field => {
        const path = field.value.split('.')
        let value = campaignData.value
        for (const part of path) {
          if (part.includes('[')) {
            const [arrayName, index] = part.split(/[\[\]]/)
            value = value[arrayName]?.[Number(index)]
          } else {
            value = value[part]
          }
        }
        if (value !== undefined) {
          fields.push(field)
        }
      })

      // Dynamic fields from membership data
      const memberData = campaignData.value.memberships[0]
      Object.keys(memberData).forEach(key => {
        if (!fields.some(f => f.value === `memberships[0].${key}`)) {
          fields.push({
            label: key.charAt(0).toUpperCase() + key.slice(1),
            value: `memberships[0].${key}`
          })
        }
      })
    }

    console.log('Available Fields:', fields)
    availableFields.value = fields

  } catch (error) {
    console.error('Error fetching campaign fields:', error)
    message.error('Failed to load campaign fields')
  }
}

// Gọi fetchCampaignFields khi component mounted hoặc campaign thay đổi
watch(() => props.selectedCampaigns, fetchCampaignFields, { immediate: true })

// Thêm state cho membership
const membershipFields = ref<Array<{label: string, value: string}>>([])

// Sửa lại getMappingOptions để sử dụng fields đã có
const getMappingOptions = (field: string) => {
  if (props.mode === 'campaign') {
    return availableFields.value
  }

  // Sử dụng lại cấu trúc fields giống như trong campaign nhưng bỏ prefix memberships[0]
  return [
    { label: 'Customer Name', value: 'fullName' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phoneNumber' },
    { label: 'Address', value: 'address' }
  ]
}

// Thêm watch cho membership mode
watch(
  [() => props.mode, () => props.selectedMembers],
  ([newMode, newMembers]) => {
    if (newMode === 'campaign') {
      fetchCampaignFields()
    } else if (newMode === 'membership' && newMembers?.length) {
      // Set membership fields với cấu trúc tương tự nhưng không có prefix
      membershipFields.value = [
        { label: 'Customer Name', value: 'fullName' },
        { label: 'Email', value: 'email' },
        { label: 'Phone', value: 'phoneNumber' },
        { label: 'Address', value: 'address' }
      ]
    }
  },
  { immediate: true }
)

// Add campaignColumns
const campaignColumns = [
  {
    title: 'Campaign Name',
    dataIndex: 'name',
    key: 'name',
    width: 180,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: 'Website',
    dataIndex: 'websiteName',
    key: 'websiteName',
    width: 120,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
    className: 'bg-gray-50 px-4 py-2'
  },
  {
    title: '',
    key: 'action',
    width: 50,
    className: 'bg-gray-50 px-4 py-2'
  }
]

// Methods
const handleSubmit = async () => {
  try {
    if (!mailSender.value) {
      message.error('Please input mail sender')
      return
    }

    if (!validateFieldMapping()) {
      return
    }

    sending.value = true

    // Lấy giá trị thực từ campaignData dựa trên mapping
    const getMappedValue = (path: string) => {
      const parts = path.split('.')
      let value = campaignData.value
      for (const part of parts) {
        if (part.includes('[')) {
          const [arrayName, index] = part.split(/[\[\]]/)
          value = value[arrayName][Number(index)]
        } else {
          value = value[part]
        }
      }
      return value || ''
    }

    const sendData = {
      templateId: props.template?.id,
      FromMail: mailSender.value,
      subject: props.template?.name || 'Mail Template',
      mergeFields: Object.entries(fieldMapping.value).reduce((acc, [key, value]) => {
        const cleanKey = key.replace(/[{}]/g, '')
        acc[cleanKey] = value
        return acc
      }, {}),
      to: [{
        email: "doannguyen.actsone@gmail.com",
        mergeData: Object.entries(fieldMapping.value).reduce((acc, [key, path]) => {
          const cleanKey = key.replace(/[{}]/g, '')
          acc[cleanKey] = getMappedValue(path)
          return acc
        }, {})
      }]
    }

    console.log('Sending data:', JSON.stringify(sendData, null, 2))

    const response = await mailCampaignService.sendMail(sendData)
    
    if (response.success) {
      message.success('Mail sent successfully')
      emit('success')
      emit('update:visible', false)
    } else {
      const errorMessage = response.data?.results?.[0]?.message || 'Failed to send mail'
      message.error(errorMessage)
    }
  } catch (error) {
    console.error('Error sending mail:', error)
    message.error('Failed to send mail')
  } finally {
    sending.value = false
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleCampaignChange = (value: any) => {
  selectedCampaign.value = value
}

const handleRemoveMember = (member: any) => {
  emit('removeMember', member)
}

const handleRemoveCampaign = (campaign: any) => {
  emit('removeCampaign', campaign)
}

// Add validation before submit
const validateFieldMapping = () => {
  const unmappedFields = templateFields.value.filter(field => !fieldMapping.value[field])
  if (unmappedFields.length > 0) {
    message.error(`Please map all template fields: ${unmappedFields.join(', ')}`)
    return false
  }
  return true
}
</script>

<style scoped>
.send-mail-container {
  @apply max-h-[80vh] overflow-y-auto pr-2;
}

.ant-form-item {
  @apply mb-4;
}

.ant-tag {
  @apply mr-2;
}
</style> 