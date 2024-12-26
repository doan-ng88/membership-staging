<!-- // src/features/call-campaign/views/CallCampaignView.vue -->
<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
      <template #title>
        <h2 class="text-2xl font-bold text-gray-800">Call Campaign Management</h2>
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
      :enable-name-click="true"
    />

    <EditCampaignModal
      v-model:visible="showEditModal"
      :campaignId="selectedCampaign?.CampaignID"
      :campaign-data="selectedCampaign || {}"
      @success="fetchCampaignList"
    />
  </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import CampaignActions from '../components/CampaignList/CampaignActions.vue';
import CampaignFilters from '../components/CampaignList/CampaignFilters.vue';
import CampaignTable from '../components/CampaignList/CampaignTable.vue';
import { useCampaign } from '../composables/useCampaign';
import EditCampaignModal from '../components/CampaignForm/EditCampaignModal.vue'
import type { Campaign } from '../types/campaign.types'
import { useRouter } from 'vue-router';

const router = useRouter();

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
    router.push({name: 'NewCampaign'});
  };

const handleEdit = (campaign: Campaign) => {
  selectedCampaign.value = {
    CampaignID: campaign.CampaignID,
    CampaignName: campaign.CampaignName,
    Description: campaign.Description,
    StartDate: campaign.StartDate,
    DueDate: campaign.DueDate,
    Issue: campaign.Issue,
    PriorityLevel: campaign.PriorityLevel,
    Status: campaign.Status,
    IsPrivated: campaign.IsPrivated,
    isServiceCall: campaign.isServiceCall,
    isAppPush: campaign.isAppPush,
    isServiceEmail: campaign.isServiceEmail
  }
  showEditModal.value = true
}
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