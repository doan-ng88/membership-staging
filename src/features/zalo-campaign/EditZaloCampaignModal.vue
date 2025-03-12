<template>
  <a-modal
    :visible="visible"
    :title="t('editZaloCampaign.title')"
    width="80%"
    @cancel="handleCancel"
    :footer="null"
  >
    <a-form layout="vertical" :model="formState">
      <div class="flex gap-4">
        <a-form-item 
          :label="t('zaloCampaign.form.name')" 
          name="name"
          :rules="[{ required: true }]"
          class="flex-1"
        >
          <a-input v-model:value="formState.name" />
        </a-form-item>
        
        <a-form-item 
          :label="t('zaloCampaign.form.description')" 
          name="description"
          class="flex-1"
        >
          <a-textarea v-model:value="formState.description" />
        </a-form-item>
      </div>

      <div class="flex justify-end gap-4 mt-6">
        <a-button @click="handleCancel">{{ t('common.cancel') }}</a-button>
        <a-button 
          type="primary" 
          @click="handleSubmit"
          :loading="loading"
        >
          {{ t('common.save') }}
        </a-button>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import { zaloAppPushApi } from '@/api/services/zaloAppPushApi'
import { useI18nGlobal } from '@/i18n'

const props = defineProps<{
  campaignId: number
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'success'): void
}>()

const { t } = useI18nGlobal()

const formState = reactive({
  name: '',
  description: '',
  startDate: null,
  dueDate: null,
  members: [] as any[],
  coupons: [] as string[],
  pic: [] as any[],
  websiteId: undefined as number | undefined
})

const loading = ref(false)

const fetchCampaignData = async () => {
  try {
    loading.value = true
    const response = await zaloAppPushApi.getCampaignDetails(props.campaignId)
    
    // Cập nhật form state với dữ liệu hiện có
    formState.name = response.campaignName
    formState.description = response.description
    formState.startDate = response.startDate
    formState.dueDate = response.dueDate
    formState.websiteId = response.websiteId
    formState.coupons = response.coupons.map((c: any) => c.couponCode)
    formState.pic = response.employeePermissions.map((ep: any) => ep.employeeId)
    formState.members = response.memberships.map((m: any) => ({
      id: m.membershipId,
      fullName: m.fullName,
      phone: m.phoneNumber
    }))
    
  } catch (error) {
    console.error('Error fetching campaign data:', error)
    message.error('Không thể tải dữ liệu chiến dịch')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  emit('update:visible', false)
}

const validateForm = () => {
  if (!formState.name.trim()) {
    message.error(t('zaloCampaign.validation.nameRequired'))
    return false
  }
  if (formState.members.length === 0) {
    message.error(t('zaloCampaign.validation.membersRequired'))
    return false
  }
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    loading.value = true
    const payload = {
      campaignName: formState.name,
      description: formState.description,
      startDate: formState.startDate,
      dueDate: formState.dueDate,
      membershipIds: formState.members.map(m => m.id),
      websiteID: formState.websiteId,
      coupons: formState.coupons.map(c => ({ couponCode: c })),
      employeePermissions: formState.pic.map(userId => ({
        employeeId: userId,
        permissionLevel: 'edit'
      }))
    }

    await zaloAppPushApi.updateAppPushCampaign(props.campaignId, payload)
    
    message.success('Cập nhật chiến dịch thành công')
    emit('success')
    emit('update:visible', false)
    
  } catch (error) {
    console.error('Error updating campaign:', error)
    message.error('Cập nhật chiến dịch thất bại')
  } finally {
    loading.value = false
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      fetchCampaignData()
    }
  }
)
</script>