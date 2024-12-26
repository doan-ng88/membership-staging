<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">Create New Discount Code</h2>

      <a-form :model="formData" @finish="handleSubmit" class="bg-white p-6 rounded-lg shadow">
        <!-- Basic Information -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <a-form-item label="Website" required>
            <a-select v-model:value="formData.websiteId" style="width: 100%" placeholder="Select website">
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item label="Discount Code" required>
            <a-input v-model:value="formData.CouponCode" placeholder="Enter discount code" />
          </a-form-item>

          <a-form-item label="Description">
            <a-textarea 
              v-model:value="formData.Description" 
              placeholder="Describe the discount code"
              :auto-size="{ minRows: 2, maxRows: 6 }" 
            />
          </a-form-item>
        </div>

        <!-- Discount Type -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Discount Type</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Discount Method" required>
              <a-select v-model:value="formData.DiscountType">
                <a-select-option value="percent">Percentage Discount</a-select-option>
                <a-select-option value="fixed_cart">Fixed Amount Cart Discount</a-select-option>
                <a-select-option value="fixed_product">Fixed Amount Product Discount</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="Discount Value" required>
              <a-input-number v-model:value="formData.DiscountAmount" :min="0"
                :max="formData.DiscountType === 'percent' ? 100 : 999999999999"
                :formatter="(value: number) => formData.DiscountType === 'percent' ? `${value}%` : formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" style="width: 100%" />
            </a-form-item>
          </div>
        </div>

        <!-- Usage Conditions -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Usage Conditions</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Minimum Order Value">
              <a-input-number v-model:value="formData.MinimumAmount"
                :formatter="(value: number) => formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" :min="0" :max="999999999999"
                style="width: 100%" />
            </a-form-item>

            <a-form-item label="Maximum Order Value">
              <a-input-number v-model:value="formData.MaximumAmount" :min="0" :max="999999999999"
                :formatter="(value: number) => formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" style="width: 100%" />
            </a-form-item>

            <a-form-item label="Maximum Usage Limit">
              <a-input-number v-model:value="formData.UsageLimit" :min="1" style="width: 100%" />
            </a-form-item>

            <a-form-item label="Usage Limit Per Customer">
              <a-input-number v-model:value="formData.UsageLimitPerUser" :min="1" style="width: 100%" />
            </a-form-item>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <a-form-item>
              <a-checkbox v-model:checked="formData.IndividualUse">
                Cannot be used with other discount codes
              </a-checkbox>
            </a-form-item>

            <a-form-item>
              <a-checkbox v-model:checked="formData.ExcludesSaleItems">
                Not applicable to sale items
              </a-checkbox>
            </a-form-item>
          </div>
        </div>

        <!-- Validity Period -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Validity Period</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Start Date" required>
              <a-date-picker v-model:value="formData.StartDate" format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
            
            <a-form-item label="Expiry Date" required>
              <a-date-picker v-model:value="formData.ExpiryDate" :disabledDate="disabledDate" format="YYYY-MM-DD" style="width: 100%" />
            </a-form-item>
          </div>
        </div>

        <!-- Scope of Application -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">Scope of Application</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item label="Applicable Products">
              <a-select v-model:value="formData.ProductIds" mode="multiple" placeholder="Search and select products"
                :options="productOptions" :loading="loadingProducts" show-search :filter-option="false"
                @search="handleSearchProducts" style="width: 100%" option-label-prop="label">
              </a-select>
            </a-form-item>

            <a-form-item label="Applicable Categories">
              <a-select v-model:value="formData.ProductCategories" mode="multiple" placeholder="Search and select categories"
                :options="categoryOptions" :loading="loadingCategories" show-search :filter-option="false"
                @search="handleSearchCategories" style="width: 100%" option-label-prop="label">
              </a-select>
            </a-form-item>

            <a-form-item label="Excluded Products">
              <a-select v-model:value="formData.ExcludeProductIds" mode="multiple" 
                placeholder="Search and select excluded products"
                :options="productOptions" 
                :loading="loadingProducts" 
                show-search 
                :filter-option="false"
                @search="handleSearchProducts" 
                style="width: 100%" 
                option-label-prop="label">
              </a-select>
            </a-form-item>

            <a-form-item label="Excluded Categories">
              <a-select v-model:value="formData.ExcludeCategories" mode="multiple" 
                placeholder="Search and select excluded categories"
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
            Create Discount Code
          </a-button>
        </div>
      </a-form>
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

        // Validate
        if (!formData.websiteId) {
          message.error('Please select a website')
          return
        }

        if (!formData.CouponCode) {
          message.error('Please enter discount code')
          return
        }

        if (!formData.ExpiryDate) {
          message.error('Please select expiry date')
          return
        }

        const payload = {
          ...formData,
          ExpiryDate: dayjs(formData.ExpiryDate).format('YYYY-MM-DD')
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
          throw new Error('Failed to create coupon')
        }

        message.success('Discount code created successfully')
        // Reset form
        Object.assign(formData, {
          websiteId: undefined,
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
          ProductIds: [],
          ExcludeProductIds: [],
          ProductCategories: [],
          ExcludeCategories: [],
          AllowedEmails: [],
          StartDate: null,
          ExpiryDate: null,
          FreeProductIds: [],
        })
      } catch (error) {
        console.error('Error creating coupon:', error)
        message.error('Unable to create discount code')
      } finally {
        loading.value = false
        router.push('/pro-coupon-voucher/usage-history')
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
        message.error('Unable to load product list')
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
          label: `${category.name} (${category.count || 0} products)`,
          value: category.id
        }))
      } catch (error) {
        console.error('Error fetching categories:', error)
        message.error('Unable to load category list')
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
      handleImageError
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
