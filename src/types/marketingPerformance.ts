export interface Campaign {
  value: string
  label: string
  period: string
  stats: CampaignStats
}

export interface CampaignStats {
  totalSent: number
  openRate: number
  clickRate: number
  conversionRate: number
  previousStats?: {
    totalSent: number
    openRate: number
    clickRate: number
    conversionRate: number
  }
}

export interface Channel {
  id: string
  name: string
  contribution: number
  trend: number
  icon: string
  color: string
}

export interface TimeRange {
  value: number
  label: string
} 