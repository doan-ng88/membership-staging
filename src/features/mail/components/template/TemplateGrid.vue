<template>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    <div 
      v-for="template in templates" 
      :key="template.mailTemplateID"
      class="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div class="aspect-w-16 aspect-h-9 bg-gray-100">
        <div class="relative">
          <img 
            :src="getPreviewUrl(template.body)" 
            :alt="template.templateName"
            class="object-cover w-full h-full cursor-pointer hover:brightness-75 transition-all duration-300"
            @click="handleEdit(template)"
          />
          <div 
            @click="handleEdit(template)"
            class="absolute cursor-pointer bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/50 to-transparent"
          />
        </div>
      </div>

      <div class="p-4">
        <h3 class="font-medium mb-2 cursor-pointer" @click="handleEdit(template)">
          {{ template.templateName }}
        </h3>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">
            {{ formatDate(template.createTime) }}
          </span>
          <a-dropdown>
            <template #overlay>
              <a-menu>
                <a-menu-item key="edit" @click="handleEdit(template)">
                  <edit-outlined /> Chỉnh sửa
                </a-menu-item>
                <a-menu-item key="duplicate" @click="handleDuplicate(template)">
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
import { EditOutlined, DeleteOutlined, CopyOutlined, MoreOutlined } from '@ant-design/icons-vue';
import dayjs from 'dayjs';
import type { MailTemplate } from '../../types/MailTemplate';

const props = defineProps<{
  templates: MailTemplate[]
}>();

const emit = defineEmits<{
  (e: 'edit', template: MailTemplate): void
  (e: 'duplicate', template: MailTemplate): void
  (e: 'delete', template: MailTemplate): void
}>();

const formatDate = (date?: string) => {
  return date ? dayjs(date).format('DD/MM/YYYY') : '';
};

const getPreviewUrl = (body: string) => {
  const fileName = body.split('/').pop() || '';
  return `${import.meta.env.VITE_API_BASE_URL_TEMPLATE}/picture/preview_${fileName}.jpg`;
};

const handleEdit = (template: MailTemplate) => {
  emit('edit', template);
};

const handleDuplicate = (template: MailTemplate) => {
  emit('duplicate', template);
};

const handleDelete = (template: MailTemplate) => {
  emit('delete', template);
};
</script>
