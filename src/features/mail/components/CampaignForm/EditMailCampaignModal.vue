<template>
  <a-modal
    v-model:open="modalVisible"
    :title="t('mailCampaign.edit.title')"
    @cancel="handleCancel"
    @ok="handleSubmit"
    :confirmLoading="loading"
    width="800px"
    :maskClosable="false"
    :keyboard="true"
    class="edit-campaign-modal"
    :okText="t('mailCampaign.edit.buttons.save')"
    :cancelText="t('mailCampaign.edit.buttons.cancel')"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <!-- Campaign Info -->
      <div class="section-container">
        <div class="grid grid-cols-2 gap-4">
          <!-- Campaign Name -->
          <a-form-item 
            :label="t('mailCampaign.table.columns.name')" 
            name="name"
            :rules="[{ required: true, message: t('mailCampaign.edit.validation.nameRequired') }]"
          >
            <a-input 
              v-model:value="formState.name" 
              :placeholder="t('mailCampaign.edit.placeholder.name')"
            />
          </a-form-item>

          <!-- Website -->
          <a-form-item 
            :label="t('mailCampaign.table.columns.website')" 
            name="websiteId"
            :rules="[{ required: true, message: t('mailCampaign.edit.validation.websiteRequired') }]"
          >
            <a-select 
              v-model:value="formState.websiteId"
              :placeholder="t('mailCampaign.edit.placeholder.website')"
            >
              <a-select-option 
                v-for="website in websites" 
                :key="website.websiteId" 
                :value="website.websiteId"
              >
                {{ website.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <!-- Priority Level -->
          <a-form-item 
            :label="t('mailCampaign.table.columns.priorityLevel')" 
            name="priorityLevel"
          >
            <a-select 
              v-model:value="formState.priorityLevel"
              :placeholder="t('mailCampaign.edit.placeholder.priorityLevel')"
            >
              <a-select-option 
                v-for="priority in priorityLevels" 
                :key="priority.value" 
                :value="priority.value"
              >
                <a-tag :color="priority.color">{{ priority.label }}</a-tag>
              </a-select-option>
            </a-select>
          </a-form-item>

          <!-- Status -->
          <a-form-item 
            :label="t('mailCampaign.table.columns.status')" 
            name="status"
          >
            <a-select 
              v-model:value="formState.status"
              :placeholder="t('mailCampaign.edit.placeholder.status')"
            >
              <a-select-option 
                v-for="status in campaignStatuses" 
                :key="status.value" 
                :value="status.value"
              >
                <a-tag :color="status.color">{{ status.label }}</a-tag>
              </a-select-option>
            </a-select>
          </a-form-item>

          <!-- Date Range -->
          <a-form-item 
            :label="t('mailCampaign.table.columns.dateRange')" 
            name="dateRange"
            class="col-span-2"
          >
            <a-range-picker
              v-model:value="dateRange"
              style="width: 100%"
              :placeholder="[
                t('mailCampaign.edit.placeholder.startDate'),
                t('mailCampaign.edit.placeholder.endDate')
              ]"
              @change="handleDateRangeChange"
              :format="dateFormat"
            />
          </a-form-item>

          <!-- Service Email Checkbox -->
          <a-form-item class="col-span-2">
            <a-checkbox 
              v-model:checked="formState.isServiceEmail"
              class="custom-checkbox"
            >
              {{ t('mailCampaign.table.columns.isServiceEmail') }}
            </a-checkbox>
          </a-form-item>
        </div>
      </div>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import dayjs, { Dayjs } from 'dayjs';
import { useI18nGlobal } from '@/i18n';
import { websites } from '@/api/types/website';
import type { FormInstance } from 'ant-design-vue';
import type { MailCampaign } from '../../types/mail-campaign.types';
import { mailCampaignService } from '../../services/mail-campaign.service';
import type { Rule } from 'ant-design-vue/es/form';

const props = defineProps<{
  open: boolean;
  campaignId: number;
  campaignData: MailCampaign;
}>();

const { t } = useI18nGlobal();
const formRef = ref<FormInstance>();
const loading = ref(false);
const dateFormat = 'YYYY-MM-DD';
const dateRange = ref<[Dayjs, Dayjs] | null>(null);

// Form State
const formState = reactive({
  name: '',
  websiteId: undefined as number | undefined,
  priorityLevel: '',
  status: '',
  isServiceEmail: false,
  startDate: null as string | null,
  endDate: null as string | null
});

// Priority Levels Configuration
const priorityLevels = [
  { value: 'High', label: t('mailCampaign.priority.high'), color: 'red' },
  { value: 'Medium', label: t('mailCampaign.priority.medium'), color: 'orange' },
  { value: 'Low', label: t('mailCampaign.priority.low'), color: 'green' },
  { value: 'Normal', label: t('mailCampaign.priority.normal'), color: 'blue' }
];

// Campaign Statuses Configuration
const campaignStatuses = [
  { value: 'Active', label: t('mailCampaign.status.active'), color: 'green' },
  { value: 'Inactive', label: t('mailCampaign.status.inactive'), color: 'red' },
  { value: 'Pending', label: t('mailCampaign.status.pending'), color: 'orange' },
  { value: 'Completed', label: t('mailCampaign.status.completed'), color: 'blue' }
];

// Add ref for modal visibility
const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

// Load campaign data when modal opens
watch(
  () => props.open,
  async (newValue) => {
    if (newValue && props.campaignId) {
      try {
        loading.value = true;
        formState.name = props.campaignData.name;
        formState.websiteId = props.campaignData.websiteId;
        formState.priorityLevel = props.campaignData.priorityLevel;
        formState.status = props.campaignData.status;
        formState.isServiceEmail = props.campaignData.isServiceEmail;
        formState.startDate = props.campaignData.startDate;
        formState.endDate = props.campaignData.endDate;

        // Set date range if both dates exist
        if (props.campaignData.startDate && props.campaignData.endDate) {
          dateRange.value = [
            dayjs(props.campaignData.startDate),
            dayjs(props.campaignData.endDate)
          ];
        }
        
        console.log('Loaded campaign data:', formState);
      } catch (error) {
        console.error('Error loading campaign:', error);
        message.error(t('mailCampaign.messages.loadError'));
      } finally {
        loading.value = false;
      }
    }
  }
);

const emit = defineEmits<{
  'update:open': [value: boolean];
  'success': [];
}>();

// Handle close/cancel modal
const handleCancel = () => {
  // Reset form
  formRef.value?.resetFields();
  // Reset date range
  dateRange.value = null;
  // Close modal
  modalVisible.value = false;
};

// Handle close button (X) click - this will be called by modal's @cancel
const handleClose = () => {
  handleCancel();
};

const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
  if (dates) {
    formState.startDate = dates[0].format(dateFormat);
    formState.endDate = dates[1].format(dateFormat);
  } else {
    formState.startDate = null;
    formState.endDate = null;
  }
};

