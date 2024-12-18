<template>
  <div class="member-birth-tab">
    <a-form layout="vertical" :model="filterForm">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="Tháng sinh nhật">
            <a-month-picker v-model:value="filterForm.birthMonth" style="width: 100%" />
          </a-form-item>
        </a-col>
        <a-col :span="6">
          <a-form-item label="Website">
            <a-select v-model:value="filterForm.website" style="width: 100%">
              <a-select-option value="">Tất cả</a-select-option>
              <a-select-option value="hince">hince</a-select-option>
              <a-select-option value="BBIA">BBIA</a-select-option>
              <a-select-option value="mixsoon">mixsoon</a-select-option>
              <a-select-option value="sky007">sky007</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <div class="flex justify-between items-end h-full">
            <a-input-search
              v-model:value="filterForm.search"
              placeholder="Tìm kiếm theo tên khách hàng"
              style="width: 300px"
              @search="handleSearch"
            />
            <div>
              <a-button type="primary" @click="handleFilter">Lọc</a-button>
              <a-button class="ml-2" @click="handleReset">Đặt lại</a-button>
            </div>
          </div>
        </a-col>
      </a-row>
    </a-form>

    <a-table
      :columns="columns"
      :data-source="members"
      :row-selection="rowSelection"
      :loading="loading"
      size="small"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.key === 'level'">
          <a-tag :color="getLevelColor(text)">{{ text }}</a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import type { TableColumnsType } from 'ant-design-vue';
import type { CampaignMember } from '../../types/campaign.types';

const emit = defineEmits<{
  (e: 'select', members: CampaignMember[]): void;
}>();

const loading = ref(false);
const selectedRowKeys = ref<string[]>([]);

const filterForm = reactive({
  birthMonth: null,
  website: '',
  search: '',
});

const columns: TableColumnsType = [
  {
    title: 'Tên khách hàng',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
  },
  {
    title: 'Ngày sinh',
    dataIndex: 'birthDate',
    key: 'birthDate',
  },
  {
    title: 'Website',
    dataIndex: 'website',
    key: 'website',
  },
];

const members = ref<CampaignMember[]>([
  {
    id: '1',
    name: 'Nguyễn Văn A',
    phone: '0123456789',
    level: 'Gold',
    birthDate: '1990-05-15',
    website: 'hince',
    joinDate: '2023-01-01',
    birthMonth: '05',
    dateRange: '2024-01-01/2024-12-31',
    orderRange: '1-5',
    pic: 'Nguyễn Văn X'
  },
  // Thêm dữ liệu mẫu khác...
]);

const rowSelection = {
  selectedRowKeys,
  onChange: (keys: string[]) => {
    selectedRowKeys.value = keys;
  },
};

const getLevelColor = (level: string) => {
  const colors = {
    Gold: 'gold',
    Silver: 'silver',
    Bronze: 'brown',
  };
  return colors[level] || 'default';
};

const handleSearch = async (value: string) => {
  filterForm.search = value;
  await handleFilter();
};

const handleFilter = async () => {
  loading.value = true;
  try {
    // TODO: Implement API call to filter members
    // const response = await memberService.getMembers(filterForm);
    // members.value = response;
  } catch (error) {
    console.error('Error filtering members:', error);
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  Object.assign(filterForm, {
    birthMonth: null,
    website: '',
    search: '',
  });
  selectedRowKeys.value = [];
  handleFilter();
};

defineExpose({
  getSelectedMembers: () => {
    return members.value.filter(member => selectedRowKeys.value.includes(member.id));
  },
});
</script>

<style scoped>
.member-birth-tab {
  padding: 16px 0;
}
</style> 