import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

export interface MailTemplate {
  mailTemplateID: number
  templateName: string
  templateTypeID: number
  templateCategoryID: number
  body: string // Đây là nơi chứa content với merge fields
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
  private baseUrl: string

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL
  }

  private get headers() {
    const authStore = useAuthStore()
    return {
      Authorization: `Bearer ${authStore.token}`
    }
  }

  async getTemplates(params: {
    pageIndex: number
    pageSize: number
    searchParams?: Array<{key: string, value: string}>
  }) {
    const response = await axios.post(
      `${this.baseUrl}/membership/mail/get-mail-template`,
      params,
      { headers: this.headers }
    )
    return response.data
  }

  async getTemplateTypes() {
    const response = await axios.get(
      `${this.baseUrl}/membership/mail/template-types`,
      { headers: this.headers }
    )
    return response.data
  }

  async getTemplateCategories() {
    const response = await axios.get(
      `${this.baseUrl}/membership/mail/template-categories`,
      { headers: this.headers }
    )
    return response.data
  }

  async createTemplate(formData: FormData) {
    const response = await axios.post(
      `${this.baseUrl}/membership/mail/upload-template`,
      formData,
      { 
        headers: {
          ...this.headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  async updateTemplate(id: number, formData: FormData) {
    const response = await axios.post(
      `${this.baseUrl}/membership/mail/update-template/${id}`,
      formData,
      { 
        headers: {
          ...this.headers,
          'Content-Type': 'multipart/form-data'
        }
      }
    )
    return response.data
  }

  async deleteTemplate(id: number) {
    const response = await axios.delete(
      `${this.baseUrl}/membership/mail/templates/${id}`,
      { headers: this.headers }
    )
    return response.data
  }

  async duplicateTemplate(id: number) {
    const response = await axios.post(
      `${this.baseUrl}/membership/mail/clone-template/${id}`,
      {},
      { headers: this.headers }
    )
    return response.data
  }
}

export const mailTemplateService = new MailTemplateService() 