<template>
  <a-modal
    :open="visible"
    :title="t('mailCampaign.addMemberModal.title')"
    @ok="handleOk"
    @cancel="handleCancel"
    width="800px"
  >
    <div class="p-4">
      <ProfileTabs v-model="activeTab" />
      
      <div class="mt-4">
        <SearchFilters 
          :tab="activeTab" 
          @filter="handleFilter" 
          @reset="handleReset"
          :hideOrderPoint="true"
          :hideLevelUpCondition="true"
          :hideMemberLevel="true"
        />

        <div class="mb-4">
          <a-input
            v-model:value="searchText"
            :placeholder="t('mailCampaign.addMemberModal.search.placeholder')"
            style="width: 300px"
            @input="onSearch"
            allowClear
            class="custom-input-clear"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>
        
        <a-table
          :columns="columns"
          :data-source="members"
          :pagination="tableConfig"
          :row-selection="rowSelection"
          :loading="loading"
          :bordered="true"
          row-key="id"
          size="small"
        />
      </div>
    </div>
    <template #footer>
      <a-button key="back" @click="handleCancel">
        {{ t('mailCampaign.addMemberModal.buttons.cancel') }}
      </a-button>
      <a-button 
        key="submit" 
        type="primary" 
        :loading="loading" 
        :disabled="!selectedRows.length"
        @click="handleOk"
      >
        {{ t('mailCampaign.addMemberModal.buttons.add', { count: selectedRows.length }) }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useI18nGlobal } from '@/i18n';
import type { TabType, FilterParams, Member } from '@/types/profile';
import type { CampaignMember } from '@/features/mail/types/mail.types';
import dayjs, { type Dayjs } from 'dayjs';
import ProfileTabs from '@/components/MemberInfomation/ProfileTabs.vue';
import SearchFilters from '@/components/MemberInfomation/SearchFilters.vue';
import { membershipAPI } from '@/api/services/membershipApi';
import { formatDateRange } from '@/utils/date';
import { getWebsiteName } from '@/api/types/website';
import { SearchOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
const { t } = useI18nGlobal();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'select', members: CampaignMember[]): void;
}>();

const props = defineProps<{
  visible: boolean
}>();

// Table state
const searchText = ref<string>('');
const activeTab = ref<TabType>('date-join-member');
const currentPage = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);
const members = ref<Member[]>([]);
const loading = ref(false);

// Selection state
const selectedRowKeys = ref<(string | number)[]>([]);
const selectedRows = ref<CampaignMember[]>([]);

// Filter state
const currentFilters = ref<Array<{key: string, value: any}>>([]);

// Columns definition
const columns = computed(() => {
  const baseColumns = [
    {
      title: t('mailCampaign.addMemberModal.table.columns.customerName'),
      dataIndex: 'fullName',
      key: 'fullName',
      width: '22%',
    },
    {
      title: t('mailCampaign.addMemberModal.table.columns.phoneNumber'), 
      dataIndex: 'mainPhoneNumber',
      key: 'mainPhoneNumber',
      width: '22%',
    },
    {
      title: t('mailCampaign.addMemberModal.table.columns.website'),
      dataIndex: 'websiteName',
      key: 'websiteName',
      width: '22%',
    }
  ];

  // Thêm cột cuối tùy theo tab
  if (activeTab.value === 'date-join-member') {
    baseColumns.push({
      title: t('mailCampaign.addMemberModal.table.columns.registeredTime'),
      dataIndex: 'registeredTime',
      key: 'registeredTime',
      width: '22%',
    });
  } else {
    baseColumns.push({
      title: t('mailCampaign.addMemberModal.table.columns.birthday'),
      dataIndex: 'birthday',
      key: 'birthday',
      width: '22%',
    });
  }

  return baseColumns;
});

// Table config
const tableConfig = computed(() => ({
  current: currentPage.value,
  total: totalCount.value,
  pageSizeOptions: ['5', '10', '20'],
  showSizeChanger: true,
  showTotal: (total: number) => t('mailCampaign.addMemberModal.table.pagination.total', { total }),
  onChange: (page: number, size: number) => {
    pageSize.value = size;
    handlePageChange(page);
  },
}));

