<!-- // src/features/call-campaign/views/CallCampaignView.vue -->
<template>
    <DefaultLayout>
      <div class="p-6">
        <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">{{ t('mailCampaign.title') }}</h2>
        </template>
        <template #extra>
          <CampaignActions 
            :loading="loading"
            @add="handleAdd"
            @refresh="fetchCampaignList"
          />
        </template>
      </PageHeader>
  
      <div class="mb-6">
        <CampaignFilters
          v-model:filters="filters"
          @search="handleSearch"
          @reset="handleReset"
          @update:filters="handleSearch"
        />
      </div>
  
      <div class="bg-white rounded-lg shadow">
        <CampaignTable
          :campaigns="displayCampaigns"
          :loading="loading"
          :pagination="{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total
          }"
          @page-change="handlePageChange"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
  
      </div>
    </DefaultLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { message } from 'ant-design-vue';
  import { mailCampaignService } from '@/services/mailCampaignService';
  import { useI18nGlobal } from '@/i18n';

  // Import components
  import PageHeader from '@/shared/components/PageHeader.vue';
  import CampaignActions from '@/features/call-campaign/components/CampaignList/CampaignActions.vue';
  import CampaignFilters from '@/features/call-campaign/components/CampaignList/CampaignFilters.vue';
  import CampaignTable from '@/features/call-campaign/components/CampaignList/CampaignTable.vue';
  import { useMailCampaign } from '../composables/useMailCampaign';
  import type { CampaignFilters as CampaignFiltersType } from '../../call-campaign/types/campaign.types';
import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
  
  const { t } = useI18nGlobal();
  const router = useRouter();

  // Reactive state
  const loading = ref(false);
  const campaigns = ref([]);
  const filters = ref<CampaignFiltersType>({});
  const pagination = ref({
    current: 1,
    pageSize: Number(t('mailCampaign.table.pagination.pageSize')),
    total: 0
  });

  // Methods
  const fetchCampaignList = async () => {
    try {
      loading.value = true;
      
      const params = {
        pageIndex: pagination.value.current,
        pageSize: pagination.value.pageSize,
        searchParams: filters.value.searchParams || []
      };

      if (filters.value.searchText) {
        params.searchParams.push({
          key: t('mailCampaign.filters.searchParams.search'),
          value: filters.value.searchText
        })
      }

      if (filters.value.status) {
        params.searchParams.push({
          key: t('mailCampaign.filters.searchParams.status'),
          value: filters.value.status
        })
      }

      if (filters.value.dateRange) {
        params.searchParams.push({
          key: t('mailCampaign.filters.searchParams.startDateFrom'),
          value: filters.value.dateRange.start,
        })
        params.searchParams.push({
          key: t('mailCampaign.filters.searchParams.dueDateTo'),
          value: filters.value.dateRange.end,
        })
      }

      params.searchParams.push({
        key: t('mailCampaign.filters.searchParams.isServiceEmail'),
        value: 'true'
      })

      const result = await mailCampaignService.getCampaignList(params);
      campaigns.value = result.data;
      pagination.value = {
        ...pagination.value,
        current: Number(result.pagination.pageIndex),
        pageSize: Number(result.pagination.pageSize),
        total: Number(result.pagination.totalCount)
      };
      
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      message.error(t('mailCampaign.messages.loadError'));
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = async () => {
    pagination.value.current = 1;
    await fetchCampaignList();
  };

  const handleReset = () => {
    filters.value = {};
    pagination.value.current = 1;
    fetchCampaignList();
  };

  const handleTableChange = ({ current, pageSize }) => {
    handlePageChange(current, pageSize);
  };

  const handlePageChange = (page, pageSize) => {
    console.log('Page change:', page, pageSize);
    pagination.value.current = page;
    if (pageSize) {
      pagination.value.pageSize = pageSize;
    }
    fetchCampaignList();
  };

  const handleEdit = (campaign) => {
    selectedCampaign.value = { ...campaign };
    showAddModal.value = true;
  };

  const handleDelete = async (campaign) => {
    try {
      // TODO: Implement delete API
      message.success(t('mailCampaign.messages.deleteSuccess'));
      await fetchCampaignList();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      message.error(t('mailCampaign.messages.deleteError'));
    }
  };

  const handleAdd = () => {
    router.push({name: 'NewCampaign'});
  };

  // Lifecycle
  onMounted(() => {
    fetchCampaignList();
  });

  // Thêm computed property
  const displayCampaigns = computed(() => {
    console.log('Computing displayCampaigns:', campaigns.value);
    return campaigns.value || [];
  });
  </script>