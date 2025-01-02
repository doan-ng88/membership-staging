<template>
  <a-modal
    :visible="visible"
    :title="t('addMemberModal.title')"
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
        />

        <div class="mb-4">
          <a-input
            v-model:value="searchText"
            :placeholder="t('addMemberModal.search.placeholder')"
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
        {{ t('addMemberModal.buttons.cancel') }}
      </a-button>
      <a-button 
        key="submit" 
        type="primary" 
        :loading="loading" 
        :disabled="!selectedRows.length"
        @click="handleOk"
      >
        {{ t('addMemberModal.buttons.add', { count: selectedRows.length }) }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { TabType, FilterParams, Member } from '@/types/profile';
import type { CampaignMember } from '../../types/mail.types';
import ProfileTabs from '@/components/MemberInfomation/ProfileTabs.vue';
import SearchFilters from '@/components/MemberInfomation/SearchFilters.vue';
import { membershipAPI } from '@/api/services/membershipApi';
import { formatDate } from '@/utils/date';
import { getWebsiteName } from '@/api/types/website';
import { SearchOutlined } from '@ant-design/icons-vue';

const { t } = useI18n();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'select', members: CampaignMember[]): void;
}>();

// Table state
const searchText = ref<string>('');
const activeTab = ref<TabType>('date-join-member');
const currentPage = ref(1);
const pageSize = ref(20);
const totalCount = ref(0);
const members = ref<Member[]>([]);
const currentFilters = reactive<FilterParams>({});
const loading = ref(false);

// Selection state
const selectedRowKeys = ref<(string | number)[]>([]);
const selectedRows = ref<CampaignMember[]>([]);

// Columns
const columns = computed(() => {
  const baseColumns = [
    {
      title: t('addMemberModal.table.columns.customerName'),
      dataIndex: 'fullName',
      key: 'fullName',
      width: '22%',
    },
    {
      title: t('addMemberModal.table.columns.phoneNumber'),
      dataIndex: 'mainPhoneNumber',
      key: 'mainPhoneNumber',
      width: '22%',
    },
    {
      title: t('addMemberModal.table.columns.website'),
      dataIndex: 'websiteName',
      key: 'websiteName',
      width: '22%',
    },
  ];

  const dateColumns = activeTab.value === 'date-join-member' 
    ? [
        {
          title: t('addMemberModal.table.columns.registeredTime'),
          dataIndex: 'registeredTime',
          key: 'registeredTime',
          width: '22%',
        }
      ]
    : [
        {
          title: t('addMemberModal.table.columns.birthday'),
          dataIndex: 'birthday',
          key: 'birthday',
          width: '22%',
        }
      ];

  return [...baseColumns, ...dateColumns];
});

// Table config
const tableConfig = computed(() => ({
  current: currentPage.value,
  total: totalCount.value,
  pageSizeOptions: ['5', '10', '20'],
  showSizeChanger: true,
  showTotal: (total: number) => t('addMemberModal.table.pagination.total', { total }),
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

// Handlers
const handleFilter = (filters: FilterParams) => {
  Object.assign(currentFilters, filters);
  fetchMembers(1);
};

const handleReset = () => {
  Object.keys(currentFilters).forEach(key => {
    currentFilters[key as keyof FilterParams] = undefined;
  });
  fetchMembers(1);
};

const handlePageChange = (page: number) => {
  fetchMembers(page);
};

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
const fetchMembers = async (page: number = 1) => {
  try {
    loading.value = true;
    const searchParams = Object.entries(currentFilters || {})
      .filter(([_, value]) => value !== undefined)
      .reduce((acc, [key, value]) => [...acc, { [key]: value }], [] as any[]);

    if (searchText.value.trim()) {
      searchParams.push({ 
        key: 'search',
        value: searchText.value.trim()
      });
    }
    if (currentFilters.startDate) {
      searchParams.push({ 
        key: 'registeredTimeFrom',
        value: currentFilters.startDate
      });
    }
    if (currentFilters.endDate) {
      searchParams.push({ 
        key: 'registeredTimeTo',
        value: currentFilters.endDate
      });
    }
    if(currentFilters.websiteId){
      searchParams.push({ 
        key: 'websiteId',
        value: currentFilters.websiteId
      });
    }

    const response = await membershipAPI.getList(
      'MembershipsWebsitesId',
      'ASC',
      pageSize.value,
      page,
      searchParams
    );

    const { data, totalCount: total, pageIndex } = response;
    
    members.value = data.map((member: any) => ({
      id: member.membershipWebsiteId,
      fullName: member.fullName || member.name,
      mainPhoneNumber: member.mainPhoneNumber,
      websiteName: member.websiteName || getWebsiteName(member.websiteId),
      birthday: formatDate(member.birthday),
      registeredTime: formatDate(member.registeredTime),
      level: member.level,
    }));
    
    totalCount.value = total;
    currentPage.value = pageIndex;
  } catch (error) {
    console.error('Error fetching members:', error);
  } finally {
    loading.value = false;
  }
};

// Add search handler
const onSearch = () => {
  fetchMembers(1);
};

// Initial fetch
onMounted(() => {
  fetchMembers();
});
</script>

<style scoped>
.custom-input-clear :deep(.ant-input-clear-icon) {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>