import axiosClient from '@/api/axiosClient';

export interface MailTemplate {
  mailTemplateID: number
  templateName: string
  templateTypeID: number
  templateCategoryID: number
  body: string
  enabled: boolean
  createTime?: string
  updateTime?: string
}

export interface TemplateType {
  templateTypeID: number
  templateTypeName: string
  enabled: boolean
}

export interface TemplateCategory {
  templateCategoryID: number
  templateCategoryName: string
  enabled: boolean
}

export class MailTemplateService {
  async getTemplate(id: number) {
    try {
      const response = await axiosClient.get(`/membership/mail/templates/${id}`);
      return response;
    } catch (error: any) {
      console.error('Error fetching template:', error);
      throw error;
    }
  }

  async getTemplates(params: {
    pageIndex: number
    pageSize: number
    searchParams?: Array<{key: string, value: string}>
  }) {
    const response = await axiosClient.post(
      `/membership/mail/get-mail-template`,
      params
    )
    return response.data
  }

  async getTemplateTypes() {
    const response = await axiosClient.get(
      `/membership/mail/template-types`
    )
    return response.data
  }

  async getTemplateCategories() {
    const response = await axiosClient.get(
      `/membership/mail/template-categories`
    )
    return response.data
  }

  async createTemplate(formData: FormData) {
    const response = await axiosClient.post(
      `/membership/mail/upload-template`,
      formData,
      { 
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  async updateTemplate(id: number, formData: FormData) {
    const response = await axiosClient.post(
      `/membership/mail/update-template/${id}`,
      formData,
      { 
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  async deleteTemplate(id: number) {
    const response = await axiosClient.delete(
      `/membership/mail/templates/${id}`
    )
    return response.data
  }

  async duplicateTemplate(id: number) {
    const response = await axiosClient.post(
      `/membership/mail/clone-template/${id}`
    )
    return response.data
  }
}

export const mailTemplateService = new MailTemplateService() 