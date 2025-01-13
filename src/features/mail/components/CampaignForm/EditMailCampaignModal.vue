<template>
  <a-modal
    v-model:open="modalVisible"
    :title="t('mailCampaign.edit.title')"
    @cancel="handleCancel"
    @ok="handleSubmit"
    :confirmLoading="loading"
    width="600px"
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
                {{ status.label }}
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
              v-model:value="formState.dateRange"
              style="width: 100%"
              :format="dateFormat"
              @change="handleDateRangeChange"
              :placeholder="[
                t('mailCampaign.placeholder.startDate'),
                t('mailCampaign.placeholder.endDate')
              ]"
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'EditMailCampaignModal'
})
</script>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { useAuthStore } from '@/stores/auth';
import { useI18nGlobal } from '@/i18n';
import type { FormInstance, Rule } from 'ant-design-vue/es/form';
import axios from 'axios';
import { websites, getWebsiteName } from '@/api/types/website';

const props = defineProps<{
  open: boolean;
  campaignId: number;
}>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'success': [];
}>();

const { t } = useI18nGlobal();
const authStore = useAuthStore();
const formRef = ref<FormInstance>();
const loading = ref(false);
const dateFormat = 'YYYY-MM-DD';

// Add modalVisible computed property
const modalVisible = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value)
});

// Add form rules
const rules = {
  name: [
    { required: true, message: t('mailCampaign.validation.nameRequired') }
  ],
  websiteId: [
    { required: true, message: t('mailCampaign.validation.websiteRequired') }
  ],
  priorityLevel: [
    { required: true, message: t('mailCampaign.validation.priorityRequired') }
  ],
  status: [
    { required: true, message: t('mailCampaign.validation.statusRequired') }
  ],
  dateRange: [
    { required: true, type: 'array', message: t('mailCampaign.validation.dateRangeRequired') }
  ]
} as Record<string, Rule[]>;

// Update form state to include dateRange
const formState = reactive({
  name: '',
  websiteId: undefined as number | undefined,
  websiteName: '',
  priorityLevel: '',
  status: '',
  isServiceEmail: false,
  startDate: null as dayjs.Dayjs | null,
  endDate: null as dayjs.Dayjs | null,
  dateRange: [] as [dayjs.Dayjs, dayjs.Dayjs] | null
});

// Define priority levels
const priorityLevels = [
  { value: 'High', label: t('mailCampaign.priority.high'), color: 'red' },
  { value: 'Medium', label: t('mailCampaign.priority.medium'), color: 'orange' },
  { value: 'Low', label: t('mailCampaign.priority.low'), color: 'blue' },
  { value: 'Normal', label: t('mailCampaign.priority.normal'), color: 'green' }
];

// Define statuses
const campaignStatuses = [
  { value: 'Created', label: t('mailCampaign.status.created') },
  { value: 'Planning', label: t('mailCampaign.status.planning') },
  { value: 'In Progress', label: t('mailCampaign.status.inProgress') },
  { value: 'On Hold', label: t('mailCampaign.status.onHold') },
  { value: 'Completed', label: t('mailCampaign.status.completed') },
  { value: 'Closed', label: t('mailCampaign.status.closed') },
  { value: 'Cancelled', label: t('mailCampaign.status.cancelled') }
];

// Update fetchCampaignData
const fetchCampaignData = async () => {
  if (!props.campaignId) return;
  
  try {
    loading.value = true;
    console.log('Fetching campaign data for ID:', props.campaignId);
    
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-campaign/${props.campaignId}`,
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`
        }
      }
    );

    console.log('API Response:', response.data);
    
    if (response.data?.campaign) {
      const campaign = response.data.campaign;
      
      // Update other fields
      formState.name = campaign.campaignName;
      formState.websiteId = campaign.websiteId;
      formState.websiteName = getWebsiteName(campaign.websiteId);
      formState.priorityLevel = campaign.priorityLevel;
      formState.status = campaign.status;
      formState.isServiceEmail = campaign.isServiceEmail;

      // Handle dates
      console.log('Start Date from API:', campaign.startDate);
      console.log('End Date from API:', campaign.dueDate);

      // Convert start date if available
      if (campaign.startDate) {
        const startDate = dayjs(campaign.startDate);
        formState.startDate = startDate;
        console.log('Converted Start Date:', startDate.format('YYYY-MM-DD'));
      }

      // Convert end date if available
      if (campaign.dueDate) {
        const endDate = dayjs(campaign.dueDate);
        formState.endDate = endDate;
        console.log('Converted End Date:', endDate.format('YYYY-MM-DD'));
      }

      // Set dateRange if both dates are available
      if (formState.startDate && formState.endDate) {
        formState.dateRange = [formState.startDate, formState.endDate];
        console.log('Updated formState.dateRange:', formState.dateRange);
      } else {
        formState.dateRange = null;
      }
    }

  } catch (error) {
    console.error('Error fetching campaign:', error);
    message.error(t('mailCampaign.messages.loadError'));
  } finally {
    loading.value = false;
  }
};

// Watch for modal visibility and campaignId changes
watch(
  [() => props.open, () => props.campaignId],
  ([newOpen, newId]) => {
    if (newOpen && newId) {
      fetchCampaignData();
    }
  }
);

const handleCancel = () => {
  modalVisible.value = false;
};

const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    loading.value = true;

    const payload = {
      campaignName: formState.name,
      websiteId: formState.websiteId,
      priorityLevel: formState.priorityLevel,
      status: formState.status,
      startDate: formState.startDate ? dayjs(formState.startDate).format('YYYY-MM-DD') : null,
      dueDate: formState.endDate ? dayjs(formState.endDate).format('YYYY-MM-DD') : null,
      isServiceEmail: formState.isServiceEmail
    };

    const response = await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/update/update-campaign/${props.campaignId}`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      message.success(t('mailCampaign.messages.updateSuccess'));
      emit('success');
      modalVisible.value = false;
    }
  } catch (error) {
    console.error('Error:', error);
    message.error(t('mailCampaign.messages.updateError'));
  } finally {
    loading.value = false;
  }
};

// Update handleDateRangeChange
const handleDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
  formState.dateRange = dates;
  if (dates) {
    formState.startDate = dates[0];
    formState.endDate = dates[1];
  } else {
    formState.startDate = null;
    formState.endDate = null;
  }
};

// Watch for websiteId changes
watch(
  () => formState.websiteId,
  (newWebsiteId) => {
    formState.websiteName = getWebsiteName(newWebsiteId ?? 0);
  }
);
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