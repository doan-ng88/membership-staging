<template>
  <a-modal
    :visible="visible"
    title="Send Mail Template"
    width="800px"
    :footer="null"
    @cancel="handleCancel"
    @ok="handleSubmit"
  >
    <div class="send-mail-container">
      <!-- Mail Info Section -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-4">Mail Information</h3>
        <a-form layout="vertical">
          <a-form-item 
            label="Mail Sender" 
            required
            :rules="[{ required: true, message: 'Please input mail sender' }]"
          >
            <a-input v-model:value="mailSender" placeholder="cskh@fakerize.com" />
          </a-form-item>
          <a-form-item 
            label="Subject" 
            required
            :rules="[{ required: true, message: 'Please input subject' }]"
          >
            <a-input v-model:value="subject" placeholder="Enter subject email" />
          </a-form-item>
        </a-form>
      </div>

      <!-- Send Options Tabs -->
      <a-tabs v-model:activeKey="activeTab">
        <!-- Send by Campaign Tab -->
        <a-tab-pane key="campaign" tab="Send by Campaign">
          <div class="p-4">
            <a-form layout="vertical">
              <a-form-item label="Select Campaign">
                <a-select
                  v-model:value="selectedCampaign"
                  placeholder="Select campaign"
                  @change="handleCampaignChange"
                  :loading="loadingCampaigns"
                >
                  <a-select-option v-for="campaign in campaigns" :key="campaign.id" :value="campaign.id">
                    {{ campaign.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>

        <!-- Send by Membership Tab -->
        <a-tab-pane key="membership" tab="Send by Membership">
          <div class="p-4">
            <a-form layout="vertical">
              <a-form-item label="Search Members">
                <a-input-search
                  v-model:value="searchText"
                  placeholder="Search by name, email, phone..."
                  @search="handleSearch"
                />
              </a-form-item>
            </a-form>
          </div>
        </a-tab-pane>
      </a-tabs>

      <!-- Fields Template Mapping -->
      <div class="mt-6 p-4 border rounded-lg">
        <h4 class="font-medium mb-4">Fields Template Mapping</h4>
        <div class="grid grid-cols-2 gap-4">
          <div v-for="field in templateFields" :key="field" class="mb-3">
            <a-tag class="mb-2">{{ field }}</a-tag>
            <a-select
              v-model:value="fieldMapping[field]"
              placeholder="Select mapping field"
              style="width: 100%"
            >
              <a-select-option v-for="option in mappingOptions" :key="option.value" :value="option.value">
                {{ option.label }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>

      <!-- Upload Excel Section -->
      <div class="mt-6 p-4 border rounded-lg">
        <h4 class="font-medium mb-4">Upload Recipients from Excel</h4>
        <a-upload
          :customRequest="handleUploadExcel"
          :showUploadList="false"
          accept=".xlsx,.xls"
        >
          <a-button type="primary">
            <template #icon>
              <upload-outlined />
            </template>
            Upload Excel
          </a-button>
        </a-upload>
      </div>

      <!-- Footer Actions -->
      <div class="mt-6 flex justify-end gap-2">
        <a-button @click="handleCancel">
          Cancel
        </a-button>
        <a-button 
          type="primary" 
          :loading="sending"
          @click="handleSubmit"
        >
          Send Mail
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import type { MailTemplate } from '../types/mail-template.types';

// Props
const props = defineProps<{
  visible: boolean;
  template: MailTemplate | null;
}>();

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean];
  'success': [];
  'cancel': [];
}>();

// States
const mailSender = ref('cskh@fakerize.com');
const subject = ref(props.template?.subject || '');
const activeTab = ref('campaign');
const selectedCampaign = ref(null);
const searchText = ref('');
const sending = ref(false);
const loadingCampaigns = ref(false);

// Template fields and mapping
const templateFields = ['firstname', 'unsubscribe', 'accountaddress', 'view'];
const fieldMapping = reactive({});
const mappingOptions = [
  { label: 'First Name', value: 'firstName' },
  { label: 'Last Name', value: 'lastName' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
];

// Methods
const handleSubmit = async () => {
  try {
    sending.value = true;
    
    // Validate required fields
    if (!mailSender.value || !subject.value) {
      message.error('Please fill in all required fields');
      return;
    }

    const sendData = {
      templateId: props.template?.id,
      mailSender: mailSender.value,
      subject: subject.value,
      sendType: activeTab.value,
      campaignId: activeTab.value === 'campaign' ? selectedCampaign.value : null,
      fieldMapping: fieldMapping,
    };

    // TODO: Call API to send mail
    await mailTemplateService.sendMail(sendData);
    
    message.success('Mail sent successfully');
    emit('update:visible', false);
    emit('success');
  } catch (error) {
    console.error('Error sending mail:', error);
    message.error('Failed to send mail');
  } finally {
    sending.value = false;
  }
};

const handleCancel = () => {
  emit('update:visible', false);
  emit('cancel');
};

const handleCampaignChange = async (value: number) => {
  // TODO: Handle campaign change
};

const handleSearch = async () => {
  // TODO: Handle member search
};

const handleUploadExcel = async (options: any) => {
  // TODO: Handle excel upload
};
</script>

<style scoped>
.send-mail-container {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 8px;
}

.ant-form-item {
  margin-bottom: 16px;
}

.ant-tag {
  margin-right: 8px;
}

:deep(.ant-upload) {
  width: 100%;
}
</style> 