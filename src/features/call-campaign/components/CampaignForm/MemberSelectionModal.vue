<template>
  <a-modal
    :open="visible"
    title="Thêm thành viên"
    width="90%"
    @ok="handleConfirm"
    @cancel="handleCancel"
  >
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="join" tab="Ngày tham gia">
        <MemberJoinTab ref="joinTabRef" />
      </a-tab-pane>
      <a-tab-pane key="birth" tab="Ngày sinh nhật">
        <MemberBirthTab ref="birthTabRef" />
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CampaignMember } from '../../types/campaign.types';
import MemberJoinTab from './MemberJoinTab.vue';
import MemberBirthTab from './MemberBirthTab.vue';

const props = defineProps<{
  visible: boolean
}>();

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'select', members: CampaignMember[]): void;
}>();

const activeTab = ref('join');
const joinTabRef = ref();
const birthTabRef = ref();

const handleConfirm = () => {
  const selectedMembers = activeTab.value === 'join' 
    ? joinTabRef.value?.getSelectedMembers() 
    : birthTabRef.value?.getSelectedMembers();
    
  if (selectedMembers?.length) {
    emit('select', selectedMembers);
  }
  handleCancel();
};

const handleCancel = () => {
  emit('update:visible', false);
};
</script> 