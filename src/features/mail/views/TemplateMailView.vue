<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">{{ t('templateMail.title') }}</h2>
        </template>
        <template #extra>
          <a-space>
            <a-button type="primary" @click="navigateToEditor">
              <template #icon>
                <plus-outlined />
              </template>
              {{ t('templateMail.buttons.create') }}
            </a-button>
          </a-space>
        </template>
      </PageHeader>

      <div class="bg-white rounded-lg shadow p-6">
        <TemplateFilters
          :template-types="templateTypes"
          :template-categories="templateCategories"
          @search="handleSearch"
        />

        <TemplateGrid
          :templates="templates"
          :loading="loading"
          @edit="handleEdit"
          @duplicate="handleDuplicate"
          @delete="handleDelete"
        />

        <div class="mt-6 flex justify-end">
          <a-pagination
            v-model:current="currentPage"
            :total="totalCount"
            :pageSize="pageSize"
            @change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- Send Mail Modal Component -->
    <!-- <SendMailModal
      v-model:open="showSendModal"
      :template="selectedTemplate"
      @success="handleSendSuccess"
      @cancel="handleSendCancel"
    /> -->
  </DefaultLayout>
</template>

<script setup lang="ts">
import DefaultLayout from '@/layouts/DefaultLayout.vue';
import PageHeader from '@/shared/components/PageHeader.vue';
import TemplateFilters from '../components/template/TemplateFilters.vue';
import TemplateGrid from '../components/template/TemplateGrid.vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { useI18n } from 'vue-i18n';
import { useMailTemplate } from '../composables/useMailTemplate';
import type { MailTemplate } from '../types/MailTemplate';

const { t } = useI18n();
const router = useRouter();
const {
  templates,
  templateTypes,
  templateCategories,
  loading,
  currentPage,
  pageSize,
  totalCount,
  fetchTemplates,
  fetchTemplateTypes,
  fetchTemplateCategories,
  duplicateTemplate,
  deleteTemplate
} = useMailTemplate();

const navigateToEditor = () => {
  router.push('/mail/editor');
};

const handleSearch = (searchParams: any) => {
  fetchTemplates(searchParams);
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  fetchTemplates();
};

const handleEdit = (template: MailTemplate) => {
  router.push({
    name: 'MailEditor',
    params: { id: template.mailTemplateID.toString() }
  });
};

const handleDuplicate = async (template: MailTemplate) => {
  try {
    await duplicateTemplate(template.mailTemplateID);
    message.success(t('templateMail.messages.duplicate.success'));
    fetchTemplates();
  } catch (error) {
    message.error(t('templateMail.messages.duplicate.error'));
  }
};

const handleDelete = async (template: MailTemplate) => {
  try {
    await deleteTemplate(template.mailTemplateID);
    message.success(t('templateMail.messages.delete.success'));
    fetchTemplates();
  } catch (error) {
    message.error(t('templateMail.messages.delete.error'));
  }
};

const showSendModal = ref(false);
const selectedTemplate = ref<MailTemplate | null>(null);

const handleSendMail = (template: MailTemplate) => {
  selectedTemplate.value = template;
  showSendModal.value = true;
};

const handleSendSuccess = () => {
  showSendModal.value = false;
  selectedTemplate.value = null;
  // Refresh list if needed
};

const handleSendCancel = () => {
  showSendModal.value = false;
  selectedTemplate.value = null;
};

onMounted(async () => {
  await Promise.all([
    fetchTemplateTypes(),
    fetchTemplateCategories()
  ]);
  fetchTemplates();
});
</script>
