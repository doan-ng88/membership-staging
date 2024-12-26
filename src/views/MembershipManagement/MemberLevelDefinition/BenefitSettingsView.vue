<template>
  <DefaultLayout>
    <div class="flex-1 p-6">
      <!-- <h2 class="text-2xl font-bold mb-4 text-center">{{ t('menu.benefitSettings.title') }}</h2> -->
      <h1 class="text-2xl font-bold text-center mb-5">
        {{ t('benefit.settings') }}
      </h1>

      <!-- Brand Selection -->
      <div class="mb-6">
        <label for="brandSelect" class="block text-sm font-medium text-gray-700">
          <h3 class="text-lg leading-6 font-medium text-gray-900">{{ t('benefit.selectBrand') }}</h3>
        </label>
        <select
          id="brandSelect"
          v-model="selectedBrand"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option v-for="brand in brands" :key="brand.id" :value="brand.id">
            {{ brand.name }}
          </option>
        </select>
      </div>

      <!-- Content Area -->
      <div class="bg-white shadow rounded-lg">
        <!-- Header -->
        <div class="px-4 py-5 sm:px-6 flex justify-between items-center">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {{ t('benefit.memberLevelList') }}
          </h3>
          <button
            @click="openAddModal"
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 focus:outline-none"
          >
            {{ t('benefit.addLevel') }}
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center">
          <div class="inline-flex items-center px-4 py-2">
            <svg class="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2">{{ t('benefit.loading') }}</span>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="p-8">
          <div class="rounded-md bg-red-50 p-4">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="ml-3">
                <h3 class="text-sm font-medium text-red-800">
                  {{ t('benefit.error.title') }}
                </h3>
                <div class="mt-2 text-sm text-red-700">
                  {{ error }}
                </div>
                <div class="mt-4">
                  <button
                    @click="retryFetch"
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    {{ t('benefit.error.retry') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Data Table -->
        <div v-else>
          <BenefitTable
            :benefits="filteredLevelSettings"
            @edit="editBenefit"
            @delete="confirmDelete"
          />
        </div>
      </div>

      <!-- Modal Component -->
      <BenefitModal
        v-if="showModal"
        v-model:show="showModal"
        :benefit="currentBenefit"
        :is-editing="isEditing"
        @save="saveBenefit"
        @close="closeModal"
      />

      <!-- Delete Confirmation Modal -->
      <ConfirmationModal
        v-model:show="showDeleteConfirm"
        @confirm="handleDelete"
        @cancel="cancelDelete"
      />

      <!-- Notification Component -->
      <!-- <div 
        v-if="notification.show"
        :class="[
          'fixed top-4 right-4 p-4 rounded shadow-lg',
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500',
          'text-white'
        ]"
      >
        {{ notification.message }}
      </div> -->
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguage } from '@/composables/useLanguage'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import LanguageSwitcher from '@/components/Header/LanguageSwitcher.vue'
import { storeToRefs } from 'pinia'
import { useBenefitStore } from '@/stores/benefitSettings'
import BenefitModal from '@/components/BenefitSettings/BenefitModal.vue'
import BenefitTable from '@/components/BenefitSettings/BenefitTable.vue'
import ConfirmationModal from '@/components/BenefitSettings/ConfirmationModal.vue'
import type { LevelSetting } from '@/data/benefits'
import { useNotification } from '@/composables/useNotification'

export default defineComponent({
  components: {
    DefaultLayout,
    LanguageSwitcher,
    BenefitModal,
    BenefitTable,
    ConfirmationModal
  },

  setup() {
    const { t } = useI18n()
    const { currentLanguage } = useLanguage()

    const store = useBenefitStore()
    const { levelSettings, isLoading, error } = storeToRefs(store)
    const { showNotification } = useNotification()
    
    // State refs
    const showModal = ref(false)
    const showDeleteConfirm = ref(false)
    const isEditing = ref(false)
    const currentBenefit = ref<LevelSetting | null>(null)
    const benefitToDelete = ref<number | null>(null)
    const selectedBrand = ref(1) // Default brand ID
    const isDeleting = ref(false)

    // Brands data
    const brands = ref([
      { id: 1, name: 'Sky007' },
      { id: 2, name: 'Bbia' },
      { id: 3, name: 'Hince' },
      { id: 4, name: 'Mixsoon' }
    ])

    // Computed
    const filteredLevelSettings = computed(() => {
      return levelSettings.value.filter((level: LevelSetting) => level.websiteId === selectedBrand.value)
    })

    onMounted(() => {
      store.fetchLevelSettings()
    })

    // Modal handlers
    const openAddModal = () => {
      isEditing.value = false
      currentBenefit.value = null
      showModal.value = true
    }

    const editBenefit = (benefit: LevelSetting) => {
      isEditing.value = true
      currentBenefit.value = { ...benefit }
      showModal.value = true
    }

    const closeModal = () => {
      showModal.value = false
      currentBenefit.value = null
      isEditing.value = false
    }

    // Save handler
    const saveBenefit = async (data: LevelSetting) => {
      const formData = {
        ...data,
        websiteId: selectedBrand.value
      }

      let success
      if (isEditing.value) {
        // console.log('Updating level with data:', formData)
        success = await store.updateLevel(formData)
      } else {
        success = await store.addLevel(formData)
      }

      if (success) {
        closeModal()
      }
    }

    // Delete handlers
    const confirmDelete = (levelId: number) => {
      console.log('Confirming delete for level:', levelId)
      benefitToDelete.value = levelId
      showDeleteConfirm.value = true
    }

    const handleDelete = async () => {
      if (!benefitToDelete.value) return

      isDeleting.value = true
      try {
        console.log('View: Attempting to delete level:', benefitToDelete.value)
        const success = await store.deleteLevel(benefitToDelete.value)
        
        if (success) {
          showDeleteConfirm.value = false
          benefitToDelete.value = null
          // Hiển thị thông báo thành công
          showNotification('Xóa cấp bậc thành công', 'success')
        } else {
          // Hiển thị thông báo lỗi
          showNotification(store.error || 'Có lỗi xảy ra khi xóa cấp bậc', 'error')
        }
      } catch (error) {
        console.error('View: Delete error:', error)
        showNotification('Có lỗi xảy ra khi xóa cấp bậc', 'error')
      } finally {
        isDeleting.value = false
      }
    }

    const cancelDelete = () => {
      showDeleteConfirm.value = false
      benefitToDelete.value = null
    }

    // Retry handler
    const retryFetch = () => {
      store.fetchLevelSettings()
    }

    return {
      t,
      currentLanguage,
      // State
      showModal,
      showDeleteConfirm,
      isEditing,
      currentBenefit,
      selectedBrand,
      brands,
      isLoading,
      error,
      filteredLevelSettings,
      isDeleting,

      // Methods
      openAddModal,
      editBenefit,
      closeModal,
      saveBenefit,
      confirmDelete,
      handleDelete,
      cancelDelete,
      retryFetch
    }
  }
})
</script>