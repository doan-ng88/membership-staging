export type BrandCode = 'sky007' | 'hince' | 'mixsoon';
export type CustomerSegment = 'low' | 'medium' | 'high';
export type ProductCategory = 'electronics' | 'fashion' | 'home' | 'health' | 'sports';
export type TimeRange = 6 | 12 | 24;
export type BehaviorMetric = 'averagePurchase' | 'purchaseFrequency' | 'averageSession';

export interface MetricOption {
  value: string;
  label: string;
}

export interface PurchaseCycleData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface ProductPreferenceData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}

export interface CustomerValueData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
  }[];
}

export interface ChartDataset {
  name: string;
  data: number[];
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface MemberStats {
  [key: string]: number;
}