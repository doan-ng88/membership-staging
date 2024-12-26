<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">Email Template List</h2>
        </template>
        <template #extra>
          <a-space>
            <a-button type="primary" @click="navigateToEditor">
              <template #icon>
                <plus-outlined />
              </template>
              Create Template
            </a-button>
          </a-space>
        </template>
      </PageHeader>

      
      <div class="bg-white rounded-lg shadow p-6">
        <!-- Search & Filters -->
        <div class="mb-6 flex gap-4">
          <a-input-search v-model:value="searchText" placeholder="Search template" style="width: 300px"
            @search="handleSearch" />
          <a-select v-model:value="selectedTypes" mode="multiple" style="width: 250px" placeholder="Template type"
            :options="templateTypes.map(type => ({
              label: type.templateTypeName,
              value: type.templateTypeID
            }))" @change="handleSearch">
            <template #maxTagPlaceholder="{ omittedValues }">
              <span>+{{ omittedValues.length }} types</span>
            </template>
          </a-select>
          <a-select v-model:value="selectedCategories" mode="multiple" style="width: 250px" placeholder="Category"
            :options="templateCategories.map(category => ({
              label: category.templateCategoryName,
              value: category.templateCategoryID
            }))" @change="handleSearch">
            <template #maxTagPlaceholder="{ omittedValues }">
              <span>+{{ omittedValues.length }} categories</span>
            </template>
          </a-select>
        </div>

        <!-- Template Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div v-for="(template, index) in templates" :key="index"
            class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div class="aspect-w-16 aspect-h-9 bg-gray-100">
              <div class="relative">
                <img :src="getPreviewUrl(template.body)" :alt="template.templateName" 
                  class="object-cover w-full h-full cursor-pointer hover:brightness-75 transition-all duration-300"
                  @click="handleEdit(template)" />
                <div  @click="handleEdit(template)" class="absolute  cursor-pointer bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
            </div>
            <div class="p-4">
              <h3 class="font-medium mb-2 cursor-pointer" @click="handleEdit(template)">{{ template?.templateName }}</h3>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-500">
                  {{ formatDate(template?.createTime) }}
                </span>
                <a-dropdown>
                  <template #overlay>
                    <a-menu>
                      <a-menu-item key="edit" @click="handleEdit(template)">
                        <edit-outlined /> Edit
                      </a-menu-item>
                      <a-menu-item key="duplicate" @click="handleDuplicate(template)">
                        <copy-outlined /> Duplicate
                      </a-menu-item>
                      <a-menu-item key="delete" @click="handleDelete(template)">
                        <delete-outlined /> Delete
                      </a-menu-item>
                    </a-menu>
                  </template>
                  <a-button type="text">
                    <more-outlined />
                  </a-button>
                </a-dropdown>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="mt-6 flex justify-end">
          <a-pagination v-model:current="currentPage" :total="totalCount" :pageSize="pageSize"
            @change="handlePageChange" />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  MoreOutlined
} from '@ant-design/icons-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import type { MailTemplate } from '@/services/mailTemplateService'

interface SearchParam {
  key: string
  value: string | number
}

const router = useRouter()
const baseUrl = import.meta.env.VITE_API_BASE_URL
const authStore = useAuthStore()
const loading = ref(false)
// Tạo axios instance với interceptor
const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      await authStore.logout()
      window.location.href = '/login'
      return Promise.reject(error)
    }
    return Promise.reject(error)
  }
)

const templates = ref<MailTemplate[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const searchText = ref('')
const templateTypes = ref<TemplateType[]>([])
const templateCategories = ref<TemplateCategory[]>([])
const selectedTypes = ref<number[]>([])
const selectedCategories = ref<number[]>([])

interface TemplateType {
  templateTypeID: number
  templateTypeName: string
  enabled: boolean
  createTime?: string
  updateTime?: string
}

interface TemplateCategory {
  templateCategoryID: number
  templateCategoryName: string
  enabled: boolean
  createTime?: string
  updateTime?: string
}

const fetchTemplateTypes = async () => {
  try {
    const response = await api.get('/membership/mail/template-types')
    if (response.data.result === 'Success') {
      templateTypes.value = response.data.data.filter((type: TemplateType) => type.enabled)
    }
  } catch (error) {
    console.error('Error fetching template types:', error)
    message.error('Unable to load template types')
  }
}

const fetchTemplateCategories = async () => {
  try {
    const response = await api.get('/membership/mail/template-categories')
    if (response.data.result === 'Success') {
      templateCategories.value = response.data.data.filter((category: TemplateCategory) => category.enabled)
    }
  } catch (error) {
    console.error('Error fetching template categories:', error)
    message.error('Unable to load categories')
  }
}

const fetchTemplates = async () => {
  try {
    loading.value = true
    const searchParams: SearchParam[] = []

    if (searchText.value) {
      searchParams.push({
        key: 'templateName',
        value: searchText.value
      })
    }

    selectedTypes.value.forEach(typeId => {
      searchParams.push({
        key: 'templateTypeID',
        value: typeId.toString()
      })
    })

    selectedCategories.value.forEach(categoryId => {
      searchParams.push({
        key: 'templateCategoryID',
        value: categoryId.toString()
      })
    })

    const response = await api.post('/membership/mail/get-mail-template', {
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      sortField: 'UpdateTime',
      sortType: 'DESC',
      searchParams
    })

    templates.value = response.data.data
    totalCount.value = response.data.totalCount
  } catch (error) {
    console.error('Error fetching templates:', error)
    message.error('Không thể tải danh sách template')
  } finally {
    loading.value = false
  }
}

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const navigateToEditor = () => {
  router.push('/mail/editor')
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchTemplates()
}

const handleSearch = () => {
  currentPage.value = 1
  fetchTemplates()
}

const handleEdit = (template: MailTemplate) => {
  router.push({
    name: 'MailEditor',
    params: { id: template.mailTemplateID.toString() },
    // query: { template: JSON.stringify(template) }
  })
}

const handleDuplicate = async (template: MailTemplate) => {
  try {
    const result = await api.post(`/membership/mail/clone-template/${template.mailTemplateID}`)
    if (result.data.result === 'Success') {
      message.success('Template duplicated successfully')
      await fetchTemplates()
    } else {
      message.error('Unable to duplicate template')
    }
  } catch (error) {
    console.error('Error cloning template:', error)
    message.error('An error occurred while duplicating the template') 
  }
}

const handleDelete = async (template: MailTemplate) => {
  try {
    const result = await api.delete(`/membership/mail/templates/${template.mailTemplateID}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (result.data.result === 'Success') {
      message.success('Template deleted successfully')
      await fetchTemplates()
    } else {
      message.error('Unable to delete template')
    }
  } catch (error) {
    console.error('Error deleting template:', error) 
    message.error('An error occurred while deleting the template')
  }
}

const getPreviewUrl = (body: string) => {
  const fileName = body.split('/').pop() || ''
    return `${import.meta.env.VITE_API_BASE_URL_TEMPLATE}/picture/preview_${fileName}.jpg`
}

onMounted(async () => {
  await Promise.all([
    fetchTemplateTypes(),
    fetchTemplateCategories()
  ])
  console.log('Template Types:', templateTypes.value)
  console.log('Template Categories:', templateCategories.value)
  fetchTemplates()
})
</script>