// src/core/interfaces/campaign.interface.ts
export interface ICampaignService {
    getCampaigns(filters?: CampaignFilters): Promise<Campaign[]>;
    createCampaign(data: CampaignCreate): Promise<Campaign>;
    updateCampaign(id: string, data: CampaignUpdate): Promise<Campaign>;
    deleteCampaign(id: string): Promise<void>;
    assignMembers(campaignId: string, memberIds: string[]): Promise<void>;
  }