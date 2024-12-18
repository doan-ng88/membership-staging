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
      Thêm chiến dịch
    </a-button>

    <a-button
      :loading="loading"
      @click="$emit('refresh')"
    >
      <template #icon>
        <ReloadOutlined />
      </template>
      Làm mới
    </a-button>

    <a-button
      type="primary"
      @click="handleExport"
      :loading="exporting"
    >
      <template #icon>
        <DownloadOutlined />
      </template>
      Xuất Excel
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
    // Thực hiện xuất file
    emit('export');
    message.success('Xuất file thành công');
  } catch (error) {
    message.error('Xuất file thất bại');
  } finally {
    exporting.value = false;
  }
};
</script>
