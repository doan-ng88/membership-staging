<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-3xl font-bold text-gray-800"> Call Campaign Detail</h2>
        </template>
        <template #extra>
          <a-button type="primary" @click="router.back()">
            Back
          </a-button>
        </template>
      </PageHeader>

      <!-- Campaign Info Card -->
      <a-card class="mb-6 shadow-lg">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold text-blue-600">{{ campaign.campaignName }}</h2>
          <a-tag color="blue">{{ campaign.status }}</a-tag>
        </div>
        <!-- <p class="text-lg font-semibold text-gray-700 mt-2">{{ campaign.description }}</p> -->
        <div class="text-gray-600 mt-1">{{ `${formatDate(campaign.startDate)} - ${formatDate(campaign.dueDate)}` }}</div>

        <!-- Members Table Title -->
        <div class="text-base font-semibold mt-8 mb-2">Members List</div>
        <!-- Members Table -->
        <a-table
          :columns="memberColumns"
          :data-source="campaign.memberships"
          :pagination="membersTableConfig.pagination"
          :row-key="record => record.userId"
          :loading="loading"
          bordered
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'birthday'">
              {{ formatDate(text) }}
            </template>
            <template v-if="column.key === 'level'">
              {{ text.Name || 'N/A' }}
            </template>
            <template v-if="column.key === 'callStatus'">
              <a-tag :color="getCallStatusColor(record.membershipCallStatus)">
                {{ getStatus(record.membershipCallStatus) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-tooltip placement="top" title="Change Status">
                  <a-button 
                    type="link" 
                    size="small" 
                    @click="showChangeStatusModal(record)"
                    class="bg-gray-200 rounded-lg hover:bg-blue-50 transition-colors mx-1"
                  >
                    <EditOutlined class="text-blue-600 text-base" />
                  </a-button>
                </a-tooltip>
                <a-tooltip placement="top" title="View History">
                  <a-button 
                    type="link" 
                    size="small" 
                    @click="handleCallHistory(record)"
                    class="bg-gray-200 rounded-lg hover:bg-green-50 transition-colors mx-1"
                  >
                    <HistoryOutlined class="text-green-600 text-base" />
                  </a-button>
                </a-tooltip>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- Coupons Table -->
      <a-card title="Coupons List" class="mb-6 shadow-lg">
        <a-table
          :columns="couponColumns"
          :data-source="campaign.coupons"
          :pagination="couponsTableConfig.pagination"
          :row-key="record => record.id"
          :loading="loading"
          bordered
        />
      </a-card>

      <!-- Update Call Customer Modal -->
      <a-modal
        v-model:open="isChangeStatusModalVisible"
        :title="t('callCampaign.callCampaignDetail.updateCallCustomer.title')"
        @ok="handleStatusChange"
        @cancel="handleCancel"
        ok-text="Xác nhận"
        cancel-text="Hủy"
        width="800px"
      >
        <a-form :model="formState" :rules="formRules" ref="formRef" layout="vertical">
          <!-- Status Selection -->
          <a-form-item 
            :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.status.label')"
            name="selectedStatus"
            :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.status.required') }]"
          >
            <a-select
              v-model:value="formState.selectedStatus"
              :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.status.statusPlaceholder')"
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
            name="statusDescription"
            :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.description.required') }]"
          >
            <a-textarea
              v-model:value="formState.statusDescription"
              :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.description.descriptionPlaceholder')"
              :rows="3"
              show-count
              :maxlength="500"
            />
          </a-form-item>

          <!-- Call Details Grid -->
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

            <div v-if="formState.followUpRequired" class="grid grid-cols-2 gap-4 mt-4">
              <a-form-item
                :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.nextFollowUpDate.label')"
                name="nextFollowUpDate"
                :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.nextFollowUpDate.required') }]"
              >
                <a-date-picker
                  v-model:value="formState.nextFollowUpDate"
                  format="DD/MM/YYYY"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  :disabled-date="disabledDate"
                />
              </a-form-item>

              <a-form-item
                :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.followUpMethod.label')"
                name="followUpMethod"
                :rules="[{ required: true, message: t('callCampaign.callCampaignDetail.updateCallCustomer.form.followUpMethod.required') }]"
              >
                <a-select
                  v-model:value="formState.followUpMethod"
                  :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.followUpMethod.placeholder')"
                >
                  <a-select-option value="call">Gọi điện</a-select-option>
                  <a-select-option value="email">Email</a-select-option>
                  <a-select-option value="sms">SMS</a-select-option>
                </a-select>
              </a-form-item>
            </div>
          </div>

          <!-- Call Note -->
          <a-form-item
            :label="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callNote')"
            name="callNote"
          >
            <a-textarea
              v-model:value="formState.callNote"
              :placeholder="t('callCampaign.callCampaignDetail.updateCallCustomer.form.callNotePlaceholder')"
              :rows="2"
              show-count
              :maxlength="500"
            />
          </a-form-item>
        </a-form>
      </a-modal>

      <CallCampaignHistoryModal ref="callHistoryModalRef" />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import dayjs from 'dayjs';
import type { TableColumnsType } from 'ant-design-vue';
import { message } from 'ant-design-vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import { HistoryOutlined, EditOutlined } from '@ant-design/icons-vue'
import CallCampaignHistoryModal from '@/features/call-campaign/components/CampaignForm/CallCampaignHistoryModal.vue';
import { useI18nGlobal } from '@/i18n';

const { t } = useI18nGlobal();

enum CallStatus {
  NOT_CALL = 'not_call',
  NEED_RECALL = 'need_recall',
  NO_ANSWER = 'no_answer',
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing'
}

const route = useRoute();
const router = useRouter();
const campaign = ref<any>({});
const coupons = ref<any[]>([]);
const isChangeStatusModalVisible = ref(false);

const formState = reactive({
  selectedMember: null,
  selectedStatus: null,
  statusDescription: '',
  callReason: '',
  callSummary: '',
  followUpRequired: false,
  nextFollowUpDate: null as Date | null,
  callNote: '',
  followUpMethod: null
});

const formRef = ref();

const formRules = {
  selectedStatus: [
    { required: true, message: 'Please select a status' }
  ],
  statusDescription: [
    { required: true, message: 'Please enter a description' }
  ]
};

const campaignId = Number(route.params.id);
const memberColumns: TableColumnsType = [
  {
    title: 'Full Name',
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: 'Phone Number',
    dataIndex: 'phoneNumber',
    key: 'phoneNumber',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Birthday',
    dataIndex: 'birthday',
    key: 'birthday',
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
  },
  {
    title: 'Points',
    dataIndex: 'points',
    key: 'points',
  },
  {
    title: 'Call Status',
    key: 'callStatus',
    width: 120,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
  }
];

const couponColumns: TableColumnsType = [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Total used',
    dataIndex: 'total_used',
    key: 'total_used',
  },
  {
    title: 'Coupon amount',
    dataIndex: 'coupon_amount',
    key: 'coupon_amount',
  },
];

const membersPagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
});

