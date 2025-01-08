<template>
  <a-table
    :columns="columns"
    :data-source="campaigns"
    :loading="loading"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <a-space>
          <a-button type="link" @click="handleEdit(record)">
            <edit-outlined />
          </a-button>
          <a-button type="link" danger @click="handleDelete(record)">
            <delete-outlined />
          </a-button>
        </a-space>
      </template>
      <template v-else-if="column.key === 'status'">
        <a-tag :color="getStatusColor(record.status)">
          {{ record.status }}
        </a-tag>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { getWebsiteName } from '@/api/types/website';
import { useI18nGlobal } from '@/i18n';

const { t } = useI18nGlobal();

const columns = computed<TableColumnsType>(() => [
  {
    title: t('mailCampaign.table.columns.name'),
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: t('mailCampaign.table.columns.website'),
    dataIndex: 'website',
    key: 'website',
    width: 120,
  },
  // ... other columns
]);
</script> 