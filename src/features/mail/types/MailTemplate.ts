export interface MailTemplate {
  mailTemplateID: number;
  templateName: string;
  templateTypeID: number;
  templateCategoryID: number;
  body: string;
  enabled: boolean;
  createTime?: string;
  updateTime?: string;
}

export interface TemplateType {
  templateTypeID: number;
  templateTypeName: string;
  enabled: boolean;
  createTime?: string;
  updateTime?: string;
}

export interface TemplateCategory {
  templateCategoryID: number;
  templateCategoryName: string;
  enabled: boolean;
  createTime?: string;
  updateTime?: string;
}

export interface MailCampaign {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  targetGroup: string;
  templateId: number;
  // ... other properties
} 