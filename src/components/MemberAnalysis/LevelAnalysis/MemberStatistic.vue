<template>
  <div class="mb-12">
    <h3 class="text-2xl font-semibold mb-4">{{ t('memberStatistics.title') }}</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th 
              v-for="header in headers" 
              :key="header"
              class="py-3 px-6 bg-gray-200 text-left text-gray-700 uppercase font-semibold text-sm"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr 
            v-for="(count, level) in statistics" 
            :key="level" 
            class="hover:bg-gray-100"
          >
            <td class="py-3 px-6 border-b">{{ level }}</td>
            <td class="py-3 px-6 border-b">{{ count }}</td>
            <td class="py-3 px-6 border-b">
              {{ ((count / total) * 100).toFixed(2) }}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="mt-4 text-gray-700">{{ t('memberStatistics.total', { count: total }) }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18nGlobal } from '@/i18n'
import type { MemberStats } from '@/types/memberAnalysis'

const { t } = useI18nGlobal()

const props = defineProps<{
  statistics: MemberStats
}>()

const headers = computed(() => [
  t('memberStatistics.table.headers.level'),
  t('memberStatistics.table.headers.count'),
  t('memberStatistics.table.headers.percentage')
])

const total = computed(() => 
  Object.values(props.statistics).reduce((a, b) => a + b, 0)
)
</script>
