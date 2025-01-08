<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-3xl font-bold text-gray-800">Campaign Details</h2>
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
        <p class="text-lg font-semibold text-gray-700 mt-2">{{ campaign.description }}</p>
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
                <a-button type="link" size="small" @click="showChangeStatusModal(record)">
                  Change Status
                </a-button>
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


      <!-- Change Status Modal -->
      <a-modal
        v-model:open="isChangeStatusModalVisible"
        title="Change Status"
        @ok="handleStatusChange"
        @cancel="handleCancel"
        ok-text="Confirm"
        cancel-text="Cancel"
      >
        <a-form :model="formState" :rules="formRules" ref="formRef">
          <a-form-item label="Status" name="selectedStatus" :rules="[{ required: true, message: 'Please select a status' }]">
            <a-select v-model:value="formState.selectedStatus" style="width: 100%" placeholder="Select status">
              <a-select-option v-for="status in statusOptions.filter(status => status !== formState.selectedMember?.membershipCallStatus)" :key="status" :value="status">
                {{ getStatus(status) }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Description" name="statusDescription">
            <a-textarea
              v-model:value="formState.statusDescription"
              placeholder="Enter note"
              :rows="4"
              style="margin-top: 16px; width: 100%;"
            />
          </a-form-item>
        </a-form>
      </a-modal>
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

enum CallStatus {
  NOT_CALL = 'not_call',
  NEED_RECALL = 'need_recall',
  NO_ANSWER = 'no_answer',
  COMPLETED = 'completed',
  PENDING = 'pending',
}

const route = useRoute();
const router = useRouter();
const campaign = ref<any>({});
const coupons = ref<any[]>([]);
const isChangeStatusModalVisible = ref(false);

const formState = reactive({
  selectedMember: null,
  selectedStatus: null,
  statusDescription: ''
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

const campaignId = route.params.id; // Get the campaign ID from the route
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
  };
  return statusColors[status] || 'default';
};

const getStatus = (status: CallStatus) => {
  const statuses: Record<string, string> = {
    [CallStatus.COMPLETED]: 'Completed',
    [CallStatus.PENDING]: 'Pending',
    [CallStatus.NO_ANSWER]: 'No answer',
    [CallStatus.NOT_CALL]: 'Not call',
    [CallStatus.NEED_RECALL]: 'Need recall',
  };
  return statuses[status] || 'Not call';
};

const getCallStatusColor = (status: CallStatus) => {
  return getStatusColor(status);
};

const statusOptions = Object.values(CallStatus).slice(1);

const loading = ref(true);

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
    console.error('Error validating form:', error);
    return;
  }

  try {
    const payload = {
      serviceCallCampaignID: Number(campaignId),
      customerID: formState.selectedMember.userId,
      callStatus: formState.selectedStatus,
      note: formState.statusDescription
    };

    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/membership/update/update-call-customer`, payload, {
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`
      }
    });
    fetchCampaignData();
  } catch (error) {
    console.error('Error fetching campaign data:', error);
    message.error('Unable to load campaign data');
  }
  isChangeStatusModalVisible.value = false;
};

const handleCancel = () => {
  isChangeStatusModalVisible.value = false;
};
</script>

<style scoped>
.ant-card {
  border-radius: 8px;
}

.ant-descriptions {
  margin-bottom: 0;
}
</style>
