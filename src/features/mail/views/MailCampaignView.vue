<!-- // src/features/call-campaign/views/CallCampaignView.vue -->
<template>
    <DefaultLayout>
      <div class="p-6">
        <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">Quản lý Chiến dịch Email</h2>
        </template>
        <template #extra>
          <CampaignActions 
            :loading="loading"
            @add="showAddModal = true"
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
  
      <CampaignFormModal
        v-model:visible="showAddModal"
        :campaign="selectedCampaign"
        @save="handleSave"
        @cancel="handleCancel"
      />
      </div>
    </DefaultLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { message } from 'ant-design-vue';
  import { mailCampaignService } from '@/services/mailCampaignService';

  // Import components
  import PageHeader from '@/shared/components/PageHeader.vue';
  import CampaignActions from '@/features/call-campaign/components/CampaignList/CampaignActions.vue';
  import CampaignFilters from '@/features/call-campaign/components/CampaignList/CampaignFilters.vue';
  import CampaignTable from '@/features/call-campaign/components/CampaignList/CampaignTable.vue';
  import CampaignFormModal from '@/features/call-campaign/components/CampaignForm/CampaignFormModal.vue';
  import { useMailCampaign } from '../composables/useMailCampaign';
  import type { CampaignFilters as CampaignFiltersType } from '../../call-campaign/types/campaign.types';
  
  // Reactive state
  const loading = ref(false);
  const campaigns = ref([]);
  const filters = ref<CampaignFiltersType>({});
  const showAddModal = ref(false);
  const selectedCampaign = ref(null);
  const pagination = ref({
    current: 1,
    pageSize: 10,
    total: 0
  });

  // Methods
  const fetchCampaignList = async () => {
    try {
      loading.value = true;
      console.log('Fetching with pagination:', pagination.value);
      
      const params = {
        pageIndex: pagination.value.current,
        pageSize: pagination.value.pageSize,
        searchParams: filters.value.searchParams || []
      };


    // TODO: refactor
    if (filters.value.searchText) {
      params.searchParams.push({
        key: 'search',
        value: filters.value.searchText
      })
    }

    if (filters.value.status) {
      params.searchParams.push({
        key: 'status',
        value: filters.value.status
      })
    }

    if (filters.value.dateRange) {
      params.searchParams.push({
        key: 'startDateFrom',
        value: filters.value.dateRange.start,
      })
      params.searchParams.push({
        key: 'dueDateTo',
        value: filters.value.dateRange.end,
      })
    }

      const result = await mailCampaignService.getCampaignList(params);
      console.log('API Response:', result);
      
      campaigns.value = result.data;
      pagination.value = {
        ...pagination.value,
        current: Number(result.pagination.pageIndex),
        pageSize: Number(result.pagination.pageSize),
        total: Number(result.pagination.totalCount)
      };
      
      console.log('Updated campaigns:', campaigns.value);
      console.log('Updated pagination:', pagination.value);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      message.error('Không thể tải danh sách chiến dịch');
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
      message.success('Xóa chiến dịch thành công');
      await fetchCampaignList();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      message.error('Xóa chiến dịch thất bại');
    }
  };

  const handleSave = async (data) => {
    try {
      // TODO: Implement save API
      message.success(selectedCampaign.value 
        ? 'Cập nhật chiến dịch thành công'
        : 'Tạo chiến dịch thành công'
      );
      showAddModal.value = false;
      await fetchCampaignList();
    } catch (error) {
      console.error('Error saving campaign:', error);
      message.error('Lưu chiến dịch thất bại');
    }
  };

  const handleCancel = () => {
    selectedCampaign.value = null;
    showAddModal.value = false;
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