// Update handleSubmit
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const updatedCampaign = {
      id: props.campaignId,
      name: formState.name,
      websiteId: formState.websiteId,
      priorityLevel: formState.priorityLevel,
      status: formState.status,
      isServiceEmail: formState.isServiceEmail,
      startDate: formState.startDate,
      endDate: formState.endDate
    };

    // Gọi API update campaign
    const response = await mailCampaignService.updateMailCampaign(updatedCampaign);
    
    if (response) {
      message.success(t('mailCampaign.messages.updateSuccess'));
      emit('success');
      modalVisible.value = false;
      formRef.value?.resetFields();
      dateRange.value = null;
    }
  } catch (error) {
    console.error('Error updating campaign:', error);
    message.error(t('mailCampaign.messages.updateError'));
  } finally {
    loading.value = false;
  }
};

// Add form rules
const rules = {
  name: [
    { 
      required: true, 
      message: t('mailCampaign.edit.validation.nameRequired'),
      trigger: 'blur' 
    }
  ],
  websiteId: [
    { 
      required: true, 
      message: t('mailCampaign.edit.validation.websiteRequired'),
      trigger: 'change' 
    }
  ],
  priorityLevel: [
    { 
      required: true, 
      message: t('mailCampaign.edit.validation.priorityRequired'),
      trigger: 'change' 
    }
  ],
  status: [
    { 
      required: true, 
      message: t('mailCampaign.edit.validation.statusRequired'),
      trigger: 'change' 
    }
  ],
  dateRange: [
    { 
      required: true, 
      message: t('mailCampaign.edit.validation.dateRangeRequired'),
      trigger: 'change',
      type: 'array' 
    }
  ]
} as Record<string, Rule[]>;
</script>

<style scoped>
.edit-campaign-modal {
  :deep(.ant-modal-content) {
    border-radius: 8px;
  }
  
  :deep(.ant-modal-header) {
    border-radius: 8px 8px 0 0;
    background-color: #f8fafc;
    padding: 16px 24px;
  }

  :deep(.ant-modal-title) {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
  }
}

.section-container {
  background-color: #ffffff;
  border-radius: 6px;
  padding: 16px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-select-selector),
:deep(.ant-input),
:deep(.ant-input-number),
:deep(.ant-picker) {
  border-radius: 6px !important;
}

:deep(.ant-input-number) {
  width: 100% !important;
}

.custom-checkbox {
  margin-top: 8px;
}
</style> 