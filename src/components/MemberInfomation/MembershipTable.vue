<!-- Generated by Cursor -->
<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-lg font-semibold">Membership Data</h2>
      <div class="flex items-center space-x-4">
        <input 
          type="text" 
          v-model="searchTerm"
          class="w-1/3 p-2 border rounded-lg" 
          placeholder="Search Customer Name..."
        >
        <button 
          @click="handleExport"
          class="bg-green-600 text-white py-2 px-4 rounded-lg"
        >
          Export Excel
        </button>
      </div>
    </div>
    <table class="w-full border-collapse border border-gray-300">
      <thead class="bg-gray-100">
        <tr>
          <th class="border border-gray-300 p-2">Customer Name</th>
          <th class="border border-gray-300 p-2">Phone Number</th>
          <th class="border border-gray-300 p-2">
            {{ tab === 'date-join-member' ? 'Date Join Member' : 'Birthday' }}
          </th>
          <th class="border border-gray-300 p-2">Platform Website</th>
          <template v-if="tab === 'date-join-member'">
            <th class="border border-gray-300 p-2">Order Point</th>
            <!-- <th class="border border-gray-300 p-2">Level Up Condition</th> -->
          </template>
          <th class="border border-gray-300 p-2">Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="member in filteredMembers" :key="member.membershipId">
          <td class="border border-gray-300 p-2">{{ member.fullName }}</td>
          <td class="border border-gray-300 p-2">{{ member.mainPhoneNumber }}</td>
          <td class="border border-gray-300 p-2">
            {{ formatDate(tab === 'date-join-member' ? member.registeredTime : member.birthday) }}
          </td>
          <td class="border border-gray-300 p-2">{{ getWebsiteName(member.websiteId) }}</td>
          <template v-if="tab === 'date-join-member'">
            <td class="border border-gray-300 p-2">{{ member.points }}</td>
            <!-- <td class="border border-gray-300 p-2">{{ formatDate(member.levelUpdateTime) }}</td> -->
          </template>
          <td class="border border-gray-300 p-2">
            <div class="flex gap-2">
              <button @click="handleView(member)" class="bg-blue-600 text-white py-1 px-2 rounded-lg">
                Edit
              </button>
              <button @click="handleHistory(member)" class="bg-green-600 text-white py-1 px-2 rounded-lg">
                History
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Enhanced Member Details Modal -->
    <div v-if="selectedMember && activeModal === 'details'" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl w-[800px] max-h-[90vh] overflow-hidden relative animate-modal-enter">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Customer Details</h2>
          <button 
            @click="closeModal"
            class="text-white/80 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="bg-gray-50 p-6 rounded-lg shadow-sm">
              <h3 class="font-semibold text-lg text-gray-800 mb-4 pb-2 border-b border-gray-200">
                Basic Information
              </h3>
              <div class="space-y-4">
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500">Full Name</span>
                  <span class="text-gray-800 font-medium">{{ selectedMember.fullName }}</span>
                </div>
                
                <!-- Editable Phone Number -->
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500">Phone Number</span>
                  <div class="flex items-center gap-2">
                    <input 
                      v-if="isEditing && editedMember"
                      v-model="editedMember.mainPhoneNumber"
                      type="text"
                      class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span v-else class="text-gray-800 font-medium">{{ selectedMember.mainPhoneNumber }}</span>
                    <button 
                      @click="toggleEdit"
                      class="text-blue-600 hover:text-blue-700"
                    >
                      <span v-if="isEditing">Save</span>
                      <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Editable Address -->
                <div class="flex flex-col">
                  <span class="text-sm text-gray-500">Address</span>
                  <div class="flex items-center gap-2">
                    <textarea 
                      v-if="isEditing && editedMember"
                      v-model="editedMember.defaultAddress"
                      class="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows="2"
                    ></textarea>
                    <span v-else class="text-gray-800 font-medium">{{ selectedMember.defaultAddress || 'N/A' }}</span>
                  </div>
                </div>
                <!-- <div class="flex flex-col">
                  <span class="text-sm text-gray-500">Platform Website</span>
                  <span class="text-gray-800 font-medium">{{ selectedMember.platformWebsite }}</span>
                </div> -->
              </div>
            </div>

            <!-- Date Information -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-semibold text-lg text-gray-800 mb-4 pb-2 border-b">
                {{ tab === 'date-join-member' ? 'Membership Information' : 'Birth Information' }}
              </h3>
              <div class="space-y-4">
                <template v-if="tab === 'date-join-member'">
                  <!-- <div class="flex flex-col">
                    <span class="text-sm text-gray-500">Join Date Range</span>
                    <span class="text-gray-800 font-medium">
                      {{ formatDateRange(selectedMember.startDate || '', selectedMember.endDate || '') }}
                    </span>
                  </div> -->
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-500">Order Point</span>
                    <span class="text-gray-800 font-medium">{{ selectedMember.totalOrder }}</span>
                  </div>
                  <!-- <div class="flex flex-col">
                    <span class="text-sm text-gray-500">Member Downgrade Month</span>
                    <span class="text-gray-800 font-medium">{{ formatMonth(selectedMember.memberDowngradeMonth || '') }}</span>
                  </div> -->
                </template>
                <template v-else>
                  <div class="flex flex-col">
                    <span class="text-sm text-gray-500">Date of Birth</span>
                    <span class="text-gray-800 font-medium">{{ formatMonth(selectedMember.birthday || '') }}</span>
                  </div>
                </template>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
          <button 
            v-if="isEditing"
            @click="cancelEdit"
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            v-if="isEditing"
            @click="saveChanges"
            class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Save Changes
          </button>
          <button 
            v-else
            @click="closeModal"
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- History Modal -->
    <div v-if="selectedMember && activeModal === 'history'" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-2xl w-[900px] max-h-[90vh] overflow-hidden relative animate-modal-enter">
        <!-- Modal Header -->
        <div class="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
          <h2 class="text-xl font-bold text-white">Customer History</h2>
          <button 
            @click="closeModal"
            class="text-white/80 hover:text-white transition-colors"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Modal Content -->
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div class="space-y-6">
            <!-- Purchase History -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-semibold text-lg text-gray-800 mb-4">Purchase History</h3>
              <div class="overflow-x-auto">
                <!-- <table class="w-full border-collapse border border-gray-300">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border p-2">Date</th>
                      <th class="border p-2">Order ID</th>
                      <th class="border p-2">Products</th>
                      <th class="border p-2">Total Amount</th>
                      <th class="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="purchase in selectedMember?.purchaseHistory" :key="purchase.orderId">
                      <td class="border p-2">{{ formatDate(purchase.date || '') }}</td>
                      <td class="border p-2">{{ purchase.orderId }}</td>
                      <td class="border p-2">
                        <div v-for="product in purchase.products" :key="product.id" class="mb-1">
                          {{ product.name }} (x{{ product.quantity }})
                        </div>
                      </td>
                      <td class="border p-2">${{ purchase.totalAmount }}</td>
                      <td class="border p-2">
                        <span :class="getStatusClass(purchase.status)">
                          {{ purchase.status }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table> -->
              </div>
            </div>

            <!-- Point History -->
            <div class="bg-gray-50 p-6 rounded-lg">
              <h3 class="font-semibold text-lg text-gray-800 mb-4">Point History</h3>
              <div class="overflow-x-auto">
                <!-- <table class="w-full border-collapse border border-gray-300">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="border p-2">Date</th>
                      <th class="border p-2">Transaction Type</th>
                      <th class="border p-2">Points</th>
                      <th class="border p-2">Description</th>
                      <th class="border p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="point in selectedMember?.pointHistory" :key="point.id">
                      <td class="border p-2">{{ formatDate(point.date) }}</td>
                      <td class="border p-2">{{ point.type }}</td>
                      <td class="border p-2" :class="point.points > 0 ? 'text-green-600' : 'text-red-600'">
                        {{ point.points > 0 ? '+' : '' }}{{ point.points }}
                      </td>
                      <td class="border p-2">{{ point.description }}</td>
                      <td class="border p-2">{{ point.balance }}</td>
                    </tr>
                  </tbody>
                </table> -->
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t flex justify-end">
          <button 
            @click="closeModal"
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Thêm phân trang -->
    <div class="mt-4 flex justify-between items-center">
      <div>
        Showing {{ (currentPage - 1) * pageSize + 1 }} to {{ Math.min(currentPage * pageSize, totalCount) }} of {{ totalCount }} entries
      </div>
      <div class="flex gap-2">
        <button 
          @click="changePage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <button 
          @click="changePage(currentPage + 1)"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1 border rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import type { TabType, Member, FilterParams, ModalType } from '@/types/profile'
import { formatDate } from '@/utils/date'
import { websites } from '@/api/types/website'

export default defineComponent({
  name: 'MembershipTable',

  props: {
    tab: { type: String as () => TabType, required: true },
    members: { type: Array as () => Member[], required: true },
    filters: { type: Object as () => FilterParams, default: () => ({}) },
    currentPage: { type: Number, required: true },
    totalCount: { type: Number, required: true },
    pageSize: { type: Number, required: true }
  },

  emits: ['view', 'page-change'],

  setup(props, { emit }) {
    const searchTerm = ref('')
    const activeModal = ref<ModalType>(null)
    const selectedMember = ref<Member | null>(null)
    const isEditing = ref(false)
    const editedMember = ref<Member | null>(null)

    const totalPages = computed(() => Math.ceil(props.totalCount / props.pageSize))

    const tableHeaders = computed(() => {
      const baseHeaders = ['Customer Name', 'Phone Number']
      const dateHeader = props.tab === 'date-join-member' ? 'Date Join Member' : 'Select Month'
      const platformHeader = ['Platform Website']
      const additionalHeaders = props.tab === 'date-join-member' 
        ? ['Order Point', 'Level Up Condition', 'Member Downgrade Month']
        : []
      
      return [...baseHeaders, dateHeader, ...platformHeader, ...additionalHeaders, 'Options']
    })

    const displayMemberDetails = computed(() => {
      if (!selectedMember.value) return {}
      
      if (props.tab === 'date-of-birth') {
        const { points, level, totalOrder, ...details } = selectedMember.value
        return details
      }
      return selectedMember.value
    })

    const formatMonth = (date: string) => {
      return new Date(date).toLocaleString('default', { month: 'long' })
    }

    const formatDateRange = (startDate: string, endDate: string) => {
      return `${startDate} - ${endDate}`
    }

    const formatLabel = (key: string) => {
      return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }

    const filteredMembers = computed(() => {
      let result = [...props.members]

      // Apply filters
      if (props.filters.date) {
        result = result.filter(member => 
          props.tab === 'date-join-member' 
            ? member.registeredTime === props.filters.date
            : member.birthday === props.filters.date
        )
      }
      // ... apply other filters

      // Apply search
      if (searchTerm.value) {
        result = result.filter(member => 
          member.fullName.toLowerCase().includes(searchTerm.value.toLowerCase())
        )
      }

      return result
    })

    const handleView = (member: Member) => {
      selectedMember.value = member
      activeModal.value = 'details'
      emit('view', member)
    }

    const handleExport = () => {
      // Implement export logic
      console.log('Exporting data...')
    }

    const toggleEdit = () => {
      isEditing.value = true
      editedMember.value = selectedMember.value ? { ...selectedMember.value } as Member : null
    }

    const cancelEdit = () => {
      isEditing.value = false
      editedMember.value = selectedMember.value ? { ...selectedMember.value } as Member : null
    }

    const saveChanges = () => {
      // Implement save changes logic
      console.log('Saving changes...')
      isEditing.value = false
    }

    const closeModal = () => {
      selectedMember.value = null
      activeModal.value = null
    }

    const handleHistory = (member: Member) => {
      selectedMember.value = member
      activeModal.value = 'history'
    }

    const getWebsiteName = (websiteId: number) => {
      const website = websites.find(w => w.websiteId === websiteId)
      return website?.name || 'Unknown'
    }

    const changePage = (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        emit('page-change', page)
      }
    }

    return {
      searchTerm,
      tableHeaders,
      filteredMembers,
      selectedMember,
      activeModal,
      displayMemberDetails,
      formatMonth,
      handleView,
      handleExport,
      formatDate,
      formatDateRange,
      formatLabel,
      isEditing,
      editedMember,
      toggleEdit,
      cancelEdit,
      saveChanges,
      closeModal,
      handleHistory,
      getWebsiteName,
      totalPages,
      changePage,
    }
  }
})
</script>
