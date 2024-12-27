<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Tạo Mã Giảm Giá Mới</h2>

      <a-form :model="formData" @finish="handleSubmit" class="bg-white p-6 rounded-lg shadow">
        <!-- Thông tin cơ bản -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <a-form-item label="Website" required>
            <a-select v-model:value="formData.websiteId" style="width: 100%" placeholder="Chọn website">
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Mã giảm giá" required>
            <a-input v-model:value="formData.CouponCode" placeholder="Nhập mã giảm giá" />
          </a-form-item>

          <a-form-item label="Mô tả">
            <a-textarea 
              v-model:value="formData.Description" 
              placeholder="Mô tả mã giảm giá"
              :auto-size="{ minRows: 2, maxRows: 6 }" 
            />
          </a-form-item>
        </div>

        <!-- Loại giảm giá -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Loại giảm giá</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Hình thức giảm giá" required>
              <a-select v-model:value="formData.DiscountType">
                <a-select-option value="percent">Giảm theo phần trăm</a-select-option>
                <a-select-option value="fixed_cart">Giảm số tiền cố định trên giỏ hàng</a-select-option>
                <a-select-option value="fixed_product">Giảm số tiền cố định trên sản phẩm</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Giá trị giảm" required>
              <a-input-number v-model:value="formData.DiscountAmount" :min="0"
                :max="formData.DiscountType === 'percent' ? 100 : 999999999999"
                :formatter="(value: number) => formData.DiscountType === 'percent' ? `${value}%` : formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" style="width: 100%" />
            </a-form-item>
          </div>
        </div>

        <!-- Điều kiện sử dụng -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Điều kiện sử dụng</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Giá trị đơn hàng tối thiểu">
              <a-input-number v-model:value="formData.MinimumAmount"
                :formatter="(value: number) => formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" :min="0" :max="999999999999"
                style="width: 100%" />
            </a-form-item>

            <a-form-item label="Giá trị đơn hàng tối đa">
              <a-input-number v-model:value="formData.MaximumAmount" :min="0" :max="999999999999"
                :formatter="(value: number) => formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" style="width: 100%" />
            </a-form-item>

            <a-form-item label="Số lần sử dụng tối đa">
              <a-input-number v-model:value="formData.UsageLimit" :min="1" style="width: 100%" />
            </a-form-item>

            <a-form-item label="Giới hạn mỗi khách hàng">
              <a-input-number v-model:value="formData.UsageLimitPerUser" :min="1" style="width: 100%" />
            </a-form-item>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <a-form-item>
              <a-checkbox v-model:checked="formData.IndividualUse">
                Không được dùng chung với mã giảm giá khác
              </a-checkbox>
            </a-form-item>

            <a-form-item>
              <a-checkbox v-model:checked="formData.ExcludesSaleItems">
                Không áp dụng cho sản phẩm đang giảm giá
              </a-checkbox>
            </a-form-item>
          </div>
        </div>

        <!-- Thời gian hiệu lực -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Thời gian hiệu lực</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Ngày bắt đầu" required>
              <a-date-picker v-model:value="formData.StartDate" format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
            
            <a-form-item label="Ngày hết hạn" required>
              <a-date-picker v-model:value="formData.ExpiryDate" :disabledDate="disabledDate" format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </div>
        </div>

        <!-- Phạm vi áp dụng -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Phạm vi áp dụng</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Sản phẩm được áp dụng">
              <a-select v-model:value="formData.ProductIds" mode="multiple" placeholder="Tìm và chọn sản phẩm"
                :options="productOptions" :loading="loadingProducts" show-search :filter-option="false"
                @search="handleSearchProducts" style="width: 100%" option-label-prop="label">
              </a-select>
            </a-form-item>

            <a-form-item label="Danh mục được áp dụng">
              <a-select v-model:value="formData.ProductCategories" mode="multiple" placeholder="Tìm và chọn danh mục"
                :options="categoryOptions" :loading="loadingCategories" show-search :filter-option="false"
                @search="handleSearchCategories" style="width: 100%" option-label-prop="label">
              </a-select>
            </a-form-item>

            <a-form-item label="Sản phẩm loại trừ">
              <a-select v-model:value="formData.ExcludeProductIds" mode="multiple" 
                placeholder="Tìm và chọn sản phẩm loại trừ"
                :options="productOptions" 
                :loading="loadingProducts" 
                show-search 
                :filter-option="false"
                @search="handleSearchProducts" 
                style="width: 100%" 
                option-label-prop="label">
              </a-select>
            </a-form-item>

            <a-form-item label="Danh mục loại trừ">
              <a-select v-model:value="formData.ExcludeCategories" mode="multiple" 
                placeholder="Tìm và chọn danh mục loại trừ"
                :options="categoryOptions" 
                :loading="loadingCategories" 
                show-search 
                :filter-option="false"
                @search="handleSearchCategories" 
                style="width: 100%" 
                option-label-prop="label">
              </a-select>
            </a-form-item>
          </div>
        </div>

        <div class="flex justify-end">
          <a-button type="primary" html-type="submit" :loading="loading">
            Tạo mã giảm giá
          </a-button>
        </div>
      </a-form>

      <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600">{{ errorMessage }}</p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, watch } from 'vue'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import { useAuthStore } from '@/stores/auth'
