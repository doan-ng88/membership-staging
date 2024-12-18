
<template>
  <DefaultLayout>
    <div class="issue-conditions mx-auto max-w-800 px-4">
      <!-- <BreadcrumbDefault :pageTitle="pageTitle" /> -->
      <h1 class="text-2xl font-bold mb-6">Điều Kiện Phát Hành Mã Giảm Giá</h1>
      
      <form @submit.prevent="saveSettings">
        <!-- Điều kiện tự động phát hành -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Tự Động Phát Hành</h2>
          <div class="space-y-4">
            <div>
              <label class="inline-flex items-center">
                <input 
                  type="checkbox" 
                  v-model="autoIssue.enabled" 
                  class="form-checkbox"
                />
                <span class="ml-2">Kích hoạt tự động phát hành</span>
              </label>
            </div>
            
            <div v-if="autoIssue.enabled" class="ml-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Điều kiện đơn hàng</label>
                <input 
                  v-model="autoIssue.orderAmount"
                  type="number"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Giá trị đơn hàng tối thiểu"
                />
              </div>
              
              <div>
                <label class="block text-sm font-medium text-gray-700">Tần suất phát hành</label>
                <select
                  v-model="autoIssue.frequency"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="immediately">Ngay lập tức</option>
                  <option value="daily">Hàng ngày</option>
                  <option value="weekly">Hàng tuần</option>
                  <option value="monthly">Hàng tháng</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Phát hành thủ công -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Phát Hành Thủ Công</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Số lượng mã cần phát hành</label>
              <input 
                v-model="manualIssue.quantity"
                type="number"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Nhập số lượng mã"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Thời hạn sử dụng</label>
              <div class="flex space-x-4">
                <input 
                  type="date"
                  v-model="manualIssue.startDate"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                <input 
                  type="date"
                  v-model="manualIssue.endDate"
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Giới hạn phát hành -->
        <div class="mb-8">
          <h2 class="text-xl font-semibold mb-4">Giới Hạn Phát Hành</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Tổng số mã tối đa</label>
              <input 
                v-model="issueLimits.maxTotal"
                type="number"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Nhập số lượng tối đa"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700">Giới hạn mỗi người dùng</label>
              <input 
                v-model="issueLimits.maxPerUser"
                type="number"
                class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Số mã tối đa mỗi người"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
        >
          Lưu Cài Đặt
        </button>
      </form>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref, reactive } from 'vue'
import { message } from 'ant-design-vue'
// import BreadcrumbDefault from '@/components/Breadcrumbs/BreadcrumbDefault.vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

export default defineComponent({
  name: 'IssueConditionsView',
  components: {
    // BreadcrumbDefault,
    DefaultLayout
  },
  setup() {
    const pageTitle = ref('Điều Kiện Phát Hành Mã Giảm Giá')
    
    const autoIssue = reactive({
      enabled: false,
      orderAmount: '',
      frequency: 'immediately'
    })

    const manualIssue = reactive({
      quantity: '',
      startDate: '',
      endDate: ''
    })

    const issueLimits = reactive({
      maxTotal: '',
      maxPerUser: ''
    })

    const saveSettings = () => {
      // TODO: Implement API call to save settings
      const settings = {
        autoIssue,
        manualIssue,
        issueLimits
      }
      
      console.log('Issue Conditions Settings Saved:', settings)
      message.success('Đã lưu cài đặt thành công')
    }

    return {
      pageTitle,
      autoIssue,
      manualIssue,
      issueLimits,
      saveSettings,
    }
  },
})
</script>

<style scoped>
.issue-conditions {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.issue-conditions h1 {
  text-align: center;
}
</style>
<!-- End all code generated by Cursor -->