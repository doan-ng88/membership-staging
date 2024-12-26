<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Permission Management</h2>

      <!-- Display warning if not admin -->
      <div v-if="!isAdmin" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <div class="flex items-center">
          <ExclamationCircleOutlined class="text-yellow-500 mr-2" />
          <span class="text-yellow-700">
            You don't have permission to access this page. Please contact an administrator.
          </span>
        </div>
      </div>

      <!-- Main content only shown to admin -->
      <div v-else class="bg-white p-6 rounded-lg shadow">
        <a-table 
          :columns="columns" 
          :data-source="users"
          :loading="loading"
          :pagination="false"
          class="mb-4"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'fullName'">
              <span>{{ record.fullName || 'Not updated' }}</span>
            </template>

            <template v-if="column.key === 'role'">
              <a-select
                v-model:value="record.role"
                style="width: 120px"
                @change="(value: string) => handleRoleChange(record, value)"
              >
                <a-select-option value="admin">Admin</a-select-option>
                <a-select-option value="manager">Manager</a-select-option>
                <a-select-option value="staff">Staff</a-select-option>
                <a-select-option value="reporter">Reporter</a-select-option>
                <a-select-option value="not_assign">Not Assign</a-select-option>
              </a-select>
            </template>
          </template>
        </a-table>

        <div class="flex justify-end">
          <a-button type="primary" @click="handleSubmit" :loading="submitting">
            Save Changes
          </a-button>
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'PermissionManagementView',
  components: {
    DefaultLayout,
    ExclamationCircleOutlined
  },
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()
    const loading = ref(false)
    const submitting = ref(false)
    const users = ref([])
    const changedRoles = ref(new Map())

    // Check admin permission
    const isAdmin = computed(() => true)

    // Redirect if not admin
    onMounted(() => {
      if (!isAdmin.value) {
        message.error('You don\'t have permission to access this page')
        router.push('/') // Redirect to home page
        return
      }
      fetchUsers()
    })

    const columns = [
      {
        title: 'ID',
        dataIndex: 'userId',
        key: 'userId',
        width: '80px'
      },
      {
        title: 'Full Name',
        dataIndex: 'fullName',
        key: 'fullName'
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email'
      },
      {
        title: 'Permission',
        dataIndex: 'role',
        key: 'role',
        width: '150px'
      }
    ]

    const fetchUsers = async () => {
      if (!isAdmin.value) return

      try {
        loading.value = true
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/membership/get/admin-role`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`
            }
          }
        )
        if (!response.ok) throw new Error('Failed to fetch users')
        const result = await response.json()
        users.value = result.data
      } catch (error) {
        console.error('Error fetching users:', error)
        message.error('Unable to load user list')
      } finally {
        loading.value = false
      }
    }

    const handleRoleChange = (user: any, newRole: string) => {
      if (!isAdmin.value) return
      changedRoles.value.set(user.userId, newRole)
    }

    const handleSubmit = async () => {
      if (!isAdmin.value) {
        message.error('You don\'t have permission to perform this action')
        return
      }

      if (changedRoles.value.size === 0) {
        message.info('No changes to save')
        return
      }

      try {
        submitting.value = true
        const userRoleSystem = Array.from(changedRoles.value).map(([userID, role]) => ({
          userID: Number(userID),
          role
        }))

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/membership/update/permission-system`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userRoleSystem })
          }
        )

        if (!response.ok) throw new Error('Failed to update permissions')

        message.success('Permissions updated successfully')
        changedRoles.value.clear()
        await fetchUsers() // Refresh data
      } catch (error) {
        console.error('Error updating permissions:', error)
        message.error('Unable to update permissions')
      } finally {
        submitting.value = false
      }
    }

    return {
      loading,
      submitting,
      users,
      columns,
      handleRoleChange,
      handleSubmit,
      isAdmin
    }
  }
})
</script> 