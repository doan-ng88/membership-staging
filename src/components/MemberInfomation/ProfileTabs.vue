<!-- Generated by Cursor -->
<template>
  <div class="flex border-b">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="[
        'px-4 py-2 border rounded-t-lg ',
        { 'bg-black text-white': modelValue === tab.id }
      ]"
      @click="$emit('update:modelValue', tab.id)"
    >
      {{ t(`membershipTable.tabs.${tab.id}`) }}
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { TabType } from '@/types/profile'
import { useI18nGlobal } from '@/i18n'

export default defineComponent({
  name: 'ProfileTabs',

  props: {
    modelValue: {
      type: String as () => TabType,
      required: true
    }
  },

  emits: ['update:modelValue'],

  setup() {
    const { t } = useI18nGlobal()
    
    const tabs = [
      { id: 'date-join-member', label: t('membershipTable.tabs.date-join-member') },
      { id: 'date-of-birth', label: t('membershipTable.tabs.date-of-birth') },
      { id: 'order-date', label: t('membershipTable.tabs.order-date') }
    ]

    return { tabs, t }
  }
})
</script>
