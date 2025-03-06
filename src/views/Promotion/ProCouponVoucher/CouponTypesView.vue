<template>
  <DefaultLayout>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-6">{{ t('couponTypes.title') }}</h2>

      <a-form :model="formData" @finish="handleSubmit" class="bg-white p-6 rounded-lg shadow">
        <!-- Basic Information -->
        <div class="grid grid-cols-2 gap-6 mb-6">
          <a-form-item :label="t('couponTypes.form.basicInfo.website.label')" required>
            <a-select 
              v-model:value="formData.websiteId" 
              style="width: 100%" 
              :placeholder="t('couponTypes.form.basicInfo.website.placeholder')"
            >
              <a-select-option v-for="web in websites" :key="web.websiteId" :value="web.websiteId">
                {{ web.name }}
              </a-select-option>
            </a-select>
          </a-form-item>

          <a-form-item :label="t('couponTypes.form.basicInfo.code.label')" required>
            <a-input 
              v-model:value="formData.CouponCode" 
              :placeholder="t('couponTypes.form.basicInfo.code.placeholder')" 
            />
          </a-form-item>

          <a-form-item :label="t('couponTypes.form.basicInfo.description.label')">
            <a-textarea 
              v-model:value="formData.Description" 
              :placeholder="t('couponTypes.form.basicInfo.description.placeholder')"
              :auto-size="{ minRows: 2, maxRows: 6 }" 
            />
          </a-form-item>
        </div>

        <!-- Discount Type -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ t('couponTypes.form.discountType.title') }}</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item :label="t('couponTypes.form.discountType.type.label')" required>
              <a-select v-model:value="formData.DiscountType">
                <a-select-option value="percent">{{ t('couponTypes.form.discountType.type.options.percent') }}</a-select-option>
                <a-select-option value="fixed_cart">{{ t('couponTypes.form.discountType.type.options.fixed_cart') }}</a-select-option>
                <a-select-option value="fixed_product">{{ t('couponTypes.form.discountType.type.options.fixed_product') }}</a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item :label="t('couponTypes.form.discountType.value.label')" required>
              <a-input-number 
                v-model:value="formData.DiscountAmount" 
                :min="0"
                :max="formData.DiscountType === 'percent' ? 100 : 999999999999"
                :formatter="(value: number) => formData.DiscountType === 'percent' ? `${value}%` : formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" 
                style="width: 100%" 
              />
            </a-form-item>
          </div>
        </div>

        <!-- Usage Conditions -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ t('couponTypes.form.conditions.title') }}</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item :label="t('couponTypes.form.conditions.minAmount.label')">
              <a-input-number 
                v-model:value="formData.MinimumAmount"
                :formatter="(value: number) => formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" 
                :min="0" 
                :max="999999999999"
                style="width: 100%" 
              />
            </a-form-item>

            <a-form-item :label="t('couponTypes.form.conditions.maxAmount.label')">
              <a-input-number 
                v-model:value="formData.MaximumAmount" 
                :min="0" 
                :max="999999999999"
                :formatter="(value: number) => formatCurrency(value)"
                :parser="(value: string) => value!.replace(/\D/g, '')" 
                style="width: 100%" 
              />
            </a-form-item>

            <a-form-item :label="t('couponTypes.form.conditions.usageLimit.label')">
              <a-input-number 
                v-model:value="formData.UsageLimit" 
                :min="1" 
                style="width: 100%" 
              />
            </a-form-item>

            <a-form-item :label="t('couponTypes.form.conditions.usageLimitPerUser.label')">
              <a-input-number 
                v-model:value="formData.UsageLimitPerUser" 
                :min="1" 
                style="width: 100%" 
              />
            </a-form-item>
          </div>

          <div class="grid grid-cols-2 gap-6">
            <a-form-item>
              <a-checkbox v-model:checked="formData.IndividualUse">
                {{ t('couponTypes.form.conditions.individualUse') }}
              </a-checkbox>
            </a-form-item>

            <a-form-item>
              <a-checkbox v-model:checked="formData.ExcludesSaleItems">
                {{ t('couponTypes.form.conditions.excludesSale') }}
              </a-checkbox>
            </a-form-item>
          </div>
        </div>

        <!-- Validity Period -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ t('couponTypes.form.validity.title') }}</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item :label="t('couponTypes.form.validity.startDate.label')" required>
              <a-date-picker 
                v-model:value="formData.StartDate" 
                format="YYYY-MM-DD" 
                :disabledDate="disabledStartDate"
                style="width: 100%" 
              />
            </a-form-item>
            
            <a-form-item :label="t('couponTypes.form.validity.expiryDate.label')" required>
              <a-date-picker 
                v-model:value="formData.ExpiryDate" 
                :disabledDate="disabledDate" 
                format="YYYY-MM-DD" 
                style="width: 100%" 
              />
            </a-form-item>
          </div>
        </div>

        <!-- Application Scope -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-4">{{ t('couponTypes.form.scope.title') }}</h3>
          <div class="grid grid-cols-2 gap-6">
            <a-form-item :label="t('couponTypes.form.scope.products.label')">
              <a-select
                v-model:value="formData.ProductIds"
                mode="multiple"
                :disabled="!formData.websiteId"
                :placeholder="formData.websiteId 
                  ? t('couponTypes.form.scope.products.placeholder')
                  : ' ' + t('couponTypes.form.scope.products.placeholderPleaseChooseWebsite')"
                :options="productOptions" 
                :loading="loadingProducts" 
                show-search 
                :filter-option="false"
                @search="handleSearchProducts" 
                style="width: 100%" 
                option-label-prop="label"
              >
              </a-select>
              <div v-if="!formData.websiteId" class="ant-form-item-explain ant-form-item-explain-error">
                <div class="ant-form-item-explain-error">{{ t('couponTypes.form.scope.products.chooseWebsiteFirstChooseProducts') }}</div>
              </div>
            </a-form-item>

            <a-form-item :label="t('couponTypes.form.scope.categories.label')">
              <a-select
                v-model:value="formData.ProductCategories"
                mode="multiple"
                :disabled="!formData.websiteId"
                :placeholder="formData.websiteId 
                  ? t('couponTypes.form.scope.categories.placeholder')
                  : ' ' + t('couponTypes.form.scope.categories.placeholderPleaseChooseWebsite')"
                :options="categoryOptions" 
                :loading="loadingCategories" 
                show-search 
                :filter-option="false"
                @search="handleSearchCategories" 
                style="width: 100%" 
                option-label-prop="label"
              >
              </a-select>
              <div v-if="!formData.websiteId" class="ant-form-item-explain ant-form-item-explain-error">
                <div class="ant-form-item-explain-error">{{ t('couponTypes.form.scope.categories.chooseWebsiteFirstChooseCategories') }}</div>
              </div>
            </a-form-item>

            <a-form-item :label="t('couponTypes.form.scope.excludeProducts.label')">
              <a-select
                v-model:value="formData.ExcludeProductIds"
                mode="multiple"
                :disabled="!formData.websiteId"
                :placeholder="formData.websiteId 
                  ? t('couponTypes.form.scope.excludeProducts.placeholder')
                  : ' ' + t('couponTypes.form.scope.excludeProducts.placeholderPleaseChooseWebsite')"
                :options="productOptions" 
                :loading="loadingProducts" 
                show-search 
                :filter-option="false"
                @search="handleSearchProducts" 
                style="width: 100%" 
                option-label-prop="label"
              >
              </a-select>
              <div v-if="!formData.websiteId" class="ant-form-item-explain ant-form-item-explain-error">
                <div class="ant-form-item-explain-error">{{ t('couponTypes.form.scope.excludeProducts.chooseWebsiteFirstChooseExcludeProducts') }}</div>
              </div>
            </a-form-item>

            <a-form-item :label="t('couponTypes.form.scope.excludeCategories.label')">
              <a-select
                v-model:value="formData.ExcludeCategories"
                mode="multiple"
                :disabled="!formData.websiteId"
                :placeholder="formData.websiteId 
                  ? t('couponTypes.form.scope.excludeCategories.placeholder')
                  : ' ' + t('couponTypes.form.scope.excludeCategories.placeholderPleaseChooseWebsite')"
                :options="categoryOptions" 
                :loading="loadingCategories" 
                show-search 
                :filter-option="false"
                @search="handleSearchCategories" 
                style="width: 100%" 
                option-label-prop="label"
              >
              </a-select>
              <div v-if="!formData.websiteId" class="ant-form-item-explain ant-form-item-explain-error">
                <div class="ant-form-item-explain-error">{{ t('couponTypes.form.scope.excludeCategories.chooseWebsiteFirstChooseExcludeCategories') }}</div>
              </div>
            </a-form-item>

            <a-form-item 
              :label="t('couponTypes.form.allowedEmails.label')"
              :rules="rules.allowedEmails"
            >
              <a-select
                v-model:value="formData.allowedEmails"
                mode="tags"
                :placeholder="t('couponTypes.form.allowedEmails.placeholder')"
                :token-separators="[',', ';']"
                style="width: 100%"
                show-search
                :filter-option="false"
                @search="handleSearchEmails"
              >
                <a-select-option 
                  v-for="email in emailOptions"
                  :key="email.value"
                  :value="email.value"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-medium">{{ email.label }}</span>
                  </div>
                </a-select-option>
              </a-select>
            </a-form-item>
          </div>
        </div>

        <div class="flex justify-end">
          <a-button type="primary" html-type="submit" :loading="loading">
            {{ t('couponTypes.buttons.create') }}
          </a-button>
        </div>
      </a-form>

      <div v-if="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
        <p class="text-red-600">{{ errorMessage }}</p>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nGlobal   } from '@/i18n'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { useAuthStore } from '@/stores/auth'
