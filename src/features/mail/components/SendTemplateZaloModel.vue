<template>
  <a-modal
    :open="visible"
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

      <!-- Selected Items Section -->
      <div class="p-4 border rounded-lg mb-6">
        <h4 class="font-medium mb-4">
          {{ props.mode === 'campaign' ? 'Selected Campaigns' : 'Selected Members' }}
        </h4>
        <div class="overflow-auto max-h-60">
          <a-table
            v-if="props.mode === 'campaign'"
            :columns="campaignColumns"
            :data-source="selectedCampaigns"
            :pagination="false"
            size="small"
          />
          <a-table
            v-else
            :columns="memberColumns"
            :data-source="props.selectedMembers"
            :pagination="false"
            size="small"
          />
        </div>
      </div>

      <!-- Fields Template Mapping Section -->
      <div class="p-4 border rounded-lg mb-6">
        <h4 class="font-medium mb-4">Template Parameters Mapping</h4>
        <div v-if="templateDetail?.listParams?.length">
          <!-- Add required parameters warning notice -->
          <div class="mb-4 p-3 bg-blue-50 rounded border border-blue-200 text-blue-700">
            <div class="flex items-center gap-2">
              <span class="flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-info-circle-fill" viewBox="0 0 16 16">
                  <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                </svg>
              </span>
              <span>
                <strong>Note:</strong> This template requires specific parameters from Zalo. Parameters marked with <span class="text-red-500">*</span> must be mapped. Look for suggested mappings shown next to each parameter.
              </span>
            </div>
          </div>
          <div v-for="param in templateDetail.listParams" :key="param.name" class="mb-4 p-3 border rounded hover:bg-gray-50" :class="{'border-red-200 bg-red-50': param.require}">
            <label class="block text-sm mb-1 font-semibold">
              {{ param.name }}
              <span class="text-red-500" v-if="param.require">*</span>
              <span class="text-xs text-gray-500 ml-2">{{ getSuggestedFieldDescription(param.name) }}</span>
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
                  show-search
                  :filter-option="filterOption"
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

      <!-- Add a preview section above the footer actions -->
      <div class="p-4 border rounded-lg mb-6" v-if="templateDetail?.listParams?.length && hasValidMappings">
        <h4 class="font-medium mb-3">Message Preview <a-tag>First recipient</a-tag></h4>
        
        <div class="p-3 bg-gray-50 rounded-lg">
          <div v-if="messagePreview" class="text-sm whitespace-pre-wrap">
            <p v-for="(line, index) in messagePreview.split('\n')" :key="index" class="mb-1">
              <span v-html="formatPreviewLine(line)"></span>
            </p>
          </div>
          <div v-else class="text-gray-500 text-center py-3">
            Complete the mapping to see a preview
          </div>
        </div>
      </div>

      <!-- Campaign Info Section -->
      <div v-if="mode === 'campaign' && campaignInfo" class="mb-4 p-3 bg-gray-50 rounded">
        <h4 class="font-medium mb-2">Campaign Details</h4>
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div>Name: {{ campaignInfo.name }}</div>
          <div>Start Date: {{ campaignInfo.startDate }}</div>
          <div>End Date: {{ campaignInfo.endDate }}</div>
          <div>Total Members: {{ campaignInfo.memberCount }}</div>
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
    return api.post('/membership/zalo/send-bulk-message', data)
  }
}

