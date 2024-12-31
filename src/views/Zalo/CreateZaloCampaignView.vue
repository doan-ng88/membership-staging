<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">Create Zalo Campaign</h2>
        </template>
      </PageHeader>

      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        layout="vertical"
      >
        <div class="flex gap-4">
          <a-form-item label="Campaign Name" name="name" class="flex-1">
            <a-input v-model:value="formState.name" placeholder="Enter campaign name" />
          </a-form-item>
          <a-form-item label="Campaign Description" name="description" class="flex-1">
            <a-input v-model:value="formState.description" placeholder="Enter campaign description" />
          </a-form-item>
        </div>

        <div class="flex gap-4">
          <a-form-item label="Website" name="websiteId" class="flex-1">
            <a-select
              v-model:value="formState.websiteId"
              placeholder="Select website"
              @change="handleWebsiteChange"
            >
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="`Coupon name ${!formState.websiteId ? '(Please select website first)' : ''}`" name="coupons" class="flex-1">
            <a-select
              v-model:value="formState.coupons"
              placeholder="Select coupons"
              :options="couponOptions"
              :loading="loadingCoupons"
              mode="multiple"
              show-search
              :filter-option="false"
              @search="handleSearchCoupons"
              style="width: 100%"
              option-label-prop="label"
              :disabled="!formState.websiteId"
            >
            </a-select>
          </a-form-item>
        </div>

        <div class="flex gap-4">
          <a-form-item label="Person in charge" name="pic" class="flex-1">
            <a-select
              v-model:value="formState.pic"
              :options="formState.adminUsers"
              mode="multiple"
              placeholder="Select person in charge"
              :loading="loadingAdmins"
              style="width: 100%"
              :field-names="{
                label: 'name',   
                value: 'id',     
              }"
            >
            </a-select>
          </a-form-item>
          <a-form-item
            label="Time of Sending"
            name="startDate"
            class="flex-1"
          >
            <a-range-picker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              :placeholder="['Start time', 'End time']"
              style="width: 100%"
              :disabled-date="disabledDate"
              @change="onDateRangeChange"
            />
          </a-form-item>
        </div>

        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-medium">Selected member list</h4>
            <a-button class="flex items-center" type="primary" @click="showAddMemberModal">
              <template #icon><UserAddOutlined /></template>
              Add member
            </a-button>
          </div>

          <a-table
            :columns="memberColumns"
            :data-source="formState.members"
            :pagination="tableConfig.pagination"
            row-key="id"
            size="small"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" danger @click="removeMember(record)">
                    <DeleteOutlined />
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>

          <div class="mt-4 flex justify-end gap-4">
            <a-button @click="handleBack">Back</a-button>
            <a-button type="primary" @click="handleSubmit">Submit</a-button>
          </div>
        </div>
      </a-form>
    </div>

    <AddMemberModal
      v-model:visible="showMemberModal"
      :website-id="formState.websiteId"
      @select="handleMemberSelect"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { Dayjs } from 'dayjs';
import { membershipAPI } from '@/api/services/membershipApi';
import { websites, type Website } from '@/api/types/website';
import { debounce } from 'lodash';
import { message } from 'ant-design-vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import dayjs from 'dayjs';
import AddMemberModal from '@/features/new-campaign/components/AddMember/AddMemberModal.vue';
import type { CampaignMember } from '@/types/campaign.types';

type User = { 
  id: string,
  name: string 
}

export type NewCampaign = {
  name: string,
  description: string,
  startDate: string | null,
  dueDate: string | null,
  pic: User[],
  members: CampaignMember[],
  websiteId: number | undefined,
  coupons: string[],
  adminUsers: User[]
}

const memberColumns = [
  {
    title: 'Customer Name',
    dataIndex: 'fullName',
    key: 'fullName',
    width: '20%',
  },
  {
    title: 'Phone Number',
    dataIndex: 'mainPhoneNumber',
    key: 'mainPhoneNumber',
    width: '20%',
  },
  {
    title: 'Platform Website',
    dataIndex: 'websiteName',
    key: 'websiteName',
    width: '20%',
  },
  {
    title: 'Birthday',
    dataIndex: 'birthday',
    key: 'birthday',
    width: '20%',
  },
  {
    title: 'Registered Time',
    dataIndex: 'registeredTime',
    key: 'registeredTime',
    width: '20%',
  },
  {
    title: 'Actions',
    key: 'action',
    width: '10%',
  },
];

const rules = {
  name: [{ required: true, message: 'Please enter campaign name' }],
  startDate: [{ required: true, message: 'Please select sending time'}],
  pic: [{ required: true, message: 'Please select person in charge' }],
  coupons: [{ required: true, message: 'Please select at least one coupon code'}],
  websiteId: [{ required: true, message: 'Please select a website' }],
};

