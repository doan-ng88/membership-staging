<template>
  <a-modal
    :visible="visible"
    :title="t('editZaloCampaign.title')"
    width="60%"
    @cancel="handleCancel"
    :footer="null"
    :maskClosable="false"
  >
    <a-spin :spinning="loading">
      <a-form ref="formRef" layout="vertical" :model="formState" :rules="rules">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item 
            :label="t('editZaloCampaign.form.name')" 
            name="name"
            :rules="[{ required: true, message: t('editZaloCampaign.validation.nameRequired') }]"
          >
            <a-input v-model:value="formState.name" :disabled="isCompleted" />
          </a-form-item>
          
          <a-form-item 
            :label="t('editZaloCampaign.form.description')" 
            name="description"
          >
            <a-textarea v-model:value="formState.description" :disabled="isCompleted" />
          </a-form-item>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item 
            :label="t('editZaloCampaign.form.website')" 
            name="websiteId"
            :rules="[{ required: true, message: t('editZaloCampaign.validation.websiteRequired') }]"
          >
            <a-select 
              v-model:value="formState.websiteId" 
              :disabled="isCompleted"
              @change="handleWebsiteChange"
            >
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item 
            :label="t('editZaloCampaign.form.dateRange')" 
            name="dateRange"
          >
            <a-range-picker
              v-model:value="formState.dateRange"
              format="YYYY-MM-DD"
              :placeholder="['Start time', 'End time']"
              style="width: 100%"
              :disabled="isCompleted"
              :disabled-date="disabledDate"
              @change="onDateRangeChange"
            />
          </a-form-item>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a-form-item 
            :label="t('editZaloCampaign.form.status')" 
            name="status"
          >
            <a-select v-model:value="formState.status">
              <a-select-option v-for="status in campaignStatuses" :key="status.value" :value="status.value">
                <a-tag :color="getCampaignStatusColor(status.value)">{{ status.label }}</a-tag>
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item 
            :label="t('editZaloCampaign.form.coupons')" 
            name="coupons"
            :rules="[{ required: true, message: t('editZaloCampaign.validation.couponsRequired') }]"
          >
            <a-select
              v-model:value="formState.coupons"
              mode="multiple"
              :disabled="isCompleted"
              :loading="loadingCoupons"
              @search="handleSearchCoupons"
            >
              <a-select-option v-for="coupon in couponOptions" :key="coupon.value" :value="coupon.value">
                {{ coupon.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-medium">{{ t('editZaloCampaign.form.memberList') }}</h4>
            <a-button 
              class="flex items-center" 
              type="primary" 
              @click="showAddMemberModal"
              :disabled="isCompleted"
            >
              <template #icon><UserAddOutlined /></template>
              {{ t('editZaloCampaign.form.addMember') }}
            </a-button>
          </div>

          <a-table
            :columns="memberColumns"
            :data-source="formState.members"
            :pagination="{ pageSize: 5 }"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-button 
                  type="link" 
                  danger 
                  :disabled="isCompleted"
                  @click="removeMember(record)"
                >
                  <DeleteOutlined />
                </a-button>
              </template>
            </template>
          </a-table>
        </div>

        <div class="flex justify-end gap-4 mt-6">
          <a-button @click="handleCancel">{{ t('editZaloCampaign.common.cancel') }}</a-button>
          <a-button 
            type="primary" 
            @click="handleSubmit"
            :loading="submitting"
            :disabled="isCompleted"
          >
            {{ t('editZaloCampaign.common.save') }}
          </a-button>
        </div>
      </a-form>
    </a-spin>
  </a-modal>

  <AddMemberModal
    v-model:visible="showMemberModal"
    :website-id="formState.websiteId"
    @select="handleMemberSelect"
  />
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { zaloAppPushApi } from '@/api/services/zaloAppPushApi'
import { useI18nGlobal } from '@/i18n'
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import AddMemberModal from '@/features/mail/components/CampaignForm/AddMemberModal.vue'
import { debounce } from 'lodash'
import dayjs, { Dayjs } from 'dayjs'
import { membershipAPI } from '@/api/services/membershipApi'
import { websites } from '@/api/types/website'

const props = defineProps<{
  campaignId: number
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18nGlobal()
const formRef = ref()
const showMemberModal = ref(false)
const loading = ref(false)
const submitting = ref(false)
const loadingCoupons = ref(false)
const couponOptions = ref<{ label: string; value: string }[]>([])

// Define campaign statuses
const campaignStatuses = [
  { value: 'Created', label: t('editZaloCampaign.status.created') },
  { value: 'Processing', label: t('editZaloCampaign.status.processing') },
  { value: 'Completed', label: t('editZaloCampaign.status.completed') },
  { value: 'Failed', label: t('editZaloCampaign.status.failed') }
]

// Determine if campaign is completed (for disabling fields)
const isCompleted = computed(() => formState.status === 'Completed')

const memberColumns = [
  {
    title: t('editZaloCampaign.table.columns.memberName'),
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: t('editZaloCampaign.table.columns.phone'),
    dataIndex: 'mainPhoneNumber',
    key: 'mainPhoneNumber',
  },
  {
    title: t('editZaloCampaign.table.columns.website'),
    dataIndex: 'websiteName',
    key: 'websiteName',
  },
  {
    title: t('editZaloCampaign.table.columns.actions'),
    key: 'action',
    width: 80
  }
]

const rules = {
  name: [{ required: true, message: t('editZaloCampaign.validation.nameRequired') }],
  websiteId: [{ required: true, message: t('editZaloCampaign.validation.websiteRequired') }],
  coupons: [{ required: true, message: t('editZaloCampaign.validation.couponsRequired') }]
}

const formState = reactive({
  name: '',
  description: '',
  status: '',
  startDate: null as Dayjs | null,
  dueDate: null as Dayjs | null,
  dateRange: null as [Dayjs, Dayjs] | null,
  members: [] as any[],
  coupons: [] as string[],
  pic: [] as any[],
  websiteId: undefined as number | undefined
})

const getCampaignStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'Created': 'warning',
    'Processing': 'processing',
    'Completed': 'success',
    'Failed': 'error'
  }
  return colors[status] || 'default'
}

const fetchCampaignData = async () => {
  try {
    loading.value = true
    const campaign = await zaloAppPushApi.getCampaignDetails(props.campaignId)
    
    if (campaign) {
      // Update form state with existing data
      formState.name = campaign.campaignName || ''
      formState.description = campaign.description || ''
      formState.status = campaign.status || 'Created'
      formState.websiteId = campaign.websiteId
      
      // Handle dates
      if (campaign.startDate && campaign.dueDate) {
        const startDate = dayjs(campaign.startDate)
        const dueDate = dayjs(campaign.dueDate)
        formState.startDate = startDate
        formState.dueDate = dueDate
        formState.dateRange = [startDate, dueDate]
      }
      
      // Handle coupons
      if (campaign.coupons && Array.isArray(campaign.coupons)) {
        formState.coupons = campaign.coupons.map((c: any) => c.couponCode || c.code)
      }
      
      // Handle members/memberships
      if (campaign.memberships && Array.isArray(campaign.memberships)) {
        formState.members = campaign.memberships.map((m: any) => ({
          id: m.membershipId,
          fullName: m.fullName,
          mainPhoneNumber: m.mainPhoneNumber || m.phoneNumber,
          websiteName: getWebsiteName(campaign.websiteId)
        }))
      }
      
      // Handle person in charge
      if (campaign.employeePermissions && Array.isArray(campaign.employeePermissions)) {
        formState.pic = campaign.employeePermissions.map((ep: any) => ep.employeeId)
      }
      
      // Fetch coupons for the selected website
      await fetchCoupons()
    }
    
  } catch (error) {
    console.error('Error fetching campaign data:', error)
    message.error(t('editZaloCampaign.messages.error.load'))
  } finally {
    loading.value = false
  }
}

const getWebsiteName = (websiteId: number) => {
  const website = websites.find(w => w.websiteId === websiteId)
  return website ? website.name : ''
}

const fetchCoupons = async (search?: string) => {
  if (!formState.websiteId) return

  try {
    loadingCoupons.value = true
    const response = await membershipAPI.getCoupons(
      formState.websiteId,
      1, // pageIndex
      100, // pageSize
      search // search term
    )

    if (response.data && Array.isArray(response.data.data)) {
      couponOptions.value = response.data.data.map((coupon: any) => ({
        label: coupon.code,
        value: coupon.code
      }))
    } else {
      couponOptions.value = []
    }
  } catch (error: any) {
    console.error('Coupon fetch error:', error)
    message.error(error.response?.data?.message || t('editZaloCampaign.messages.error.loadCoupons'))
  } finally {
    loadingCoupons.value = false
  }
}

const handleSearchCoupons = debounce((value: string) => {
  if (formState.websiteId) {
    fetchCoupons(value)
  }
}, 500)

const handleWebsiteChange = () => {
  formState.coupons = []
  couponOptions.value = []
  fetchCoupons()
}

const disabledDate = (current: dayjs.Dayjs) => {
  // Disable dates before today
  return current && current < dayjs().startOf('day')
}

const onDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
  formState.dateRange = dates
  if (dates) {
    formState.startDate = dates[0]
    formState.dueDate = dates[1]
  } else {
    formState.startDate = null
    formState.dueDate = null
  }
}

