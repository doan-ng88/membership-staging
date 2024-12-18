// Types và Interfaces
export type BrandCode = 'sky007' | 'hince' | 'mixsoon';

export interface Benefit {
  levelName: string;
  condition: string;
  discountRate: number;
  pointRate: number;
  specialServices: string;
}

export interface BrandBenefits {
  [key: string]: Benefit[]; // index signature for brand keys
}

export interface BrandOption {
  value: BrandCode;
  label: string;
}

// Constants
export const BRAND_OPTIONS: BrandOption[] = [
  { value: 'sky007', label: 'Sky007, BBIA' },
  { value: 'hince', label: 'Hince' },
  { value: 'mixsoon', label: 'Mixsoon' }
];

// Default benefit object
export const defaultBenefit: Benefit = {
  levelName: '',
  condition: '',
  discountRate: 0,
  pointRate: 0,
  specialServices: ''
};

// Main data object
export const brandsData: BrandBenefits = {
  sky007: [
    {
      levelName: 'Bạc',
      condition: 'Sau khi hoàn thành đăng ký tài khoản thành viên trên website.',
      discountRate: 0,
      pointRate: 1,
      specialServices: 'Không hỗ trợ'
    },
    {
      levelName: 'Vàng',
      condition: 'Mua trên 1.500.000đ trong vòng 6 tháng.',
      discountRate: 0,
      pointRate: 2,
      specialServices: 'Voucher miễn phí vận chuyển, gói quà miễn phí'
    },
    {
      levelName: 'Kim Cương',
      condition: 'Mua trên 4.000.000đ trong vòng 6 tháng.',
      discountRate: 3,
      pointRate: 3,
      specialServices: 'Voucher giảm giá, voucher vận chuyển, gói quà miễn phí, giảm giá đơn hàng'
    }
  ],
  hince: [
    {
      levelName: 'Bạc',
      condition: 'Sau khi hoàn thành đăng ký tài khoản thành viên trên website.',
      discountRate: 0,
      pointRate: 1,
      specialServices: 'Không hỗ trợ'
    },
    {
      levelName: 'Vàng',
      condition: 'Mua trên 3.500.000đ trong vòng 6 tháng.',
      discountRate: 0,
      pointRate: 2,
      specialServices: 'Voucher miễn phí vận chuyển, gói quà miễn phí'
    },
    {
      levelName: 'Kim Cương',
      condition: 'Mua trên 6.000.000đ trong vòng 6 tháng.',
      discountRate: 3,
      pointRate: 3,
      specialServices: 'Voucher giảm giá, voucher vận chuyển, gói quà miễn phí, giảm giá đơn hàng'
    }
  ],
  mixsoon: [
    {
      levelName: 'Bạc',
      condition: 'Sau khi hoàn thành đăng ký tài khoản thành viên trên website.',
      discountRate: 0,
      pointRate: 1,
      specialServices: 'Không hỗ trợ'
    },
    {
      levelName: 'Vàng',
      condition: 'Mua trên 1.500.000đ trong vòng 6 tháng.',
      discountRate: 0,
      pointRate: 2,
      specialServices: 'Voucher miễn phí vận chuyển, gói quà miễn phí'
    },
    {
      levelName: 'Kim Cương',
      condition: 'Mua trên 4.000.000đ trong vòng 6 tháng.',
      discountRate: 3,
      pointRate: 3,
      specialServices: 'Voucher giảm giá, voucher vận chuyển, gói quà miễn phí, giảm giá đơn hàng'
    }
  ]
};

// Helper functions
export const isValidBrandCode = (code: string): code is BrandCode => {
  return ['sky007', 'hince', 'mixsoon'].includes(code);
};

export const validateBenefit = (benefit: Partial<Benefit>): benefit is Benefit => {
  return (
    typeof benefit.levelName === 'string' &&
    benefit.levelName.length > 0 &&
    typeof benefit.condition === 'string' &&
    benefit.condition.length > 0 &&
    typeof benefit.discountRate === 'number' &&
    benefit.discountRate >= 0 &&
    benefit.discountRate <= 100 &&
    typeof benefit.pointRate === 'number' &&
    benefit.pointRate >= 0 &&
    benefit.pointRate <= 100 &&
    typeof benefit.specialServices === 'string'
  );
};

export const createEmptyBenefit = (): Benefit => ({
  ...defaultBenefit
});

// Types for component props and emits
export interface BenefitTableProps {
  benefits: Benefit[];
}

export interface BenefitModalProps {
  show: boolean;
  benefit: Benefit;
  isEditing: boolean;
}

export interface EditEventPayload {
  index: number;
  benefit: Benefit;
}

export interface DeleteEventPayload {
  index: number;
}

export interface LevelSetting {
  levelId: number;
  Name: string;
  websiteId: number;
  thresholdAmount: number;  // Số tiền tối thiểu
  rewardRate: number;       // Tỷ lệ tích điểm
  redeemRate: number;       // Tỷ lệ đổi điểm
  levelIdWebsite: number;
  durationExpired: number;  // Thời hạn hiệu lực (tháng)
  rank: number;             // Thứ hạng
  discountPerOrder: number; // Giảm giá trên mỗi đơn
  membershipWebsites: null;
}

export const defaultLevel: LevelSetting = {
  levelId: 0,
  Name: '',
  websiteId: 1,
  thresholdAmount: 0,
  rewardRate: 0,
  redeemRate: 0,
  levelIdWebsite: 0,
  durationExpired: 6,
  rank: 0,
  discountPerOrder: 0,
  membershipWebsites: null
};

// Thêm interface cho response API
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Thêm interface cho form validation
export interface FormErrors {
  Name?: string;
  thresholdAmount?: string;
  rewardRate?: string;
  redeemRate?: string;
  durationExpired?: string;
  discountPerOrder?: string;
}

// Thêm interface cho request update
export interface UpdateLevelRequest {
  levelId: number;
  Name: string;
  websiteId: number;
  thresholdAmount: number;
  rewardRate: number;
  redeemRate: number;
  levelIdWebsite: number;
  durationExpired: number;
  rank: number;
  discountPerOrder: number;
}

// Thêm interface cho response
export interface UpdateLevelResponse {
  success: boolean;
  data: LevelSetting;
  message?: string;
}

// Thêm validation rules
export const validationRules = {
  Name: (value: string) => !!value.trim() || 'Tên cấp bậc là bắt buộc',
  thresholdAmount: (value: number) => value >= 0 || 'Số tiền không được âm',
  rewardRate: (value: number) => (value >= 0 && value <= 100) || 'Tỷ lệ phải từ 0-100%',
  redeemRate: (value: number) => (value >= 0 && value <= 100) || 'Tỷ lệ phải từ 0-100%',
  durationExpired: (value: number) => value >= 0 || 'Thời hạn không được âm',
  rank: (value: number) => value >= 0 || 'Thứ hạng không được âm',
  discountPerOrder: (value: number) => (value >= 0 && value <= 100) || 'Giảm giá phải từ 0-100%'
}
