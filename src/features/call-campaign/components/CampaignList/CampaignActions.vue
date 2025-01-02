<template>
  <div class="flex items-center space-x-4">
    <a-button 
      type="primary"
      :loading="loading"
      @click="$emit('add')"
    >
      <template #icon>
        <PlusOutlined />
      </template>
      {{ t('campaignActions.buttons.addCampaign') }}
    </a-button>

    <a-button
      :loading="loading"
      @click="$emit('refresh')"
    >
      <template #icon>
        <ReloadOutlined />
      </template>
      {{ t('campaignActions.buttons.refresh') }}
    </a-button>

    <a-button
      type="primary"
      @click="handleExport"
      :loading="exporting"
    >
      <template #icon>
        <DownloadOutlined />
      </template>
      {{ t('campaignActions.buttons.exportExcel') }}
    </a-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { 
  PlusOutlined,
  ReloadOutlined,
  DownloadOutlined 
} from '@ant-design/icons-vue';
import { useI18nGlobal } from '@/i18n';

const { t } = useI18nGlobal();

const props = defineProps<{
  loading?: boolean
}>();

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'refresh'): void
  (e: 'export'): void
}>();

const exporting = ref(false);

const handleExport = async () => {
  try {
    exporting.value = true;
    // Perform file export
    emit('export');
    message.success(t('campaignActions.messages.exportSuccess'));
  } catch (error) {
    message.error(t('campaignActions.messages.exportError'));
  } finally {
    exporting.value = false;
  }
};
</script>
