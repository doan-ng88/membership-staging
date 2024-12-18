export interface LevelSetting {
  levelId: number;
  Name: string;
  rank: number;
  thresholdAmount: number;
  rewardRate: number;
  redeemRate: number;
  durationExpired: number; // Trong ngày
  websiteId: number;
  discountPerOrder: number;
  membershipWebsites: number[] | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string[]>;

  constructor(message: string, statusCode: number = 500, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
} 