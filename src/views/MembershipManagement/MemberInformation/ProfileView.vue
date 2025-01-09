<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold text-center mb-8">{{ t('profileManagement.title') }}</h1>
      <ProfileTabs v-model="activeTab" />
      <div class="mt-4">
        <SearchFilters :tab="activeTab" @filter="handleFilterChange" @reset="handleReset" />
        <MembershipTable 
          :tab="activeTab" 
          :members="members" 
          :filters="currentFilters"
          :current-page="currentPage"
          :total-count="totalCount"
          :page-size="pageSize"
          @view="handleViewMember"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { TabType, FilterParams, Member } from '@/types/profile'
import ProfileTabs from '@/components/MemberInfomation/ProfileTabs.vue'
import SearchFilters from '@/components/MemberInfomation/SearchFilters.vue'
import MembershipTable from '@/components/MemberInfomation/MembershipTable.vue'
import { membershipAPI } from '@/api/services/membershipApi'
import { message } from 'ant-design-vue'
import { useI18nGlobal } from '@/i18n'

const { t } = useI18nGlobal()

// State
const activeTab = ref<TabType>('date-join-member')
const currentPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)
const members = ref<Member[]>([])
const loading = ref(false)
const currentFilters = ref<Array<{key: string, value: any}>>([])

// Methods
const handleFilterChange = (searchParams: Array<{key: string, value: any}>) => {
  currentFilters.value = searchParams
  fetchMembers(1, pageSize.value, searchParams)
}

const handleReset = () => {
  currentFilters.value = []
  fetchMembers(1, pageSize.value, [])
}

const handleViewMember = (member: Member) => {
  console.log('Viewing member:', member)
  // Implement view logic
}

const handlePageChange = ({ pageIndex, pageSize }: { pageIndex: number, pageSize: number }) => {
  fetchMembers(pageIndex, pageSize, currentFilters.value)
}

const handleSizeChange = (newPageSize: number) => {
  fetchMembers(1, newPageSize, currentFilters.value)
}

const fetchMembers = async (
  pageIndex: number = 1, 
  pageSizeParam: number = 20, 
  searchParams: Array<{key: string, value: any}> = []
) => {
  try {
    loading.value = true
    console.log('pageIndex', pageIndex)
    const response = await membershipAPI.getList(
      'MembershipsWebsitesId',
      'DESC',
      pageSizeParam,
      pageIndex,
      searchParams || currentFilters.value
    )
    
    if (response) {
      console.log('response', response)
      const { data, totalCount: total, pageIndex: page, pageSize: limit } = response
      members.value = data
      totalCount.value = total
      currentPage.value = page
      pageSize.value = limit || pageSizeParam
    }
  } catch (error) {
    console.error('Error fetching members:', error)
    message.error('Không thể tải danh sách thành viên')
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  handlePageChange({ pageIndex: 1, pageSize: pageSize.value })
})

// No need for defineExpose as all template refs are automatically exposed in setup script
</script>
