<template>
  <a-table
    :columns="columns"
    :data-source="campaignsWithWebsite"
    :loading="loading"
    :pagination="{
      current: currentPage,
      pageSize: pageSize,
      total: total,
      onChange: onPageChange
    }"
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
      <template v-else-if="column.key === 'website'">
        <template v-if="record.memberships && record.memberships.length">
          <div v-for="websiteId in getUniqueWebsiteIds(record.memberships)" :key="websiteId">
            {{ getWebsiteName(websiteId) }}
          </div>
        </template>
        <template v-else>
          N/A
        </template>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType } from 'ant-design-vue';
import { websites } from '@/api/types/website';

interface Membership {
  websiteId: number;
  // other membership properties...
}

interface Campaign {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  memberships?: Membership[];
}

const props = defineProps<{
  campaigns: Campaign[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  total: number;
}>();

const emit = defineEmits<{
  (e: 'pageChange', page: number): void;
  (e: 'edit', campaign: Campaign): void;
  (e: 'delete', campaign: Campaign): void;
}>();

const getUniqueWebsiteIds = (memberships: Membership[]) => {
  return [...new Set(memberships.map(m => m.websiteId))];
};

const getWebsiteName = (websiteId: number) => {
  const website = websites.find(w => w.websiteId === websiteId);
  return website?.name || 'N/A';
};

const campaignsWithWebsite = computed(() => {
  return props.campaigns;
});

const columns: TableColumnsType = [
  {
    title: 'Campaign Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Website',
    key: 'website',
  },
  {
    title: 'Start Time',
    dataIndex: 'startDate',
    key: 'startDate',
  },
  {
    title: 'End Time',
    dataIndex: 'endDate',
    key: 'endDate',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Actions',
    key: 'action',
  }
];

const onPageChange = (page: number) => {
  emit('pageChange', page);
};

const handleEdit = (campaign: Campaign) => {
  emit('edit', campaign);
};

const handleDelete = (campaign: Campaign) => {
  emit('delete', campaign);
};

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'active': 'green',
    'inactive': 'red',
    'pending': 'orange',
    'completed': 'blue'
  };
  return statusColors[status.toLowerCase()] || 'default';
};
</script> 