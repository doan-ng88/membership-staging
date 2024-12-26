<template>
  <DefaultLayout>
    <div class="p-6">
      <h1 class="text-2xl font-bold text-center mb-8">Profile Management</h1>
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

<script lang="ts">
import { defineComponent, ref, reactive, onMounted } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import type { TabType, FilterParams, Member } from '@/types/profile'
import ProfileTabs from '@/components/MemberInfomation/ProfileTabs.vue'
import SearchFilters from '@/components/MemberInfomation/SearchFilters.vue'
import MembershipTable from '@/components/MemberInfomation/MembershipTable.vue'
import { membershipAPI } from '@/api/services/membershipApi'
import { message } from 'ant-design-vue'

interface PaginationParams {
  pageIndex: number
  pageSize: number
  searchParams?: Array<{ key: string; value: string | number }>
}

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
    const pageSize = ref(10)
    const totalCount = ref(0)
    const members = ref<Member[]>([])
    const loading = ref(false)

    const currentFilters = reactive<FilterParams>({
      registeredTimeFrom: undefined,
      registeredTimeTo: undefined
    })

    const handleFilter = (filters: FilterParams) => {
      Object.assign(currentFilters, filters)

      const searchParams = []
      
      if (filters.registeredTimeFrom) {
        searchParams.push({
          key: 'registeredTimeFrom',
          value: filters.registeredTimeFrom
        })
      }

      if (filters.registeredTimeTo) {
        searchParams.push({
          key: 'registeredTimeTo',
          value: filters.registeredTimeTo
        })
      }

      fetchMembers({
        pageIndex: 1,
        pageSize: pageSize.value,
        searchParams
      })
    }

    const handleReset = () => {
      Object.keys(currentFilters).forEach(key => {
        currentFilters[key as keyof FilterParams] = undefined
      })

      fetchMembers({
        pageIndex: 1,
        pageSize: pageSize.value,
        searchParams: []
      })
    }

    const handleViewMember = (member: Member) => {
      console.log('Viewing member:', member)
      // Implement view logic
    }

    const handlePageChange = (params: PaginationParams) => {
      fetchMembers({
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        searchParams: []
      })
    }

    const handleSizeChange = (params: PaginationParams) => {
      fetchMembers({
        pageIndex: params.pageIndex,
        pageSize: params.pageSize,
        searchParams: []
      })
    }

    const fetchMembers = async (params: PaginationParams) => {
      try {
        loading.value = true
        
        const searchParams = []
        
        if (currentFilters.registeredTimeFrom) {
          searchParams.push({
            key: 'registeredTimeFrom',
            value: currentFilters.registeredTimeFrom
          })
        }

        if (currentFilters.registeredTimeTo) {
          searchParams.push({
            key: 'registeredTimeTo',
            value: currentFilters.registeredTimeTo
          })
        }

        const response = await membershipAPI.getList(
          'MembershipsWebsitesId',
          'ASC',
          params.pageSize,
          params.pageIndex,
          searchParams
        )

        if (response) {
          members.value = response.data || []
          totalCount.value = response.totalCount || 0
          currentPage.value = response.pageIndex || 1
          pageSize.value = response.pageSize || 10
        }
      } catch (error) {
        console.error('Error fetching members:', error)
        message.error('Không thể tải danh sách thành viên')
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      handlePageChange({ 
        pageIndex: 1, 
        pageSize: 10,
        searchParams: []
      })
    })

    return {
      activeTab,
      members,
      currentFilters,
      currentPage,
      pageSize,
      totalCount,
      handleFilter,
      handleReset,
      handleViewMember,
      handlePageChange,
      handleSizeChange
    }
  }
})
</script>
<!-- API 
Get list Membership: {{base_url}}/api/membership/get/get-membership-list
Get info membership với user_id: {{base_url}}/api/membership/get/member-information-detail?user_id=99
Update membership: {{base_url}}/api/membership/update/membership
Address Membership: {{base_url}}/api/membership/update/address -->


<!-- 
XEM LẠI CODE NÀY ĐỂ CẬP NHẬT CHỨC NĂNG FILTER PLATFORM WEBSITE
<template>
  <div>
    <SearchFilters 
      :tab="currentTab"
      @filter="handleFilterChange"
      @reset="handleReset"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { SearchFilters } from '@/components'
import { membershipAPI } from '@/api/services/membershipApi'

