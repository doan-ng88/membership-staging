<template>
  <div class="bg-white dark:bg-dark-2 rounded-lg shadow p-4 mb-6">
    <div class="flex flex-wrap gap-4">
      <a-input-search
        v-model:value="searchText"
        placeholder="Tìm kiếm template"
        style="width: 300px"
        @search="handleSearch"
      />
      
      <a-select
        v-model:value="filters.templateType"
        mode="multiple"
        style="width: 250px"
        placeholder="Loại template"
        :options="templateTypes.map(type => ({
          label: type.templateTypeName,
          value: type.templateTypeID
        }))"
        @change="handleSearch"
      >
        <template #maxTagPlaceholder="{ omittedValues }">
          <span>+{{ omittedValues.length }} loại</span>
        </template>
      </a-select>

      <a-select
        v-model:value="filters.templateCategory"
        mode="multiple"
        style="width: 250px"
        placeholder="Danh mục"
        :options="templateCategories.map(category => ({
          label: category.templateCategoryName,
          value: category.templateCategoryID
        }))"
        @change="handleSearch"
      >
        <template #maxTagPlaceholder="{ omittedValues }">
          <span>+{{ omittedValues.length }} danh mục</span>
        </template>
      </a-select>

      <a-button @click="handleReset" class="dark:text-gray-300">
        <template #icon><ReloadOutlined /></template>
        Đặt lại
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import type { AxiosError } from 'axios'

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

interface SearchParam {
  key: string
  value: string
}

const router = useRouter()
const authStore = useAuthStore()

// Check auth
if (!authStore.isAuthenticated) {
  router.push('/login')
}

const searchText = ref('')
const templateTypes = ref<TemplateType[]>([])
const templateCategories = ref<TemplateCategory[]>([])

const filters = reactive({
  templateType: [] as number[],
  templateCategory: [] as number[]
})

const baseUrl = import.meta.env.VITE_API_BASE_URL
const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
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

const emit = defineEmits<{
  (e: 'search', params: (number | string | SearchParam)[]): void
  (e: 'reset'): void
}>()

const handleSearch = () => {
  const searchParams: (number | string | SearchParam)[] = []
  
  if (searchText.value) {
    searchParams.push({
      key: 'templateName',
      value: searchText.value
    })
  }

  // Thêm trực tiếp templateTypeID vào mảng
  if (filters.templateType?.length > 0) {
    filters.templateType.forEach(typeId => {
      searchParams.push(typeId)
    })
  }

  // Thêm trực tiếp templateCategoryID vào mảng
  if (filters.templateCategory?.length > 0) {
    filters.templateCategory.forEach(categoryId => {
      searchParams.push(categoryId)
    })
  }

  emit('search', searchParams)
}

const handleReset = () => {
  searchText.value = ''
  filters.templateType = []
  filters.templateCategory = []
  emit('reset')
}

const fetchTemplateTypes = async () => {
  try {
    const response = await api.get('/membership/mail/template-types')
    if (response.data.result === 'Success') {
      templateTypes.value = response.data.data.filter((type: TemplateType) => type.enabled)
    }
  } catch (error) {
    console.error('Error fetching template types:', error)
    message.error('Không thể tải danh sách loại template')
    if ((error as AxiosError)?.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
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
    message.error('Không thể tải danh sách danh mục')
    if ((error as AxiosError)?.response?.status === 401) {
      authStore.logout()
      router.push('/login')
    }
  }
}

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await Promise.all([
      fetchTemplateTypes(),
      fetchTemplateCategories()
    ])
  }
})
</script> 