// Row selection
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: (string | number)[], rows: CampaignMember[]) => {
    onSelectChange(keys, rows);
  },
}));

// Filter handlers
const handleFilter = (filters: Array<{key: string, value: any}>) => {
  const params: Array<{key: string, value: any}> = [];

  // Xử lý filter theo tab hiện tại
  if (activeTab.value === 'date-join-member') {
    // Filter cho Date Join Member
    const registeredTimeFilter = filters.find(f => f.key === 'registeredTimeFrom' || f.key === 'registeredTimeTo');
    if (registeredTimeFilter) {
      params.push(...filters);
    }
  } else if (activeTab.value === 'date-of-birth') {
    // Filter cho Date of Birth
    const birthdayFilter = filters.find(f => f.key === 'birthdayFrom' || f.key === 'birthdayTo');
    if (birthdayFilter) {
      params.push(
        ...filters.map(f => ({
          key: f.key === 'registeredTimeFrom' ? 'birthdayFrom' : 
               f.key === 'registeredTimeTo' ? 'birthdayTo' : f.key,
          value: f.value
        }))
      );
    }
  }

  // Website filter (chung cho cả 2 tab)
  const websiteFilter = filters.find(f => f.key === 'websiteId');
  if (websiteFilter) {
    params.push(websiteFilter);
  }

  currentFilters.value = params;
  fetchMembers(1, pageSize.value, params);
};

const handleReset = () => {
  currentFilters.value = [];
  fetchMembers(1, pageSize.value, []);
};

// Existing search handler
const onSearch = () => {
  const searchParams = [...currentFilters.value];
  if (searchText.value.trim()) {
    searchParams.push({
      key: 'search',
      value: searchText.value.trim()
    });
  }
  fetchMembers(1, pageSize.value, searchParams);
};

// Pagination handler
const handlePageChange = (page: number) => {
  fetchMembers(page, pageSize.value, currentFilters.value);
};

// Selection handlers
const onSelectChange = (keys: (string | number)[], rows: CampaignMember[]) => {
  selectedRowKeys.value = keys;
  selectedRows.value = rows;
};

const handleOk = () => {
  emit('select', selectedRows.value);
  emit('update:visible', false);
  // Reset selection
  selectedRowKeys.value = [];
  selectedRows.value = [];
};

const handleCancel = () => {
  emit('update:visible', false);
  // Reset selection
  selectedRowKeys.value = [];
  selectedRows.value = [];
};

// Data fetching
const fetchMembers = async (
  page: number = 1,
  pageSizeParam: number = 20,
  searchParams: Array<{key: string, value: any}> = []
) => {
  try {
    loading.value = true;
    console.log('Fetching with params:', { page, pageSizeParam, searchParams });

    const response = await membershipAPI.getList(
      'MembershipsWebsitesId',
      'DESC',
      pageSizeParam,
      page,
      searchParams
    );

    if (response?.data) {
      members.value = response.data.map((member: any) => ({
        id: member.membershipWebsiteId,
        fullName: member.fullName || member.name,
        mainPhoneNumber: member.mainPhoneNumber,
        websiteName: member.websiteName || getWebsiteName(member.websiteId),
        registeredTime: activeTab.value === 'date-join-member' ? 
          formatDateRange(member.registeredTime) : undefined,
        birthday: activeTab.value === 'date-of-birth' ? 
          formatDateRange(member.birthday) : undefined
      }));

      totalCount.value = response.totalCount || 0;
      currentPage.value = page;
      pageSize.value = pageSizeParam;
    }
  } catch (error) {
    console.error('Error fetching members:', error);
    message.error(t('mailCampaign.addMemberModal.messages.fetchError'));
  } finally {
    loading.value = false;
  }
};

// Helper function để format date
const formatDate = (date: string | Date | undefined, format: string = 'DD/MM/YYYY HH:mm:ss') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

// Initial fetch
onMounted(() => {
  fetchMembers();
});

// Watch for tab changes
watch(activeTab, (newTab) => {
  currentFilters.value = []; // Reset filters when changing tabs
  fetchMembers(1, pageSize.value, []); // Reload data with new tab
});
</script>

<style scoped>
.custom-input-clear :deep(.ant-input-clear-icon) {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>