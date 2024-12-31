export interface ZaloTemplate {
  id: number
  name: string
  content: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface ZaloCampaign {
  id: number
  name: string
  description: string
  templateId: number
  status: string
  scheduleTime: string
  recipientCount: number
  createdAt: string
  updatedAt: string
} 