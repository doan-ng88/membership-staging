<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Date Range Picker với giá trị mặc định -->
      <div>
        <label class="block text-gray-700">Order Date Range</label>
        <a-range-picker
          v-model:value="dateRange"
          format="YYYY-MM-DD"
          :placeholder="['Start date', 'End date']"
          style="width: 100%"
          :disabled-date="disabledDate"
          @change="onDateRangeChange"
        />
      </div>

      <!-- Member Website ID với giá trị mặc định -->
      <div>
        <label class="block text-gray-700">Member Website ID</label>
        <input
          v-model="filters.memberWebId"
          type="number"
          class="w-full p-2 border rounded-lg"
          placeholder="Enter Member Website ID"
        />
      </div>
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

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dayjs from 'dayjs'

// Khởi tạo giá trị mặc định
const dateRange = ref<[dayjs.Dayjs, dayjs.Dayjs]>([
  dayjs().subtract(1, 'month'), // 1 tháng trước
  dayjs() // Hiện tại
])

const filters = ref({
  memberWebId: '281'
})

const emit = defineEmits<{
  (e: 'filter', params: any): void
  (e: 'reset'): void
}>()

// Emit filter ngay khi component được mount
onMounted(() => {
  handleFilter()
})

const onDateRangeChange = (dates: [dayjs.Dayjs, dayjs.Dayjs] | null) => {
  dateRange.value = dates
}

const handleFilter = () => {
  const urlParams = new URLSearchParams()
  
  // Date range luôn có giá trị mặc định
  const [startDate, endDate] = dateRange.value
  urlParams.append('_start_date', startDate.format('YYYY-MM-DD'))
  urlParams.append('_end_date', endDate.format('YYYY-MM-DD'))
  
  // Member Web ID có giá trị mặc định
  urlParams.append('_member_web_id', filters.value.memberWebId)

  emit('filter', Object.fromEntries(urlParams))
}

const handleReset = () => {
  // Reset về giá trị mặc định thay vì null
  dateRange.value = [dayjs().subtract(1, 'month'), dayjs()]
  filters.value.memberWebId = '281'
  handleFilter() // Gọi filter với giá trị mặc định
}

const disabledDate = (current: dayjs.Dayjs) => {
  return current && current > dayjs().endOf('day')
}
</script> 