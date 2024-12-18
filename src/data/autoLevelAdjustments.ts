export type BrandCode = 'sky007' | 'hince' | 'mixsoon';
export type NotificationChannel = 'zalo_sms' | 'email';
export type AdjustmentType = 'recalculation' | 'notification';
export type SendType = 'before' | 'after';

export interface Recalculation {
  adjustmentName: string;
  frequency: string;
  description: string;
  day: string;
}

export interface Notification {
  adjustmentName: string;
  notificationMethod: NotificationChannel;
  description: string;
  days: number;
  sendType: SendType;
}

export interface BrandAdjustments {
  recalculations: Recalculation[];
  notifications: Notification[];
}

export interface AdjustmentData {
  [key: string]: BrandAdjustments;
}

export interface AdjustmentForm {
  adjustmentName: string;
  frequency: string;
  recalculationDescription: string;
  notificationMethod: NotificationChannel;
  notificationDescription: string;
}

export const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Hàng Ngày' },
  { value: 'weekly', label: 'Hàng Tuần' },
  { value: 'monthly', label: 'Hàng Tháng' },
  { value: 'quarterly', label: 'Hàng Quý' },
  { value: 'yearly', label: 'Hàng Năm' }
] as const;

export const NOTIFICATION_METHOD_OPTIONS = [
  { value: 'zalo_sms', label: 'Zalo SMS' },
  { value: 'email', label: 'Email' }
] as const;

export const DAYS_OPTIONS = Array.from({length: 15}, (_, i) => ({
  value: i + 1,
  label: `${i + 1} ngày`
}));

export const BRAND_OPTIONS = [
  { value: 'sky007', label: 'Sky007, BBIA' },
  { value: 'hince', label: 'Hince' },
  { value: 'mixsoon', label: 'Mixsoon' }
] as const;

// Default form state
export const defaultAdjustmentForm: AdjustmentForm = {
  adjustmentName: '',
  frequency: '',
  recalculationDescription: '',
  notificationMethod: '',
  notificationDescription: ''
};

// Main data
export const adjustmentData: AdjustmentData = {
  sky007: {
    recalculations: [
      {
        adjustmentName: 'Zalo SMS',
        frequency: 'SMS',
        description: 'Gửi SMS thông báo khi hạng thành viên giảm xuống.',
        day: 'Số Ngày'
      }
    ],
    notifications: [
      {
        adjustmentName: 'Email',
        notificationMethod: 'email',
        description: 'Gửi email thông báo khi hạng thành viên giảm xuống.',
        days: 1,
        sendType: 'before'
      }
    ]
  },
  // ... other brands data
};

// Nếu cần thiết, định nghĩa và export CHANNEL_OPTIONS
export const CHANNEL_OPTIONS = [
  { value: 'zalo_sms', label: 'Zalo SMS' },
  { value: 'email', label: 'Email' }
];