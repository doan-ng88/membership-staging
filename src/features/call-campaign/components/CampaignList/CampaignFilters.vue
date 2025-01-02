<!-- // src/features/call-campaign/components/CampaignList/CampaignFilters.vue -->
<template>
  <div class="mb-6 space-y-4">
    <div class="flex gap-4">
      <a-input-search
        v-model:value="searchText"
        :placeholder="t('campaignFilters.search.placeholder')"
        style="width: 300px"
        allow-clear
        @search="handleSearch"
        @change="handleSearchChange"
      />

      <a-select
        v-model:value="localFilters.status"
        :placeholder="t('campaignFilters.status.placeholder')"
        class="w-32"
        @change="emitFilters"
      >
        <a-select-option 
          v-for="status in CAMPAIGN_STATUS_OPTIONS" 
          :key="status.value" 
          :value="status.value"
        >
          {{ t(`campaignFilters.status.options.${status.value}`) }}
        </a-select-option>
      </a-select>

      <a-select
        v-model:value="localFilters.pic"
        :placeholder="t('campaignFilters.pic.placeholder')"
        class="w-48"
        @change="emitFilters"
      >
        <a-select-option 
          v-for="pic in PIC_OPTIONS" 
          :key="pic.value" 
          :value="pic.value"
        >
          {{ t(`campaignFilters.pic.options.${pic.value}`) }}
        </a-select-option>
      </a-select>

      <a-range-picker
        v-model:value="dateRange"
        @change="handleDateRangeChange"
      />

      <a-button type="primary" @click="emitFilters">
        {{ t('campaignFilters.buttons.filter') }}
      </a-button>
      <a-button @click="resetFilters">
        {{ t('campaignFilters.buttons.reset') }}
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';
import { SearchOutlined } from '@ant-design/icons-vue';
import type { CampaignFilters } from '../../types/campaign.types';
import { CAMPAIGN_STATUS_OPTIONS, PIC_OPTIONS } from '../../constants/campaign.constants';
import { useI18nGlobal } from '@/i18n';

const { t } = useI18nGlobal();

const props = defineProps<{
  filters: CampaignFilters;
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: CampaignFilters): void;
  (e: 'search', value: string): void;
}>();

const localFilters = ref<CampaignFilters>({ ...props.filters });
const dateRange = ref<[moment.Moment, moment.Moment] | null>(null);
const searchText = ref('');

// Thêm debounce cho search
let searchTimeout: NodeJS.Timeout;
const handleSearchChange = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  clearTimeout(searchTimeout);
  
  if (!value) {
    // If text is cleared, trigger search immediately
    handleSearch();
    return;
  }

  // Debounce search while typing
  searchTimeout = setTimeout(() => {
    handleSearch();
  }, 500);
};

const handleSearch = () => {
  const searchValue = searchText.value.trim();
  emit('search', searchValue);
  
  // Cập nhật filters
  localFilters.value = {
    ...localFilters.value,
    searchText: searchValue
  };
  emitFilters();
};

const emitFilters = () => {
  emit('update:filters', {
    ...localFilters.value,
    searchText: searchText.value.trim()
  });
};

const handleDateRangeChange = (dates: [moment.Moment, moment.Moment] | null) => {
  if (dates) {
    localFilters.value.dateRange = {
      start: dates[0].format('YYYY-MM-DD'),
      end: dates[1].format('YYYY-MM-DD')
    };
  } else {
    localFilters.value.dateRange = undefined;
  }
  emitFilters();
};

const resetFilters = () => {
  localFilters.value = {};
  dateRange.value = null;
  searchText.value = '';
  emitFilters();
};

// Watch filters changes from parent
watch(() => props.filters, (newFilters) => {
  localFilters.value = { ...newFilters };
}, { deep: true });

// Cleanup timeout when component unmounts
onUnmounted(() => {
  clearTimeout(searchTimeout);
});
</script>