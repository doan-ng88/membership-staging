// src/features/call-campaign/composables/useCampaign.ts
import { ref, computed } from 'vue';
import { campaignService } from '../services/campaign.service';
import type { Campaign } from '../types/campaign.types';
import { message } from 'ant-design-vue';
import { useI18nGlobal } from '@/i18n';

const { t } = useI18nGlobal();

export interface CampaignFilters {
  searchText?: string;
  status?: string;
  dateRange?: [string, string];
}

export function useCampaign() {
  const campaigns = ref<Campaign[]>([]);
  const loading = ref(false);
  const filters = ref<CampaignFilters>({
    searchText: '',
    status: '',
    dateRange: undefined
  });

  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const currentPage = computed(() => pagination.value.current);
  const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.pageSize));

  const fetchCampaignList = async () => {
    try {
      loading.value = true;
      
      const searchParams = [
        { 
          key: 'isServiceCall',
          value: 'true'
        }
      ];

      // Add filters to searchParams
      if (filters.value.searchText) {
        searchParams.push({
          key: 'searchText',
          value: filters.value.searchText
        });
      }

      if (filters.value.status) {
        searchParams.push({
          key: 'status',
          value: filters.value.status
        });
      }

      const params = {
        pageIndex: pagination.value.current,
        pageSize: pagination.value.pageSize,
        searchParams
      };

      const response = await campaignService.getCampaignList(params);
      
      if (response?.data) {
        campaigns.value = response.data;
        pagination.value = {
          ...pagination.value,
          total: response.pagination.totalCount
        };
      }
    } catch (error) {
      console.error('Error in fetchCampaignList:', error);
      message.error(t('campaignTabMail.messages.error.fetchFailed'));
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = async (page: number, pageSize: number = pagination.value.pageSize) => {
    if (page === pagination.value.current && pageSize === pagination.value.pageSize) return;
    
    pagination.value = {
      ...pagination.value,
      current: page,
      pageSize: pageSize
    };

    await fetchCampaignList();
  };

  const handleSearch = async (newFilters: CampaignFilters) => {
    filters.value = { ...newFilters };
    pagination.value.current = 1; // Reset về trang 1 khi search
    await fetchCampaignList();
  };

  const handleReset = async () => {
    filters.value = {
      searchText: '',
      status: '',
      dateRange: undefined
    };
    pagination.value.current = 1;
    await fetchCampaignList();
  };

  return {
    campaigns,
    loading,
    pagination,
    filters,
    currentPage,
    totalPages,
    fetchCampaignList,
    handlePageChange,
    handleSearch,
    handleReset
  };
}