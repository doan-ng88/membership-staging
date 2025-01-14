<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-3xl font-bold text-gray-800">Mail Campaign Details</h2>
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
          <a-tag :color="getStatusColor(campaign.status)">{{ campaign.status }}</a-tag>
        </div>
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
            <template v-if="column.key === 'mailStatus'">
              <a-tag :color="getMailStatusColor(record.membershipMailStatus)">
                {{ getStatus(record.membershipMailStatus) }}
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

      <!-- Coupons List Card -->
      <a-card class="mb-6 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold">Coupons List</h3>
          <a-button type="primary" @click="showAddCouponModal">
            Add Coupon
          </a-button>
        </div>

        <a-table
          :columns="couponColumns"
          :data-source="campaign.coupons"
          :pagination="false"
          :loading="loading"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
              <a-tag :color="getCouponStatusColor(record.status)">
                {{ record.status }}
              </a-tag>
            </template>
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" @click="handleEditCoupon(record)">
                  <edit-outlined /> Edit
                </a-button>
                <a-button type="link" danger @click="handleDeleteCoupon(record)">
                  <delete-outlined /> Delete
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- Add/Edit Coupon Modal -->
      <a-modal
        v-model:visible="isCouponModalVisible"
        :title="editingCoupon ? 'Edit Coupon' : 'Add Coupon'"
        @ok="handleCouponSubmit"
        @cancel="handleCouponCancel"
      >
        <a-form :model="couponForm" :rules="couponRules" ref="couponFormRef">
          <a-form-item label="Code" name="code">
            <a-input v-model:value="couponForm.code" />
          </a-form-item>
          <a-form-item label="Description" name="description">
            <a-textarea v-model:value="couponForm.description" />
          </a-form-item>
          <a-form-item label="Value" name="value">
            <a-input-number v-model:value="couponForm.value" :min="0" />
          </a-form-item>
          <a-form-item label="Status" name="status">
            <a-select v-model:value="couponForm.status">
              <a-select-option value="active">Active</a-select-option>
              <a-select-option value="inactive">Inactive</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>

      <!-- Change Status Modal -->
      <a-modal
        v-model:open="isChangeStatusModalVisible"
        title="Change Mail Status"
        @ok="handleStatusChange"
        @cancel="handleCancel"
        ok-text="Confirm"
        cancel-text="Cancel"
      >
        <a-form :model="formState" :rules="formRules" ref="formRef">
          <a-form-item label="Status" name="selectedStatus" :rules="[{ required: true, message: 'Please select a status' }]">
            <a-select v-model:value="formState.selectedStatus" style="width: 100%" placeholder="Select status">
              <a-select-option v-for="status in statusOptions.filter(status => status !== formState.selectedMember?.membershipMailStatus)" :key="status" :value="status">
                {{ getStatus(status) }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Note" name="statusDescription">
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
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { FormInstance } from 'ant-design-vue';

enum MailStatus {
  NOT_SENT = 'not_sent',
  SENT = 'sent',
  FAILED = 'failed',
  PENDING = 'pending',
  BOUNCED = 'bounced'
}

const route = useRoute();
const router = useRouter();
const campaign = ref<any>({});
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
    { required: true, message: 'Please enter a note' }
  ]
};

const campaignId = route.params.id;

const memberColumns: TableColumnsType = [
  {
    title: 'Full Name',
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: 'Phone',
    dataIndex: 'phoneNumber',
    key: 'phone',
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
  },
  {
    title: 'Mail Status',
    dataIndex: 'membershipMailStatus',
    key: 'mailStatus',
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
  }
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
    showTotal: (total: number) => `Total ${campaign.value.memberships?.length || 0} items`,
    pageSizeOptions: ['5', '10', '20'],
    onChange: (page: number, pageSize: number) => {
      membersPagination.current = page;
      membersPagination.pageSize = pageSize;
    },
  }
}));

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY');
};

const getStatusColor = (status: MailStatus) => {
  const statusColors: Record<string, string> = {
    [MailStatus.SENT]: 'success',
    [MailStatus.PENDING]: 'processing',
    [MailStatus.FAILED]: 'error',
    [MailStatus.NOT_SENT]: 'default',
    [MailStatus.BOUNCED]: 'warning',
  };
  return statusColors[status] || 'default';
};