import { websites } from '@/api/types/website'
import { debounce } from 'lodash'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'CreateCouponView',

  components: {
    DefaultLayout
  },

  setup() {
    const authStore = useAuthStore()
    const loading = ref(false)
    const router = useRouter()
    const errorMessage = ref('')

    const formData = reactive({
      websiteId: undefined as number | undefined,
      CouponCode: '',
      Description: '',
      DiscountType: 'percent',
      DiscountAmount: 0,
      IndividualUse: false,
      ExcludesSaleItems: false,
      MinimumAmount: 0,
      MaximumAmount: 0,
      UsageLimit: 1,
      UsageLimitPerUser: 1,
      ProductIds: [] as number[],
      ExcludeProductIds: [] as number[],
      ProductCategories: [] as number[],
      ExcludeCategories: [] as number[],
      AllowedEmails: [] as string[],
      StartDate: null as any,
      ExpiryDate: null as any,
      FreeProductIds: [] as number[],
    })

    // Mock data - Thay thế bằng API call thực tế
    const products = ref([
      { id: 1, name: 'Sản phẩm 1' },
      { id: 2, name: 'Sản phẩm 2' }
    ])

    const categories = ref([
      { id: 1, name: 'Danh mục 1' },
      { id: 2, name: 'Danh mục 2' }
    ])

    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value)
    }

    const disabledDate = (current: dayjs.Dayjs) => {
      return current && current < dayjs().endOf('day')
    }

    const handleSubmit = async () => {
      try {
        loading.value = true
        errorMessage.value = '' // Reset error message

        // Validate
        if (!formData.websiteId) {
          errorMessage.value = 'Vui lòng chọn website'
          return
        }

        if (!formData.CouponCode) {
          errorMessage.value = 'Vui lòng nhập mã giảm giá'
          return
        }

        if (!formData.ExpiryDate) {
          errorMessage.value = 'Vui lòng chọn ngày hết hạn'
          return
        }

        const payload = {
          ...formData,
          ExpiryDate: dayjs(formData.ExpiryDate).format('YYYY-MM-DD'),
          StartDate: dayjs(formData.StartDate).format('YYYY-MM-DD')
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/membership/update/create-coupon`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Không thể tạo mã giảm giá')
        }

        message.success('Tạo mã giảm giá thành công')
        router.push('/pro-coupon-voucher/usage-history')

      } catch (error: any) {
        console.error('Error creating coupon:', error)
        errorMessage.value = error.message || 'Có lỗi xảy ra khi tạo mã giảm giá'
      } finally {
        loading.value = false
      }
    }

    const productOptions = ref([])
    const categoryOptions = ref([])
    const loadingProducts = ref(false)
    const loadingCategories = ref(false)

    const fetchProducts = async (search = '') => {
      if (!formData.websiteId) return

      try {
        loadingProducts.value = true
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/membership/get/products/${formData.websiteId}?search=${search}&limit=10`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        productOptions.value = data.products.map((product: any) => ({
          label: `${product.name} - ${formatCurrency(product.price || 0)}`,
          value: product.id,
          disabled: product.stock_status === 'outofstock'
        }))
      } catch (error) {
        console.error('Error fetching products:', error)
        message.error('Không thể tải danh sách sản phẩm')
      } finally {
        loadingProducts.value = false
      }
    }

    const fetchCategories = async (search = '') => {
      if (!formData.websiteId) return

      try {
        loadingCategories.value = true
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/membership/get/categories/${formData.websiteId}?search=${search}&limit=10`,
          {
            headers: {
              'Authorization': `Bearer ${authStore.token}`,
              'Content-Type': 'application/json'
            }
          }
        )
        if (!response.ok) {
          throw new Error('Failed to fetch categories')
        }
        const data = await response.json()
        categoryOptions.value = data.categories.map((category: any) => ({
          label: `${category.name} (${category.count || 0} sản phẩm)`,
          value: category.id
        }))
      } catch (error) {
        console.error('Error fetching categories:', error)
        message.error('Không thể tải danh sách danh mục')
      } finally {
        loadingCategories.value = false
      }
    }

    const handleSearchProducts = debounce((value: string) => {
      fetchProducts(value)
    }, 300)

    const handleSearchCategories = debounce((value: string) => {
      fetchCategories(value)
    }, 300)

    const handleImageError = (e: Event) => {
      const img = e.target as HTMLImageElement
      img.src = '/placeholder-image.png' // Thay thế bằng ảnh mặc định
    }

    watch(() => formData.websiteId, () => {
      if (formData.websiteId) {
        fetchProducts()
        fetchCategories()
      }
    })

    return {
      formData,
      loading,
      products,
      categories,
      websites,
      formatCurrency,
      disabledDate,
      handleSubmit,
      productOptions,
      categoryOptions,
      loadingProducts,
      loadingCategories,
      handleSearchProducts,
      handleSearchCategories,
      handleImageError,
      errorMessage
    }
  }
})
</script>

<style scoped>
.coupon-types {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.coupon-types h1 {
  text-align: center;
}

:deep(.ant-select-item-option-content img) {
  object-fit: cover;
  border-radius: 4px;
}
</style>
