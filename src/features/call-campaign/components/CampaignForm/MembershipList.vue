<!-- // src/features/call-campaign/components/CampaignForm/MembershipList.vue -->
<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h4 class="text-lg font-medium">Members</h4>
      <a-button type="primary" @click="showMemberModal = true">
        Add Members
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
          Remove
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
import { ref } from 'vue';
import type { CampaignMember } from '../../types/campaign.types';
import CustomerSelectionModal from '../CustomerSelection/CustomerSelectionModal.vue';

const props = defineProps<{
  campaignId: string;
  members: CampaignMember[];
}>();

const emit = defineEmits<{
  (e: 'update:members', members: CampaignMember[]): void;
}>();

const showMemberModal = ref(false);

const columns = [
  { title: 'Name', dataIndex: 'name' },
  { title: 'Phone', dataIndex: 'phone' },
  { title: 'Level', dataIndex: 'level' },
  { title: 'Website', dataIndex: 'website' },
  { title: 'Action', key: 'action', slots: { customRender: 'action' } }
];

const handleMemberSelection = (selectedMembers: CampaignMember[]) => {
  emit('update:members', selectedMembers);
  showMemberModal.value = false;
};

const removeMember = (member: CampaignMember) => {
  const updatedMembers = props.members.filter(m => m.id !== member.id);
  emit('update:members', updatedMembers);
};
</script>