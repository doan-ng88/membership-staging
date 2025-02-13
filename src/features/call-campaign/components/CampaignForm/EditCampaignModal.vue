<template>
  <a-modal
    :open="open"
    :title="t('editCampaign.title')"
    @cancel="handleCancel"
    @ok="handleSubmit"
    :confirmLoading="loading"
    width="700px"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <a-form-item :label="t('editCampaign.form.name')" name="campaignName">
        <a-input v-model:value="formState.CampaignName" />
      </a-form-item>

      <a-form-item :label="t('editCampaign.form.description')" name="description">
        <a-textarea v-model:value="formState.Description" :rows="3" />
      </a-form-item>

      <div class="grid grid-cols-2 gap-4">
        <a-form-item :label="t('editCampaign.form.startDate')" name="startDate">
          <a-date-picker 
            v-model:value="formState.StartDate" 
            style="width: 100%"
            :format="dateFormat"
          />
        </a-form-item>

        <a-form-item :label="t('editCampaign.form.endDate')" name="dueDate">
          <a-date-picker 
            v-model:value="formState.DueDate" 
            style="width: 100%"
            :format="dateFormat"
          />
        </a-form-item>
      </div>

      <!-- <a-form-item :label="t('editCampaign.form.issue')" name="issue">
        <a-input v-model:value="formState.Issue" />
      </a-form-item> -->

      <div class="grid grid-cols-2 gap-4">
        <a-form-item :label="t('editCampaign.form.priorityLevel.label')" name="priorityLevel">
          <a-select v-model:value="formState.PriorityLevel">
            <a-select-option value="High">{{ t('editCampaign.form.priorityLevel.options.high') }}</a-select-option>
            <a-select-option value="Medium">{{ t('editCampaign.form.priorityLevel.options.medium') }}</a-select-option>
            <a-select-option value="Low">{{ t('editCampaign.form.priorityLevel.options.low') }}</a-select-option>
            <a-select-option value="Not Set">{{ t('editCampaign.form.priorityLevel.options.notSet') }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="t('editCampaign.form.status.label')" name="status">
          <a-select v-model:value="formState.Status">
            <a-select-option value="Created">{{ t('editCampaign.form.status.options.created') }}</a-select-option>
            <a-select-option value="Planning">{{ t('editCampaign.form.status.options.planning') }}</a-select-option>
            <a-select-option value="In Progress">{{ t('editCampaign.form.status.options.inProgress') }}</a-select-option>
            <a-select-option value="On Hold">{{ t('editCampaign.form.status.options.onHold') }}</a-select-option>
            <a-select-option value="Completed">{{ t('editCampaign.form.status.options.completed') }}</a-select-option>
            <a-select-option value="Closed">{{ t('editCampaign.form.status.options.closed') }}</a-select-option>
            <a-select-option value="Cancelled">{{ t('editCampaign.form.status.options.cancelled') }}</a-select-option>
          </a-select>
        </a-form-item>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <!-- <a-form-item>
          <a-checkbox v-model:checked="formState.IsPrivated" :defaultChecked="formState.IsPrivated">
            {{ t('editCampaign.form.checkboxes.private') }}
          </a-checkbox>
        </a-form-item> -->
        <a-form-item>
          <a-checkbox v-model:checked="formState.isServiceCall" :defaultChecked="formState.isServiceCall">
            {{ t('editCampaign.form.checkboxes.callService') }}
          </a-checkbox>
        </a-form-item>
        <!-- <a-form-item>
          <a-checkbox v-model:checked="formState.isAppPush" :defaultChecked="formState.isAppPush">
            {{ t('editCampaign.form.checkboxes.appPush') }}
          </a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.isServiceEmail" :defaultChecked="formState.isServiceEmail">
            {{ t('editCampaign.form.checkboxes.sendEmail') }}
          </a-checkbox>
        </a-form-item> -->
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import type { FormInstance } from 'ant-design-vue'
import axios from 'axios'

export default defineComponent({
  name: 'EditCampaignModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    campaignId: {
      type: Number,
      required: true
    },
    campaignData: {
      type: Object,
      required: true
    }
  },
  
  setup(props, { emit }) {
    const { t } = useI18n()
    const authStore = useAuthStore()
    const formRef = ref<FormInstance>()
    const loading = ref(false)
    const dateFormat = 'YYYY-MM-DD'

    // Form state
    const formState = reactive({
      CampaignName: '',
      Description: '',
      StartDate: null,
      DueDate: null,
      Issue: '',
      PriorityLevel: 'Not Set',
      Status: 'Created',
      IsPrivated: false,
      isServiceCall: false,
      isAppPush: false,
      isServiceEmail: false
    })

    // Fetch campaign data
    const fetchCampaignData = async () => {
      try {
        loading.value = true
        console.log('Fetching campaign data for ID:', props.campaignId)
        
        // Sử dụng URL trực tiếp từ bạn cung cấp
        const response = await axios.get(`https://membership.actsone.io.vn/api/membership/get/get-campaign/${props.campaignId}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        })

        console.log('API Response:', response.data)
        
        if (response.data?.campaign) {
          const campaign = response.data.campaign
          
          // Update form state with existing data
          formState.CampaignName = campaign.campaignName
          formState.Description = campaign.description
          formState.StartDate = campaign.startDate ? dayjs(campaign.startDate) : null
          formState.DueDate = campaign.dueDate ? dayjs(campaign.dueDate) : null
          formState.Issue = campaign.issue
          formState.PriorityLevel = campaign.priorityLevel
          formState.Status = campaign.status
          formState.IsPrivated = campaign.isPrivated
          formState.isServiceCall = campaign.isServiceCall
          formState.isAppPush = campaign.isAppPush
          formState.isServiceEmail = campaign.isServiceEmail
        }

      } catch (error) {
        console.error('Error fetching campaign:', error)
        message.error(t('editCampaign.messages.error.update'))
      } finally {
        loading.value = false
      }
    }

    // Fetch data when component is mounted
    // onMounted(() => {
    //   fetchCampaignData()
    // })

    // Watch for modal visibility
    watch(
      [() => props.open, () => props.campaignId],
      ([newOpen, newId]) => {
        if (newOpen && newId) {
          fetchCampaignData()
        }
      }
    )

    const handleCancel = () => {
      emit('update:open', false)
    }

    const handleSubmit = async () => {
      try {
        loading.value = true
        const payload = {
          CampaignName: formState.CampaignName,
          Description: formState.Description,
          StartDate: formState.StartDate ? dayjs(formState.StartDate).format('YYYY-MM-DD') : null,
          DueDate: formState.DueDate ? dayjs(formState.DueDate).format('YYYY-MM-DD') : null,
          Issue: formState.Issue,
          PriorityLevel: formState.PriorityLevel,
          Status: formState.Status,
          IsPrivated: formState.IsPrivated,
          isServiceCall: formState.isServiceCall,
          isAppPush: formState.isAppPush,
          isServiceEmail: formState.isServiceEmail
        }

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/membership/update/update-campaign/${props.campaignId}`,
          payload,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          }
        )

        if (response.status === 200) {
          message.success(t('editCampaign.messages.success'))
          emit('success')
          emit('update:open', false)
        }
      } catch (error) {
        console.error('Error:', error)
        message.error(t('editCampaign.messages.error.update'))
      } finally {
        loading.value = false
      }
    }

    return {
      t,
      formRef,
      formState,
      loading,
      dateFormat,
      handleSubmit,
      handleCancel
    }
  }
})
</script> 