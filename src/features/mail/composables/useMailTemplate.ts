import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { mailTemplateService, type MailTemplate, type TemplateType, type TemplateCategory } from '@/services/mailTemplateService';

export function useMailTemplate() {
  const templates = ref<MailTemplate[]>([]);
  const templateTypes = ref<TemplateType[]>([]);
  const templateCategories = ref<TemplateCategory[]>([]);
  const loading = ref(false);
  const currentPage = ref(1);
  const pageSize = ref(10);
  const totalCount = ref(0);

  const fetchTemplates = async (searchParams?: Array<{key: string, value: string}>) => {
    try {
      loading.value = true;
      const response = await mailTemplateService.getTemplates({
        pageIndex: currentPage.value,
        pageSize: pageSize.value,
        searchParams
      });
      
      if (response.result === 'Success') {
        templates.value = response.data;
        totalCount.value = response.totalCount;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.error('Không thể tải danh sách template');
    } finally {
      loading.value = false;
    }
  };

  const fetchTemplateTypes = async () => {
    try {
      const response = await mailTemplateService.getTemplateTypes();
      if (response.result === 'Success') {
        templateTypes.value = response.data.filter((type: TemplateType) => type.enabled);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching template types:', error);
      message.error('Không thể tải danh sách loại template');
    }
  };

  const fetchTemplateCategories = async () => {
    try {
      const response = await mailTemplateService.getTemplateCategories();
      if (response.result === 'Success') {
        templateCategories.value = response.data.filter(
          (category: TemplateCategory) => category.enabled
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error fetching template categories:', error);
      message.error('Không thể tải danh sách danh mục');
    }
  };

  const duplicateTemplate = async (id: number) => {
    try {
      const response = await mailTemplateService.duplicateTemplate(id);
      if (response.result !== 'Success') {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      console.error('Error duplicating template:', error);
      throw error;
    }
  };

  const deleteTemplate = async (id: number) => {
    try {
      const response = await mailTemplateService.deleteTemplate(id);
      if (response.result !== 'Success') {
        throw new Error(response.message);
      }
      return response.data;
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  };

  return {
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
  };
} 