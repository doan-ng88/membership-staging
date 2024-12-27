<template>
  <a-modal
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :title="'Send Zalo Template'"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
  >
    <div class="send-zalo-container">
      <!-- Campaign Info Section -->
      <div class="mb-6">
        <a-form layout="vertical">
          <a-form-item 
            label="Tracking ID" 
            required
          >
            <a-input v-model:value="trackingId" placeholder="BULK_MSG_001" />
          </a-form-item>
        </a-form>
      </div>

      <!-- Selected Campaigns Section -->
      <div class="p-4 border rounded-lg mb-6">
        <h4 class="font-medium mb-4">Selected Campaigns</h4>
        <div class="overflow-auto max-h-60">
          <a-table
            :columns="campaignColumns"
            :data-source="selectedCampaigns"
            :pagination="false"
            size="small"
          />
        </div>
      </div>

      <!-- Fields Template Mapping Section -->
      <div class="p-4 border rounded-lg mb-6">
        <h4 class="font-medium mb-4">Template Parameters Mapping</h4>
        <div v-if="templateDetail?.listParams?.length">
          <div v-for="param in templateDetail.listParams" :key="param.name" class="mb-3">
            <label class="block text-sm mb-1 font-semibold">
              {{ param.name }}
              <span class="text-red-500">*</span>
            </label>
            <div class="flex gap-2">
              <a-select
                v-model:value="fieldMapping[param.name].type"
                style="width: 150px"
                @change="handleMappingTypeChange(param.name)"
              >
                <a-select-option value="field">Map từ trường</a-select-option>
                <a-select-option value="custom">Tùy chỉnh</a-select-option>
              </a-select>
              
              <template v-if="fieldMapping[param.name].type === 'field'">
                <a-select
                  v-model:value="fieldMapping[param.name].value"
                  :options="getMappingOptions(param)"
                  :placeholder="`Select ${param.name} mapping`"
                  class="flex-1"
                />
              </template>
              
              <template v-else>
                <a-input 
                  v-model:value="fieldMapping[param.name].value"
                  :placeholder="'Nhập giá trị cho ' + param.name"
                  class="flex-1"
                />
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="mt-6 flex justify-end gap-2">
        <a-button @click="handleCancel">Cancel</a-button>
        <a-button 
          type="primary" 
          :loading="sending"
          @click="handleSubmit"
        >
          Send Zalo Message
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Zalo service
const zaloService = {
  sendBulkMessage: (data: any) => {
    return api.post('/zalo/send-bulk-message', data)
  }
}

const props = defineProps<{
  visible: boolean
  template: any
  selectedCampaigns: any[]
  mode: 'campaign' | 'membership'
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
  (e: 'cancel'): void
}>()

const sending = ref(false)
const trackingId = ref('BULK_MSG_' + Date.now())
const fieldMapping = ref<Record<string, { type: 'field' | 'custom', value: string }>>({})

const campaignColumns = [
  {
    title: 'Campaign Name',
    dataIndex: 'name',
    key: 'name',
    width: 180
  },
  {
    title: 'Website',
    dataIndex: 'websiteName',
    key: 'websiteName',
    width: 120
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100
  }
]

// Thêm interface cho template detail
interface ZaloTemplateDetail {
  templateId: number
  templateName: string
  status: string
  listParams: Array<{
    name: string
    require: boolean
    type: string
    maxLength: number
    minLength: number
    acceptNull: boolean
  }>
}

const templateDetail = ref<ZaloTemplateDetail | null>(null)

// Thêm state cho campaign detail
const campaignDetail = ref<any>(null)

// Load campaign detail khi selected campaign thay đổi
watch(
  () => props.selectedCampaigns,
  async (campaigns) => {
    if (campaigns?.[0]?.id) {
      try {
        const response = await api.get(`/membership/get/get-campaign/${campaigns[0].id}`)
        if (response.data.campaign) {
          campaignDetail.value = response.data.campaign
          console.log('Campaign detail loaded:', campaignDetail.value)
        }
      } catch (error) {
        console.error('Error loading campaign:', error)
        message.error('Không thể tải thông tin campaign')
      }
    }
  },
  { immediate: true }
)

// Thêm watch cho visible prop
watch(
  () => props.visible,
  (isVisible) => {
    console.log('Modal visible changed:', isVisible)
    console.log('Template:', props.template.templateId)
    console.log('Template:', props.template)
    console.log('is visible:', isVisible)
    console.log('Campaigns:', props.selectedCampaigns)
    if (isVisible && props.template?.templateId) {
      console.log('Loading template ID:', props.template.templateId)
      loadTemplateDetail()
    }
  }
)

