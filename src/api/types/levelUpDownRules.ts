import { ref } from 'vue';
import type { ApiResponse } from './responses';

export interface LevelSetting {
  levelId?: number;
  Name: string;
  websiteId: number;
  thresholdAmount: number;
  rewardRate: number;
  redeemRate: number;
  levelIdWebsite?: number;
  durationExpired: number;
  rank: number;
  discountPerOrder: number;
  membershipWebsites?: any;
  deletedAt?: string | null;
}

export interface LevelRank {
  id: number;
  name: string;
  description?: string;
}

export type EditableLevelFields = Pick<
  LevelSetting,
  'thresholdAmount' | 'durationExpired'
>;

export type LevelSettingResponse = ApiResponse<LevelSetting[]>;
export type SingleLevelSettingResponse = ApiResponse<LevelSetting>;

export interface CreateLevelSettingDTO {
  levelName: string;
  thresholdAmount: number;
  durationExpired: number;
  websiteId: number;
}

export interface UpdateLevelSettingDTO extends CreateLevelSettingDTO {
  id: number;
}

// Thêm interface cho form state
interface FormState {
  Name: string;
  thresholdAmount: number;
  durationExpired: number;
}

// Update form state ref
export const formState = ref<FormState>({
  Name: '',
  thresholdAmount: 0,
  durationExpired: 30,
});

// Form state mặc định
export const defaultFormState: Omit<LevelSetting, 'levelId'> = {
  Name: '',
  websiteId: 1,
  thresholdAmount: 0,
  durationExpired: 6,
  rank: 0
};

// Thêm interface cho form errors
export interface FormErrors {
  Name?: string;
  rank?: string;
  thresholdAmount?: string;
  rewardRate?: string;
  redeemRate?: string;
  durationExpired?: string;
  discountPerOrder?: string;
} 