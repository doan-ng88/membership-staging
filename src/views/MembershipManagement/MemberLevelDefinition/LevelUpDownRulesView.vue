<template>
  <DefaultLayout>
    <div class="p-4">
      <div class="flex justify-between items-center mb-4">
        <div class="flex items-center gap-4">
          <h1 class="text-2xl font-bold">Quản Lý Cấp Bậc</h1>

          <!-- Brand Selection -->
          <div class="mb-6">
            <label for="brandSelect" class="block text-sm font-medium text-gray-700">
              <h3 class="text-lg leading-6 font-medium text-gray-900">Chọn Website</h3>
            </label>
            <select
              id="brandSelect"
              v-model="selectedWebsiteId"
              style="width: 200px"
              placeholder="Chọn Website"
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </option>
            </select>
          </div>

          <!-- <a-select
            v-model:value="selectedWebsiteId"
            style="width: 200px"
            placeholder="Chọn Website"
          >
            <a-select-option v-for="web in websites" :key="web.id" :value="web.id">
              {{ web.name }}
            </a-select-option>
          </a-select> -->
        </div>
        <Button type="primary" @click="handleAdd">Thêm Cấp Bậc</Button>
      </div>

      <Table
        :columns="columns"
        :dataSource="filteredLevelSettings"
        :loading="loading"
        :pagination="false"
        rowKey="levelId"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <div class="flex gap-2">
              <Button type="primary" @click="handleEdit(record)">
                <EditOutlined /> Sửa
              </Button>
              <Button type="primary" danger @click="handleDelete(record)">
                <DeleteOutlined /> Xóa
              </Button>
            </div>
          </template>
          <template v-else-if="column.key === 'thresholdAmount'">
            {{ new Intl.NumberFormat('vi-VN').format(record.thresholdAmount) }}
          </template>
        </template>
      </Table>
    </div>

    <UpDownRulesModal
      v-model:visible="showModal"
      :is-edit="isEdit"
      :initial-data="selectedLevel"
      :website-id="selectedWebsiteId"
      @submit="handleSubmit"
      @success="handleSuccess"
    />
  </DefaultLayout>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from 'vue';
import { Button, Table, message, Select } from 'ant-design-vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import UpDownRulesModal from '@/components/LevelUpDownRules/upDownRulesModal.vue';
import { useLevelSettingStore } from '@/stores/levelUpDownRules';
import type { LevelSetting } from '@/api/types/levelUpDownRules';
import { websites } from '@/api/types/website';

const levelSettingStore = useLevelSettingStore();
const loading = ref(false);
const showModal = ref(false);
const isEdit = ref(false);
const selectedLevel = ref<LevelSetting | undefined>();
const selectedWebsiteId = ref(1); // Default website

// Computed properties
const levelSettings = computed(() => levelSettingStore.levelSettings);
const filteredLevelSettings = computed(() => 
  levelSettings.value.filter(level => level.websiteId === selectedWebsiteId.value)
);

// Columns definition
const columns = [
  {
    title: 'Tên Cấp Bậc',
    dataIndex: 'Name',
    key: 'Name',
  },
  {
    title: 'Thứ Hạng',
    dataIndex: 'rank',
    key: 'rank',
    sorter: (a: LevelSetting, b: LevelSetting) => a.rank - b.rank,
  },
  {
    title: 'Số Tiền Ngưỡng',
    dataIndex: 'thresholdAmount',
    key: 'thresholdAmount',
    customRender: ({ text }: { text: number }) => {
      return new Intl.NumberFormat('vi-VN').format(text);
    },
  },
  {
    title: 'Thời Hạn (Tháng)',
    dataIndex: 'durationExpired',
    key: 'durationExpired',
  },
  {
    title: 'Thao Tác',
    key: 'action',
    fixed: 'right',
    width: 200,
  },
];

// Methods
const fetchData = async () => {
  try {
    loading.value = true;
    await levelSettingStore.fetchLevelSettings();
    console.log('Data loaded:', filteredLevelSettings.value);
  } catch (error) {
    console.error('Error fetching data:', error);
    message.error('Có lỗi xảy ra khi tải dữ liệu');
  } finally {
    loading.value = false;
  }
};

// Event handlers
const handleAdd = () => {
  isEdit.value = false;
  selectedLevel.value = undefined;
  showModal.value = true;
};

const handleEdit = (record: LevelSetting) => {
  isEdit.value = true;
  selectedLevel.value = { ...record }; // Clone để tránh mutate trực tiếp
  showModal.value = true;
};

const handleDelete = async (record: LevelSetting) => {
  try {
    await levelSettingStore.deleteLevel(record.levelId);
    message.success('Xóa cấp bậc thành công');
    await fetchData();
  } catch (error) {
    console.error('Error deleting level:', error);
    message.error('Có lỗi xảy ra khi xóa cấp bậc');
  }
};

const handleSubmit = async (data: LevelSetting) => {
  try {
    await levelSettingStore.updateLevel(data);
    message.success('Cập nhật thành công');
    showModal.value = false;
    // Refresh data
    await levelSettingStore.fetchLevelSettings();
  } catch (error) {
    message.error('Có lỗi xảy ra khi cập nhật');
  }
};

const handleSuccess = async () => {
  showModal.value = false;
  // Refresh data
  await levelSettingStore.fetchLevelSettings();
};

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
.ant-table-wrapper {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03);
}

.ant-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* Style cho button primary (không phải danger) */
:deep(.ant-btn-primary:not(.ant-btn-dangerous)) {
  background-color: #1890ff !important;
  color: white !important;
}

/* Hover state cho button primary (không phải danger) */
:deep(.ant-btn-primary:not(.ant-btn-dangerous):hover) {
  background-color: #40a9ff !important;
}

/* Active state cho button primary (không phải danger) */
:deep(.ant-btn-primary:not(.ant-btn-dangerous):active) {
  background-color: #096dd9 !important;
}

/* Giữ nguyên style cho button danger */
:deep(.ant-btn-dangerous) {
  background-color: #ff4d4f !important;
}
</style>