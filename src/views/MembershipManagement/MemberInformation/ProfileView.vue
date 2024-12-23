<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold text-center mb-8">Membership Management</h1>
      <ProfileTabs v-model="activeTab" />
      <div class="mt-4">
        <SearchFilters :tab="activeTab" @filter="handleFilter" @reset="handleReset" />
        <MembershipTable 
          :tab="activeTab" 
          :members="members" 
          :filters="currentFilters"
          :current-page="currentPage"
          :total-count="totalCount"
          :page-size="pageSize"
          @view="handleViewMember"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">

import { defineComponent, ref, reactive, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { TabType, FilterParams, Member } from '@/types/profile'
import ProfileTabs from '@/components/MemberInfomation/ProfileTabs.vue'
import SearchFilters from '@/components/MemberInfomation/SearchFilters.vue'
import MembershipTable from '@/components/MemberInfomation/MembershipTable.vue'
import { membershipAPI } from '@/api/services/membershipApi'

export default defineComponent({
  name: 'ProfileManagement',

  components: {
    DefaultLayout,
    ProfileTabs,
    SearchFilters,
    MembershipTable
  },

  setup() {
    const activeTab = ref<TabType>('date-join-member')
    const currentPage = ref(1)
    const pageSize = ref(20)
    const totalCount = ref(0)
    const members = ref<Member[]>([])
    const currentFilters = reactive<FilterParams>({})
    const loading = ref(false)

    const handleFilter = (filters: FilterParams) => {
      Object.assign(currentFilters, filters)
      fetchMembers(1)
    }

    const handleReset = () => {
      Object.keys(currentFilters).forEach(key => {
        currentFilters[key as keyof FilterParams] = undefined
      })
      fetchMembers(1)
    }

    const handleViewMember = (member: Member) => {
      console.log('Viewing member:', member)
      // Implement view logic
    }

    const handlePageChange = (page: number) => {
      fetchMembers(page)
    }

    const fetchMembers = async (page: number = 1) => {
      try {
        loading.value = true
        const searchParams = Object.entries(currentFilters || {})
          .filter(([_, value]) => value !== undefined)
          .reduce((acc, [key, value]) => [ ...acc, {[key]: value} ], [] as any[])

        const response = await membershipAPI.getList(
          'MembershipsWebsitesId',
          'ASC',
          pageSize.value,
          page,
          searchParams
        )
        console.log('response', response)
        const { data, totalCount, pageIndex } = response
        members.value = data
        totalCount.value = totalCount
        currentPage.value = pageIndex
      } catch (error) {
        console.error('Error fetching members:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      fetchMembers()
    })

    return {
      activeTab,
      members,
      currentFilters,
      handleFilter,
      handleReset,
      handleViewMember,
      currentPage,
      pageSize,
      totalCount,
      handlePageChange
    }
  }
})
</script>
<!-- API 
Get list Membership: {{base_url}}/api/membership/get/get-membership-list
Get info membership với user_id: {{base_url}}/api/membership/get/member-information-detail?user_id=99
Update membership: {{base_url}}/api/membership/update/membership
Address Membership: {{base_url}}/api/membership/update/address -->