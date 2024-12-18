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
      showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} chiến dịch`
    }"
    @change="handleTableChange"
  >
    <template #websiteName="{ record }">
      <a-tag>{{ getWebsiteName(record.websiteId) }}</a-tag>
    </template>

    <template #action="{ record }">
      <a-space>
        <a-tooltip title="Gửi mail">
          <a-button 
            type="primary"
            size="small"
            @click="handleSendMail(record)"
          >
            <template #icon>
              <MailOutlined />
            </template>
          </a-button>
        </a-tooltip>

        <a-tooltip title="Sửa">
          <a-button 
            type="link" 
            size="small"
            @click="$emit('edit', record)"
          >
            <EditOutlined />
          </a-button>
        </a-tooltip>

        <a-tooltip title="Xóa">
          <a-popconfirm
            title="Bạn có chắc chắn muốn xóa?"
            @confirm="$emit('delete', record)"
          >
            <a-button 
              type="link" 
              size="small"
              danger
            >
              <DeleteOutlined />
            </a-button>
          </a-popconfirm>
        </a-tooltip>
      </a-space>
    </template>
  </a-table>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
import { MailOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { MailCampaign } from '../../types/mail-campaign.types';
import { getWebsiteName } from '@/api/types/website';

console.log('Imported getWebsiteName:', getWebsiteName);

const props = defineProps<{
  campaigns: MailCampaign[];
  loading: boolean;
  pagination: {
    current: number;
    pageSize: number;
    total: number;
  };
}>();

const emit = defineEmits<{
  (e: 'change', pagination: TablePaginationConfig): void;
  (e: 'edit', campaign: MailCampaign): void;
  (e: 'delete', campaign: MailCampaign): void;
  (e: 'sendMail', campaign: MailCampaign): void;
}>();

const columns: TableColumnsType = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: 'Tên chiến dịch',
    dataIndex: 'name',
    width: 200,
  },
  {
    title: 'Website',
    dataIndex: 'websiteId',
    key: 'website',
    slots: { customRender: 'websiteName' },
    width: 120,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    width: 120,
  },
  {
    title: 'Ngày bắt đầu',
    dataIndex: 'startDate',
    width: 120,
  },
  {
    title: 'Ngày kết thúc',
    dataIndex: 'endDate',
    width: 120,
  },
  {
    title: 'Tổng số',
    dataIndex: 'total',
    width: 100,
  },
  {
    title: 'Còn lại',
    dataIndex: 'remaining',
    width: 100,
  },
  {
    title: 'Thao tác',
    key: 'action',
    fixed: 'right',
    width: 150,
    slots: { customRender: 'action' }
  }
];

const handleSendMail = (campaign: MailCampaign) => {
  emit('sendMail', campaign);
};

const handleTableChange = (pagination: TablePaginationConfig) => {
  emit('change', pagination);
};
</script>

<style scoped>
.ant-table-wrapper {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.ant-tag {
  min-width: 80px;
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}
</style> 