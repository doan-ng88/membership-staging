<!-- // src/features/call-campaign/components/CustomerSelection/CustomerSelectionModal.vue -->
<template>
  <a-modal
    :open="visible"
    title="Select Members"
    width="1000px"
    @cancel="handleCancel"
    @ok="handleConfirm"
  >
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="joinDate" tab="Join Date">
        <JoinDateTab
          v-model:selected-members="selectedMembers"
          :existing-members="existingMembers"
        />
      </a-tab-pane>
      <a-tab-pane key="birthDate" tab="Birth Date">
        <BirthDateTab
          v-model:selected-members="selectedMembers"
          :existing-members="existingMembers"
        />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CampaignMember } from '../../types/campaign.types';
import JoinDateTab from './JoinDateTab.vue';
import BirthDateTab from './BirthDateTab.vue';

const props = defineProps<{
  visible: boolean;
  selectedMembers: CampaignMember[];
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'confirm', members: CampaignMember[]): void;
}>();

const activeTab = ref('joinDate');
const selectedMembers = ref<CampaignMember[]>([...props.selectedMembers]);

const handleCancel = () => {
  selectedMembers.value = [...props.selectedMembers];
  emit('update:visible', false);
};

const handleConfirm = () => {
  emit('confirm', selectedMembers.value);
  emit('update:visible', false);
};
</script>