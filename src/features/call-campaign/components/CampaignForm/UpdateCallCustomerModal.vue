<template>
  <a-modal
    :open="visible"
    :title="t('callCampaign.callCampaignDetail.updateCallCustomer.title')"
    @ok="handleSubmit"
    @cancel="handleCancel"
    :ok-button-props="{ loading: submitting }"
    ok-text="Xác nhận"
    cancel-text="Hủy"
    width="800px"
  >
    <a-form :model="formState" :rules="formRules" ref="formRef" layout="vertical">
      <!-- Status Selection -->
      <a-form-item 
        :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.status.label')"
        name="callStatus"
        :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.status.required') }]"
      >
        <a-select
          v-model:value="formState.callStatus"
          :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.statusPlaceholder')"
          option-label-prop="label"
          style="width: 100%"
        >
          <a-select-option
            v-for="status in statusOptions"
            :key="status"
            :value="status"
            :label="getStatus(status)"
          >
            <a-tag :color="getStatusColor(status)">
              {{ getStatus(status) }}
            </a-tag>
          </a-select-option>
        </a-select>
      </a-form-item>

      <!-- Description -->
      <a-form-item
        :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.description.label')"
        name="description"
        :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.description.required') }]"
      >
        <a-textarea
          v-model:value="formState.description"
          :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.descriptionPlaceholder')"
          :rows="3"
          show-count
          :maxlength="500"
        />
      </a-form-item>

      <!-- Call Reason and Call Summary -->
      <div class="grid grid-cols-2 gap-4">
        <a-form-item
          :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callReason.label')"
          name="callReason"
          :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.callReason.required') }]"
        >
          <a-textarea
            v-model:value="formState.callReason"
            :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callReasonPlaceholder')"
            :rows="3"
            show-count
            :maxlength="200"
          />
        </a-form-item>

        <a-form-item
          :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callSummary.label')"
          name="callSummary"
          :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.callSummary.required') }]"
        >
          <a-textarea
            v-model:value="formState.callSummary"
            :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callSummaryPlaceholder')"
            :rows="3"
            show-count
            :maxlength="200"
          />
        </a-form-item>
      </div>

      <!-- Follow Up Section -->
      <div class="border-t pt-4">
        <a-form-item
          name="followUpRequired"
          class="mb-0"
        >
          <a-checkbox v-model:checked="formState.followUpRequired">
            {{ t('callCampaign.callCampaignDetail.updateCallCustomer.form.followUpRequired.label') }}
          </a-checkbox>
        </a-form-item>

        <a-form-item
          :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.nextFollowUpDate.label')"
          name="nextFollowUpDate"
          :rules="[{ required: formState.followUpRequired, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.nextFollowUpDate.required') }]"
        >
          <a-date-picker
            v-model:value="formState.nextFollowUpDate"
            format="DD/MM/YYYY"
            value-format="YYYY-MM-DD"
            style="width: 100%"
            :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.nextFollowUpDatePlaceholder')"
            :disabled-date="disabledDate"
          />
        </a-form-item>
      </div>

      <a-form-item
        :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callNote')"
        name="customerNote"
      >
        <a-textarea
          v-model:value="formState.customerNote"
          :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callNotePlaceholder')"
          :rows="2"
          show-count
          :maxlength="500"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useI18nGlobal } from '@/i18n';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18nGlobal();
const authStore = useAuthStore();

enum CallStatus {
  NOT_CALL = 'not_call',
  NEED_RECALL = 'need_recall',
  NO_ANSWER = 'no_answer',
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing'
}

const props = defineProps({
  visible: Boolean,
  campaignId: {
    type: Number,
    required: true
  },
  customerData: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:visible', 'success', 'cancel']);

const formRef = ref();
const submitting = ref(false);

const formState = reactive({
  callStatus: null,
  description: '',
  callReason: '',
  callSummary: '',
  followUpRequired: false,
  nextFollowUpDate: null,
  followUpMethod: null,
  internalNote: '',
  customerNote: '',
  callDuration: 0,
  satisfactionRating: null
});

const formRules = reactive({
  callStatus: [{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.status.required') }],
  description: [{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.description.required') }],
  callReason: [{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.callReason.required') }],
  callSummary: [{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.callSummary.required') }],
  nextFollowUpDate: [
    {
      required: formState.followUpRequired,
      message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.nextFollowUpDate.required')
    }
  ],
  followUpMethod: [
    {
      required: formState.followUpRequired,
      message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.followUpMethod.required')
    }
  ]
});

const statusOptions = Object.values(CallStatus);

const getStatusColor = (status: string) => {
  const colors = {
    [CallStatus.NOT_CALL]: 'gray',
    [CallStatus.NEED_RECALL]: 'orange',
    [CallStatus.NO_ANSWER]: 'red',
    [CallStatus.COMPLETED]: 'green',
    [CallStatus.PENDING]: 'blue',
    [CallStatus.CANCELLED]: 'black'
  };
  return colors[status as keyof typeof colors] || 'default';
};

const getStatus = (status: string) => {
  return t(`callCampaign.callCampaignDetail.updateCallCustomer.status.${status}`);
};

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current < dayjs().endOf('day');
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return null;
  return dayjs(dateString).format('YYYY-MM-DD');
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    submitting.value = true;

    const payload = {
      campaignId: props.campaignId,
      customerId: props.customerData.id,
      callStatus: formState.callStatus,
      description: formState.description,
      callReason: formState.callReason,
      callSummary: formState.callSummary,
      followUpRequired: formState.followUpRequired,
      nextFollowUpDate: formState.nextFollowUpDate,
      followUpMethod: formState.followUpMethod,
      internalNote: formState.internalNote,
      customerNote: formState.customerNote,
      callDuration: formState.callDuration,
      satisfactionRating: formState.satisfactionRating,
      agentId: authStore.user?.id
    };

    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/update/call-record`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    );

    message.success(t('callCampaign.messages.updateSuccess'));
    emit('success');
    handleCancel();
  } catch (error) {
    console.error('Update error:', error);
    message.error(t('callCampaign.messages.updateError'));
  } finally {
    submitting.value = false;
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
  emit('update:visible', false);
  emit('cancel');
};

// Initialize form with existing data
watch(
  () => props.customerData,
  (newData) => {
    if (newData) {
      formState.nextFollowUpDate = formatDate(newData.nextFollowUpDate) || null;
      Object.assign(formState, {
        callStatus: newData.callStatus,
        description: newData.description,
        callReason: newData.callReason,
        callSummary: newData.callSummary,
        followUpRequired: newData.followUpRequired,
        nextFollowUpDate: newData.nextFollowUpDate,
        followUpMethod: newData.followUpMethod,
        internalNote: newData.internalNote,
        customerNote: newData.customerNote,
        callDuration: newData.callDuration,
        satisfactionRating: newData.satisfactionRating
      });
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.ant-form-item:not(.ant-form-item-with-help) {
  margin-bottom: 16px;
}
</style> 