const props = defineProps<{
  visible: boolean
  template: any
  selectedCampaigns: any[]
  selectedMembers: any[]
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

const memberColumns = [
  {
    title: 'Name',
    dataIndex: 'fullName',
    key: 'fullName',
    width: 180
  },
  {
    title: 'Phone',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
    width: 120
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 180
  },
  {
    title: 'Level',
    dataIndex: 'levelName',
    key: 'levelName',
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

// Define interface for mapping options
interface MappingOption {
  label: string;
  value: string;
  description?: string;
}

const templateDetail = ref<ZaloTemplateDetail | null>(null)

// Thêm state cho campaign detail
const campaignDetail = ref<any>(null)

// Define all helper functions first

// Extract process template data function for reuse
const processTemplateData = (member: any, templateFields: Record<string, string>) => {
  try {
    return Object.entries(templateFields).reduce((acc: Record<string, any>, [key, path]) => {
      let value: any = ''
      
      // Special case for array access in the path (e.g., 'latestOrder.items[0].price')
      if (path === 'latestOrder.items[0].price') {
        // Handle product price from the first item specifically
        if (member?.latestOrder?.items && Array.isArray(member.latestOrder.items) && member.latestOrder.items.length > 0) {
          value = member.latestOrder.items[0].price || ''
        }
      } else {
        // Normal path handling
        const pathParts = path.split('.')
        value = member
        
        for (const part of pathParts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part]
          } else {
            // If path not found, set to empty string
            value = ''
            break
          }
        }
      }
      
      // Format specific fields
      if (key === 'order_date') {
        value = value ? dayjs(value).format('DD/MM/YYYY') : 
                member.latestOrder?.createTime ? dayjs(member.latestOrder.createTime).format('DD/MM/YYYY') : 
                dayjs().format('DD/MM/YYYY');
      } else if (path === 'latestOrder.createTime' || path === 'birthday' || path === 'expirationDate') {
        value = value ? dayjs(value).format('DD/MM/YYYY') : dayjs().format('DD/MM/YYYY')
      } else if (key === 'price') {
        const numericValue = String(value).replace(/[^0-9]/g, '')
        value = numericValue ? parseInt(numericValue, 10) : 0
      } else if (key === 'point' || key === 'total_point') {
        // Giữ nguyên giá trị số cho API
        value = value ? parseInt(value) || 0 : 0
      } else if (
        path === 'latestOrder.totalAmount' || 
        path === 'latestOrder.subtotal' ||
        path === 'latestOrder.discount' || 
        path === 'latestOrder.tax' || 
        path === 'latestOrder.shippingFee' ||
        path === 'latestOrder.items[0].price' ||
        key === 'subtotal' ||
        key === 'discount' ||
        key === 'tax' ||
        key === 'shipping_fee' ||
        key === 'product_price'
      ) {
        value = value ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' đ' : '0 đ'
      }
      
      acc[key] = value
      return acc
    }, {})
  } catch (error) {
    console.error('Error processing template data:', error)
    message.error('Lỗi xử lý dữ liệu thành viên')
    return {}
  }
}

// Add a function to suggest field descriptions based on parameter name
const getSuggestedFieldDescription = (paramName: string): string => {
  const paramLower = paramName.toLowerCase();
  
  if (paramLower.includes('total') && paramLower.includes('point')) {
    return 'Suggested: <total_point>';
  } else if (paramLower.includes('order') && paramLower.includes('code')) {
    return 'Suggested: <order_code>';
  } else if (paramLower.includes('date') && (paramLower.includes('order') || paramLower.includes('purchase'))) {
    return 'Suggested: <order_date>';
  } else if (paramLower.includes('subtotal') || (paramLower.includes('sub') && paramLower.includes('total'))) {
    return 'Suggested: <subtotal>';
  } else if (paramLower.includes('discount')) {
    return 'Suggested: <discount>';
  } else if (paramLower.includes('tax')) {
    return 'Suggested: <tax>';
  } else if (paramLower.includes('shipping') || paramLower.includes('delivery') || paramLower.includes('ship')) {
    return 'Suggested: <shipping_fee>';
  } else if (paramLower.includes('product') && (paramLower.includes('price') || paramLower.includes('value'))) {
    return 'Suggested: <product_price>';
  } else if ((paramLower.includes('price') || paramLower.includes('value') || paramLower.includes('amount') || paramLower.includes('total')) && 
             (paramLower.includes('order') || paramLower.includes('purchase'))) {
    return 'Suggested: <price>';
  } else if (paramLower.includes('point') && (paramLower.includes('earn') || paramLower.includes('reward'))) {
    return 'Suggested: <point>';
  } else if (paramLower.includes('point') && (paramLower.includes('total') || paramLower.includes('current') || paramLower.includes('balance'))) {
    return 'Suggested: <total_point>';
  }
  
  return '';
}

// Add filter option for select dropdown search
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0 ||
         (option.description && option.description.toLowerCase().indexOf(input.toLowerCase()) >= 0);
}

