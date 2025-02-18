<!-- // src/features/call-campaign/views/CallCampaignView.vue -->
<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold text-gray-800">{{ t('newEmailCampaign.title') }}</h2>
        </template>
      </PageHeader>

      <a-form ref="formRef" :model="formState" :rules="rules" layout="vertical">
        <div class="flex gap-4">
          <a-form-item :label="t('newEmailCampaign.form.name.label')" name="name" class="flex-1">
            <a-input v-model:value="formState.name" placeholder="Enter campaign name" />
          </a-form-item>
          <a-form-item
            :label="t('newEmailCampaign.form.description.label')"
            name="description"
            class="flex-1"
          >
            <a-input
              v-model:value="formState.description"
              placeholder="Enter campaign description"
            />
          </a-form-item>
        </div>

        <div class="flex gap-4">
          <a-form-item
            :label="t('newEmailCampaign.form.website.label')"
            name="websiteId"
            class="flex-1"
          >
            <a-select
              v-model:value="formState.websiteId"
              placeholder="Select website"
              @change="handleWebsiteChange"
            >
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item
            :label="
              t(
                formState.websiteId
                  ? 'newEmailCampaign.form.coupon.label'
                  : 'newEmailCampaign.form.coupon.labelWithWebsite'
              )
            "
            name="coupons"
            class="flex-1"
          >
            <a-select
              v-model:value="formState.coupons"
              placeholder="Select coupons"
              :options="couponOptions"
              :loading="loadingCoupons"
              mode="multiple"
              show-search
              :filter-option="false"
              @search="handleSearchCoupons"
              style="width: 100%"
              option-label-prop="label"
              :disabled="!formState.websiteId"
            >
            </a-select>
          </a-form-item>
        </div>

        <div class="flex gap-4">
          <a-form-item :label="t('newEmailCampaign.form.pic.label')" name="pic" class="flex-1">
            <a-select
              v-model:value="formState.pic"
              :options="formState.adminUsers"
              mode="multiple"
              placeholder="Select person in charge"
              :loading="loadingAdmins"
              style="width: 100%"
              :field-names="{
                label: 'name',
                value: 'id'
              }"
            >
            </a-select>
          </a-form-item>
          <a-form-item
            :label="t('newEmailCampaign.form.time.label')"
            name="startDate"
            class="flex-1"
          >
            <a-range-picker
              v-model:value="dateRange"
              format="YYYY-MM-DD"
              :placeholder="[
                t('newEmailCampaign.form.time.startPlaceholder'),
                t('newEmailCampaign.form.time.endPlaceholder')
              ]"
              style="width: 100%"
              :disabled-date="disabledDate"
              @change="onDateRangeChange"
            />
          </a-form-item>
        </div>
        <div class="mt-6 pt-4 border-t border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h4 class="text-lg font-medium">{{ t('newEmailCampaign.memberList.title') }}</h4>
            <a-button type="primary" @click="showAddMemberModal">
              <template #icon><UserAddOutlined /></template>
              {{ t('newEmailCampaign.memberList.addButton') }}
            </a-button>
          </div>

          <a-table
            :columns="memberColumns"
            :data-source="formState.members"
            :pagination="tableConfig"
            :row-key="(record: any) => record.membershipWebsiteId"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'action'">
                <a-space>
                  <a-button type="link" danger @click="removeMember(record)">
                    <DeleteOutlined />
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
        </div>
        <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div class="max-w-7xl mx-auto flex justify-end gap-4">
            <a-button @click="handleBack">{{ t('newEmailCampaign.buttons.back') }}</a-button>
            <a-button type="primary" @click="handleSubmit">{{
              t('newEmailCampaign.buttons.submit')
            }}</a-button>
          </div>
        </div>
      </a-form>
    </div>

    <AddMemberModal
      v-model:visible="showMemberModal"
      :website-id="formState.websiteId"
      @select="handleMemberSelect"
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { UserAddOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'
import { membershipAPI } from '@/api/services/membershipApi'
import { websites } from '@/api/types/website'
import { debounce, update } from 'lodash'
import { useI18nGlobal } from '@/i18n'
import { message } from 'ant-design-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import type { Campaign } from '../../mail/types/mail.types'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import dayjs from 'dayjs'
import AddMemberModal from '../components/AddMember/AddMemberModal.vue'

const { t } = useI18nGlobal()

type User = {
  id: string
  name: string
}
export type NewCampaign = {
  name: string
  description: string
  startDate: string | null
  dueDate: string | null
  pic: User[]
  members: CampaignMember[]
  websiteId: number | undefined
  coupons: string[]
  adminUsers: User[]
}
const memberColumns = computed(() => [
  {
    title: t('newEmailCampaign.memberList.table.customerName'),
    dataIndex: 'fullName',
    key: 'fullName',
    width: '20%'
  },
  {
    title: t('newEmailCampaign.memberList.table.phoneNumber'),
    dataIndex: 'mainPhoneNumber',
    key: 'mainPhoneNumber',
    width: '20%'
  },
  {
    title: t('newEmailCampaign.memberList.table.website'),
    dataIndex: 'websiteName',
    key: 'websiteName',
    width: '20%'
  },
  {
    title: t('newEmailCampaign.memberList.table.birthday'),
    dataIndex: 'birthday',
    key: 'birthday',
    width: '20%'
  },
  {
    title: t('newEmailCampaign.memberList.table.registeredTime'),
    dataIndex: 'registeredTime',
    key: 'registeredTime',
    width: '20%'
  },
  {
    title: t('newEmailCampaign.memberList.table.actions'),
    key: 'action',
    width: '10%'
  }
])

const rules = computed(() => ({
  name: [{ required: true, message: t('newEmailCampaign.form.name.required') }],
  startDate: [{ required: true, message: t('newEmailCampaign.form.time.required') }],
  pic: [{ required: true, message: t('newEmailCampaign.form.pic.required') }],
  websiteId: [{ required: true, message: t('newEmailCampaign.form.website.required') }]
}))

const props = defineProps<{
  visible: boolean
  campaign?: Campaign
}>()

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void
  (e: 'save', data: Partial<Campaign>): void
  (e: 'cancel'): void
}>()

