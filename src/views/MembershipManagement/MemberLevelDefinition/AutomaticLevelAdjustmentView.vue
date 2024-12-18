<template>
  <DefaultLayout>
    <div class="flex-1 p-6">
      <h2 class="text-2xl font-bold mb-4">Automatic Level Adjustment</h2>

      <!-- Brand Selection -->
      <div class="mb-6">
        <label for="brandAdjustment" class="block text-gray-700 font-medium mb-2">
          Chọn Thương Hiệu:
        </label>
        <select v-model="selectedBrand" 
                id="brandAdjustment" 
                class="block w-1/3 bg-white border border-gray-300 rounded px-4 py-2">
          <option v-for="option in BRAND_OPTIONS" 
                  :key="option.value" 
                  :value="option.value">
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Tables -->
      <div class="bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <div class="flex items-center gap-6">
            <h3 class="text-xl font-semibold text-gray-800">
              Cài Đặt Tự Động Điều Chỉnh Hạng
            </h3>
            <div class="flex items-center gap-2">
              <label class="text-gray-600">Số Ngày:</label>
              <input 
                type="number" 
                v-model="daysBeforeAdjustment"
                class="w-24 border border-gray-300 rounded px-3 py-1"
                min="1"
              />
            </div>
          </div>
          <button 
            @click="saveSettings" 
            :disabled="isLoading"
            class="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 focus:outline-none disabled:bg-purple-300 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Đang lưu...
            </span>
            <span v-else>Save Settings</span>
          </button>
        </div>

        <AdjustmentTable 
          v-model:notifications="notificationSettings"
          @update:notifications="handleNotificationChange"
        />
      </div>
    </div>

    <!-- Success Popup -->
    <SuccessPopup
      :show="showSuccessPopup"
      title="Cập nhật thành công"
      message="Các cài đặt đã được lưu thành công!"
      @close="showSuccessPopup = false"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import AdjustmentTable from '@/components/AutoLevelAdjustment/AdjustmentTable.vue'
import SuccessPopup from '@/components/common/SuccessPopup.vue'
import { systemConfigApi } from '@/api/services/systemConfigApi'
import type { SystemConfig } from '@/types/automaticAdjustment'

// Định nghĩa BRAND_OPTIONS
const BRAND_OPTIONS = [
  { value: 'sky007', label: 'Sky007' },
  { value: 'bbia', label: 'Bbia' },
  { value: 'hince', label: 'Hince' },
  { value: 'mixsoon', label: 'Mixsoon' }
]

const selectedBrand = ref(BRAND_OPTIONS[0].value)
const daysBeforeAdjustment = ref(7)
const isLoading = ref(false)
const showSuccessPopup = ref(false)

const notificationSettings = ref({
  zaloSmsBefore: false,
  zaloSmsAfter: false,
  emailBefore: false,
  emailAfter: false
})

const handleNotificationChange = (newSettings: { zaloSmsBefore: boolean; zaloSmsAfter: boolean; emailBefore: boolean; emailAfter: boolean }) => {
  notificationSettings.value = newSettings
}

const saveSettings = async () => {
  try {
    isLoading.value = true

    const config: SystemConfig = {
      DateBeforeDowngrade: daysBeforeAdjustment.value,
      SendMailBeforeDowngrade: notificationSettings.value.emailBefore,
      SendMailAfterDowngrade: notificationSettings.value.emailAfter,
      SendZaloOABeforeDowngrade: notificationSettings.value.zaloSmsBefore,
      SendZaloOAAfterDowngrade: notificationSettings.value.zaloSmsAfter,
      Sky007ExpirationPointMonth: 0,
      BbiaExpirationPointMonth: 0,
      HinceExpirationPointMonth: 0,
      MixsoonExpirationPointMonth: 0,
      AccessTokenZalo: '',
      RefreshTokenZalo: '',
      ElasticEmailSender: '',
      ElasticEmailApi: ''
    }

    await systemConfigApi.updateConfig(config)
    showSuccessPopup.value = true
  } catch (error: any) {
    console.error('Error saving settings:', error)
    // Có thể thêm error popup ở đây nếu cần
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.alert-enter-active,
.alert-leave-active {
  transition: opacity 0.3s ease;
}

.alert-enter-from,
.alert-leave-to {
  opacity: 0;
}
</style>