<template>
  <a-modal
    :open="visible"
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

      <a-form-item :label="t('editCampaign.form.issue')" name="issue">
        <a-input v-model:value="formState.Issue" />
      </a-form-item>

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
        <a-form-item>
          <a-checkbox v-model:checked="formState.IsPrivated">{{ t('editCampaign.form.checkboxes.private') }}</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.isServiceCall">{{ t('editCampaign.form.checkboxes.callService') }}</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.isAppPush">{{ t('editCampaign.form.checkboxes.appPush') }}</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.isServiceEmail">{{ t('editCampaign.form.checkboxes.sendEmail') }}</a-checkbox>
        </a-form-item>
      </div>
    </a-form>
  </a-modal>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'
import type { Campaign } from '../../types/campaign.types'

export default defineComponent({
  name: 'EditCampaignModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    campaignId: {
      type: Number,
      default: 1,
      required: false
    },
    campaignData: {
      type: Object as () => Campaign,
      required: false
    }
  },
  emits: ['update:visible', 'success'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const authStore = useAuthStore()
    const formRef = ref()
    const loading = ref(false)
    const dateFormat = 'YYYY-MM-DD'

    const formState = reactive<Campaign>({
      CampaignID: props.campaignData?.CampaignID || 0   ,
      CampaignName: props.campaignData?.CampaignName || '',
      Description: props.campaignData?.Description || '',
      StartDate: props.campaignData?.StartDate ? dayjs(props.campaignData.StartDate).format('YYYY-MM-DD') : null,
      DueDate: props.campaignData?.DueDate ? dayjs(props.campaignData.DueDate).format('YYYY-MM-DD') : null,
      Issue: props.campaignData?.Issue || '',
      PriorityLevel: props.campaignData?.PriorityLevel || 'Not Set',
      Status: props.campaignData?.Status || 'Created',
      IsPrivated: props.campaignData?.IsPrivated || false,
      isServiceCall: props.campaignData?.isServiceCall || false,
      isAppPush: props.campaignData?.isAppPush || false,
      isServiceEmail: props.campaignData?.isServiceEmail || false
    })

    const rules = {
      CampaignName: [
        { required: true, message: t('editCampaign.messages.error.validation') }
      ],
      StartDate: [
        { required: true, message: t('editCampaign.messages.error.validation') }
      ],
      Issue: [
        { required: true, message: t('editCampaign.messages.error.validation') }
      ],
      DueDate: [
        {
          validator: async (_rule: any, value: any) => {
            if (value && formState.StartDate && dayjs(value).isBefore(formState.StartDate)) {
              throw new Error('End date must be after start date')
            }
          }
        }
      ]
    }

    watch(() => props.campaignData, (newVal) => {
      if (newVal) {
        Object.assign(formState, {
          ...newVal,
          StartDate: newVal.StartDate ? dayjs(newVal.StartDate) : null,
          DueDate: newVal.DueDate ? dayjs(newVal.DueDate) : null
        })
      }
    }, { immediate: true })

    const handleSubmit = async () => {
      try {
        await formRef.value.validate()
        loading.value = true

        if (!formState.StartDate) {
          message.error('Please select start date')
          return
        }

        const payload = {
          ...formState,
          StartDate: dayjs(formState.StartDate).format('YYYY-MM-DD'),
          DueDate: formState.DueDate ? dayjs(formState.DueDate).format('YYYY-MM-DD') : null
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/membership/update/update-campaign/${props.campaignId}`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }
        )

        if (!response.ok) throw new Error('Failed to update campaign')

        message.success(t('editCampaign.messages.success'))
        emit('success')
        emit('update:visible', false)
      } catch (error) {
        console.error('Error:', error)
        if (error instanceof Error) {
          message.error(error.message)
        } else {
          message.error(t('editCampaign.messages.error.update'))
        }
      } finally {
        loading.value = false
      }
    }

    const handleCancel = () => {
      formRef.value?.resetFields()
      emit('update:visible', false)
    }

    return {
      formRef,
      formState,
      loading,
      rules,
      dateFormat,
      handleSubmit,
      handleCancel,
      t
    }
  }
})
</script> 