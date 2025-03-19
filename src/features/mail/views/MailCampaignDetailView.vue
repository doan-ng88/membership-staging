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
          :row-key="(record: any) => record.userId"
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
            <template v-if="column.key === 'emailStatus'">
              <a-tag :color="getEmailStatusColor(record.emailStatus)" class="animate__animated animate__fadeIn">
                {{ record.emailStatus || 'N/A' }}
              </a-tag>
            </template>
            <template v-if="column.key === 'emailSendingTime'">
              <span class="animate__animated animate__fadeIn">
                {{ record.emailSendingTime ? formatDate(record.emailSendingTime) : 'N/A' }}
              </span>
            </template>
            <template v-if="column.key === 'emailTemplateID'">
              <span class="animate__animated animate__fadeIn">
                {{ record.emailTemplateID || 'N/A' }}
              </span>
            </template>
          </template>
        </a-table>
      </a-card>

      <!-- PIC Staff List -->
      <a-card class="mb-6 shadow-lg">
        <!-- CHỜ API ENDPOINT -->
        <div class="text-base mt-8 mb-2">
          <h3 class="text-lg font-semibold">PIC Staff List</h3>
          <div v-if="campaign.employees?.length" class="mt-2">
            <a-table :dataSource="campaign.employees" :pagination="false">
              <a-table-column title="Name" dataIndex="name" key="name" />
              <a-table-column title="Email" dataIndex="email" key="email" />
              <a-table-column title="Employee ID" dataIndex="employeeId" key="employeeId" />
              <a-table-column title="Permission Level" dataIndex="permissionLevel" key="permissionLevel" />
              <a-table-column 
                title="Assigned At" 
                dataIndex="assignedAt" 
                key="assignedAt"
                :customRender="({ text }) => dayjs(text).format('DD/MM/YYYY')"
              />
            </a-table>
          </div>
          <div v-else class="text-gray-500 font-normal mt-2">
            No PIC assigned
          </div>
        </div>
      </a-card>

      <!-- Coupons List Card -->
      <a-card class="mb-6 shadow-lg">
        <div class="flex items-center justify-between mb-2">
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
        title="Add Coupon"
        @ok="handleCouponSubmit"
        @cancel="handleCouponCancel"
      >
        <a-form :model="couponForm" :rules="couponRules" ref="couponFormRef">
          <div class="gap-4">
            <a-form-item 
              label="Website" 
              name="websiteId"
              :rules="[{ required: true, message: 'Please select website' }]"
              class="flex-1"
            >
              <a-select
                v-model:value="couponForm.websiteId"
                placeholder="Select website"
                @change="handleWebsiteChange"
              >
                <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                  {{ web.name }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item
              :label="couponForm.websiteId ? 'Coupon Code' : 'Please select website first'"
              name="code"
              :rules="[{ required: true, message: 'Please select coupon code' }]"
              class="flex-1"
            >
              <a-select
                v-model:value="couponForm.code"
                placeholder="Select coupon code"
                :options="couponOptions"
                :loading="loadingCoupons"
                show-search
                :filter-option="false"
                @search="handleSearchCoupons"
                :disabled="!couponForm.websiteId"
                option-label-prop="label"
              >
              </a-select>
            </a-form-item>
          </div>
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
import { Website } from '@/api/types/website'
import { debounce } from 'lodash';
import { membershipAPI } from '@/api/services/membershipApi';

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
    title: 'Email Status',
    dataIndex: 'emailStatus',
    key: 'emailStatus',
    width: 120,
  },
  {
    title: 'Last Send At',
    dataIndex: 'emailSendingTime',
    key: 'emailSendingTime',
    width: 150,
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

const getEmailStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'success': 'success',
    'failed': 'error',
    'pending': 'processing',
    'bounced': 'warning'
  };
  return statusColors[status?.toLowerCase()] || 'default';
};

const statusOptions = Object.values(MailStatus);

const loading = ref(true);