const router = useRouter();
const formRef = ref();
const showMemberModal = ref(false);
const dateRange = ref<[Dayjs, Dayjs] | null>(null);

const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
});

const tableConfig = computed(() => ({
  pagination: {
    ...pagination,
    showSizeChanger: true,
    showTotal: (total: number) => `Total ${formState.members.length} items`,
    pageSizeOptions: ['5', '10', '20'],
    onChange: (page: number, pageSize: number) => {
      pagination.current = page;
      pagination.pageSize = pageSize;
    },
  }
}));

const formState = reactive<NewCampaign>({
  name: '',
  description: '',
  startDate: null,
  dueDate: null,
  pic: [],
  websiteId: undefined,
  members: [],
  coupons: [],
  adminUsers: []
});

const couponOptions = ref<{ label: string; value: string }[]>([]);
const loadingCoupons = ref(false);
const loadingAdmins = ref(false);

const fetchCoupons = async (search?: string) => {
  if (!formState.websiteId) return;
  
  try {
    loadingCoupons.value = true;
    const response = await membershipAPI.getCoupons(
      formState.websiteId,
      1, // pageIndex
      10, // pageSize
      search // search term
    );

    couponOptions.value = response.data.map((coupon: any) => ({
      label: coupon.code,
      value: coupon.code,
    }));
  } catch (error) {
    message.error('Error fetching coupons');
  } finally {
    loadingCoupons.value = false;
  }
};

const handleWebsiteChange = () => {
  formState.coupons = [];
  couponOptions.value = [];
  if (formState.websiteId) {
    fetchCoupons();
  }
};

const handleSearchCoupons = debounce((value: string) => {
  fetchCoupons(value);
}, 300);

const fetchAdminUsers = async () => {
  try {
    loadingAdmins.value = true;
    const response = await membershipAPI.getAdminUsers();
    formState.adminUsers = response.data.map((admin: any) => ({
      id: admin.userId,
      name: admin.name || admin.fullName || admin.email,
    }));
  } catch (error) {
    message.error('Error fetching admin users');
  } finally {
    loadingAdmins.value = false;
  }
};

onMounted(() => {
  if (formState.websiteId) {
    fetchCoupons();
  }
  fetchAdminUsers();
});

const onDateRangeChange = (dates: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
  if (dates) {
    formState.startDate = dateStrings[0];
    formState.dueDate = dateStrings[1];
  } else {
    formState.startDate = null;
    formState.dueDate = null;
  }
};

const disabledDate = (current: dayjs.Dayjs) => {
  // Disable dates before today
  return current && current < dayjs().startOf('day');
};

const handleMemberSelect = (members: CampaignMember[]) => {
  const existingMemberIds = new Set(formState.members.map(member => member.id));
  const newMembers = members.filter(member => !existingMemberIds.has(member.id));
  formState.members = [...formState.members, ...newMembers];
};

const removeMember = (member: CampaignMember) => {
  formState.members = formState.members.filter(m => m.id !== member.id);
};

const showAddMemberModal = () => {
  showMemberModal.value = true;
};

const handleSubmit = async () => {
  const previousRoute = router.options.history.state.back;
  console.log('Previous route:', router.resolve(previousRoute).name);
  try {
    await formRef.value.validate();
    if (formState.members.length === 0) {
      message.error('Please select at least one membership');
      return;
    }
  } catch (error) {
    console.error('Validation failed:', error);
    return;
  }
  try {
    const previousRouteName = router.resolve(router.options.history.state.back).name;
    let payload = {
      campaignName: formState.name,
      description: formState.description,
      startDate: formState.startDate,
      dueDate: formState.dueDate,
      membershipIds: formState.members.map((member: any) => member.id),
      websiteID: formState.websiteId,
      coupons: formState.coupons.map((coupon)=> ({couponCode: coupon})),
      employeePermissions: formState.pic.map((user)=> ({           
        employeeId: user,
        permissionLevel: "edit"
      })),
      isServiceZalo: true,
      ...( previousRouteName === 'MailCampaign' && {isServiceEmail: true}),
      ...( previousRouteName === 'CallCampaign' && {isServiceCall: true})
    }

    console.log('Payload:', payload);

    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/update/create-campaign`, 
      payload,          
      {
        headers: {
          'Authorization': `Bearer ${useAuthStore().token}`
        }
      }
    );

    message.success('Campaign created successfully');
    router.back()
  } catch (error) {
    console.error('Error:', error.response?.data);
    message.error(error.response?.data?.message || 'Failed to save campaign');
  }
};

const handleBack = () => {
  router.back();
};
</script>

<style scoped>
.custom-input-clear :deep(.ant-input-clear-icon) {
  display: flex;
  align-items: center;
  height: 100%;
}
</style> 