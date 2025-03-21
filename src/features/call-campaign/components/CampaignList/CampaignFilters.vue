<template>
  <a-card class="mb-6 shadow-sm" :bordered="true">
    <template #title>
      <div class="flex items-center">
        <FilterOutlined class="mr-2 text-blue-500" />
        <span>{{ t('callCampaign.campaignMailFilters.title') }}</span>
      </div>
    </template>
    
    <div class="space-y-4">
      <!-- Search row -->
      <div class="w-full">
        <div class="text-sm text-gray-500 mb-1">{{ t('callCampaign.campaignMailFilters.search.label', 'Tên chiến dịch') }}</div>
        <a-input-search
          v-model:value="searchText"
          :placeholder="t('callCampaign.campaignMailFilters.search.placeholder')"
          class="w-full"
          allow-clear
          :loading="loading"
          @search="handleSearch"
          @change="handleSearchChange"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input-search>
      </div>
      
      <!-- Filters row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ t('callCampaign.campaignMailFilters.status.label', 'Trạng thái') }}</div>
          <a-select
            v-model:value="localFilters.status"
            :placeholder="t('callCampaign.campaignMailFilters.status.placeholder')"
            class="w-full"
            allow-clear
            @change="handleStatusChange"
          >
            <a-select-option value="">
              {{ t('callCampaign.campaignMailFilters.status.options.all', 'Tất cả') }}
            </a-select-option>
            <a-select-option 
              v-for="status in CAMPAIGN_STATUS_OPTIONS" 
              :key="status.value" 
              :value="status.value"
            >
              {{ t(`callCampaign.campaignMailFilters.status.options.${status.value}`) }}
            </a-select-option>
          </a-select>
        </div>
        
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ t('callCampaign.campaignMailFilters.website.label', 'Website') }}</div>
          <a-select
            v-model:value="localFilters.website"
            :placeholder="t('callCampaign.campaignMailFilters.website.placeholder')"
            class="w-full"
            allow-clear
            @change="handleWebsiteChange"
          >
            <a-select-option value="">
              {{ t('callCampaign.campaignMailFilters.website.all') }}
            </a-select-option>
            <a-select-option 
              v-for="website in websites" 
              :key="website.websiteId" 
              :value="website.websiteId"
            >
              {{ website.name }}
            </a-select-option>
          </a-select>
        </div>
        
        <div>
          <div class="text-sm text-gray-500 mb-1">{{ t('callCampaign.campaignMailFilters.dateRange.label', 'Thời gian chiến dịch') }}</div>
          <a-range-picker
            v-model:value="dateRange"
            :placeholder="['Từ ngày', 'Đến ngày']"
            format="DD/MM/YYYY"
            class="w-full"
            allow-clear
            @change="handleDateRangeChange"
          />
        </div>
      </div>
      
      <!-- Actions row -->
      <div class="flex justify-end pt-4 border-t border-gray-200">
        <a-button class="mr-2" @click="resetFilters">
          <template #icon><ReloadOutlined /></template>
          {{ t('callCampaign.campaignMailFilters.buttons.reset') }}
        </a-button>
        <a-button type="primary" @click="applyFilters" :loading="loading">
          <template #icon><SearchOutlined /></template>
          {{ t('callCampaign.campaignMailFilters.buttons.filter', 'Lọc') }}
        </a-button>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons-vue';
import type { CampaignFilters } from '../../types/campaign.types';
import { CAMPAIGN_STATUS_OPTIONS } from '../../constants/campaign.constants';
import { useI18nGlobal } from '@/i18n';
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import { websites } from '@/api/types/website';

const { t } = useI18nGlobal();

const props = defineProps<{
  filters: CampaignFilters;
}>();

const emit = defineEmits<{
  (e: 'update:filters', filters: CampaignFilters): void;
  (e: 'search', value: string): void;
  (e: 'filter-change', filters: CampaignFilters): void;  // New event for actual filtering
}>();

const localFilters = ref<CampaignFilters>({ ...props.filters });
const dateRange = ref<[Dayjs, Dayjs] | null>(null);
const searchText = ref('');
const loading = ref(false);

// Computed để theo dõi filter đã thay đổi hay chưa
const hasFilterChanged = computed(() => {
  const currentFilters = {
    searchText: searchText.value,
    status: localFilters.value.status,
    website: localFilters.value.website,
    dateRange: localFilters.value.dateRange
  };
  
  const originalFilters = {
    searchText: props.filters.searchText || '',
    status: props.filters.status || '',
    website: props.filters.website || '',
    dateRange: props.filters.dateRange
  };
  
  return JSON.stringify(currentFilters) !== JSON.stringify(originalFilters);
});

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
  
  // Cập nhật filters
  localFilters.value = {
    ...localFilters.value,
    searchText: searchValue,
    searchField: 'campaignName' // Chỉ định rõ là search theo tên chiến dịch
  };
  
  emit('search', searchValue);
  applyFilters(); // Auto apply filter when user searches
};

// Handle individual filter changes
const handleStatusChange = (value: string) => {
  localFilters.value.status = value;
  // Don't auto apply to avoid multiple API calls when changing multiple filters
};

const handleWebsiteChange = (value: string) => {
  localFilters.value.website = value;
  // Don't auto apply to avoid multiple API calls when changing multiple filters
};

const handleDateRangeChange = (dates: [Dayjs, Dayjs] | null) => {
  if (dates) {
    localFilters.value.dateRange = [dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')];
  } else {
    localFilters.value.dateRange = undefined;
  }
  // Don't auto apply to avoid multiple API calls when changing multiple filters
};

const resetFilters = () => {
  localFilters.value = {};
  dateRange.value = null;
  searchText.value = '';
  emitFilters();
  
  // Trigger a filter change event to reload data with no filters
  emit('filter-change', {});
};

// Update the filters in parent component
const emitFilters = () => {
  emit('update:filters', {
    ...localFilters.value,
    searchText: searchText.value.trim(),
    searchField: 'campaignName' // Đảm bảo luôn có thông tin này
  });
};

// Apply filters and trigger API call
const applyFilters = async () => {
  try {
    loading.value = true;
    
    // First update the parent component's filters
    emitFilters();
    
    // Then trigger the actual filtering event to tell parent to make API call
    emit('filter-change', {
      ...localFilters.value,
      searchText: searchText.value.trim(),
      searchField: 'campaignName'
    });
  } finally {
    // Small delay to ensure loading indicator is visible
    setTimeout(() => {
      loading.value = false;
    }, 300);
  }
};

// Khởi tạo dateRange từ filters nếu có
watch(() => props.filters, (newFilters) => {
  // Cập nhật localFilters nếu props thay đổi từ bên ngoài
  if (!hasFilterChanged.value) {
    localFilters.value = { ...newFilters };
    
    // Cập nhật searchText
    searchText.value = newFilters.searchText || '';
    
    // Khôi phục dateRange nếu có trong filters
    if (newFilters.dateRange && Array.isArray(newFilters.dateRange) && newFilters.dateRange.length === 2) {
      try {
        dateRange.value = [
          dayjs(newFilters.dateRange[0]), 
          dayjs(newFilters.dateRange[1])
        ];
      } catch (error) {
        console.error('Error parsing date range:', error);
        dateRange.value = null;
      }
    } else {
      dateRange.value = null;
    }
  }
}, { deep: true, immediate: true });

// Cleanup timeout when component unmounts
onUnmounted(() => {
  clearTimeout(searchTimeout);
});
</script>