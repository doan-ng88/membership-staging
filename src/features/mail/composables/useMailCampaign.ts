import { ref } from 'vue';
import { mailCampaignService } from '../services/mail-campaign.service';
import type { MailCampaign } from '../types/mail-campaign.types';
import { message } from 'ant-design-vue';

export function useMailCampaign() {
  const campaigns = ref<MailCampaign[]>([]);
  const loading = ref(false);
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const fetchCampaignList = async () => {
    try {
      loading.value = true;
      const params = {
        pageIndex: pagination.value.current,
        pageSize: pagination.value.pageSize,
        searchParams: []
      };

      const response = await mailCampaignService.getMailCampaignList(params);
      
      campaigns.value = response.data;
      pagination.value = {
        ...pagination.value,
        total: response.pagination.totalCount
      };
    } catch (error) {
      console.error('Error:', error);
    } finally {
      loading.value = false;
    }
  };

  const handlePageChange = async (page: number, pageSize: number) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
    await fetchCampaignList();
  };

  return {
    campaigns,
    loading,
    pagination,
    fetchCampaignList,
    handlePageChange
  };
}