const membersTableConfig = computed(() => ({
  pagination: {
    ...membersPagination,
    showSizeChanger: true,
    showTotal: (total: number) => `Total ${campaign.value.memberships.length} items`,
    pageSizeOptions: ['5', '10', '20'],
    onChange: (page: number, pageSize: number) => {
      membersPagination.current = page;
      membersPagination.pageSize = pageSize;
    },
  }
}));

const couponsPagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
});

const couponsTableConfig = computed(() => ({
  pagination: {
    ...couponsPagination,
    showSizeChanger: true,
    showTotal: (total: number) => `Total ${campaign.value.memberships.length} items`,
    pageSizeOptions: ['5', '10', '20'],
    onChange: (page: number, pageSize: number) => {
      couponsPagination.current = page;
      couponsPagination.pageSize = pageSize;
    },
  }
}));

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current < dayjs().endOf('day');
};

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY');
};

const getStatusColor = (status: CallStatus) => {
  const statusColors: Record<string, string> = {
    [CallStatus.COMPLETED]: 'success',
    [CallStatus.PENDING]: 'processing',
    [CallStatus.NO_ANSWER]: 'error',
    [CallStatus.NOT_CALL]: 'default',
    [CallStatus.NEED_RECALL]: 'warning',
    [CallStatus.CANCELLED]: 'orange',
  };
  return statusColors[status] || 'default';
};

const getStatus = (status: string) => {
  return t(`callCampaign.callCampaignDetail.updateCallCustomer.status.${status}`);
};

// const getStatus = (status: CallStatus) => {
//   const statuses: Record<string, string> = {
//     [CallStatus.COMPLETED]: 'Completed',
//     [CallStatus.PENDING]: 'Pending',
//     [CallStatus.NO_ANSWER]: 'No answer',
//     [CallStatus.NOT_CALL]: 'Not call',
//     [CallStatus.NEED_RECALL]: 'Need recall',
//     [CallStatus.CANCELLED]: 'Cancelled',
//     [CallStatus.PROCESSING]: 'Processing'
//   };
//   return statuses[status] || 'Not call';
// };

const getCallStatusColor = (status: CallStatus) => {
  return getStatusColor(status);
};

const statusOptions = Object.values(CallStatus).slice(1);

const loading = ref(true);

const callHistoryModalRef = ref<InstanceType<typeof CallCampaignHistoryModal>>();

// Fetch campaign data
const fetchCampaignData = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/membership/get/get-campaign/${campaignId}`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`
      }
    });
    campaign.value = response.data.campaign; 
  } catch (error) {
    console.error('Error fetching campaign data:', error);
    message.error('Unable to load campaign data');
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  fetchCampaignData();
});

const showChangeStatusModal = (record: any) => {
  formState.selectedMember = record;
  isChangeStatusModalVisible.value = true;
};

const handleStatusChange = async () => {
  try {
    await formRef.value.validateFields();
  } catch (error) {
    return;
  }

  try {
    const payload = {
      serviceCallCampaignID: Number(campaignId),
      customerID: formState.selectedMember?.userId,
      callStatus: formState.selectedStatus,
      note: formState.statusDescription,
      callReason: formState.callReason,
      callSummary: formState.callSummary,
      followUpRequired: formState.followUpRequired,
      nextFollowUpDate: formState.nextFollowUpDate ? dayjs(formState.nextFollowUpDate).format('YYYY-MM-DDTHH:mm:ssZ') : null,
      callNote: formState.callNote,
      followUpMethod: formState.followUpMethod
    };

    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/membership/update/update-call-customer`, payload, {
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`
      }
    });
    fetchCampaignData();
  } catch (error) {
    console.error('Error updating status:', error);
    message.error('Update failed');
  }
  isChangeStatusModalVisible.value = false;
};

const handleCancel = () => {
  isChangeStatusModalVisible.value = false;
};

const handleCallHistory = (member: any) => {
  callHistoryModalRef.value?.open(
    campaignId,
    member.userId
  );
};
</script>

<style scoped>
.ant-card {
  border-radius: 8px;
}

.ant-descriptions {
  margin-bottom: 0;
}

.action-btn {
  background: #f0f2f5;
  border-radius: 8px;
  padding: 4px 8px;
  margin: 0 4px;
  transition: all 0.3s;
}

.action-btn:hover {
  background: #e6f7ff;
}

.icon-change-status {
  color: #1890ff;
  font-size: 16px;
}

.icon-view-history {
  color: #52c41a;
  font-size: 16px;
}
</style>
