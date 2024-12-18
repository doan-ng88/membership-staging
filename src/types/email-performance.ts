export interface EmailCampaign {
  value: string
  label: string
  status: 'active' | 'completed' | 'scheduled' | 'draft'
  startDate?: string
  endDate?: string
}

export interface EmailStats {
  id: string
  title: string
  value: number
  trend: number
  trendLabel: string
  icon: string
  color: string
  format: 'number' | 'percent' | 'currency'
}

export interface EmailContent {
  id: string
  subject: string
  sentDate: string
  openRate: number
  clickRate: number
  conversionRate: number
  revenue: number
  status: string
}

export interface EmailMetrics {
  totalSent: number
  delivered: number
  bounced: number
  openRate: number
  clickRate: number
  conversionRate: number
  unsubscribeRate: number
  revenue: number
  previousPeriod: {
    openRate: number
    clickRate: number
    conversionRate: number
    revenue: number
  }
}

export interface DateRange {
  start: Date
  end: Date
}

export interface ChartOptions {
  chart: {
    type: string
    fontFamily: string
    [key: string]: any
  }
  [key: string]: any
} 