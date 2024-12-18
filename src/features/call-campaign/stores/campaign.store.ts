// src/features/call-campaign/stores/campaign.store.ts
import { defineStore } from 'pinia';
import type { Campaign, CampaignFilters } from '../types/campaign.types';
import { CampaignService } from '../services/campaign.service';

export const useCampaignStore = defineStore('campaign', {
  state: () => ({
    campaigns: [] as Campaign[],
    loading: false,
    error: null as string | null,
    filters: {} as CampaignFilters,
    selectedCampaign: null as Campaign | null,
  }),

  actions: {
    async fetchCampaigns(filters?: CampaignFilters) {
      try {
        this.loading = true;
        const service = new CampaignService();
        this.campaigns = await service.getCampaigns(filters);
      } catch (error) {
        this.error = 'Failed to fetch campaigns';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createCampaign(data: Partial<Campaign>) {
      try {
        this.loading = true;
        const service = new CampaignService();
        const newCampaign = await service.createCampaign(data);
        this.campaigns.push(newCampaign);
        return newCampaign;
      } catch (error) {
        this.error = 'Failed to create campaign';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    setSelectedCampaign(campaign: Campaign | null) {
      this.selectedCampaign = campaign;
    },
  },

  getters: {
    filteredCampaigns: (state) => {
      // Add any filtering logic here
      return state.campaigns;
    },
  },
});