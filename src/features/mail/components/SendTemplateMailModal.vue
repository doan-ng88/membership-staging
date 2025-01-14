<template>
  <a-modal
    :open="visible"
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

// 2. States
const mailSender = ref('testing@sky007.vn')
const subject = ref(props.template?.subject || '')
const sending = ref(false)
const loadingCampaigns = ref(false)
const campaignData = ref<any>(null)
const availableFields = ref<Array<{label: string, value: string}>>([])
const fieldMapping = ref<Record<string, string>>({})

// 3. Computed
const templateFields = computed(() => {
  if (!props.template?.content) return []
  const matches = props.template.content.match(/\{([^}]+)\}/g) || []
  return Array.from(new Set(matches))
})

// 4. Methods
const fetchCampaignFields = async () => {
  if (props.mode !== 'campaign' || !props.selectedCampaigns?.length) {
    return
  }

  try {
    loadingCampaigns.value = true
    const campaignId = props.selectedCampaigns[0].id
    const response = await mailCampaignService.getCampaignDetail(campaignId)
    
    if (!response?.data?.campaign) {
      throw new Error('No campaign data received')
    }

    campaignData.value = response.data.campaign
    
    // Build available fields
    const fields: Array<{label: string, value: string}> = [
      { label: 'Campaign Name', value: 'campaignName' },
      { label: 'Description', value: 'description' },
      { label: 'Start Date', value: 'startDate' },
      { label: 'Due Date', value: 'dueDate' }
    ]

    if (campaignData.value?.memberships?.[0]) {
      fields.push(
        { label: 'Customer Name', value: 'memberships[0].fullName' },
        { label: 'Email', value: 'memberships[0].email' },
        { label: 'Phone', value: 'memberships[0].phone' },
        { label: 'Address', value: 'memberships[0].address' }
      )
    }

    availableFields.value = fields
  } catch (error) {
    console.error('Error fetching campaign fields:', error)
    message.error('Failed to load campaign fields')
  } finally {
    loadingCampaigns.value = false
  }
}

// 5. Watchers
watch(() => props.visible, (newValue) => {
  if (!newValue) return

  // Validate template first
  if (!props.template) {
    console.error('Invalid template data')
    emit('update:visible', false)
    message.error('Invalid template data')
    return
  }

  // Mode specific validation
  if (props.mode === 'campaign') {
    if (!props.selectedCampaigns?.length) {
      console.error('No campaigns selected')
      emit('update:visible', false)
      message.error('Please select at least one campaign')
      return
    }
    fetchCampaignFields()
  } else if (props.mode === 'membership') {
    if (!props.selectedMembers?.length) {
      console.error('No members selected')
      emit('update:visible', false)
      message.error('Please select at least one member')
      return
    }
  }
}, { immediate: true })

// 6. Helper Methods
const getMappingOptions = (field: string) => {
  if (props.mode === 'campaign') {
    return availableFields.value
  }
  return [
    { label: 'Customer Name', value: 'fullName' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phoneNumber' },
    { label: 'Address', value: 'address' }
  ]
}

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

    // Lấy giá trị thực từ data dựa trên mode
    const getMappedValue = (path: string) => {
      if (props.mode === 'campaign') {
        if (!campaignData.value) return ''
        const parts = path.split('.')
        let value = campaignData.value
        for (const part of parts) {
          if (part.includes('[')) {
            const [arrayName, index] = part.split(/[\[\]]/)
            value = value[arrayName]?.[Number(index)]
          } else {
            value = value[part]
          }
          if (value === undefined) return ''
        }
        return value || ''
      } else {
        // Mode membership
        if (!props.selectedMembers?.[0]) return ''
        return props.selectedMembers[0][path] || ''
      }
    }

    const sendData = {
      templateId: props.template?.id,
      FromMail: mailSender.value,
      subject: subject.value || props.template?.name || 'Mail Template',
      mergeFields: Object.entries(fieldMapping.value).reduce((acc, [key, value]) => {
        const cleanKey = key.replace(/[{}]/g, '')
        acc[cleanKey] = value
        return acc
      }, {}),
      to: props.mode === 'campaign' ? 
        [{
          email: campaignData.value?.memberships?.[0]?.email || '',
          mergeData: Object.entries(fieldMapping.value).reduce((acc, [key, path]) => {
            const cleanKey = key.replace(/[{}]/g, '')
            acc[cleanKey] = getMappedValue(path)
            return acc
          }, {})
        }] :
        props.selectedMembers.map(member => ({
          email: member.email || '',
          mergeData: Object.entries(fieldMapping.value).reduce((acc, [key, path]) => {
            const cleanKey = key.replace(/[{}]/g, '')
            acc[cleanKey] = member[path] || ''
            return acc
          }, {})
        }))
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