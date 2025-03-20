<template>
  <div class="flex items-center space-x-4">
    <a-button 
      type="primary"
      :loading="loading"
      @click="$emit('add')"
      class="flex items-center justify-center"
    >
      <template #icon>
        <PlusOutlined class="flex items-center" />
      </template>
      {{ t('mailCampaign.campaignActions.buttons.addCampaign') }}
    </a-button>

    <a-button
      :loading="loading"
      @click="$emit('refresh')"
      class="flex items-center justify-center"
    >
      <template #icon>
        <ReloadOutlined class="flex items-center" />
      </template>
      {{ t('callCampaign.campaignActions.buttons.refresh') }}
    </a-button>

    <a-button
      type="primary"
      @click="handleExport"
      :loading="exporting"
      :disabled="!hasData"
      class="flex items-center justify-center"
    >
      <template #icon>
        <DownloadOutlined class="flex items-center" />
      </template>
      {{ t('callCampaign.campaignActions.buttons.exportExcel') }}
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { message } from 'ant-design-vue';
import { 
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined 
} from '@ant-design/icons-vue';
import { useI18nGlobal } from '@/i18n';
import * as XLSX from 'xlsx';
import { formatDate } from '@/utils/date';

const { t } = useI18nGlobal();

const props = defineProps<{
  loading?: boolean;
  data?: any[];
  fileName?: string;
}>();

const emit = defineEmits<{
  (e: 'add'): void;
  (e: 'refresh'): void;
  (e: 'export'): void;
}>();

const exporting = ref(false);

const hasData = computed(() => props.data && props.data.length > 0);

const handleExport = async () => {
  if (!hasData.value) {
    message.warning(t('callCampaign.campaignActions.messages.noData'));
    return;
  }

  try {
    exporting.value = true;
    
    const exportData = props.data.map(item => ({
      'ID': item.id,
      'Tên chiến dịch': item.name,
      'Trạng thái': t(`campaignFilters.status.options.${item.status}`),
      'Ngày bắt đầu': formatDate(item.startDate),
      'Ngày kết thúc': formatDate(item.endDate),
      'Người phụ trách': item.pic,
      'Ngày tạo': formatDate(item.createdAt),
      'Người tạo': item.createdBy
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Campaigns');

    const defaultFileName = `campaigns-${formatDate(new Date())}`;
    const fileName = `${props.fileName || defaultFileName}.xlsx`;

    XLSX.writeFile(wb, fileName);
    
    emit('export');
    message.success(t('campaignActions.messages.exportSuccess'));
  } catch (error) {
    console.error('Export error:', error);
    message.error(t('callCampaign.campaignActions.messages.exportError'));
  } finally {
    exporting.value = false;
  }
};
</script>

<style scoped>
/* Thêm CSS để căn chỉnh icon */
:deep(.anticon) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

:deep(.ant-btn) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
</style>
