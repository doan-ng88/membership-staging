<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div
      v-for="template in templates"
      :key="template.mailTemplateID"
      class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div class="aspect-w-16 aspect-h-9 bg-gray-100">
        <img
          :src="`${baseUrl}/api/membership/mail/preview_${template.templateName}.html.jpg`"
          :alt="template.templateName"
          class="object-cover w-full h-full"
          @error="handleImageError"
        />
      </div>
      <div class="p-4">
        <h3 class="font-medium mb-2">{{ template.templateName }}</h3>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">
            {{ formatDate(template.createTime) }}
          </span>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="edit" @click="$emit('edit', template)">
                  <edit-outlined /> Chỉnh sửa
                </a-menu-item>
                <a-menu-item key="duplicate" @click="$emit('duplicate', template)">
                  <copy-outlined /> Nhân bản
                </a-menu-item>
                <a-menu-item key="delete" @click="handleDelete(template)">
                  <delete-outlined /> Xóa
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
</template>

<script setup lang="ts">
import { EditOutlined, DeleteOutlined, CopyOutlined, MoreOutlined } from '@ant-design/icons-vue'
import { Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { MailTemplate } from '@/services/mailTemplateService'

const props = defineProps<{
  templates: MailTemplate[]
}>()

const emit = defineEmits(['edit', 'duplicate', 'delete'])

const baseUrl = import.meta.env.VITE_API_BASE_URL

const formatDate = (date: string) => {
  return dayjs(date).format('DD/MM/YYYY')
}

const handleDelete = (template: MailTemplate) => {
  Modal.confirm({
    title: 'Xác nhận xóa',
    content: `Bạn có chắc chắn muốn xóa template "${template.templateName}"?`,
    okText: 'Xóa',
    okType: 'danger',
    cancelText: 'Hủy',
    onOk: () => {
      emit('delete', template)
    }
  })
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/placeholder-image.jpg' // Thay thế bằng ảnh mặc định
}
</script> 