const handleMemberSelect = (members: any[]) => {
  const existingMemberIds = new Set(formState.members.map((member) => member.id))
  const newMembers = members.filter((member) => !existingMemberIds.has(member.id))
  formState.members = [...formState.members, ...newMembers]
}

const removeMember = (member: any) => {
  formState.members = formState.members.filter(m => m.id !== member.id)
}

const showAddMemberModal = () => {
  if (!formState.websiteId) {
    message.warning(t('editZaloCampaign.messages.warning.selectWebsite'))
    return
  }
  showMemberModal.value = true
}

const handleCancel = () => {
  emit('update:visible', false)
}

const validateForm = () => {
  if (isCompleted.value) {
    message.error(t('editZaloCampaign.messages.error.cannotEditCompleted'))
    return false
  }
  
  if (!formState.name.trim()) {
    message.error(t('editZaloCampaign.validation.nameRequired'))
    return false
  }
  
  if (!formState.websiteId) {
    message.error(t('editZaloCampaign.validation.websiteRequired'))
    return false
  }
  
  if (formState.members.length === 0) {
    message.error(t('editZaloCampaign.validation.membersRequired'))
    return false
  }
  
  if (formState.coupons.length === 0) {
    message.error(t('editZaloCampaign.validation.couponsRequired'))
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    submitting.value = true
    
    const payload = {
      campaignName: formState.name,
      description: formState.description,
      startDate: formState.startDate ? dayjs(formState.startDate).format('YYYY-MM-DD') : null,
      dueDate: formState.dueDate ? dayjs(formState.dueDate).format('YYYY-MM-DD') : null,
      membershipIds: formState.members.map(m => m.id),
      websiteID: formState.websiteId,
      coupons: formState.coupons.map(c => ({ couponCode: c })),
      employeePermissions: formState.pic.map(userId => ({
        employeeId: userId,
        permissionLevel: 'edit'
      })),
      status: formState.status,
      isAppPush: true
    }

    await zaloAppPushApi.updateAppPushCampaign(props.campaignId, payload)
    
    message.success(t('editZaloCampaign.messages.success.update'))
    emit('success')
    emit('update:visible', false)
    
  } catch (error: any) {
    console.error('Error updating campaign:', error)
    message.error(error.response?.data?.message || t('editZaloCampaign.messages.error.update'))
  } finally {
    submitting.value = false
  }
}

// Watch for visibility changes to fetch data
watch(
  () => props.visible,
  (visible) => {
    if (visible && props.campaignId) {
      fetchCampaignData()
    }
  },
  { immediate: true }
)
</script>