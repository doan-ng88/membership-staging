
<template>
  <DefaultLayout>
    <div class="target-group mx-auto max-w-1200 px-4">
      <!-- <BreadcrumbDefault :pageTitle="pageTitle" /> -->
      <h1 class="text-2xl font-bold mb-6">Target Group Settings</h1>

      <!-- Group Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-700">Total Groups</h3>
          <p class="text-2xl font-bold text-blue-600">{{ totalGroups }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-700">Grouped Members</h3>
          <p class="text-2xl font-bold text-green-600">{{ groupedMembers }}</p>
        </div>
        <div class="bg-white p-4 rounded-lg shadow">
          <h3 class="text-lg font-semibold text-gray-700">Active Groups</h3>
          <p class="text-2xl font-bold text-purple-600">{{ activeGroups }}</p>
        </div>
      </div>

      <!-- Create New Group -->
      <div class="bg-white rounded-lg shadow mb-6">
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">Create New Group</h2>
          <form @submit.prevent="saveGroup">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Group Name</label>
                <input
                  v-model="newGroup.name"
                  type="text"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Enter group name"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  v-model="newGroup.description"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows="2"
                  placeholder="Group description"
                ></textarea>
              </div>

              <!-- Segment Combination -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Segment Combination</label>
                <div class="space-y-4">
                  <!-- Purchase Behavior -->
                  <div class="border rounded-lg p-4">
                    <h4 class="font-medium mb-2">Purchase Behavior</h4>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="newGroup.segments.purchase.frequent"
                          class="form-checkbox"
                        />
                        <span class="ml-2">Frequent Customers</span>
                      </label>
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="newGroup.segments.purchase.highSpender"
                          class="form-checkbox"
                        />
                        <span class="ml-2">High Spenders</span>
                      </label>
                    </div>
                  </div>

                  <!-- Interests -->
                  <div class="border rounded-lg p-4">
                    <h4 class="font-medium mb-2">Interests</h4>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="newGroup.segments.interest.organic"
                          class="form-checkbox"
                        />
                        <span class="ml-2">Organic Products</span>
                      </label>
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="newGroup.segments.interest.luxury"
                          class="form-checkbox"
                        />
                        <span class="ml-2">Luxury Products</span>
                      </label>
                    </div>
                  </div>

                  <!-- Visit Frequency -->
                  <div class="border rounded-lg p-4">
                    <h4 class="font-medium mb-2">Visit Frequency</h4>
                    <div class="space-y-2">
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="newGroup.segments.visit.frequent"
                          class="form-checkbox"
                        />
                        <span class="ml-2">Frequent Visits</span>
                      </label>
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="newGroup.segments.visit.engaged"
                          class="form-checkbox"
                        />
                        <span class="ml-2">Highly Engaged</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="submit"
                  class="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                  Save Group
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <!-- Group List -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h2 class="text-xl font-semibold mb-4">Manage Groups</h2>
          
          <!-- Filters -->
          <div class="mb-4 flex gap-4">
            <input
              v-model="searchQuery"
              type="text"
              class="border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Search groups..."
            />
            <select
              v-model="filterStatus"
              class="border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <!-- Groups Table -->
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Group Name
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member Count
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created Date
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="group in filteredGroups" :key="group.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                      <div>
                        <div class="text-sm font-medium text-gray-900">
                          {{ group.name }}
                        </div>
                        <div class="text-sm text-gray-500">
                          {{ group.description }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                          :class="getMemberCountClass(group.memberCount)">
                      {{ group.memberCount }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full"
                          :class="getStatusClass(group.status)">
                      {{ group.status === 'active' ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ group.createdAt }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      @click="editGroup(group)"
                      class="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      @click="deleteGroup(group.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
// import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

export default defineComponent({
  name: 'TargetGroupSettingView',
  components: {
    // BreadcrumbDefault,
    DefaultLayout
  },
  setup() {
    const pageTitle = ref('Target Group Settings')
    const totalGroups = ref(8)
    const groupedMembers = ref(1500)
    const activeGroups = ref(6)
    const searchQuery = ref('')
    const filterStatus = ref('all')

    const newGroup = reactive({
      name: '',
      description: '',
      segments: {
        purchase: {
          frequent: false,
          highSpender: false
        },
        interest: {
          organic: false,
          luxury: false
        },
        visit: {
          frequent: false,
          engaged: false
        }
      }
    })

    // Mock data for groups
    const groups = ref([
      {
        id: 1,
        name: 'VIP Customers',
        description: 'High-spending and frequent customers',
        memberCount: 250,
        status: 'active',
        createdAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Organic Lovers',
        description: 'Customers who prefer organic products',
        memberCount: 180,
        status: 'active',
        createdAt: '2024-02-01'
      }
    ])

    const filteredGroups = computed(() => {
      return groups.value.filter(group => {
        const matchesSearch = group.name.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesStatus = filterStatus.value === 'all' || group.status === filterStatus.value
        return matchesSearch && matchesStatus
      })
    })

    const saveGroup = () => {
      // TODO: Implement save logic
      message.success('Group saved successfully')
      // Reset form
      Object.assign(newGroup, {
        name: '',
        description: '',
        segments: {
          purchase: { frequent: false, highSpender: false },
          interest: { organic: false, luxury: false },
          visit: { frequent: false, engaged: false }
        }
      })
    }

    const editGroup = (group: any) => {
      // TODO: Implement edit logic
      console.log('Editing group:', group)
    }

    const deleteGroup = (id: number) => {
      // TODO: Implement delete logic
      message.success('Group deleted successfully')
    }

    const getMemberCountClass = (count: number) => {
      return count > 200 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
    }

    const getStatusClass = (status: string) => {
      return status === 'active' 
        ? 'bg-green-100 text-green-600'
        : 'bg-red-100 text-red-600'
    }

    return {
      pageTitle,
      totalGroups,
      groupedMembers,
      activeGroups,
      newGroup,
      groups,
      searchQuery,
      filterStatus,
      filteredGroups,
      saveGroup,
      editGroup,
      deleteGroup,
      getMemberCountClass,
      getStatusClass
    }
  }
})
</script>

<style scoped>
.target-group {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.target-group h1 {
  text-align: center;
}
</style>
