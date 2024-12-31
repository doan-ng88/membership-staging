<template>
  <div class="membership-tab">
    <div class="mb-4">
      <a-input-search
        v-model:value="searchText"
        placeholder="Search members..."
        @search="handleSearch"
      />
    </div>

    <a-table
      :columns="columns"
      :data-source="members"
      :row-selection="rowSelection"
      :loading="loading"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.key === 'level'">
          <a-tag :color="getLevelColor(text)">{{ text }}</a-tag>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TableColumnsType } from 'ant-design-vue'
import { membershipAPI } from '@/api/services/membershipApi'

const emit = defineEmits<{
  (e: 'select', members: any[]): void
}>()

const searchText = ref('')
const loading = ref(false)
const members = ref([])
const selectedRowKeys = ref<string[]>([])

const columns: TableColumnsType = [
  {
    title: 'Name',
    dataIndex: 'fullName',
    key: 'fullName',
  },
  {
    title: 'Phone',
    dataIndex: 'mainPhoneNumber',
    key: 'phone',
  },
  {
    title: 'Level',
    dataIndex: 'levelName',
    key: 'level',
  }
]

const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (selectedKeys: string[]) => {
    selectedRowKeys.value = selectedKeys
    const selectedMembers = members.value.filter(
      member => selectedKeys.includes(member.membershipWebsiteId)
    )
    emit('select', selectedMembers)
  }
}

const getLevelColor = (level: string) => {
  const colors: Record<string, string> = {
    'Gold': 'gold',
    'Silver': 'silver',
    'Bronze': 'orange',
    'Normal': 'blue'
  }
  return colors[level] || 'default'
}

const fetchMembers = async () => {
  loading.value = true
  try {
    const response = await membershipAPI.getList(
      'MembershipsWebsitesId',
      'ASC',
      100,
      1,
      searchText.value ? [{ key: 'fullName', value: searchText.value }] : []
    )
    members.value = response.data.data
  } catch (error) {
    console.error('Error fetching members:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchMembers()
}

// Initial fetch
fetchMembers()
</script> 