// Function to format preview line with highlighting
const formatPreviewLine = (line: string): string => {
  // Highlight the mapped fields
  return line.replace(/{{(\w+)}}/g, '<span class="bg-yellow-100 px-1 rounded">{{$1}}</span>')
}

// Improve the getMappingOptions function to include order-related fields
const getMappingOptions = (param: any): MappingOption[] => {
  // Basic user fields
  const userFields: MappingOption[] = [
    { label: 'Full Name', value: 'fullName' },
    { label: 'Phone Number', value: 'phoneNumber' },
    { label: 'Email', value: 'email' },
    { label: 'Address', value: 'address' },
    { label: 'Birthday', value: 'birthday' },
    // { label: 'Current Points', value: 'points', description: '<total_point>' },
    { label: 'Total Points', value: 'points', description: '<total_point>' },
    { label: 'Member Level', value: 'level.Name' },
    { label: 'Expiration Date', value: 'expirationDate' },
  ]
  
  // Order-related fields
  const orderFields: MappingOption[] = [
    { label: 'Order Code', value: 'latestOrder.orderId', description: '<order_code>' },
    { label: 'Order Date', value: 'latestOrder.createTime', description: '<order_date>' },
    { label: 'Price', value: 'latestOrder.totalAmount', description: '<price>' },
    // { label: 'Order Subtotal', value: 'latestOrder.subtotal', description: '<subtotal>' },
    { label: 'Order Discount', value: 'latestOrder.discount', description: '<discount>' }, 
    { label: 'Order Tax', value: 'latestOrder.tax', description: '<tax>' },
    { label: 'Order Shipping Fee', value: 'latestOrder.shippingFee', description: '<shipping_fee>' },
    // { label: 'Product Price', value: 'latestOrder.items[0].price', description: '<product_price>' },
    { label: 'Points', value: 'latestOrder.points', description: '<point>' },
  ]
  
  // Combine all available fields based on parameter type
  let allFields: MappingOption[] = [...userFields, ...orderFields]
  
  // If param.name contains any hint about its purpose, we can prioritize certain options
  const paramName = param.name.toLowerCase()
  
  if (paramName.includes('order') && paramName.includes('code')) {
    allFields = allFields.sort((a, b) => {
      return a.description === '<order_code>' ? -1 : b.description === '<order_code>' ? 1 : 0
    })
  } else if (paramName.includes('date')) {
    allFields = allFields.sort((a, b) => {
      return a.description === '<order_date>' ? -1 : b.description === '<order_date>' ? 1 : 0
    })
  } else if (paramName.includes('price') || paramName.includes('value') || paramName.includes('amount')) {
    // Expanded sorting logic for price-related fields
    allFields = allFields.sort((a, b) => {
      // Default to total price
      if (a.description === '<price>') return -1
      if (b.description === '<price>') return 1
      
      // Check if it's specifically product price
      if (paramName.includes('product') && paramName.includes('price')) {
        if (a.description === '<product_price>') return -1
        if (b.description === '<product_price>') return 1
      }
      
      // Check if it's specifically subtotal
      if (paramName.includes('subtotal')) {
        if (a.description === '<subtotal>') return -1
        if (b.description === '<subtotal>') return 1
      }
      
      // Check if it's specifically discount
      if (paramName.includes('discount')) {
        if (a.description === '<discount>') return -1
        if (b.description === '<discount>') return 1
      }
      
      return 0
    })
  } else if (paramName.includes('point') && paramName.includes('total')) {
    allFields = allFields.sort((a, b) => {
      return a.description === '<total_point>' ? -1 : b.description === '<total_point>' ? 1 : 0
    })
  } else if (paramName.includes('point')) {
    allFields = allFields.sort((a, b) => {
      return a.description === '<point>' ? -1 : b.description === '<point>' ? 1 : 0
    })
  } else if (paramName.includes('shipping')) {
    allFields = allFields.sort((a, b) => {
      return a.description === '<shipping_fee>' ? -1 : b.description === '<shipping_fee>' ? 1 : 0
    })
  } else if (paramName.includes('tax')) {
    allFields = allFields.sort((a, b) => {
      return a.description === '<tax>' ? -1 : b.description === '<tax>' ? 1 : 0
    })
  }
  
  return allFields
}

