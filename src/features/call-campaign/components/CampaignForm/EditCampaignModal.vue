<template>
  <a-modal
    :visible="visible"
    :title="'Chỉnh sửa chiến dịch'"
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
      <a-form-item label="Tên chiến dịch" name="campaignName">
        <a-input v-model:value="formState.CampaignName" />
      </a-form-item>

      <a-form-item label="Mô tả" name="description">
        <a-textarea v-model:value="formState.Description" :rows="3" />
      </a-form-item>

      <div class="grid grid-cols-2 gap-4">
        <a-form-item label="Ngày bắt đầu" name="startDate">
          <a-date-picker 
            v-model:value="formState.StartDate" 
            style="width: 100%"
            :format="dateFormat"
          />
        </a-form-item>

        <a-form-item label="Ngày kết thúc" name="dueDate">
          <a-date-picker 
            v-model:value="formState.DueDate" 
            style="width: 100%"
            :format="dateFormat"
          />
        </a-form-item>
      </div>

      <a-form-item label="Vấn đề" name="issue">
        <a-input v-model:value="formState.Issue" />
      </a-form-item>

      <div class="grid grid-cols-2 gap-4">
        <a-form-item label="Mức độ ưu tiên" name="priorityLevel">
          <a-select v-model:value="formState.PriorityLevel">
            <a-select-option value="High">Cao</a-select-option>
            <a-select-option value="Medium">Trung bình</a-select-option>
            <a-select-option value="Low">Thấp</a-select-option>
            <a-select-option value="Not Set">Chưa đặt</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="Trạng thái" name="status">
          <a-select v-model:value="formState.Status">
            <a-select-option value="Created">Đã tạo</a-select-option>
            <a-select-option value="Planning">Lên kế hoạch</a-select-option>
            <a-select-option value="In Progress">Đang thực hiện</a-select-option>
            <a-select-option value="On Hold">Tạm dừng</a-select-option>
            <a-select-option value="Completed">Hoàn thành</a-select-option>
            <a-select-option value="Closed">Đã đóng</a-select-option>
            <a-select-option value="Cancelled">Đã hủy</a-select-option>
          </a-select>
        </a-form-item>
      </div>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <a-form-item>
          <a-checkbox v-model:checked="formState.IsPrivated">Riêng tư</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.isServiceCall">Gọi điện</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.isAppPush">Thông báo App</a-checkbox>
        </a-form-item>
        <a-form-item>
          <a-checkbox v-model:checked="formState.isServiceEmail">Gửi Email</a-checkbox>
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
        { required: true, message: 'Vui lòng nhập tên chiến dịch' }
      ],
      StartDate: [
        { required: true, message: 'Vui lòng chọn ngày bắt đầu' }
      ],
      Issue: [
        { required: true, message: 'Vui lòng nhập vấn đề' }
      ],
      DueDate: [
        {
          validator: async (_rule: any, value: any) => {
            if (value && formState.StartDate && dayjs(value).isBefore(formState.StartDate)) {
              throw new Error('Ngày kết thúc phải sau ngày bắt đầu')
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
          message.error('Vui lòng chọn ngày bắt đầu')
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

        message.success('Cập nhật chiến dịch thành công')
        emit('success')
        emit('update:visible', false)
      } catch (error) {
        console.error('Error:', error)
        if (error instanceof Error) {
          message.error(error.message)
        } else {
          message.error('Vui lòng kiểm tra lại thông tin')
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
      handleCancel
    }
  }
})
</script> 