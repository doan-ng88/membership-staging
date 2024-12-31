<template>
  <div>
    <a-select
      v-model:value="selectedTemplate"
      placeholder="Select template"
      :loading="loading"
      @change="handleChange"
    >
      <a-select-option 
        v-for="template in templates" 
        :key="template.id" 
        :value="template.id"
      >
        {{ template.name }}
      </a-select-option>
    </a-select>

    <!-- Template Preview -->
    <div v-if="selectedTemplate" class="mt-4">
      <template-preview :template-id="selectedTemplate" />
    </div>
  </div>
</template>

<script setup lang="ts">
// ... component logic
</script> 