<!-- // src/features/call-campaign/components/CampaignForm/MembershipList.vue -->
<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h4 class="text-lg font-medium">{{ t('membershipList.title') }}</h4>
      <a-button type="primary" @click="showMemberModal = true">
        {{ t('membershipList.addButton') }}
      </a-button>
    </div>

    <a-table
      :columns="columns"
      :dataSource="members"
      :pagination="false"
      size="small"
    >
      <template #action="{ record }">
        <a-button type="link" danger @click="removeMember(record)">
          {{ t('membershipList.actions.remove') }}
        </a-button>
      </template>
    </a-table>

    <CustomerSelectionModal
      v-model:visible="showMemberModal"
      :selected-members="members"
      @confirm="handleMemberSelection"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { CampaignMember } from '../../types/campaign.types';
import CustomerSelectionModal from '../CustomerSelection/CustomerSelectionModal.vue';

const { t } = useI18n();

const props = defineProps<{
  campaignId: string;
  members: CampaignMember[];
}>();

const emit = defineEmits<{
  (e: 'update:members', members: CampaignMember[]): void;
}>();

const showMemberModal = ref(false);

const columns = computed(() => [
  { 
    title: t('membershipList.table.name'), 
    dataIndex: 'name' 
  },
  { 
    title: t('membershipList.table.phone'), 
    dataIndex: 'phone' 
  },
  { 
    title: t('membershipList.table.level'), 
    dataIndex: 'level' 
  },
  { 
    title: t('membershipList.table.website'), 
    dataIndex: 'website' 
  },
  { 
    title: t('membershipList.table.action'), 
    key: 'action', 
    slots: { customRender: 'action' } 
  }
]);

const handleMemberSelection = (selectedMembers: CampaignMember[]) => {
  emit('update:members', selectedMembers);
  showMemberModal.value = false;
};

const removeMember = (member: CampaignMember) => {
  const updatedMembers = props.members.filter(m => m.id !== member.id);
  emit('update:members', updatedMembers);
};
</script>