const loadTemplateDetail = async () => {
  console.log('Loading template detail...')
  try {
    if (!props.template?.templateId) {
      throw new Error('Template ID not found')
    }

    const response = await api.get(`/zalo/templates/${props.template.templateId}`)
    console.log('Template API response:', response)
    
    if (response.data.result === 'Success') {
      templateDetail.value = response.data.source.data
      console.log('Template detail loaded:', templateDetail.value)
    } else {
      throw new Error(response.data.message || 'Failed to load template detail')
    }
  } catch (error) {
    console.error('Error loading template detail:', error)
    message.error('Không thể tải thông tin template')
  }
}

const handleSubmit = async () => {
  try {
    if (!validateFieldMapping()) return
    sending.value = true

    const mergeData: Record<string, string> = {}
    const templateData: Record<string, any> = {}

    Object.entries(fieldMapping.value).forEach(([key, mapping]) => {
      if (mapping.type === 'custom') {
        mergeData[key] = mapping.value
      } else {
        templateData[key] = mapping.value
      }
    })

    const sendData = {
      template_id: props.template.templateId.toString(),
      tracking_id: trackingId.value,
      campaign_id: campaignDetail.value?.campaignId,
      merge_data: mergeData,
      recipients: campaignDetail.value?.memberships?.map((member: any) => ({
        membership_website_id: member.websiteId,
        phone: member.phoneNumber,
        template_data: Object.entries(templateData).reduce((acc: Record<string, any>, [key, path]) => {
          let value = path.split('.').reduce((obj: any, prop: string) => {
            return obj?.[prop]
          }, member)

          if (path === 'birthday' || path === 'expirationDate') {
            value = dayjs(value).format('DD/MM/YYYY')
          }

          acc[key] = value
          return acc
        }, {})
      })) || []
    }

    console.log('Sending data:', sendData)
    const response = await api.post('/zalo/send-bulk-message', sendData)
    
    if (response.data.result === 'Success') {
      message.success('Gửi tin nhắn thành công')
      emit('success')
    } else {
      message.error(response.data.message || 'Gửi tin nhắn thất bại')
    }
  } catch (error) {
    console.error('Error sending message:', error)
    message.error('Gửi tin nhắn thất bại')
  } finally {
    sending.value = false
  }
}

const validateFieldMapping = () => {
  if (!templateDetail.value?.listParams) {
    message.error('Template parameters not found')
    return false
  }

  const requiredParams = templateDetail.value.listParams.filter(p => p.require)
  const unmapped = requiredParams.filter(p => !fieldMapping.value[p.name])
  
  if (unmapped.length) {
    message.error(`Vui lòng điền đầy đủ các trường bắt buộc: ${unmapped.map(p => p.name).join(', ')}`)
    return false
  }
  return true
}

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const getMappingOptions = (param: any) => {
  const options = [
    // User fields
    { label: 'Full Name', value: 'fullName' },
    { label: 'Phone Number', value: 'phoneNumber' },
    { label: 'Email', value: 'email' },
    { label: 'Address', value: 'address' },
    { label: 'Birthday', value: 'birthday' },
    { label: 'Points', value: 'points' },
    { label: 'Member Level', value: 'level.Name' },
    { label: 'Expiration Date', value: 'expirationDate' },
    
    
  ]

  // // Filter options based on param type if needed
  // if (param.type === 'DATE') {
  //   return options.filter(opt => 
  //     ['birthday', 'expirationDate', 'startDate', 'dueDate'].includes(opt.value)
  //   )
  // }

  return options
}

// Thêm watch để khởi tạo fieldMapping khi templateDetail thay đổi
watch(() => templateDetail.value?.listParams, (params) => {
  if (params) {
    params.forEach(param => {
      if (!fieldMapping.value[param.name]) {
        fieldMapping.value[param.name] = {
          type: 'field',
          value: ''
        }
      }
    })
  }
}, { immediate: true })

const handleMappingTypeChange = (paramName: string) => {
  fieldMapping.value[paramName].value = ''
}

// ... rest of the code (campaignColumns, etc)
</script>

<style scoped>
.send-zalo-container {
  @apply max-h-[80vh] overflow-y-auto pr-2;
}

.ant-form-item {
  @apply mb-4;
}

.ant-tag {
  @apply mr-2;
}
</style> 