// Now define computed properties that use these helper functions
const hasValidMappings = computed(() => {
  if (!templateDetail.value?.listParams) return false
  
  // Check if all required params have a value
  return templateDetail.value.listParams
    .filter(p => p.require)
    .every(p => 
      fieldMapping.value[p.name] && 
      fieldMapping.value[p.name].value
    )
})

const messagePreview = computed(() => {
  if (!hasValidMappings.value || !templateDetail.value) return ''
  
  // Get the first recipient
  const firstMember = props.mode === 'campaign' 
    ? campaignDetail.value?.memberships?.[0] 
    : props.selectedMembers[0]
    
  if (!firstMember) return ''
  
  // Get the template content (mocked for preview)
  let previewContent = templateDetail.value.templateName || 'Zalo Message Template'
  
  // Replace template parameters with values
  Object.entries(fieldMapping.value).forEach(([key, mapping]) => {
    if (mapping.type === 'custom') {
      // For custom values, use directly
      previewContent = previewContent.replace(new RegExp(`{{${key}}}`, 'g'), mapping.value)
    } else {
      // For field mappings, get the value from the member
      const templateFields: Record<string, string> = { [key]: mapping.value }
      const processedData = processTemplateData(firstMember, templateFields)
      
      // Tạo bản sao để không ảnh hưởng dữ liệu gốc
      const previewData = {...processedData}
      
      // Format lại cho hiển thị
      if (previewData.point) {
        previewData.point = `+${previewData.point} điểm`
      }
      if (previewData.total_point) {
        previewData.total_point = `${previewData.total_point} điểm`
      }
      
      previewContent = previewContent.replace(new RegExp(`{{${key}}}`, 'g'), previewData[key] || '')
    }
  })
  
  return previewContent
})

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

    const response = await api.get(`/membership/zalo/templates/${props.template.templateId}`)
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

const handleMappingTypeChange = (paramName: string) => {
  fieldMapping.value[paramName].value = ''
}

const processCampaignData = (member: any) => {
  const processedData = processTemplateData(member, templateData)
  
  // Thêm fallback cho các trường order
  if (!processedData.order_code && member.latestOrder?.orderId) {
    processedData.order_code = member.latestOrder.orderId
  }
  
  if (!processedData.order_date && member.latestOrder?.createTime) {
    processedData.order_date = dayjs(member.latestOrder.createTime).format('DD/MM/YYYY')
  }
  
  if (!processedData.price && member.latestOrder?.totalAmount) {
    processedData.price = member.latestOrder.totalAmount
  }

  return cleanApiData(processedData)
}