const router = useRouter()
const formRef = ref()
const showMemberModal = ref(false)
const dateRange = ref<[Dayjs, Dayjs] | null>(null)

// States for form
const formState = reactive<NewCampaign>({
  name: '',
  description: '',
  startDate: null,
  dueDate: null,
  pic: [],
  websiteId: undefined,
  members: [],
  coupons: [],
  adminUsers: []
})

// States for table
const searchText = ref<string>('')
const pagination = reactive({
  current: 1,
  pageSize: 5,
  total: 0
})

// States for coupons
const couponOptions = ref<{ label: string; value: string }[]>([])
const loadingCoupons = ref<boolean>(false)

// Add new state for admin users
// const adminUsers = ref<{ id: string; name: string }[]>([]);
const loadingAdmins = ref(false)

// Add function to fetch admin users
const fetchAdminUsers = async () => {
  try {
    loadingAdmins.value = true
    const response = await membershipAPI.getAdminUsers()
    formState.adminUsers = response.data.data.map((admin: any) => ({
      id: admin.userId,
      name: admin.fullName || admin.email // Fallback to email if no fullName
    }))
  } catch (error) {
    message.error(t('newEmailCampaign.messages.error.fetchAdmins'))
  } finally {
    loadingAdmins.value = false
  }
}

