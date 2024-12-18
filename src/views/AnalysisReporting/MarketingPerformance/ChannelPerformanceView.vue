<template>
  <DefaultLayout>
    <div class="flex-1 p-6 bg-gray-50">
      <a-spin :spinning="loading">
        <!-- Header Section -->
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-gray-800">Channel Performance Analytics</h2>
          <p class="text-gray-600 mt-2">Track and analyze your marketing channels performance</p>
        </div>

        <!-- Filters Section -->
        <div class="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Website Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Website Selection
              </label>
              <a-select
                v-model:value="selectedWebsiteId"
                class="w-full"
                :options="websiteOptions"
                placeholder="Select website"
              />
            </div>

            <!-- Date Range -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <a-range-picker
                v-model:value="dateRange"
                class="w-full"
                :disabled-date="disabledDate"
                @change="handleDateRangeChange"
              />
            </div>
          </div>
        </div>

        <!-- Performance Cards -->
        <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <PerformanceCard
            title="Email Performance"
            :value="statistics.emailTotal"
            :change="calculatePercentageChange(statistics.delivered, previousStatistics.delivered)"
            icon="mail"
          />
          <PerformanceCard
            title="SMS Performance"
            :value="statistics.smsTotal"
            :change="calculatePercentageChange(statistics.smsTotal, previousStatistics.smsTotal)"
            icon="message"
          />
          <PerformanceCard
            title="Overall Performance"
            :value="statistics.recipients"
            :change="calculatePercentageChange(statistics.opened, previousStatistics.opened)"
            icon="chart"
          />
        </div>

        <!-- Email Performance Section -->
        <div class="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div class="p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center">
              <mail-outlined class="mr-2 text-blue-500" />
              Email Marketing Performance
            </h3>
          </div>
          <div class="p-6">
            <EmailPerformanceSection
              :selectedBrand="selectedWebsiteId"
              :statistics="statistics"
            />
          </div>
        </div>

        <!-- SMS and Channel Contribution Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- SMS Performance Section -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                <message-outlined class="mr-2 text-green-500" />
                SMS Marketing Performance
              </h3>
            </div>
            <div class="p-6">
              <SmsPerformanceSection
                :selectedBrand="selectedWebsiteId"
                :statistics="statistics"
              />
            </div>
          </div>

          <!-- Channel Contribution Section -->
          <div class="bg-white rounded-xl shadow-sm overflow-hidden">
            <div class="p-6 border-b border-gray-100">
              <h3 class="text-lg font-semibold text-gray-800 flex items-center">
                <pie-chart-outlined class="mr-2 text-purple-500" />
                Channel Contribution Analysis
              </h3>
            </div>
            <div class="p-6">
              <ChannelContributionSection
                :selectedBrand="selectedWebsiteId"
                :statistics="statistics"
              />
            </div>
          </div>
        </div>
      </a-spin>
    </div>
  </DefaultLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { 
  MailOutlined, 
  MessageOutlined, 
  PieChartOutlined 
} from '@ant-design/icons-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PerformanceCard from '@/components/MarketingPerformance/ChanelPerformance/PerformanceCard.vue'
import EmailPerformanceSection from '@/components/MarketingPerformance/ChanelPerformance/EmailPerformance.vue'
import SmsPerformanceSection from '@/components/MarketingPerformance/ChanelPerformance/SmsPerformance.vue'
import ChannelContributionSection from '@/components/MarketingPerformance/ChanelPerformance/ChannelContribution.vue'
import { marketingPerformanceService } from '@/services/marketingPerformance'
import { websites } from '@/api/types/website'

// State Management
const loading = ref(false)
const selectedWebsiteId = ref(websites[0].websiteId)
const dateRange = ref([dayjs().subtract(30, 'days'), dayjs()])

// Data states
const statistics = ref(null)
const previousStatistics = ref(null)

// Format websites for select options
const websiteOptions = computed(() => 
  websites.map(website => ({
    value: website.websiteId,
    label: website.name
  }))
)

const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

// API calls
const fetchChannelStats = async () => {
  try {
    loading.value = true
    
    // Fetch current period stats
    const currentResponse = await marketingPerformanceService.getChannelStats({
      fromDate: dateRange.value[0].toISOString(),
      toDate: dateRange.value[1].toISOString()
    })
    
    // Calculate previous period
    const [previousStart, previousEnd] = calculatePreviousDateRange(
      dateRange.value[0],
      dateRange.value[1]
    )
    
    // Fetch previous period stats
    const previousResponse = await marketingPerformanceService.getChannelStats({
      fromDate: previousStart.toISOString(),
      toDate: previousEnd.toISOString()
    })

    if (currentResponse.result === 'Success' && previousResponse.result === 'Success') {
      statistics.value = currentResponse.statistics
      previousStatistics.value = previousResponse.statistics
    } else {
      throw new Error('Failed to fetch statistics')
    }
  } catch (error) {
    console.error('Error fetching channel stats:', error)
    message.error('Không thể tải dữ liệu thống kê kênh')
  } finally {
    loading.value = false
  }
}

const calculatePreviousDateRange = (startDate, endDate) => {
  const start = dayjs(startDate)
  const end = dayjs(endDate)
  const daysDiff = end.diff(start, 'day')
  
  const previousEnd = start.subtract(1, 'day')
  const previousStart = previousEnd.subtract(daysDiff, 'day')
  
  return [previousStart, previousEnd]
}

// Event Handlers
const handleDateRangeChange = () => {
  fetchChannelStats()
}

// Watchers
watch([selectedWebsiteId, dateRange], () => {
  fetchChannelStats()
}, { deep: true })

// Lifecycle
onMounted(() => {
  fetchChannelStats()
})

// Date range validation
const disabledDate = (current) => {
  return current && current > dayjs().endOf('day')
}
</script>

<style scoped>
/* Custom styles for better visual hierarchy */
.rounded-xl {
  border-radius: 1rem;
}

.shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

/* Hover effects for cards */
.bg-white {
  transition: all 0.3s ease;
}

.bg-white:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Custom scrollbar for better UX */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .grid-cols-1 {
    gap: 1.5rem;
  }
  
  .p-6 {
    padding: 1.25rem;
  }
}
</style>
