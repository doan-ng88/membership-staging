<template>
  <a-table
    :columns="columns"
    :data-source="campaigns"
    :loading="loading"
    :pagination="{
      total: pagination.total,
      current: pagination.current,
      pageSize: pagination.pageSize,
      showSizeChanger: true,
      showQuickJumper: true,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total, range) => t('callCampaign.table.pagination.total', {
        start: range[0],
        end: range[1],
        total: total
      }),
    }"
    @change="handleTableChange"
    :row-key="(record) => record.id"
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'name'">
        <template v-if="props.enableNameClick">
          <a @click="handleNameClick(record)">{{ record.name }}</a>
        </template>
        <template v-else>
          {{ record.name }}
        </template>
      </template>
      <template v-else-if="column.key === 'action'">
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
        {{ getWebsiteName(record.websiteId) }}
      </template>
    </template>
  </a-table>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18nGlobal } from '@/i18n';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import type { Campaign } from '../../types/campaign.types';
import { getWebsiteName } from '@/api/types/website';
import { useRouter } from 'vue-router';

interface Props {
  campaigns: Campaign[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
  enableNameClick?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  enableNameClick: false
});

const emit = defineEmits<{
  (e: 'pageChange', page: number, pageSize: number): void;
  (e: 'edit', campaign: Campaign): void;
  (e: 'delete', campaign: Campaign): void;
}>();

const router = useRouter();

const selectedCampaign = ref<Campaign | null>(null);

const { t } = useI18nGlobal();

const columns = computed<TableColumnsType>(() => [
  {
    title: t('callCampaign.table.columns.name'),
    dataIndex: 'name',
    key: 'name',
    width: '25%',
    defaultSortOrder: 'descend',
    sorter: true
  },
  {
    title: t('callCampaign.table.columns.website'),
    dataIndex: 'websiteId',
    slots: { customRender: 'websiteName' },
    width: 120,
    
  },
  {
    title: t('callCampaign.table.columns.startTime'),
    dataIndex: 'startDate',
    key: 'startDate',
    width: '20%',
  },
  {
    title: t('callCampaign.table.columns.endTime'),
    dataIndex: 'endDate',
    key: 'endDate',
    width: '20%',
  },
  {
    title: t('callCampaign.table.columns.status'),
    dataIndex: 'status',
    key: 'status',
    width: '10%',
  },
  {
    title: t('callCampaign.table.columns.actions'),
    key: 'action',
    width: '10%',
  },
]);

const handleTableChange = (pagination: TablePaginationConfig) => {
  emit('pageChange', pagination.current || 1, pagination.pageSize || 10);
};

const handleEdit = (campaign: Campaign) => {
  emit('edit', campaign);
};

const handleDelete = (campaign: Campaign) => {
  emit('delete', campaign);
};

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    [t('callCampaign.table.status.active').toLowerCase()]: 'green',
    [t('callCampaign.table.status.inactive').toLowerCase()]: 'red',
    [t('callCampaign.table.status.pending').toLowerCase()]: 'orange',
    [t('callCampaign.table.status.completed').toLowerCase()]: 'blue',
    [t('callCampaign.table.status.created').toLowerCase()]: 'geekblue',
    [t('callCampaign.table.status.inProgress').toLowerCase()]: 'gold',
  };
  return statusColors[status.toLowerCase()] || 'default';
};

const handleNameClick = (campaign: Campaign) => {
  selectedCampaign.value = campaign;
  router.push(`/call-campaign/${campaign.id}`);
};

</script>

<style scoped>
.ant-table-wrapper {
  margin-top: 16px;
}

.ant-pagination {
  margin: 16px 0;
  text-align: right;
}

/* Add styles for clickable name */
a {
  color: #1890ff;
  cursor: pointer;
}

a:hover {
  text-decoration: underline;
}
</style>