<!-- // src/features/call-campaign/views/CallCampaignView.vue -->
<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">{{ t('callCampaign.title') }}</h2>
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
        />
      </div>

      <CampaignTable
        :campaigns="campaigns"
        :loading="loading"
        :pagination="pagination"
        @page-change="handlePageChange"
        @edit="handleEdit"
        @delete="handleDelete"
        :enable-name-click="true"
      />

      <EditCampaignModal
        v-model:open="showEditModal"
        :campaignId="selectedCampaign?.Id||0"
        :campaign-data="selectedCampaign || {}"
        @success="fetchCampaignList"
      />
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18nGlobal  } from '@/i18n';
import PageHeader from '@/shared/components/PageHeader.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import CampaignActions from '../components/CampaignList/CampaignActions.vue';
import CampaignFilters from '../components/CampaignList/CampaignFilters.vue';
import CampaignTable from '../components/CampaignList/CampaignTable.vue';
import { useCampaign } from '../composables/useCampaign';
import EditCampaignModal from '../components/CampaignForm/EditCampaignModal.vue'
import type { Campaign } from '../types/campaign.types'
import { useRouter } from 'vue-router';
import { Modal, message } from 'ant-design-vue';
import { CampaignService } from '../services/campaign.service';

const { t } = useI18nGlobal();
const router = useRouter();
const campaignService = new CampaignService();

const showEditModal = ref(false)
const selectedCampaign = ref<Campaign | null>(null)

// Using composable
const {
  campaigns,
  loading,
  pagination,
  filters,
  fetchCampaignList,
  handlePageChange,
  handleSearch,
  handleReset
} = useCampaign();

// Fetch data when component is mounted
onMounted(() => {
  fetchCampaignList();
});

const handleAdd = () => {
  router.push({
    name: 'CreateCallCampaign',
    state: { 
      campaignType: 'CALL',
      returnRoute: 'CallCampaign' 
    }
  })
}

const handleEdit = (campaign: any) => {
  console.log('Campaign before setting:', campaign)
  selectedCampaign.value = {
    Id: campaign.id,
    CampaignName: campaign.name,
    Description: campaign.description,
    StartDate: campaign.startDate,
    DueDate: campaign.endDate,
    Issue: campaign.issue,
    PriorityLevel: campaign.priorityLevel,
    Status: campaign.status,
    IsPrivated: campaign.isPrivated || false,        // Private
    isServiceCall: campaign.isServiceCall || false,  // Call Service 
    isAppPush: campaign.isAppPush || false,         // App Notification
    isServiceEmail: campaign.isServiceEmail || false // Send Email
  }
  console.log('Campaign after setting:', selectedCampaign.value)
  showEditModal.value = true
}

const handleDelete = async (campaign: Campaign) => {
    Modal.confirm({
      title: t('callCampaign.table.delete.confirmTitle'),
      content: t('callCampaign.table.delete.confirmContent', { name: campaign.name }),
      okText: t('callCampaign.table.delete.buttons.confirm'),
      cancelText: t('callCampaign.table.delete.buttons.cancel'),
      okType: 'danger',
      async onOk() {
        try {
          await campaignService.deleteCallCampaign(Number(campaign.id));
          message.success(t('callCampaign.table.messages.deleteSuccess'));
          await fetchCampaignList(); // Refresh list after delete
        } catch (error) {
          console.error('Error deleting campaign:', error);
          message.error(t('callCampaign.table.messages.deleteError'));
        }
      }
    });
  };
</script>

<style scoped>
.call-campaign {
  padding: 24px;
}

.campaign-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.pagination-info {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.45);
}
</style>