const handleSubmit = async () => {
  try {
    if (props.mode === 'campaign') {
      // Kiểm tra trạng thái campaign
      // if (campaignDetail.value?.status !== 'ACTIVE') {
      //   message.error('Chỉ có thể gửi cho campaign đang hoạt động')
      //   return
      // }
      
      // Kiểm tra ngày hết hạn campaign
      if (dayjs(campaignDetail.value.endDate).isBefore(dayjs())) {
        message.error('Campaign đã hết hạn')
        return
      }
    }
    
    if (!validateFieldMapping()) return
    sending.value = true

    // Thêm validation cho recipients
    if (props.mode === 'campaign' && (!campaignDetail.value?.memberships || campaignDetail.value.memberships.length === 0)) {
      message.error('Campaign không có thành viên nào')
      return
    }

    if (props.mode === 'membership' && props.selectedMembers.length === 0) {
      message.error('Vui lòng chọn ít nhất 1 thành viên')
      return
    }

    const mergeData: Record<string, string> = {}
    const templateData: Record<string, any> = {}

    Object.entries(fieldMapping.value).forEach(([key, mapping]) => {
      if (mapping.type === 'custom') {
        mergeData[key] = mapping.value
      } else {
        templateData[key] = mapping.value
      }
    })

    // let recipients = []
    
    // if (props.mode === 'campaign') {
    //   recipients = campaignDetail.value.memberships
    //     .filter((member: any) => validateMemberData(member))
    //     .map((member: any) => ({
    //       membership_website_id: member.websiteId,
    //       phone: member.phoneNumber.replace(/[^0-9]/g, ''),
    //       template_data: processCampaignData(member)
    //     }))
    // } else {
    //   recipients = props.selectedMembers
    //     .map((member: any) => {
    //       if (!member.membershipWebsiteId) {
    //         console.warn('Invalid member:', member)
    //         return null
    //       }
          
    //       // Thêm logging chi tiết
    //       console.log('Processing selected member:', member.membershipWebsiteId)
          
    //       const processedData = processTemplateData(member, templateData)
    //       return {
    //         membership_website_id: member.membershipWebsiteId,
    //         phone: member.phoneNumber?.replace(/[^0-9]/g, '') || '', // Clean phone number
    //         template_data: cleanApiData(processedData)
    //       }
    //     })
    //     .filter(Boolean)
    // }

    // Thêm validation cuối cùng cho recipients
    // if (recipients.length === 0) {
    //   message.error('Không có thành viên hợp lệ để gửi')
    //   return
    // }

    // Thêm logging để kiểm tra dữ liệu cuối cùng
    // console.log('Final recipients data:', recipients)

    const sendData = {
      template_id: props.template.templateId.toString(),
      tracking_id: trackingId.value,
      campaign_id: props.mode === 'campaign' ? campaignDetail.value?.campaignId : null,
      merge_data: mergeData,
      // recipients: recipients
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
    const response = await api.post('/membership/zalo/send-bulk-message', sendData)
    
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
  const unmapped = requiredParams.filter(p => 
    !fieldMapping.value[p.name] || 
    !fieldMapping.value[p.name].value
  )
  
  // Check known Zalo parameters
  const knownParams = ['order_date', 'order_code', 'price', 'point', 'total_point'];
  const missingKnownParams = templateDetail.value.listParams
    .filter(p => knownParams.includes(p.name))
    .filter(p => !fieldMapping.value[p.name] || !fieldMapping.value[p.name].value);
  
  if (unmapped.length) {
    message.error(`Vui lòng điền đầy đủ các trường bắt buộc: ${unmapped.map(p => p.name).join(', ')}`)
    return false
  }
  
  // Special warning for known parameters if not mapped
  if (missingKnownParams.length) {
    // Auto-map order_date to the default if not mapped and exists in template
    const needsOrderDate = missingKnownParams.find(p => p.name === 'order_date');
    if (needsOrderDate) {
      message.warning(`Đang tự động map '${needsOrderDate.name}' đến 'latestOrder.createTime'`);
      fieldMapping.value[needsOrderDate.name] = {
        type: 'field',
        value: 'latestOrder.createTime'
      };
    } else {
      message.warning(`Nên map các trường quan trọng: ${missingKnownParams.map(p => p.name).join(', ')}`);
    }
  }
  
  // Add price format validation
  const priceParam = templateDetail.value.listParams.find(p => p.name === 'price')
  if (priceParam) {
    const mapping = fieldMapping.value.price
    if (mapping?.type === 'custom') {
      const priceValue = mapping.value
      if (!/^\d+$/.test(priceValue)) {
        message.error('Giá trị price phải là số nguyên dương')
        return false
      }
    }
  }
  
  // Kiểm tra định dạng point
  const pointParam = templateDetail.value.listParams.find(p => p.name === 'point')
  if (pointParam) {
    const mapping = fieldMapping.value.point
    if (mapping?.type === 'custom') {
      const pointValue = mapping.value
      if (!/^\d+$/.test(pointValue)) {
        message.error('Giá trị point phải là số nguyên dương')
        return false
      }
    }
  }
  
  // Thêm validation đặc biệt cho Campaign mode
  if (props.mode === 'campaign') {
    // Kiểm tra campaign có memberships không
    if (!campaignDetail.value?.memberships?.length) {
      message.error('Campaign không có thành viên nào')
      return false
    }

    // Kiểm tra các trường liên quan đến order
    const orderRelatedParams = ['order_date', 'order_code', 'price']
    const missingOrderFields = orderRelatedParams.filter(param => 
      templateDetail.value?.listParams?.some(p => p.name === param) && 
      !fieldMapping.value[param]?.value
    )

    if (missingOrderFields.length > 0) {
      message.error(`Campaign cần map các trường đơn hàng: ${missingOrderFields.join(', ')}`)
      return false
    }
  }
  
  // Thêm check giá trị thực tế
  const requiredParamsWithValues = templateDetail.value.listParams
    .filter(p => p.require)
    .map(p => {
      const mapping = fieldMapping.value[p.name]
      let value = ''
      
      if (mapping?.type === 'custom') {
        value = mapping.value
      } else {
        // Lấy giá trị từ member đầu tiên
        const sampleMember = props.mode === 'campaign' 
          ? campaignDetail.value?.memberships?.[0]
          : props.selectedMembers?.[0]
        
        if (sampleMember) {
          value = processTemplateData(sampleMember, { [p.name]: mapping.value })[p.name]
        }
      }
      
      return { param: p.name, value }
    })

  const missingValues = requiredParamsWithValues
    .filter(({ value }) => !value || value.toString().trim() === '')
    .map(({ param }) => param)

  if (missingValues.length > 0) {
    message.error(`Giá trị các trường bắt buộc không được trống: ${missingValues.join(', ')}`)
    return false
  }
  
  return true
}

const handleCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

// Thêm watch để khởi tạo fieldMapping khi templateDetail thay đổi
watch(() => templateDetail.value?.listParams, (params) => {
  if (params) {
    // Known Zalo parameters with their default mappings
    const defaultMappings: Record<string, string> = {
      'order_date': 'latestOrder.createTime',
      'order_code': 'latestOrder.orderId',
      'price': 'latestOrder.totalAmount',
      'point': 'latestOrder.points',
      'total_point': 'points',
    };

    params.forEach(param => {
      if (!fieldMapping.value[param.name]) {
        fieldMapping.value[param.name] = {
          type: 'field',
          value: ''
        };
        
        // If parameter has a default mapping, apply it
        if (param.name in defaultMappings) {
          fieldMapping.value[param.name].value = defaultMappings[param.name];
          console.log(`Auto-mapped ${param.name} to ${defaultMappings[param.name]}`);
        }
      }
    });
  }
}, { immediate: true });

// Thêm hàm kiểm tra dữ liệu member
const validateMemberData = (member: any) => {
  const requiredFields = {
    order_code: member.latestOrder?.orderId,
    phone: member.phoneNumber,
    membership_id: member.membershipWebsiteId
  }

  const missingFields = Object.entries(requiredFields)
    .filter(([_, value]) => !value)
    .map(([field]) => field)

  if (missingFields.length > 0) {
    console.warn('Member data missing required fields:', missingFields, member)
    return false
  }
  return true
}

const cleanApiData = (data: Record<string, any>) => {
  // Lấy danh sách các param từ template
  const templateParams = templateDetail.value?.listParams?.map(p => p.name) || []
  
  return templateParams.reduce((acc: Record<string, any>, param) => {
    // Ưu tiên giá trị từ data, nếu không có thì dùng giá trị mặc định
    acc[param] = data[param] ?? getDefaultValueForParam(param)
    return acc
  }, {})
}

const getDefaultValueForParam = (param: string) => {
  const paramConfig = templateDetail.value?.listParams?.find(p => p.name === param)
  if (!paramConfig) return ''
  
  // Xử lý theo loại dữ liệu
  switch(paramConfig.type.toLowerCase()) {
    case 'number':
      return 0
    case 'date':
      return dayjs().format('DD/MM/YYYY')
    case 'string':
    default:
      return paramConfig.acceptNull ? '' : '-'
  }
}

watch(() => props.mode, (newMode) => {
  if (newMode === 'campaign') {
    // Thêm logic đặc biệt cho campaign
    const campaignParams = ['order_date', 'order_code', 'price']
    campaignParams.forEach(param => {
      if (templateDetail.value?.listParams?.some(p => p.name === param)) {
        fieldMapping.value[param] = {
          type: 'field',
          value: `latestOrder.${param.split('_')[1]}` // order_date -> latestOrder.date
        }
      }
    })
  }
})

// Thêm các trường thông tin campaign vào preview
const campaignInfo = computed(() => {
  if (!campaignDetail.value) return null
  return {
    name: campaignDetail.value.name,
    startDate: dayjs(campaignDetail.value.startDate).format('DD/MM/YYYY'),
    endDate: dayjs(campaignDetail.value.endDate).format('DD/MM/YYYY'),
    memberCount: campaignDetail.value.memberships?.length || 0
  }
})
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