<template>
  <div 
    class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-999"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-lg shadow-lg w-[500px] p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ isEditing ? t('benefitModal.title.edit') : t('benefitModal.title.add') }}
        </h3>
        <button @click="$emit('close')" class="text-gray-600 hover:text-gray-800 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <!-- Tên cấp bậc -->
        <div class="mb-4">
          <label class="block text-gray-700 required">{{ t('benefitModal.fields.level.label') }}</label>
          <input 
            type="text" 
            v-model="formData.Name" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            @input="validateName"
            :class="{'border-red-500': errors.Name}"
            :placeholder="t('benefitModal.fields.level.placeholder')"
          >
          <span v-if="errors.Name" class="text-red-500 text-sm">
            {{ errors.Name }}
          </span>
        </div>

        <!-- Rank -->
        <div class="mb-4">
          <label class="block text-gray-700 required">{{ t('benefitModal.fields.rank.label') }}</label>
          <input 
            type="number" 
            v-model.number="formData.rank" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            @input="validateRank"
            :class="{
              'border-red-500': errors.rank,
              'border-green-500': formData.rank !== null && !errors.rank
            }"
            :placeholder="t('benefitModal.fields.rank.placeholder')"
          >
          <span v-if="errors.rank" class="text-red-500 text-sm mt-1 block">
            {{ errors.rank }}
          </span>
        </div>

        <!-- Điểm tích lũy tối thiểu -->
        <div class="mb-4">
          <label class="block text-gray-700 required">{{ t('benefitModal.fields.thresholdAmount.label') }}</label>
          <input 
            type="number" 
            v-model.number="formData.thresholdAmount" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            :class="{'border-red-500': errors.thresholdAmount}"
            :placeholder="t('benefitModal.fields.thresholdAmount.placeholder')"
          >
          <span v-if="errors.thresholdAmount" class="text-red-500 text-sm">
            {{ errors.thresholdAmount }}
          </span>
        </div>

        <!-- Tỷ lệ tích điểm -->
        <div class="mb-4">
          <label class="block text-gray-700 required">{{ t('benefitModal.fields.rewardRate.label') }}</label>
          <input 
            type="number" 
            v-model.number="formData.rewardRate" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            max="100"
            :class="{'border-red-500': errors.rewardRate}"
            :placeholder="t('benefitModal.fields.rewardRate.placeholder')"
          >
          <span v-if="errors.rewardRate" class="text-red-500 text-sm">
            {{ t('benefitModal.validation.rewardRate.range') }}
          </span>
        </div>

        <!-- Tỷ lệ đổi điểm -->
        <div class="mb-4">
          <label class="block text-gray-700 required">{{ t('benefitModal.fields.redeemRate.label') }}</label>
          <input 
            type="number" 
            v-model.number="formData.redeemRate" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            :class="{'border-red-500': errors.redeemRate}"
            :placeholder="t('benefitModal.fields.redeemRate.placeholder')"
          >
          <span v-if="errors.redeemRate" class="text-red-500 text-sm">
            {{ t('benefitModal.validation.redeemRate.negative') }}
          </span>
        </div>

        <!-- Thời hạn hiệu lực -->
        <div class="mb-4">
          <label class="block text-gray-700 required">{{ t('benefitModal.fields.duration.label') }}</label>
          <input 
            type="number" 
            v-model.number="formData.durationExpired" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="1"
            :class="{'border-red-500': errors.durationExpired}"
            :placeholder="t('benefitModal.fields.duration.placeholder')"
          >
          <span v-if="errors.durationExpired" class="text-red-500 text-sm">
            {{ t('benefitModal.validation.duration.minimum') }}
          </span>
        </div>

        <!-- Giảm giá trên mỗi đơn -->
        <div class="mb-4">
          <label class="block text-gray-700 required">{{ t('benefitModal.fields.discount.label') }}</label>
          <input 
            type="number" 
            v-model.number="formData.discountPerOrder" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            max="100"
            :class="{'border-red-500': errors.discountPerOrder}"
            :placeholder="t('benefitModal.fields.discount.placeholder')"
          >
          <span v-if="errors.discountPerOrder" class="text-red-500 text-sm">
            {{ t('benefitModal.validation.discount.range') }}
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <button 
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
          >
            {{ t('benefitModal.buttons.cancel') }}
          </button>
          <button 
            type="submit" 
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting 
              ? t('benefitModal.buttons.saving') 
              : (isEditing ? t('benefitModal.buttons.update') : t('benefitModal.buttons.add')) 
            }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useBenefitStore } from '@/stores/benefitSettings'
