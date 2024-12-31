import './assets/css/satoshi.css'
import './assets/css/style.css'
import 'flatpickr/dist/flatpickr.min.css'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import { QuillEditor } from '@vueup/vue-quill'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import VueApexCharts from 'vue3-apexcharts'
import { message } from 'ant-design-vue'

import App from './App.vue'
import router from './router'
import i18nInstance from '@/i18n'

import { useAuthStore } from '@/stores/auth'

// import 'ant-design-vue/dist/antd.css'

import { ApiService } from './services/api.service'
import { CampaignService } from './features/call-campaign/services/campaign.service'

const app = createApp(App)
const pinia = createPinia()

// Services
const apiService = new ApiService()
const campaignService = new CampaignService(apiService)

app.provide('apiService', apiService)
app.provide('campaignService', campaignService)

app.use(pinia)
app.use(router)
app.use(i18nInstance)
app.use(Antd)
app.use(VueApexCharts)

// Cấu hình message globally
app.config.globalProperties.$message = message

const authStore = useAuthStore()
authStore.initializeAuth()

// Register QuillEditor globally
app.component('QuillEditor', QuillEditor)

app.mount('#app')
