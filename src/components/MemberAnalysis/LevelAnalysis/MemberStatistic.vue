<template>
  <div class="mb-12">
    <h3 class="text-2xl font-semibold mb-4">Thống Kê Thành Viên Theo Cấp Bậc</h3>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white shadow rounded">
        <thead>
          <tr>
            <th v-for="header in headers" 
                :key="header" 
                class="py-3 px-6 bg-gray-200 text-left text-gray-700 uppercase font-semibold text-sm"
            >
              {{ header }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(count, level) in statistics" 
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
    <p class="mt-4 text-gray-700">Tổng Số Thành Viên: {{ total }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { PropType } from 'vue'
import type { MemberStats } from '@/types/memberAnalysis'

export default defineComponent({
  name: 'MemberStatistics',

  props: {
    statistics: {
      type: Object as PropType<MemberStats>,
      required: true
    }
  },

  setup(props) {
    const headers = ['Cấp Bậc', 'Số Lượng Thành Viên', 'Tỷ Lệ (%)']
    
    const total = computed(() => 
      Object.values(props.statistics).reduce((a, b) => a + b, 0)
    )

    return {
      headers,
      total
    }
  }
})
</script>
