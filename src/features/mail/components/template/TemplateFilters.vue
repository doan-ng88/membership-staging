<!-- src/features/mail/components/template/TemplateFilters.vue -->
<template>
    <div class="mb-6 flex gap-4">
      <a-input-search
        v-model:value="searchText"
        placeholder="Tìm kiếm template"
        style="width: 300px"
        @search="handleSearch"
      />
      
      <a-select
        v-model:value="selectedTypes"
        mode="multiple"
        style="width: 250px"
        placeholder="Loại template"
        :options="templateTypeOptions"
        @change="handleSearch"
      >
        <template #maxTagPlaceholder="{ omittedValues }">
          <span>+{{ omittedValues.length }} loại</span>
        </template>
      </a-select>
  
      <a-select
        v-model:value="selectedCategories" 
        mode="multiple"
        style="width: 250px"
        placeholder="Danh mục"
        :options="templateCategoryOptions"
        @change="handleSearch"
      >
        <template #maxTagPlaceholder="{ omittedValues }">
          <span>+{{ omittedValues.length }} danh mục</span>
        </template>
      </a-select>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import type { TemplateType, TemplateCategory } from '../../types/MailTemplate';
  
  const props = defineProps<{
    templateTypes: TemplateType[]
    templateCategories: TemplateCategory[]
  }>();
  
  const emit = defineEmits<{
    (e: 'search', params: any): void
  }>();
  
  const searchText = ref('');
  const selectedTypes = ref<number[]>([]);
  const selectedCategories = ref<number[]>([]);
  
  const templateTypeOptions = computed(() => 
    props.templateTypes.map(type => ({
      label: type.templateTypeName,
      value: type.templateTypeID
    }))
  );
  
  const templateCategoryOptions = computed(() => 
    props.templateCategories.map(category => ({
      label: category.templateCategoryName,
      value: category.templateCategoryID
    }))
  );
  
  const handleSearch = () => {
    const searchParams = [];
    
    if (searchText.value) {
      searchParams.push({
        key: 'templateName',
        value: searchText.value
      });
    }
  
    selectedTypes.value.forEach(typeId => {
      searchParams.push({
        key: 'templateTypeID',
        value: typeId.toString()
      });
    });
  
    selectedCategories.value.forEach(categoryId => {
      searchParams.push({
        key: 'templateCategoryID',
        value: categoryId.toString()
      });
    });
  
    emit('search', searchParams);
  };
  </script>