const fetchCampaignData = async () => {
  try {
    loading.value = true;
    const response = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-campaign/${campaignId}`,
      {
        headers: {
          'Authorization': `Bearer ${useAuthStore().token}`
        }
      }
    );
    campaign.value = response.data.campaign;
  } catch (error) {
    console.error('Error fetching campaign data:', error);
    message.error('Failed to fetch campaign data');
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
    title: 'Total use/Usage-limit',
    key: 'usage',
    customRender: ({ record }) => `${record.total_used}/${record.usage_limit}`
  },
  {
    title: 'Date Range',
    key: 'dateRange',
    customRender: ({ record }) => {
      const start = record.start_date ? dayjs(record.start_date).format('DD/MM/YYYY') : 'No start date'
      const end = record.expiry_date ? dayjs(record.expiry_date).format('DD/MM/YYYY') : 'No end date'
      return `${start} - ${end}`
    }
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
  websiteId: undefined,
  code: ''
});

const couponRules = {
  code: [{ required: true, message: 'Please input coupon code' }],
  value: [{ required: true, message: 'Please input coupon value' }],
  status: [{ required: true, message: 'Please select status' }],
};

// Coupon methods
const websites = ref<Website[]>([])

const showAddCouponModal = () => {
  websites.value = [
    { websiteId: 1, name: 'Sky007' },
    { websiteId: 2, name: 'Bbia' },
    { websiteId: 3, name: 'Hince' },
    { websiteId: 4, name: 'Mixsoon' }
  ]
  isCouponModalVisible.value = true
}

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
    const payload = {
      coupons: [
        {
          couponCode: coupon.code,
          status: "remove"
        }
      ]
    };

    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/update/campaign-coupon/${campaignId}`, 
      payload,
      {
        headers: {
          'Authorization': `Bearer ${useAuthStore().token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    message.success('Coupon removed successfully');
    await fetchCampaignData();
  } catch (error: any) {
    console.error('Error removing coupon:', error);
    message.error(error.response?.data?.message || 'Failed to remove coupon');
  }
};

const handleCouponSubmit = async () => {
  try {
    await couponFormRef.value?.validate();
    
    const payload = {
      coupons: [
        {
          couponCode: couponForm.code,
          status: "add"
        }
      ]
    };

    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/update/campaign-coupon/${campaignId}`, 
      payload,
      {
        headers: {
          'Authorization': `Bearer ${useAuthStore().token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    message.success('Coupon added successfully');
    isCouponModalVisible.value = false;
    fetchCampaignData(); // Refresh data
    resetCouponForm();
  } catch (error: any) {
    console.error('Error submitting coupon:', error);
    message.error(error.response?.data?.message || 'Failed to submit coupon');
  }
};

const resetCouponForm = () => {
  Object.assign(couponForm, {
    websiteId: undefined,
    code: ''
  });
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

// State
const loadingCoupons = ref(false)
const couponOptions = ref<{ label: string; value: string }[]>([])

// Methods
const fetchCoupons = async (search?: string) => {
  if (!couponForm.websiteId) return

  try {
    loadingCoupons.value = true
    const response = await membershipAPI.getCoupons(
      couponForm.websiteId,
      1, // pageIndex
      10, // pageSize
      search // search term
    )

    couponOptions.value = response.data.data.map((coupon: any) => ({
      label: coupon.code,
      value: coupon.code
    }))
  } catch (error) {
    message.error('Failed to load coupons')
  } finally {
    loadingCoupons.value = false
  }
}

const handleWebsiteChange = () => {
  couponForm.code = ''
  couponOptions.value = []
  if (couponForm.websiteId) {
    fetchCoupons()
  }
}

const handleSearchCoupons = debounce((value: string) => {
  fetchCoupons(value)
}, 300)
</script>

<style scoped>
.ant-card {
  border-radius: 8px;
}

.ant-descriptions {
  margin-bottom: 0;
}

.animate__animated {
  animation-duration: 0.5s;
}

.a-tag {
  transition: all 0.3s;
}
</style> 