<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">Email Statistics</h2>
        </template>
        <template #extra>
          <a-range-picker
            v-model:value="dateRange"
            :show-time="{ format: 'HH:mm' }"
            format="YYYY-MM-DD HH:mm"
            :placeholder="['Start Time', 'End Time']"
            @change="handleDateRangeChange"
          />
        </template>
      </PageHeader>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- In Progress Card -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">In Progress</h3>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <sync-outlined class="text-2xl text-blue-500 mr-2" />
              <span class="text-3xl font-bold">{{ statistics.inProgress }}</span>
            </div>
            <p class="text-sm text-gray-500">All emails in progress</p>
          </div>
        </div>

        <!-- Submitted Card -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Submitted</h3>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <mail-outlined class="text-2xl text-green-500 mr-2" />
              <span class="text-3xl font-bold">{{ statistics.emailTotal }}</span>
            </div>
            <p class="text-sm text-gray-500">Total emails sent</p>
          </div>
        </div>

        <!-- Opened Card -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Opened</h3>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <folder-open-outlined class="text-2xl text-yellow-500 mr-2" />
              <span class="text-3xl font-bold">{{ statistics.opened }}</span>
            </div>
            <p class="text-sm text-gray-500">Emails opened</p>
          </div>
        </div>

        <!-- Bounced Card -->
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Bounced</h3>
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <warning-outlined class="text-2xl text-red-500 mr-2" />
              <span class="text-3xl font-bold">{{ statistics.bounced }}</span>
            </div>
            <p class="text-sm text-gray-500">Emails bounced</p>
          </div>
        </div>
      </div>

      <!-- Detailed Statistics -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium mb-4">Detailed Statistics</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatisticCard 
            title="Delivered" 
            :value="statistics.delivered"
            icon="CheckCircleOutlined"
            color="text-green-500"
          />
          <StatisticCard 
            title="Clicked" 
            :value="statistics.clicked"
            icon="LinkOutlined"
            color="text-blue-500"
          />
          <StatisticCard 
            title="Not Delivered" 
            :value="statistics.notDelivered"
            icon="CloseCircleOutlined"
            color="text-red-500"
          />
          <StatisticCard 
            title="Unsubscribed" 
            :value="statistics.unsubscribed"
            icon="StopOutlined"
            color="text-gray-500"
          />
          <StatisticCard 
            title="Complaints" 
            :value="statistics.complaints"
            icon="MessageOutlined"
            color="text-orange-500"
          />
          <StatisticCard 
            title="Manual Cancel" 
            :value="statistics.manualCancel"
            icon="CloseOutlined"
            color="text-purple-500"
          />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import StatisticCard from './components/StatisticCard.vue'
import { SyncOutlined, MailOutlined, FolderOpenOutlined, WarningOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

interface EmailStatistics {
  recipients: number
  emailTotal: number
  smsTotal: number
  delivered: number
  bounced: number
  inProgress: number
  opened: number
  clicked: number
  unsubscribed: number
  complaints: number
  inbound: number
  manualCancel: number
  notDelivered: number
}

const statistics = ref<EmailStatistics>({
  recipients: 0,
  emailTotal: 0,
  smsTotal: 0,
  delivered: 0,
  bounced: 0,
  inProgress: 0,
  opened: 0,
  clicked: 0,
  unsubscribed: 0,
  complaints: 0,
  inbound: 0,
  manualCancel: 0,
  notDelivered: 0
})

const dateRange = ref<[Dayjs, Dayjs]>([
  dayjs().subtract(30, 'days'),
  dayjs()
])

const fetchStatistics = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/membership/mail/statistics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        fromDate: dateRange.value[0].toISOString(),
        toDate: dateRange.value[1].toISOString()
      })
    })

    const data = await response.json()
    if (data.result === 'Success') {
      statistics.value = data.statistics
    } else {
      throw new Error('Failed to fetch statistics')
    }
  } catch (error) {
    console.error('Error fetching statistics:', error)
    message.error('Không thể tải dữ liệu thống kê')
  }
}

const handleDateRangeChange = () => {
  fetchStatistics()
}

onMounted(() => {
  fetchStatistics()
})
</script>
