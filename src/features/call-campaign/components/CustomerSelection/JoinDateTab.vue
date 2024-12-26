<!-- // src/features/call-campaign/components/CustomerSelection/JoinDateTab.vue -->
<template>
  <div class="space-y-4">
    <div class="grid grid-cols-4 gap-4">
      <a-form-item label="Join Date">
        <a-date-picker v-model:value="filters.joinDate" class="w-full" />
      </a-form-item>

      <a-form-item label="Website">
        <a-select v-model:value="filters.website" class="w-full">
          <a-select-option v-for="website in WEBSITE_OPTIONS" 
            :key="website.value" 
            :value="website.value"
          >
            {{ website.label }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="Member Level">
        <a-select v-model:value="filters.levelId" class="w-full">
          <a-select-option value="">All Levels</a-select-option>
          <a-select-option 
            v-for="member in members" 
            :key="member.levelId" 
            :value="member.levelId"
          >
            {{ member.levelName }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </div>

    <div class="flex justify-end space-x-2">
      <a-button @click="resetFilters">Reset</a-button>
      <a-button type="primary" @click="applyFilters">Apply</a-button>
    </div>

    <a-table
      :columns="columns"
      :dataSource="filteredMembers"
      :rowSelection="rowSelection"
      rowKey="id"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { CampaignMember } from '../../types/campaign.types';
import { WEBSITE_OPTIONS } from '../../constants/campaign.constants';

const props = defineProps<{
  selectedMembers: CampaignMember[];
  existingMembers: CampaignMember[];
  members: any[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedMembers', members: CampaignMember[]): void;
}>();

const filters = ref({
  joinDate: null,
  website: '',
  levelId: null
});

// ... Rest of the component logic for filtering and selection
</script>