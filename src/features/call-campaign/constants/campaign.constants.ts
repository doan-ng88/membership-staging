// Priority Level Options
export const PRIORITY_LEVEL_OPTIONS = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
  { label: 'Not Set', value: 'Not Set' }
] as const;

// Campaign Status Options
export const CAMPAIGN_STATUS_OPTIONS = [
  { label: 'Created', value: 'Created' },
  { label: 'Planning', value: 'Planning' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Closed', value: 'Closed' },
  { label: 'Cancelled', value: 'Cancelled' }
] as const;

// Status Color Mapping
export const STATUS_COLOR_MAP = {
  Created: 'default',
  Planning: 'processing',
  'In Progress': 'processing',
  'On Hold': 'warning',
  Completed: 'success',
  Closed: 'default',
  Cancelled: 'error'
} as const;

// Priority Level Color Mapping
export const PRIORITY_COLOR_MAP = {
  High: 'red',
  Medium: 'orange',
  Low: 'blue',
  'Not Set': 'default'
} as const;

// Type definitions
export type PriorityLevel = typeof PRIORITY_LEVEL_OPTIONS[number]['value'];
export type CampaignStatus = typeof CAMPAIGN_STATUS_OPTIONS[number]['value'];

// Helper functions
export const getPriorityLevelLabel = (value: PriorityLevel): string => {
  return PRIORITY_LEVEL_OPTIONS.find(option => option.value === value)?.label || 'Not Set';
};

export const getStatusLabel = (value: CampaignStatus): string => {
  return CAMPAIGN_STATUS_OPTIONS.find(option => option.value === value)?.label || 'Created';
};

export const getPriorityColor = (priority: PriorityLevel): string => {
  return PRIORITY_COLOR_MAP[priority] || 'default';
};

export const getStatusColor = (status: CampaignStatus): string => {
  return STATUS_COLOR_MAP[status] || 'default';
};

export const WEBSITE_OPTIONS = [
  { label: 'Hince', value: 'hince' },
  { label: 'BBIA', value: 'bbia' },
  { label: 'Mixsoon', value: 'mixsoon' },
  { label: 'Sky007', value: 'sky007' }
];
