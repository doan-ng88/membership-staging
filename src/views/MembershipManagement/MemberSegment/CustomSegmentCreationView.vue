
<template>
  <DefaultLayout>
    <div class="custom-segment mx-auto max-w-1200 px-4">
      <h1 class="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Create Customer Segment</h1>

      <!-- Segment Overview -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-300">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Total Segments</h3>
          <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">{{ totalSegments }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-300">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Segmented Customers</h3>
          <p class="text-2xl font-bold text-green-600 dark:text-green-400">{{ segmentedCustomers }}</p>
        </div>
        <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow transition-colors duration-300">
          <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Active Segments</h3>
          <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">{{ activeSegments }}</p>
        </div>
      </div>

      <!-- Segment Tabs -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 transition-colors duration-300">
        <div class="border-b border-gray-200 dark:border-gray-700">
          <nav class="flex">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="currentTab = tab.id"
              class="px-6 py-4 text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300"
              :class="currentTab === tab.id ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'hover:text-gray-700 dark:hover:text-gray-200'"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>

        <!-- Purchase Pattern Segments -->
        <div v-if="currentTab === 'purchase'" class="p-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Segments by Purchase Behavior</h2>
          <div class="space-y-6">
            <!-- Frequency of Purchases -->
            <div class="border-b pb-4">
              <h3 class="text-lg font-medium mb-3">Purchase Frequency</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="(segment, index) in purchaseFrequencySegments" :key="index" class="border rounded-lg p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ segment.name }}</span>
                    <span :class="getSegmentClass(segment.type)">{{ segment.count }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ segment.description }}</p>
                </div>
              </div>
            </div>

            <!-- Average Spend -->
            <div class="border-b pb-4">
              <h3 class="text-lg font-medium mb-3">Average Spend</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="(segment, index) in spendingSegments" :key="index" class="border rounded-lg p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ segment.name }}</span>
                    <span :class="getSegmentClass(segment.type)">{{ segment.count }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ segment.description }}</p>
                </div>
              </div>
            </div>

            <!-- Product Type -->
            <div>
              <h3 class="text-lg font-medium mb-3">Product Type</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="(segment, index) in productTypeSegments" :key="index" class="border rounded-lg p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ segment.name }}</span>
                    <span :class="getSegmentClass(segment.type)">{{ segment.count }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ segment.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Interest-Based Segments -->
        <div v-if="currentTab === 'interest'" class="p-6">
          <h2 class="text-xl font-semibold mb-4">Segments by Interest</h2>
          <div class="space-y-6">
            <!-- Product Preferences -->
            <div class="border-b pb-4">
              <h3 class="text-lg font-medium mb-3">Product Preferences</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="(segment, index) in productPreferenceSegments" :key="index" class="border rounded-lg p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ segment.name }}</span>
                    <span :class="getSegmentClass(segment.type)">{{ segment.count }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ segment.description }}</p>
                </div>
              </div>
            </div>

            <!-- Brand Interaction -->
            <div class="border-b pb-4">
              <h3 class="text-lg font-medium mb-3">Brand Interaction</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="(segment, index) in brandInteractionSegments" :key="index" class="border rounded-lg p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ segment.name }}</span>
                    <span :class="getSegmentClass(segment.type)">{{ segment.count }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ segment.description }}</p>
                </div>
              </div>
            </div>

            <!-- Lifestyle -->
            <div>
              <h3 class="text-lg font-medium mb-3">Lifestyle</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div v-for="(segment, index) in lifestyleSegments" :key="index" class="border rounded-lg p-4">
                  <div class="flex justify-between items-center mb-2">
                    <span class="font-medium">{{ segment.name }}</span>
                    <span :class="getSegmentClass(segment.type)">{{ segment.count }}</span>
                  </div>
                  <p class="text-sm text-gray-600">{{ segment.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Visit Frequency Segments -->
        <div v-if="currentTab === 'visit'" class="p-6">
          <h2 class="text-xl font-semibold mb-4">Segments by Visit Frequency</h2>
          <div class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div v-for="(segment, index) in visitFrequencySegments" :key="index" class="border rounded-lg p-4">
                <div class="flex justify-between items-center mb-2">
                  <span class="font-medium">{{ segment.name }}</span>
                  <span :class="getSegmentClass(segment.type)">{{ segment.count }}</span>
                </div>
                <p class="text-sm text-gray-600">{{ segment.description }}</p>
                <div class="mt-2">
                  <span class="text-sm text-gray-500">Visit Frequency: {{ segment.frequency }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

export default defineComponent({
  name: 'CustomSegmentCreationView',
  components: {
    DefaultLayout
  },
  setup() {
    const pageTitle = ref('Create Customer Segment')
    const currentTab = ref('purchase')
    const totalSegments = ref(15)
    const segmentedCustomers = ref(1250)
    const activeSegments = ref(12)

    const tabs = [
      { id: 'purchase', name: 'Purchase Behavior' },
      { id: 'interest', name: 'Interest' },
      { id: 'visit', name: 'Visit Frequency' }
    ]

    const purchaseFrequencySegments = [
      {
        name: 'Frequent Customers',
        count: 450,
        type: 'high',
        description: 'Purchases at least 2 times/month'
      },
      {
        name: 'Occasional Customers',
        count: 850,
        type: 'medium',
        description: 'Purchases 1 time/month'
      },
      {
        name: 'Inactive Customers',
        count: 200,
        type: 'low',
        description: 'No purchases in 3 months'
      }
    ]

    const spendingSegments = [
      {
        name: 'High Spend',
        count: 300,
        type: 'high',
        description: 'Average spend >5tr/month'
      },
      {
        name: 'Medium Spend',
        count: 700,
        type: 'medium',
        description: 'Average spend 2-5tr/month'
      },
      {
        name: 'Low Spend',
        count: 500,
        type: 'low',
        description: 'Average spend <2tr/month'
      }
    ]

    const productTypeSegments = [
      {
        name: 'Diverse Products',
        count: 600,
        type: 'high',
        description: 'Purchases multiple different products'
      },
      {
        name: 'Specialized',
        count: 400,
        type: 'medium',
        description: 'Focuses on a single product type'
      }
    ]

    const productPreferenceSegments = [
      {
        name: 'Organic Products',
        count: 350,
        type: 'high',
        description: 'Prioritize organic products'
      },
      {
        name: 'Cruelty-Free Products',
        count: 450,
        type: 'medium',
        description: 'Concerned about products not tested on animals'
      }
    ]

    const brandInteractionSegments = [
      {
        name: 'High Interaction',
        count: 400,
        type: 'high',
        description: 'Regularly interacts with content'
      },
      {
        name: 'Low Interaction',
        count: 600,
        type: 'low',
        description: 'Interacts less with content'
      }
    ]

    const lifestyleSegments = [
      {
        name: 'Eco-friendly',
        count: 300,
        type: 'high',
        description: 'Concerned about the environment'
      },
      {
        name: 'Luxury',
        count: 200,
        type: 'medium',
        description: 'Prioritize luxury products'
      }
    ]

    const visitFrequencySegments = [
      {
        name: 'Regular Visitors',
        count: 500,
        type: 'high',
        description: 'Visits weekly',
        frequency: '4-7 times/week'
      },
      {
        name: 'Occasional Visitors',
        count: 600,
        type: 'medium',
        description: 'Visits monthly',
        frequency: '1-3 times/month'
      },
      {
        name: 'Infrequent Visitors',
        count: 400,
        type: 'low',
        description: 'Does not visit regularly',
        frequency: '<1 time/month'
      }
    ]

    const getSegmentClass = (type: string) => {
      const classes = {
        high: 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400',
        medium: 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400',
        low: 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400'
      }
      return `px-2 py-1 rounded-full text-xs transition-colors duration-300 ${classes[type as keyof typeof classes] || ''}`
    }

    return {
      pageTitle,
      currentTab,
      tabs,
      totalSegments,
      segmentedCustomers,
      activeSegments,
      purchaseFrequencySegments,
      spendingSegments,
      productTypeSegments,
      productPreferenceSegments,
      brandInteractionSegments,
      lifestyleSegments,
      visitFrequencySegments,
      getSegmentClass
    }
  }
})
</script>

<style scoped>
.custom-segment {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.custom-segment h1 {
  text-align: center;
}
</style>
