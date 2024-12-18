<template>
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-999">
    <div class="bg-white rounded-lg shadow-lg w-[500px] p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">
          {{ isEditing ? 'Chỉnh Sửa Cấp Bậc' : 'Thêm Cấp Bậc' }}
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
          <label class="block text-gray-700 required">Cấp bậc:</label>
          <input 
            type="text" 
            v-model="formData.Name" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            @input="validateName"
            :class="{'border-red-500': errors.Name}"
            placeholder="Nhập tên cấp bậc"
          >
          <span v-if="errors.Name" class="text-red-500 text-sm">
            {{ errors.Name }}
          </span>
        </div>

        <!-- Thêm input Rank -->
        <div class="mb-4">
          <label class="block text-gray-700 required">Rank:</label>
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
            placeholder="Nhập rank"
          >
          <span v-if="errors.rank" class="text-red-500 text-sm mt-1 block">
            {{ errors.rank }}
          </span>
        </div>

        <!-- Điểm tích lũy tối thiểu -->
        <div class="mb-4">
          <label class="block text-gray-700 required">Số tiền tích lũy tối thiểu:</label>
          <input 
            type="number" 
            v-model.number="formData.thresholdAmount" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            :class="{'border-red-500': errors.thresholdAmount}"
          >
          <span v-if="errors.thresholdAmount" class="text-red-500 text-sm">
            {{ errors.thresholdAmount }}
          </span>
        </div>

        <!-- Tỷ lệ tích điểm -->
        <div class="mb-4">
          <label class="block text-gray-700 required">Tỷ lệ tích điểm (%):</label>
          <input 
            type="number" 
            v-model.number="formData.rewardRate" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            max="100"
            :class="{'border-red-500': errors.rewardRate}"
          >
          <span v-if="errors.rewardRate" class="text-red-500 text-sm">
            {{ errors.rewardRate }}
          </span>
        </div>

        <!-- Tỷ lệ đổi điểm -->
        <div class="mb-4">
          <label class="block text-gray-700 required">Tỷ lệ đổi điểm:</label>
          <input 
            type="number" 
            v-model.number="formData.redeemRate" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            :class="{'border-red-500': errors.redeemRate}"
          >
          <span v-if="errors.redeemRate" class="text-red-500 text-sm">
            {{ errors.redeemRate }}
          </span>
        </div>

        <!-- Thời hạn hiệu lực -->
        <div class="mb-4">
          <label class="block text-gray-700 required">Thời hạn hiệu lực (tháng):</label>
          <input 
            type="number" 
            v-model.number="formData.durationExpired" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="1"
            :class="{'border-red-500': errors.durationExpired}"
          >
          <span v-if="errors.durationExpired" class="text-red-500 text-sm">
            {{ errors.durationExpired }}
          </span>
        </div>

        <!-- Giảm giá trên mỗi đơn -->
        <div class="mb-4">
          <label class="block text-gray-700 required">Giảm giá trên mỗi đơn (%):</label>
          <input 
            type="number" 
            v-model.number="formData.discountPerOrder" 
            class="w-full border border-gray-300 rounded px-4 py-2 mt-1" 
            required
            min="0"
            max="100"
            :class="{'border-red-500': errors.discountPerOrder}"
          >
          <span v-if="errors.discountPerOrder" class="text-red-500 text-sm">
            {{ errors.discountPerOrder }}
          </span>
        </div>

        <div class="flex justify-end gap-2">
          <button 
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none"
          >
            Hủy
          </button>
          <button 
            type="submit" 
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none"
            :disabled="!isFormValid || isSubmitting"
          >
            {{ isSubmitting ? 'Đang lưu...' : (isEditing ? 'Cập nhật' : 'Thêm mới') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, watch, type PropType } from 'vue'
import { useBenefitStore } from '@/stores/benefitSettings'
import type { LevelSetting } from '@/data/benefits'

export default defineComponent({
  name: 'BenefitModal',

  props: {
    show: {
      type: Boolean,
      required: true
    },
    benefit: {
      type: Object as PropType<LevelSetting | null>,
      default: null
    },
    isEditing: {
      type: Boolean,
      default: false
    }
  },

  emits: ['update:show', 'save', 'close'],

  setup(props, { emit }) {
    const store = useBenefitStore()
    const formData = reactive<LevelSetting>({
      levelId: 0,
      Name: '',
      websiteId: 1,
      thresholdAmount: 0,
      rewardRate: 0,
      redeemRate: 0,
      levelIdWebsite: 0,
      durationExpired: 6,
      rank: 0,
      discountPerOrder: 0,
      membershipWebsites: null
    })
    // Log props khi component được tạo
    // console.log('Initial props:', props)

    const errors = reactive({
      Name: '',
      thresholdAmount: '',
      rewardRate: '',
      redeemRate: '',
      durationExpired: '',
      discountPerOrder: '',
      rank: ''
    })

    const isSubmitting = ref(false)

    // Cập nhật form khi prop benefit thay đổi
    watch(
    //   () => props.benefit, 
    //   (newBenefit) => {
    //   if (newBenefit) {
    //     Object.assign(formData, newBenefit)
    //   }
    // }, { deep: true, immediate: true }
      () => props.benefit,
      (newBenefit) => {
        if (newBenefit) {
          // console.log('Updating form data with:', newBenefit) // Debug
          Object.assign(formData, {
            levelId: newBenefit.levelId,
            Name: newBenefit.Name,
            websiteId: newBenefit.websiteId,
            thresholdAmount: newBenefit.thresholdAmount,
            rewardRate: newBenefit.rewardRate,
            redeemRate: newBenefit.redeemRate,
            levelIdWebsite: newBenefit.levelIdWebsite,
            durationExpired: newBenefit.durationExpired,
            rank: newBenefit.rank,
            discountPerOrder: newBenefit.discountPerOrder,
            membershipWebsites: newBenefit.membershipWebsites
          })
        } else {
          // Reset form khi không có dữ liệu
          Object.assign(formData, {
            levelId: 0,
            Name: '',
            websiteId: 1,
            thresholdAmount: 0,
            rewardRate: 0,
            redeemRate: 0,
            levelIdWebsite: 0,
            durationExpired: 6,
            rank: 0,
            discountPerOrder: 0,
            membershipWebsites: null
          })
        }
      },
      { immediate: true, deep: true }
    )

    watch(() => props.benefit, (newValue) => {
      console.log('Benefit prop changed:', newValue)
    })

    // Thêm validate rank
    const validateRank = async () => {
      errors.rank = ''

      // Required validation
      if (formData.rank === null || formData.rank === undefined) {
        errors.rank = 'Rank là bắt buộc'
        return false
      }

      // Non-negative validation
      if (formData.rank < 0) {
        errors.rank = 'Rank không được âm'
        return false
      }

      // Unique validation
      const existingLevels = store.levelSettings
      const rankExists = existingLevels.some(level => 
        level.websiteId === formData.websiteId && 
        level.rank === formData.rank &&
        (!props.isEditing || level.levelId !== formData.levelId) // Skip current level when editing
      )

      if (rankExists) {
        errors.rank = `Rank ${formData.rank} đã tồn tại cho website này`
        return false
      }

      return true
    }

    // Thêm validate name
    const validateName = async () => {
      errors.Name = ''

      // Kiểm tra độ dài tối thiểu
      if (formData.Name.trim().length < 2) {
        errors.Name = 'Tên cấp bậc phải có ít nhất 3 ký tự'
        return false
      }

      // Kiểm tra độ dài tối đa
      if (formData.Name.trim().length > 50) {
        errors.Name = 'Tên cấp bậc không được vượt quá 50 ký tự'
        return false
      }

      // Kiểm tra tên đã tồn tại cho website
      const existingLevels = store.levelSettings
      const nameExists = existingLevels.some(level => 
        level.websiteId === formData.websiteId && 
        level.Name.toLowerCase() === formData.Name.toLowerCase() &&
        (!props.isEditing || level.levelId !== formData.levelId)
      )

      if (nameExists) {
        errors.Name = `Tên cấp bậc "${formData.Name}" đã tồn tại cho website này`
        return false
      }

      // Kiểm tra ký tự đặc biệt
      const specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
      if (specialChars.test(formData.Name)) {
        errors.Name = 'Tên cấp bậc không được chứa ký tự đặc biệt'
        return false
      }

      return true
    }

    // Cập nhật validateForm
    const validateForm = () => {
      let isValid = true
      
      // Validate name
      if (!validateName()) {
        isValid = false
      }

      // Validate rank
      if (!validateRank()) {
        isValid = false
      }

      if (formData.thresholdAmount < 0) {
        errors.thresholdAmount = 'Số tiền tích lũy không được âm'
        isValid = false
      }

      if (formData.rewardRate < 0 || formData.rewardRate > 100) {
        errors.rewardRate = 'Tỷ lệ tích điểm phải từ 0-100%'
        isValid = false
      }

      if (formData.redeemRate < 0) {
        errors.redeemRate = 'Tỷ lệ đổi điểm không được âm'
        isValid = false
      }

      if (formData.durationExpired < 1) {
        errors.durationExpired = 'Thời hạn hiệu lực phải lớn hơn 0 tháng'
        isValid = false
      }

      if (formData.discountPerOrder < 0 || formData.discountPerOrder > 100) {
        errors.discountPerOrder = 'Giảm giá phải từ 0-100%'
        isValid = false
      }

      return isValid
    }

    // Cập nhật isFormValid
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

    // Watch for websiteId changes
    watch(() => formData.websiteId, () => {
      validateName()
      validateRank()
    })

    // Watch for name changes
    watch(() => formData.Name, () => {
      validateName()
    }, { debounce: 300 }) // Thêm debounce để tránh validate quá nhiều

    // Watch for rank changes
    watch(() => formData.rank, () => {
      validateRank()
    })

    const handleSubmit = async () => {
      if (!validateForm()) return
      
      try {
        isSubmitting.value = true
        // console.log('Submitting form data:', formData)
        await emit('save', {...formData})
      } catch (error) {
        // console.error('Error submitting form:', error)
      } finally {
        isSubmitting.value = false
      }
    }

    // Reset form
    const resetForm = () => {
      Object.assign(formData, {
        levelId: 0,
        Name: '',
        websiteId: 1,
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

    return {
      formData,
      errors,
      isSubmitting,
      isFormValid,
      handleSubmit,
      validateName,
      validateRank,
      resetForm
    }
  }
})
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