import DefaultLayout from '@/layouts/DefaultLayout.vue'

const { t } = useI18nGlobal()
const router = useRouter()
const authStore = useAuthStore()

const websites = ref([])
const loading = ref(false)
const errorMessage = ref('')

const formData = reactive({
  websiteId: undefined,
  CouponCode: '',
  Description: '',
  DiscountType: 'percent',
  DiscountAmount: 0,
  MinimumAmount: 0,
  MaximumAmount: 0,
  UsageLimit: 1,
  UsageLimitPerUser: 1,
  IndividualUse: false,
  ExcludesSaleItems: false,
  StartDate: null,
  ExpiryDate: null,
  ProductIds: [],
  ProductCategories: [],
  ExcludeProductIds: [],
  ExcludeCategories: [],
  allowedEmails: [] as string[],
})

const rules = {
  allowedEmails: [
    {
      validator: (_: any, value: string[]) => {
        if (value.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
          return Promise.reject('Chứa email không hợp lệ')
        }
        return Promise.resolve()
      }
    }
  ]
}

const fetchWebsites = async () => {
  try {
    loading.value = true
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/websites`,
      {
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        }
      }
    )
    if (!response.ok) {
      throw new Error('Failed to fetch websites')
    }
    const data = await response.json()
    websites.value = data.websites
  } catch (error) {
    console.error('Error fetching websites:', error)
    message.error(t('couponTypes.messages.error.loadWebsites'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchWebsites()
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
  return current && current < dayjs().startOf('day')
}

const disabledStartDate = (current: dayjs.Dayjs) => {
  return current && current < dayjs().startOf('day');
};

const handleSubmit = async () => {
  try {
    if (!formData.websiteId) {
      errorMessage.value = t('couponTypes.messages.error.websiteRequired')
      return
    }

    if (!formData.CouponCode) {
      errorMessage.value = t('couponTypes.messages.error.codeRequired')
      return
    }

    if (!formData.ExpiryDate) {
      errorMessage.value = t('couponTypes.messages.error.expiryDateRequired')
      return
    }

    // Validate manual
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const invalidEmails = formData.allowedEmails.filter(
      email => !emailRegex.test(email)
    )
    
    if (invalidEmails.length > 0) {
      throw new Error(
        `${t('couponTypes.messages.error.invalidEmail')}: ${invalidEmails.join(', ')}`
      )
    }

    loading.value = true
    errorMessage.value = '' // Reset error message

    const payload = {
      ...formData,
      ExpiryDate: dayjs(formData.ExpiryDate).format('YYYY-MM-DD'),
      StartDate: dayjs(formData.StartDate).format('YYYY-MM-DD'),
      allowed_emails: formData.allowedEmails,
    }

    console.log('Request Payload:', payload);

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

    const data = await response.json()
    console.log('Response Data:', data);

    message.success(t('couponTypes.messages.success.created'))
    router.push('/pro-coupon-voucher/usage-history')

  } catch (error: any) {
    console.error('Error creating coupon:', error)
    errorMessage.value = error.message || t('couponTypes.messages.error.createFailed')
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
    message.error(t('couponTypes.messages.error.loadProducts'))
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
    message.error(t('couponTypes.messages.error.loadCategories'))
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

const emailOptions = ref<{label: string, value: string}[]>([])
const loadingEmails = ref(false)

const fetchEmails = async (search = '') => {
  try {
    loadingEmails.value = true;

    // Tạo payload theo đúng format API
    const payload = {
      sortField: "MembershipsWebsitesId",
      sortType: "ASC",
      pageSize: 10,
      pageIndex: 1,
      searchParams: search ? [
        {
          key: "email", // Field cần search
          value: search,
          operator: "CONTAINS" // Hoặc operator phù hợp
        }
      ] : []
    };

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/membership/get/get-membership-list`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Lỗi khi tải danh sách email');
    }

    const data = await response.json();
    
    // Xử lý dữ liệu trả về
    emailOptions.value = data.data.map((member: any) => ({
      label: member.email,
      value: member.email
    }));

  } catch (error) {
    console.error('Lỗi khi tải email:', error);
    message.error(error.message || 'Không thể tải danh sách email');
  } finally {
    loadingEmails.value = false;
  }
};

// Thêm debounce cho search
const handleSearchEmails = debounce((value: string) => {
  if (value) {
    fetchEmails(value);
  }
}, 500);

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
