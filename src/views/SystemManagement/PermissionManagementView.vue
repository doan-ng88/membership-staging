<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Quản Lý Phân Quyền</h2>

      <!-- Hiển thị cảnh báo nếu không phải admin -->
      <div v-if="!isAdmin" class="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6">
        <div class="flex items-center">
          <ExclamationCircleOutlined class="text-yellow-500 mr-2" />
          <span class="text-yellow-700">
            Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên.
          </span>
        </div>
      </div>

      <!-- Nội dung chính chỉ hiển thị cho admin -->
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
              <span>{{ record.fullName || 'Chưa cập nhật' }}</span>
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
            Lưu thay đổi
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

    // Kiểm tra quyền admin
    const isAdmin = computed(() => true)

    // Chuyển hướng nếu không phải admin
    onMounted(() => {
      if (!isAdmin.value) {
        message.error('Bạn không có quyền truy cập trang này')
        router.push('/') // Chuyển về trang chủ
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
        title: 'Họ Tên',
        dataIndex: 'fullName',
        key: 'fullName'
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email'
      },
      {
        title: 'Phân Quyền',
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
        message.error('Không thể tải danh sách người dùng')
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
        message.error('Bạn không có quyền thực hiện thao tác này')
        return
      }

      if (changedRoles.value.size === 0) {
        message.info('Không có thay đổi nào để lưu')
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

        message.success('Cập nhật phân quyền thành công')
        changedRoles.value.clear()
        await fetchUsers() // Refresh data
      } catch (error) {
        console.error('Error updating permissions:', error)
        message.error('Không thể cập nhật phân quyền')
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