const getStatus = (status: MailStatus) => {
  const statuses: Record<string, string> = {
    [MailStatus.SENT]: 'Sent',
    [MailStatus.PENDING]: 'Pending',
    [MailStatus.FAILED]: 'Failed',
    [MailStatus.NOT_SENT]: 'Not Sent',
    [MailStatus.BOUNCED]: 'Bounced',
  };
  return statuses[status] || 'Not Sent';
};

const getMailStatusColor = (status: MailStatus) => {
  return getStatusColor(status);
};

const statusOptions = Object.values(MailStatus);

const loading = ref(true);

const fetchCampaignData = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/membership/get/get-campaign/${campaignId}`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`
      }
    });
    
    if (response.data.campaign) {
      campaign.value = response.data.campaign;
      console.log('Campaign data loaded:', campaign.value);
    } else {
      throw new Error('Campaign data not found');
    }
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
      mailCampaignId: Number(campaignId),
      customerId: formState.selectedMember.userId,
      mailStatus: formState.selectedStatus,
      note: formState.statusDescription
    };

    await axios.post(`${import.meta.env.VITE_API_BASE_URL}/membership/update/update-mail-customer`, payload, {
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`
      }
    });
    await fetchCampaignData();
    message.success('Status updated successfully');
  } catch (error) {
    console.error('Error updating status:', error);
    message.error('Failed to update status');
  }
  isChangeStatusModalVisible.value = false;
};

const handleCancel = () => {
  isChangeStatusModalVisible.value = false;
};

// Coupon columns
const couponColumns = [
  {
    title: 'Code',
    dataIndex: 'code',
    key: 'code',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Value',
    dataIndex: 'value',
    key: 'value',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
  },
];

// Coupon state
const isCouponModalVisible = ref(false);
const editingCoupon = ref<any>(null);
const couponFormRef = ref<FormInstance>();
const couponForm = reactive({
  code: '',
  description: '',
  value: 0,
  status: 'active'
});

const couponRules = {
  code: [{ required: true, message: 'Please input coupon code' }],
  value: [{ required: true, message: 'Please input coupon value' }],
  status: [{ required: true, message: 'Please select status' }],
};

// Coupon methods
const showAddCouponModal = () => {
  editingCoupon.value = null;
  couponForm.code = '';
  couponForm.description = '';
  couponForm.value = 0;
  couponForm.status = 'active';
  isCouponModalVisible.value = true;
};

const handleEditCoupon = (coupon: any) => {
  editingCoupon.value = coupon;
  couponForm.code = coupon.code;
  couponForm.description = coupon.description;
  couponForm.value = coupon.value;
  couponForm.status = coupon.status;
  isCouponModalVisible.value = true;
};

const handleDeleteCoupon = async (coupon: any) => {
  try {
    await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/coupons/${coupon.id}`, {
      headers: {
        'Authorization': `Bearer ${useAuthStore().token}`
      }
    });
    message.success('Coupon deleted successfully');
    fetchCampaignData(); // Refresh data
  } catch (error) {
    console.error('Error deleting coupon:', error);
    message.error('Failed to delete coupon');
  }
};

const handleCouponSubmit = async () => {
  try {
    await couponFormRef.value?.validate();
    
    const payload = {
      campaignId: campaignId,
      ...couponForm
    };

    if (editingCoupon.value) {
      await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/coupons/${editingCoupon.value.id}`, payload, {
        headers: {
          'Authorization': `Bearer ${useAuthStore().token}`
        }
      });
    } else {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/coupons`, payload, {
        headers: {
          'Authorization': `Bearer ${useAuthStore().token}`
        }
      });
    }

    message.success(`Coupon ${editingCoupon.value ? 'updated' : 'added'} successfully`);
    isCouponModalVisible.value = false;
    fetchCampaignData(); // Refresh data
  } catch (error) {
    console.error('Error submitting coupon:', error);
    message.error('Failed to submit coupon');
  }
};

const handleCouponCancel = () => {
  isCouponModalVisible.value = false;
};

const getCouponStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'active': 'green',
    'inactive': 'red',
  };
  return statusColors[status.toLowerCase()] || 'default';
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