<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">Chọn đối tượng gửi mail</h2>
        </template>
        <template #extra>
          <a-button @click="router.back()">
            Quay lại
          </a-button>
        </template>
      </PageHeader>

      <div class="bg-white dark:bg-dark-2 rounded-lg shadow p-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <!-- Campaign Option -->
          <div 
            class="border dark:border-dark-5 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-dark-2"
            @click="handleSelectOption('campaign')"
          >
            <div class="text-center mb-4">
              <TeamOutlined class="text-4xl text-blue-500" />
            </div>
            <h3 class="text-xl font-medium mb-2 text-center text-gray-900 dark:text-gray-100">
              Gửi theo Campaign
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-center">
              Chọn campaign có sẵn để gửi mail cho các thành viên trong campaign
            </p>
          </div>

          <!-- Membership Option -->
          <div 
            class="border dark:border-dark-5 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-dark-2"
            @click="handleSelectOption('membership')"
          >
            <div class="text-center mb-4">
              <UserOutlined class="text-4xl text-green-500" />
            </div>
            <h3 class="text-xl font-medium mb-2 text-center text-gray-900 dark:text-gray-100">
              Gửi theo Membership
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-center">
              Chọn các thành viên từ danh sách membership để gửi mail
            </p>
          </div>

          <!-- Excel Upload Option -->
          <div 
            class="border dark:border-dark-5 rounded-lg p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-dark-2"
            @click="handleSelectOption('excel')"
          >
            <div class="text-center mb-4">
              <FileExcelOutlined class="text-4xl text-green-600" />
            </div>
            <h3 class="text-xl font-medium mb-2 text-center text-gray-900 dark:text-gray-100">
              Upload Excel
            </h3>
            <p class="text-gray-500 dark:text-gray-400 text-center">
              Tải lên file Excel chứa danh sách email người nhận
            </p>
          </div>
        </div>

        <!-- Upload Modal -->
        <a-modal
          v-model:visible="showUploadModal"
          title="Upload File Excel"
          @ok="handleUpload"
          :confirmLoading="uploading"
        >
          <div class="p-4">
            <a-upload-dragger
              v-model:fileList="fileList"
              name="file"
              :multiple="false"
              :before-upload="beforeUpload"
              @drop="handleDrop"
            >
              <p class="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p class="ant-upload-text">Click hoặc kéo thả file vào đây</p>
              <p class="ant-upload-hint">
                Chỉ hỗ trợ file Excel (.xlsx, .xls)
              </p>
            </a-upload-dragger>
          </div>
        </a-modal>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import type { UploadProps } from 'ant-design-vue'
import {
  TeamOutlined,
  UserOutlined,
  FileExcelOutlined,
  InboxOutlined
} from '@ant-design/icons-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'

const router = useRouter()
const route = useRoute()
const templateId = route.params.id

// Upload states
const showUploadModal = ref(false)
const uploading = ref(false)
const fileList = ref<any[]>([])

const handleSelectOption = (option: 'campaign' | 'membership' | 'excel') => {
  switch (option) {
    case 'campaign':
      router.push(`/mail/send/${templateId}/campaign`)
      break
    case 'membership':
      router.push(`/mail/send/${templateId}/membership`)
      break
    case 'excel':
      showUploadModal.value = true
      break
  }
}

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('Chỉ hỗ trợ upload file Excel!')
    return false
  }
  return true
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
}

const handleUpload = async () => {
  if (fileList.value.length === 0) {
    message.error('Vui lòng chọn file Excel!')
    return
  }

  try {
    uploading.value = true
    // TODO: Implement file upload logic
    await new Promise(resolve => setTimeout(resolve, 1000)) // Mock upload
    message.success('Upload thành công!')
    showUploadModal.value = false
    router.push(`/mail/send/${templateId}/preview`)
  } catch (error) {
    message.error('Upload thất bại!')
  } finally {
    uploading.value = false
    fileList.value = []
  }
}
</script> 