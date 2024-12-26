<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">Campaign Details</h2>
        </template>
        <template #extra>
          <a-button @click="router.back()">
            Back
          </a-button>
        </template>
      </PageHeader>

      <!-- Campaign Info Card -->
      <a-card class="mb-6">
        <a-descriptions title="Campaign Information" bordered>
          <a-descriptions-item label="Campaign Name">
            {{ campaign.campaignName }}
          </a-descriptions-item>
          <a-descriptions-item label="Description">
            {{ campaign.description }}
          </a-descriptions-item>
          <a-descriptions-item label="Status">
            <a-tag :color="getStatusColor(campaign.status)">
              {{ campaign.status }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="Start Date">
            {{ formatDate(campaign.startDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="End Date">
            {{ formatDate(campaign.dueDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="Priority Level">
            {{ campaign.priorityLevel }}
          </a-descriptions-item>
        </a-descriptions>
      </a-card>

      <!-- Members Table -->
      <a-card title="Member List" class="mb-6">
        <a-table
          :columns="memberColumns"
          :data-source="campaign.memberships"
          :pagination="{ pageSize: 10 }"
          :row-key="record => record.userId"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'birthday'">
              {{ formatDate(text) }}
            </template>
            <template v-if="column.key === 'level'">
              {{ text.Name || 'N/A' }}
            </template>
            <template v-if="column.key === 'callStatus'">
              <a-tag :color="getCallStatusColor(record.membershipCallHistory?.status || 'Not Called')">
                {{ record.membershipCallHistory?.status || 'Not Called' }}
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

      <!-- Change Status Modal -->
      <a-modal
        v-model:visible="isChangeStatusModalVisible"
        title="Change Status"
        @ok="handleStatusChange"
        @cancel="handleCancel"
      >
        <a-form :model="{ status: selectedStatus, description: statusDescription }">
          <a-form-item label="Status">
            <a-select v-model="selectedStatus" style="width: 100%" placeholder="Select status">
              <a-select-option value="not_call" :disabled="selectedStatus === 'not_call'">Not Call</a-select-option>
              <a-select-option value="need_recall" :disabled="selectedStatus === 'need_recall'">Need Recall</a-select-option>
              <a-select-option value="no_answer" :disabled="selectedStatus === 'no_answer'">No Answer</a-select-option>
              <a-select-option value="completed" :disabled="selectedStatus === 'completed'">Completed</a-select-option>
              <a-select-option value="pending" :disabled="selectedStatus === 'pending'">Pending</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="Description">
            <a-textarea
              v-model="statusDescription"
              placeholder="Enter note"
              rows="4"
              style="margin-top: 16px; width: 100%;"
            />
          </a-form-item>
        </a-form>
      </a-modal>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import dayjs from 'dayjs';
import type { TableColumnsType } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message, Modal } from 'ant-design-vue';

const route = useRoute();
const router = useRouter();
const campaign = ref<any>({});
const isChangeStatusModalVisible = ref(false);
const selectedMember = ref<any>(null);
const selectedStatus = ref('not_call');
const statusDescription = ref('');

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

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY');
};

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'Created': 'blue',
    'In Progress': 'processing',
    'Completed': 'success',
    'Cancelled': 'error',
  };
  return statusColors[status] || 'default';
};

const getCallStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'Completed': 'success',
    'In Progress': 'processing',
    'Failed': 'error',
    'Not Called': 'default',
    'Scheduled': 'warning',
  };
  return statusColors[status] || 'default';
};

// Fetch campaign data
const fetchCampaignData = async () => {
  try {
    // TODO: Remove this after implementing API
    campaign.value = {
        "campaignId": 87,
        "campaignName": "Test_kvd123",
        "description": "Test",
        "startDate": "2024-12-25",
        "dueDate": "2024-12-26",
        "isPrivated": false,
        "total": 0,
        "remaining": 0,
        "createdAt": "2024-12-19T16:04:51+07:00",
        "updatedAt": "2024-12-19T16:04:51+07:00",
        "isServiceCall": false,
        "isAppPush": false,
        "isServiceEmail": false,
        "issue": "",
        "createdBy": 3,
        "priorityLevel": "Not Set",
        "websiteId": 1,
        "status": "Created",
        "memberships": [
            {
                "userId": 46,
                "websiteId": 2,
                "fullName": "khai",
                "phoneNumber": "0912345678",
                "address": "",
                "birthday": "2024-05-01T00:00:00+07:00",
                "points": 0,
                "level": {
                    "levelId": 8,
                    "Name": "Gold",
                    "thresholdAmount": 3500000,
                    "durationExpried": 6
                },
                "expirationDate": "2024-11-18T00:00:00+07:00",
                "isJoinSky007": true,
                "email": "khaidang.actsone@gmail.com",
                "membershipCallHistory": []
            },
            {
                "userId": 48,
                "websiteId": 4,
                "fullName": "khai",
                "phoneNumber": "0912345678",
                "address": "",
                "birthday": "2024-05-02T00:00:00+07:00",
                "points": 0,
                "level": {
                    "levelId": 2,
                    "Name": "Gold",
                    "thresholdAmount": 1500000,
                    "durationExpried": 6
                },
                "expirationDate": "2024-12-30T00:00:00+07:00",
                "isJoinSky007": true,
                "email": "khaidang.actsone@gmail.com",
                "membershipCallHistory": []
            }
        ],
        "employees": [
            {
                "campaignID": 87,
                "employeeID": 1,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "edit",
                "campaign": null,
                "employee": null
            },
            {
                "campaignID": 87,
                "employeeID": 2,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "edit",
                "campaign": null,
                "employee": null
            },
            {
                "campaignID": 87,
                "employeeID": 3,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "full_permission",
                "campaign": null,
                "employee": null
            },
            {
                "campaignID": 87,
                "employeeID": 4,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "edit",
                "campaign": null,
                "employee": null
            },
            {
                "campaignID": 87,
                "employeeID": 5,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "edit",
                "campaign": null,
                "employee": null
            },
            {
                "campaignID": 87,
                "employeeID": 6,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "edit",
                "campaign": null,
                "employee": null
            },
            {
                "campaignID": 87,
                "employeeID": 7,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "edit",
                "campaign": null,
                "employee": null
            },
            {
                "campaignID": 87,
                "employeeID": 8,
                "assignedAt": "2024-12-19T16:04:51+07:00",
                "deletedAt": null,
                "permissionLevel": "edit",
                "campaign": null,
                "employee": null
            }
        ],
        "coupons": []
    };
  } catch (error) {
    console.error('Error fetching campaign:', error);
    message.error('Unable to load campaign information');
  }
};

onMounted(() => {
  fetchCampaignData();
});

const showChangeStatusModal = (record: any) => {
  selectedMember.value = record;
  isChangeStatusModalVisible.value = true;
};

const handleStatusChange = () => {
  // Implement logic to change the status of the selected member
  console.log('Change status for member:', selectedMember.value);
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
