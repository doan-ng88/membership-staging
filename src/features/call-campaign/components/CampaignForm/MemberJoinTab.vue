<template>
  <div class="member-join-tab">
    <a-form layout="vertical" :model="filterForm">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-form-item label="Ngày tham gia">
            <a-date-picker v-model:value="filterForm.joinDate" style="width: 100%" />
          </a-form-item>
        </a-col>
        <!-- Other filter fields -->
      </a-row>
    </a-form>

    <a-table
      :columns="columns"
      :data-source="members"
      :row-selection="rowSelection"
      size="small"
    />
  </div>
</template>

<script setup lang="ts">
// ... Component logic
</script> 