const handleSubmit = async () => {
  const previousRoute = router.options.history.state.back
  console.log('Previous route:', router.resolve(previousRoute).name)
  try {
    await formRef.value.validate()
    if (formState.members.length === 0) {
      message.error(t('newEmailCampaign.messages.selectMember'))
      return
    }
  } catch (error) {
    console.error('Validation failed:', error)
    return
  }
  try {
    const previousRouteName = router.resolve(router.options.history.state.back).name
    let payload = {
      campaignName: formState.name,
      description: formState.description,
      startDate: formState.startDate,
      dueDate: formState.dueDate,
      membershipIds: formState.members.map((member: any) => member.id),
      websiteID: formState.websiteId,
      coupons: formState.coupons.map((coupon) => ({ couponCode: coupon })),
      employeePermissions: formState.pic.map((userId) => ({
        employeeId: userId,
        permissionLevel: 'edit'
      })),
      ...(previousRouteName === 'MailCampaign' && { isServiceEmail: true }),
      ...(previousRouteName === 'CallCampaign' && { isServiceCall: true })
    }

    // TODO: refactor
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/membership/update/create-campaign`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${useAuthStore().token}`
        }
      }
    )
    // await mailCampaignService.createCampaign(payload);

    message.success(t('newEmailCampaign.messages.success'))
    router.back()
  } catch (error) {
    message.error(t('newEmailCampaign.messages.error.default'))
  }
}

const handleBack = () => {
  router.back()
}

const showAddMemberModal = () => {
  showMemberModal.value = true
}

const handleMemberSelect = (members: CampaignMember[]) => {
  const existingMemberIds = new Set(formState.members.map((member) => member.id))
  const newMembers = members.filter((member) => !existingMemberIds.has(member.id))
  formState.members = [...formState.members, ...newMembers]
}

const removeMember = (member: CampaignMember) => {
  formState.members = formState.members.filter((m) => m.id !== member.id)
}

const onDateRangeChange = (dates: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
  if (dates) {
    formState.startDate = dateStrings[0]
    formState.dueDate = dateStrings[1]
  } else {
    formState.startDate = null
    formState.dueDate = null
  }
}

const fetchCoupons = async (search?: string) => {
  if (!formState.websiteId) return

  try {
    loadingCoupons.value = true
    const response = await membershipAPI.getCoupons(
      formState.websiteId,
      1, // pageIndex
      10, // pageSize
      search
    )

    couponOptions.value = response.data.data.map((coupon: any) => ({
      label: coupon.code,
      value: coupon.code
    }))
  } catch (error) {
    message.error(t('newEmailCampaign.messages.error.fetchCoupons'))
    // message.error('Cannot load coupon list');
  } finally {
    loadingCoupons.value = false
  }
}

const handleWebsiteChange = () => {
  formState.coupons = []
  couponOptions.value = []
  if (formState.websiteId) {
    fetchCoupons()
  }
}

const handleSearchCoupons = debounce((value: string) => {
  fetchCoupons(value)
}, 300)

// Call fetchMembers when component is mounted
onMounted(() => {
  fetchCoupons()
  fetchAdminUsers()
})

// Update the table configuration
const tableConfig = computed(() => ({
  pagination: {
    ...pagination,
    showSizeChanger: true,
    showTotal: (total: number) =>
      t('newEmailCampaign.memberList.total', { total: formState.members.length }),
    pageSizeOptions: ['5', '10', '20'],
    onChange: (page: number, pageSize: number) => {
      pagination.current = page
      pagination.pageSize = pageSize
    }
  }
}))

// Watch for campaign prop changes to update form
watch(
  () => props.campaign,
  (newCampaign) => {
    if (newCampaign) {
      Object.assign(formState, {
        name: newCampaign.name,
        startDate: newCampaign.startDate,
        dueDate: newCampaign.dueDate,
        pic: newCampaign.pic,
        members: [...newCampaign.members]
      })
    }
  },
  { immediate: true }
)

const disabledDate = (current: dayjs.Dayjs) => {
  // Disable dates before today
  return current && current < dayjs().startOf('day')
}
</script>

<style scoped>
.custom-input-clear :deep(.ant-input-clear-icon) {
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