import type { LevelSetting } from '@/data/benefits'
import { useI18nGlobal } from '@/i18n'
import { message } from 'ant-design-vue'

const { t } = useI18nGlobal()

const props = defineProps<{
  show: boolean
  benefit: LevelSetting | null
  isEditing: boolean
  websiteId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: LevelSetting): void
}>()

const store = useBenefitStore()
const isSubmitting = ref(false)

// Form data
const formData = reactive<LevelSetting>({
  levelId: 0,
  Name: '',
  websiteId: props.websiteId,
  thresholdAmount: 0,
  rewardRate: 0,
  redeemRate: 0,
  levelIdWebsite: 0,
  durationExpired: 6,
  rank: 0,
  discountPerOrder: 0,
  membershipWebsites: null
})

// Errors object
const errors = reactive({
  Name: '',
  rank: '',
  thresholdAmount: '',
  rewardRate: '',
  redeemRate: '',
  durationExpired: '',
  discountPerOrder: ''
})

// Initialize form if editing
if (props.benefit) {
  Object.assign(formData, props.benefit)
}

// Validation methods
const validateName = async () => {
  if (!formData.Name.trim()) {
    errors.Name = t('benefitModal.validation.level.required')
    return false
  }

  if (formData.Name.length < 3) {
    errors.Name = t('benefitModal.validation.level.minLength')
    return false
  }

  if (formData.Name.length > 50) {
    errors.Name = t('benefitModal.validation.level.maxLength')
    return false
  }

  // Check for special characters
  const specialCharsRegex = /[!@#$%^&*(),.?":{}|<>]/
  if (specialCharsRegex.test(formData.Name)) {
    errors.Name = t('benefitModal.validation.level.specialChars')
    return false
  }

  // Check for duplicate name
  const existingLevel = await store.checkDuplicateName(formData.Name, formData.websiteId, formData.levelId)
  if (existingLevel) {
    errors.Name = t('benefitModal.validation.level.exists', { name: formData.Name })
    return false
  }

  errors.Name = ''
  return true
}

const validateRank = async () => {
  if (formData.rank < 0) {
    errors.rank = t('benefitModal.validation.rank.negative')
    return false
  }

  // Check for duplicate rank
  const existingRank = await store.checkDuplicateRank(formData.rank, formData.websiteId, formData.levelId)
  if (existingRank) {
    errors.rank = t('benefitModal.validation.rank.exists', { rank: formData.rank })
    return false
  }

  errors.rank = ''
  return true
}

const validateForm = () => {
  let isValid = true

  // Validate all fields
  if (formData.thresholdAmount < 0) {
    errors.thresholdAmount = t('benefitModal.validation.thresholdAmount.negative')
    isValid = false
  }

  if (formData.rewardRate < 0 || formData.rewardRate > 100) {
    errors.rewardRate = t('benefitModal.validation.rewardRate.range')
    isValid = false
  }

  if (formData.redeemRate < 0) {
    errors.redeemRate = t('benefitModal.validation.redeemRate.negative')
    isValid = false
  }

  if (formData.durationExpired < 1) {
    errors.durationExpired = t('benefitModal.validation.duration.minimum')
    isValid = false
  }

  if (formData.discountPerOrder < 0 || formData.discountPerOrder > 100) {
    errors.discountPerOrder = t('benefitModal.validation.discount.range')
    isValid = false
  }

  return isValid
}

// Computed
const isFormValid = computed(() => {
  return formData.Name.trim().length >= 2 && 
         formData.Name.trim().length <= 50 &&
         !errors.Name &&
         formData.rank >= 0 &&
         !errors.rank &&
         formData.thresholdAmount >= 0 && 
         formData.rewardRate >= 0 && 
         formData.rewardRate <= 100 &&
         formData.redeemRate >= 0 && 
         formData.durationExpired >= 1 &&
         formData.discountPerOrder >= 0 &&
         formData.discountPerOrder <= 100
})

// Watchers
watch(() => props.websiteId, (newWebsiteId) => {
  if (newWebsiteId) {
    formData.websiteId = newWebsiteId
    // Re-validate sau khi cập nhật websiteId
    validateName()
    validateRank() 
  }
}, { immediate: true })

watch(() => formData.Name, () => {
  validateName()
}, { debounce: 300 })

watch(() => formData.rank, () => {
  validateRank()
})

// Methods
const handleSubmit = async () => {
  if (!validateForm()) return
  
  try {
    isSubmitting.value = true
    
    const payload = {
      ...formData,
      websiteId: Number(formData.websiteId),
      thresholdAmount: Number(formData.thresholdAmount),
      rewardRate: Number(formData.rewardRate),
      redeemRate: Number(formData.redeemRate),
      durationExpired: Number(formData.durationExpired),
      rank: Number(formData.rank),
      discountPerOrder: Number(formData.discountPerOrder),
      Name: formData.Name.trim(),
      levelIdWebsite: formData.levelIdWebsite || 0,
      membershipWebsites: formData.membershipWebsites || null
    }

    // Lưu payload để đảm bảo UI hiển thị giá trị mới nhất
    const updatedBenefit = await emit('save', payload)
    
    // Hiển thị thông báo thành công
    message.success(props.isEditing ? 'Cập nhật cấp bậc thành công' : 'Thêm mới cấp bậc thành công')
    
    // Thêm logic ép buộc refresh store data để đảm bảo dữ liệu mới nhất
    if (props.isEditing) {
      // Force refresh store data with actual updated values
      store.updateLocalBenefit({
        ...payload,
        // Sử dụng giá trị từ form, không phụ thuộc vào response API
        rewardRate: Number(formData.rewardRate)
      })
    }
    
    emit('close')
  } catch (error) {
    console.error('Error submitting form:', error)
    message.error(
      error.response?.data?.message || 
      (props.isEditing ? 'Cập nhật cấp bậc thất bại' : 'Thêm mới cấp bậc thất bại')
    )
  } finally {
    isSubmitting.value = false
  }
}

// Reset form
const resetForm = () => {
  Object.assign(formData, {
    levelId: 0,
    Name: '',
    websiteId: props.websiteId,
    thresholdAmount: 0,
    rewardRate: 0,
    redeemRate: 0,
    levelIdWebsite: 0,
    durationExpired: 6,
    rank: 0,
    discountPerOrder: 0,
    membershipWebsites: null
  })
  Object.keys(errors).forEach(key => {
    errors[key as keyof typeof errors] = ''
  })
}
</script>

<style scoped>
.required:after {
  content: " *";
  color: #ef4444;
}

input:disabled, 
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error-message {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: #ef4444;
}

/* Input focus styles */
input:focus {
  outline: none;
  ring: 2px;
  ring-offset: 2px;
  ring-color: #60a5fa;
}

/* Error state styles */
input.border-red-500:focus {
  ring: 2px;
  ring-color: #ef4444;
}

/* Thêm styles cho input number */
input[type="number"] {
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Success state */
.border-green-500 {
  border-color: #10B981;
}

/* Error state */
.border-red-500 {
  border-color: #EF4444;
}

/* Focus states */
input:focus {
  outline: none;
  ring: 2px;
  ring-offset: 2px;
}

input:focus.border-green-500 {
  ring-color: #10B981;
}

input:focus.border-red-500 {
  ring-color: #EF4444;
}
</style>