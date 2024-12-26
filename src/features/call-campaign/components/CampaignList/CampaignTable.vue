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
      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} campaigns`,
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
        <!-- {{ record.websiteName }} -->
        {{ getWebsiteName(record.websiteId) }}
      </template>
    </template>
  </a-table>

</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
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

const columns: TableColumnsType = [
  {
    title: 'Campaign Name',
    dataIndex: 'name',
    key: 'name',
    width: '25%',
  },
  {
    title: 'Website',
    dataIndex: 'websiteId',
    slots: { customRender: 'websiteName' },
    width: 120,
  },
  {
    title: 'Start Time',
    dataIndex: 'startDate',
    key: 'startDate',
    width: '20%',
  },
  {
    title: 'End Time',
    dataIndex: 'endDate',
    key: 'endDate',
    width: '20%',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: '10%',
  },
  {
    title: 'Actions',
    key: 'action',
    width: '10%',
  },
];

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
    'active': 'green',
    'inactive': 'red',
    'pending': 'orange',
    'completed': 'blue',
    'created': 'geekblue',
    'in progress': 'gold',
    // Thêm màu sắc cho các trạng thái khác nếu cần
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