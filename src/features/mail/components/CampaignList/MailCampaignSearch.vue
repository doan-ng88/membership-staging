<template>
  <div class="search-wrapper">
    <a-input-search
      v-model:value="searchValue"
      :placeholder="t('mailCampaign.search.placeholder')"
      enter-button
      :loading="loading"
      @search="onSearch"
      style="width: 300px"
    >
      <template #enterButton>
        <SearchOutlined />
      </template>
    </a-input-search>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import { useI18nGlobal } from '@/i18n';

const { t } = useI18nGlobal();

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'search', value: string): void;
}>();

const searchValue = ref('');

const onSearch = (value: string) => {
  emit('search', value);
};
</script>

<style scoped>
.search-wrapper {
  margin-bottom: 16px;
}
</style> 