const currentTab = ref<'date-join-member' | 'date-of-birth'>('date-join-member')

const handleFilterChange = async (filterPayload: any) => {
  console.log('Filter payload:', filterPayload)
  try {
    const response = await membershipAPI.getMembers(filterPayload)
  } catch (error) {
    console.error('Error:', error)
  }
}

const handleReset = () => {
}
</script> 

================================================
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { websites, type Website } from '@/api/types/website'
import type { TabType } from '@/types/profile'
import { membershipAPI } from '@/api/services/membershipApi'
import dayjs from 'dayjs'

// Props & Emits
defineProps<{
  tab: TabType
}>()

const emit = defineEmits<{
  (e: 'filter', params: any): void
  (e: 'reset'): void
}>()

// State
const filters = ref({
  websiteId: '',
  levelId: '',
  memberDowngradeMonth: undefined,
  birthMonth: undefined
})

const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs] | null>(null)
const memberLevels = ref<any[]>([])
const loading = ref(false)

// Months data
const months = ref(Array.from({ length: 12 }, (_, i) => ({
  value: i + 1,
  label: new Date(2000, i, 1).toLocaleString('default', { month: 'long' })
})))

// Methods
const handleWebsiteChange = (websiteId: number | '') => {
  filters.value.levelId = ''
  filters.value.websiteId = websiteId
  handleFilter()
}

const handleFilter = () => {
  const searchParams = []
  
  // Website filter
  if (filters.value.websiteId !== '') {
    searchParams.push({
      key: 'websiteId',
      value: filters.value.websiteId.toString()
    })
  }

  // Date range filter
  if (dateRange.value) {
    const [startDate, endDate] = dateRange.value
    if (startDate && endDate) {
      searchParams.push(
        {
          key: 'registeredTimeFrom',
          value: startDate.format('YYYY-MM-DD')
        },
        {
          key: 'registeredTimeTo',
          value: endDate.format('YYYY-MM-DD')
        }
      )
    }
  }

  // Level filter
  if (filters.value.levelId) {
    searchParams.push({
      key: 'levelId',
      value: filters.value.levelId.toString()
    })
  }

  // Member downgrade month filter
  if (filters.value.memberDowngradeMonth) {
    searchParams.push({
      key: 'memberDowngradeMonth',
      value: filters.value.memberDowngradeMonth.toString()
    })
  }

  console.log('Filter params:', searchParams)

  emit('filter', {
    sortField: 'MembershipsWebsitesId',
    sortType: 'ASC',
    pageSize: 10,
    pageIndex: 1,
    searchParams
  })
}

const handleReset = () => {
  filters.value = {
    websiteId: '',
    levelId: '',
    memberDowngradeMonth: undefined,
    birthMonth: undefined
  }
  dateRange.value = null
  emit('reset')
}

// Lifecycle hooks
onMounted(async () => {
  try {
    const response = await membershipAPI.getLevelInfo()
    if (response?.code === 200 && response?.data) {
      memberLevels.value = response.data
    }
  } catch (error) {
    console.error('Error fetching member levels:', error)
  }
})

defineExpose({
  filters,
  websites,
  memberLevels,
  months,
  dateRange,
  handleWebsiteChange,
  handleFilter,
  handleReset
})
</script>


CỦA FILE SEARCH FILTERS
<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <template v-if="tab === 'date-join-member'">
      </template>

      <div>
        <label class="block text-gray-700 mb-2">Platform Website</label>
        <a-select
          v-model:value="filters.websiteId"
          style="width: 100%"
          placeholder="Select Platform"
          allow-clear
          @change="handleWebsiteChange"
        >
          <a-select-option value="">All Platforms</a-select-option>
          <a-select-option 
            v-for="website in websites" 
            :key="website.websiteId" 
            :value="website.websiteId"
          >
            {{ website.name }}
          </a-select-option>
        </a-select>
      </div>

      <template v-if="tab === 'date-join-member'">
      </template>

      <template v-if="tab === 'date-join-member'">
      </template>
    </div>

    <div class="flex justify-end gap-4 mt-4">
      <button 
        @click="handleFilter"
        class="bg-blue-600 text-white py-2 px-4 rounded-lg"
      >
        Filter
      </button>
      <button 
        @click="handleReset"
        class="bg-gray-500 text-white py-2 px-4 rounded-lg"
      >
        Reset
      </button>
    </div>
  </div>
</template>
-->