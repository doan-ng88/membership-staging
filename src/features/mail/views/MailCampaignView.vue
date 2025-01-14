<!-- // src/features/call-campaign/views/CallCampaignView.vue -->
<template>
    <DefaultLayout>
      <div class="p-6">
        <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">{{ t('mailCampaign.title') }}</h2>
        </template>
        <template #extra>
          <!-- <CampaignActions 
            :loading="loading"
            @add="handleAdd"
            @refresh="fetchCampaignList"
          /> -->
          <CampaignActions 
            :loading="loading"
            :data="displayCampaigns"
            fileName="Email-campaigns"
            @add="handleAdd"
            @refresh="fetchCampaignList"
            @export="handleExportSuccess"
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
        <MailCampaignTable
          :campaigns="displayCampaigns"
          :loading="loading"
          :pagination="{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total
          }"
          :enable-name-click="true" 
          @page-change="handlePageChange"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
  
      <EditMailCampaignModal
        v-model:open="showEditModal"
        :campaignId="selectedCampaign?.id || 0"
        :campaign-data="selectedCampaign || {}"
        @success="fetchCampaignList"
      />
  
      </div>
    </DefaultLayout>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import DefaultLayout from '@/layouts/DefaultLayout.vue';
  import { message, Modal } from 'ant-design-vue';
  import { mailCampaignService } from '@/features/mail/services/mail-campaign.service'
  import { useI18nGlobal } from '@/i18n';
  import EditMailCampaignModal from '@/features/mail/components/CampaignForm/EditMailCampaignModal.vue';
  import type { MailCampaign } from '../types/mail-campaign.types';

  // Import components
  import PageHeader from '@/shared/components/PageHeader.vue';
  import CampaignActions from '@/features/call-campaign/components/CampaignList/CampaignActions.vue';
  import CampaignFilters from '@/features/call-campaign/components/CampaignList/CampaignFilters.vue';
  import MailCampaignTable from '@/features/mail/components/CampaignList/MailCampaignTable.vue';
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
    pageSize: 10,
    total: 0
  });

  // Thêm reactive states cho modal
  const showEditModal = ref(false);
  const selectedCampaign = ref<MailCampaign | null>(null);

  // Methods
  const fetchCampaignList = async () => {
    try {
      loading.value = true;
      const response = await mailCampaignService.getMailCampaignList({
        pageIndex: pagination.value.current,
        pageSize: pagination.value.pageSize
      });
      
      console.log('Fetched campaigns:', response);
      
      campaigns.value = response.data;
      pagination.value.total = response.pagination.totalCount;
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

  const handleEdit = (campaign: MailCampaign) => {
    console.log('Campaign before setting:', campaign);
    selectedCampaign.value = {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      websiteId: campaign.websiteId,
      priorityLevel: campaign.priorityLevel,
      status: campaign.status,
      isServiceEmail: campaign.isServiceEmail || false,
      total: campaign.total,
      remaining: campaign.remaining,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
      createdBy: campaign.createdBy
    };
    console.log('Campaign after setting:', selectedCampaign.value);
    showEditModal.value = true;
  };

  const handleDelete = async (campaign: MailCampaign) => {
    Modal.confirm({
      title: t('mailCampaign.delete.confirmTitle'),
      content: t('mailCampaign.delete.confirmContent', { name: campaign.name }),
      okText: t('mailCampaign.delete.buttons.confirm'),
      cancelText: t('mailCampaign.delete.buttons.cancel'),
      okType: 'danger',
      async onOk() {
        try {
          await mailCampaignService.deleteMailCampaign(campaign.id);
          message.success(t('mailCampaign.messages.deleteSuccess'));
          await fetchCampaignList(); // Refresh list after delete
        } catch (error) {
          console.error('Error deleting campaign:', error);
          message.error(t('mailCampaign.messages.deleteError'));
        }
      }
    });
  };

  const handleAdd = () => {
    router.push({name: 'NewCampaign'});
  };

  const handleExportSuccess = () => {
    message.success(t('mailCampaign.messages.exportSuccess'));
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