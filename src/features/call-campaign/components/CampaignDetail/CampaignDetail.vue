<template>
  <div v-if="selectedCampaign">
    <h2>{{ selectedCampaign.name }}</h2>
    <div class="campaign-info">
      <div class="websites">
        <p>Websites:</p>
        <ul>
          <li v-for="websiteId in uniqueWebsiteIds" :key="websiteId">
            {{ getWebsiteName(websiteId) }}
          </li>
        </ul>
      </div>
      <!-- Other campaign details -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useCampaign } from '../../composables/useCampaign';
import { websites } from '@/api/types/website';

const { selectedCampaign, fetchCampaignById } = useCampaign();
const route = useRoute();

const uniqueWebsiteIds = computed(() => {
  if (!selectedCampaign?.memberships) return [];
  return [...new Set(selectedCampaign.memberships.map(m => m.websiteId))];
});

const getWebsiteName = (websiteId: number) => {
  const website = websites.find(w => w.websiteId === websiteId);
  return website?.name || 'N/A';
};

onMounted(() => {
  const campaignId = route.params.id as string;
  fetchCampaignById(campaignId);
});
</script>

<style scoped>
.campaign-info {
  margin-top: 1rem;
}

.websites {
  margin-top: 0.5rem;
}

.websites ul {
  list-style: none;
  padding-left: 1rem;
}

.websites li {
  margin: 0.25rem 0;
}
</style> 