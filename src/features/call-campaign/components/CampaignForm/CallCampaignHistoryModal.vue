<template>
  <a-modal
    :open="visible"
    :title="t('callCampaign.callCampaignDetail.callCampaignHistory.title')"
    width="900px"
    @cancel="handleCancel"
    :footer="null"
  >
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      size="small"
      bordered
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'callStatus'">
          <a-tag :color="getStatusColor(text)">
            {{ t(`callCampaign.callCampaignDetail.callCampaignHistory.status.${text}`) }}
          </a-tag>
        </template>
        
        <template v-if="column.dataIndex === 'serviceCallDate' || column.dataIndex === 'nextFollowUpDate'">
          {{ formatDate(text) }}
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18nGlobal } from '@/i18n';
import { callHistoryAPI } from '@/api/services/membershipApi';
import type { CallCampaignHistory } from '@/features/call-campaign/types/campaign.types';
// import { CallStatus } from '@/features/call-campaign/views/CallCampaignDetailView.vue';

const { t } = useI18nGlobal();

const visible = ref(false);
const loading = ref(false);
const data = ref<CallCampaignHistory[]>([]);
const errorMessage = ref('');

const columns = computed(() => [
  {
    title: t('callCampaign.callCampaignDetail.callCampaignHistory.columns.serviceCallDate'),
    dataIndex: 'serviceCallDate',
    width: 120,
  },
  {
    title: t('callCampaign.callCampaignDetail.callCampaignHistory.columns.callReason'),
    dataIndex: 'callReason',
    width: 120,
  },
  {
    title: t('callCampaign.callCampaignDetail.callCampaignHistory.columns.callStatus'),
    dataIndex: 'callStatus',
    width: 90,
  },
  {
    title: t('callCampaign.callCampaignDetail.callCampaignHistory.columns.callSummary'),
    dataIndex: 'callSummary',
    width: 120,
  },
  {
    title: t('callCampaign.callCampaignDetail.callCampaignHistory.columns.nextFollowUpDate'),
    dataIndex: 'nextFollowUpDate',
    width: 120,
  },
  {
    title: t('callCampaign.callCampaignDetail.callCampaignHistory.columns.callNote'),
    dataIndex: 'callNote',
    ellipsis: true,
    width: 120,
  },
]);

const getStatusColor = (status: string) => {
  const statusColors = {
    'not_call': 'gray',
    'need_recall': 'orange',
    'no_answer': 'red',
    'completed': 'green',
    'pending': 'blue',
    'cancelled': 'black'
  };
  return statusColors[status as keyof typeof statusColors] || 'default';
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const handleCancel = () => {
  visible.value = false;
  data.value = [];
};

const fetchData = async (campaignId: number, membershipId: number) => {
  try {
    loading.value = true;
    const response = await callHistoryAPI.getHistory(campaignId, membershipId);
    data.value = response.data;
  } catch (error) {
    errorMessage.value = t('callCampaign.callCampaignDetail.callCampaignHistory.messages.fetchError');
    console.error('Error fetching call history:', error);
  } finally {
    loading.value = false;
  }
};

defineExpose({
  open: (campaignId: number, membershipId: number) => {
    visible.value = true;
    fetchData(campaignId, membershipId);
  },
});
</script> 