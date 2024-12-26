<template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">Template Editor</h2>
        </template>
        <template #extra>
          <a-space>
            <a-upload accept=".docx" :showUploadList="false" :beforeUpload="handleWordUpload">
              <a-button class="flex items-center">
                <template #icon>
                  <upload-outlined />
                </template>
                Upload Word
              </a-button>
            </a-upload>

            <a-button class="flex items-center" @click="handleSendMail" :disabled="isSaving">
              <template #icon>
                <mail-outlined />
              </template>
              Select Campaigns/Members to Send Mail
            </a-button>

            <a-button class="flex items-center" type="primary" @click="handleCreateOrSaveTemplate" :disabled="isSaving">
              <template #icon>
                <SaveOutlined />
              </template>
              {{ isEdit ? 'Save Template' : 'Create Template' }}
            </a-button>
          </a-space>
        </template>
      </PageHeader>

      <div class="bg-white rounded-lg shadow p-6">
        <a-form-item class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Template Name
          </label>
          <a-input v-model:value="templateName" placeholder="Enter template name" :rules="[{ required: true, message: 'Please input template name' }]"/>
        </a-form-item>

        <!-- <a-form-item class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <a-input v-model:value="subject" placeholder="Enter email subject" :rules="[{ required: true, message: 'Please input email subject' }]"/>
        </a-form-item> -->

        <a-form-item class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <a-select
            v-model:value="templateType"
            placeholder="Select template type"
            :options="templateTypes.map(type => ({
              label: type.templateTypeName,
              value: type.templateTypeID
            }))"
            :loading="!templateTypes.length"
          />
        </a-form-item>

        <a-form-item class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <a-select
            v-model:value="templateCategory" 
            placeholder="Select category"
            :options="templateCategories.map(category => ({
              label: category.templateCategoryName,
              value: category.templateCategoryID
            }))"
            :loading="!templateCategories.length"
          />
        </a-form-item>

        <a-form-item class="mb-4">
          <a-switch 
            :checked="saveToElasticMail" 
            checked-children="Save to ElasticMail"
            un-checked-children="Not save" 
            @change="handleElasticMailChange"
          />
        </a-form-item>

        <div class="editor-container">
          <QuillEditor v-model:content="editorData" contentType="html" toolbar="full" theme="snow" @paste="handlePaste"
            @drop="handleDrop" />
        </div>
      </div>
    </div>

    <!-- First Drawer: Gửi Mail Template -->
    <a-drawer
      v-model:visible="showSendMailDrawer"
      @update:visible="handleCloseSendMailDrawer"
      title="Choose Campaign/Membership to send Mail Template"
      placement="right"
      width="80%"
      :footer="true"
    >
      <div class="flex items-center justify-between border-gray-200 mb-4">
        <div class="flex-1">
          <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane key="campaign" tab="Send by Campaign" />
            <a-tab-pane key="membership" tab="Send by Membership" />
          </a-tabs>
        </div>

        <div class="flex gap-2 pr-4">
          <a-upload
            accept=".xlsx,.xls"
            :showUploadList="false"
            :beforeUpload="handleExcelUpload"
          >
            <a-button class="flex items-center">
              <FileExcelOutlined class="flex-shrink-0" />
              <span class="ml-2">Upload Excel</span>
            </a-button>
          </a-upload>
        </div>
      </div>

      <div class="px-4">
        <div v-if="activeTab === 'campaign'">
          <CampaignTab 
            ref="campaignTabRef"
            @select="handleCampaignSelect"
            @send="handleShowSendMailModal"
            @cancel="handleCloseSendMailDrawer"
          />
        </div>
        <div v-if="activeTab === 'membership'">
          <MembershipTab 
            ref="membershipTabRef"
            @select="handleMembershipSelect"
            @send="handleShowSendMailModal"
            @cancel="handleCloseSendMailDrawer"
          />
        </div>
      </div>

      <!-- <template #footer>
        <div class="flex justify-end gap-2">
          <a-button @click="() => showSendMailDrawer = false">Cancel</a-button>
          <a-button type="primary" @click="handleShowSecondModal">Send Mail</a-button>
        </div>
      </template> -->
    </a-drawer>

    <!-- Second Modal: Send Mail Template by Campaign/Membership -->
    <SendTemplateMailModal
      v-if="showSendMailModal && templateData"
      v-model:visible="showSendMailModal"
      :template="templateData"
      :selected-campaigns="selectedCampaign"
      :selected-members="selectedMembers"
      :mode="activeTab === 'campaign' ? 'campaign' : 'membership'"
      @success="handleSendMailSuccess"
      @cancel="handleSendMailCancel"
      @removeCampaign="handleRemoveCampaign"
      @removeMember="handleRemoveMember" 
    />
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SaveOutlined, UploadOutlined, MailOutlined, TeamOutlined, UserOutlined, FileExcelOutlined, PlusOutlined } from '@ant-design/icons-vue'
import DefaultLayout from '@/layouts/DefaultLayout.vue'
import PageHeader from '@/shared/components/PageHeader.vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import JSZip from 'jszip'
import mammoth from 'mammoth'
import { useAuthStore } from '@/stores/auth'
import html2canvas from 'html2canvas'
import type { MailTemplate } from '@/services/mailTemplateService'
import axios from 'axios'
import CampaignTab from '../components/SendMail/CampaignTab.vue'
import MembershipTab from '../components/SendMail/MembershipTab.vue'
import SendTemplateMailModal from '../components/SendTemplateMailModal.vue'
// import SendMailModal from '@/features/mail/components/SendMailModal.vue'
import type { Campaign } from '@/types/campaign'  // Import interface

const route = useRoute()
const router = useRouter()

const editorData = ref('')
const templateName = ref('')
const subject = ref('')
const templateType = ref()
const templateCategory = ref()
const saveToElasticMail = ref(false)
const isSaving = ref(false)
const isEdit = ref(false)
const templateId = ref<number | null>(null)

// Modal states
const showSendMailDrawer = ref(false)
const showSendMailModal = ref(false)
const activeTab = ref('campaign')
const selectedCampaign = ref<Campaign[]>([])
const selectedMembers = ref<any[]>([])
const templateFields = ref<string[]>([])
const campaignTabRef = ref() // Add ref to access CampaignTab methods
const membershipTabRef = ref()

// Xử lý id từ route params để xác định chế độ edit
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      isEdit.value = true
      templateId.value = parseInt(newId as string)
    } else {
      isEdit.value = false 
      templateId.value = null
    }
  },
  { immediate: true }
)

// Thêm interfaces
interface TemplateType {
  templateTypeID: number
  templateTypeName: string
  enabled: boolean
  createTime?: string
  updateTime?: string
}

interface TemplateCategory {
  templateCategoryID: number
  templateCategoryName: string
  enabled: boolean
  createTime?: string
  updateTime?: string
}

// Cập nhật các biến ref
const templateTypes = ref<TemplateType[]>([])
const templateCategories = ref<TemplateCategory[]>([])

// Thêm phần khởi tạo api instance
const baseUrl = import.meta.env.VITE_API_BASE_URL
const authStore = useAuthStore()

const api = axios.create({
  baseURL: baseUrl,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    const token = authStore.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Thêm hàm fetch template types
const fetchTemplateTypes = async () => {
  try {
    const response = await api.get('/membership/mail/template-types')
    if (response.data.result === 'Success') {
      templateTypes.value = response.data.data.filter((type: TemplateType) => type.enabled)
    }
  } catch (error) {
    console.error('Error fetching template types:', error)
    message.error('Không thể tải danh sách loại template')
  }
}

// Thêm hàm fetch template categories
const fetchTemplateCategories = async () => {
  try {
    const response = await api.get('/membership/mail/template-categories')
    if (response.data.result === 'Success') {
      templateCategories.value = response.data.data.filter((category: TemplateCategory) => category.enabled)
    }
  } catch (error) {
    console.error('Error fetching template categories:', error)
    message.error('Không thể tải danh sách danh mục')
  }
}

// Thêm hàm fetchTemplateById
const fetchTemplateById = async (id: number) => {
  try {
    const response = await api.get(`/membership/mail/templates/${id}`)
    if (response.data.result === 'Success') {
      const mailTemplate = response.data.data
      templateId.value = mailTemplate.mailTemplateID
      templateName.value = mailTemplate.templateName
      subject.value = mailTemplate.templateName
      templateType.value = mailTemplate.templateTypeID
      templateCategory.value = mailTemplate.templateCategoryID
      saveToElasticMail.value = mailTemplate.enabled
      editorData.value = await fetchTemplateData(mailTemplate.body)
      
      // Extract and store merge fields
      templateFields.value = extractMergeFields(mailTemplate.body)
      console.log('Extracted merge fields:', templateFields.value)
    } else {
      throw new Error('Failed to get template details')
    }
  } catch (error) {
    console.error('Error fetching template by ID:', error)
    message.error('Không thể tải thông tin template')
  }
}

// Cập nhật onMounted để gọi fetchTemplateById
onMounted(async () => {
  await Promise.all([
    fetchTemplateTypes(),
    fetchTemplateCategories()
  ])
  const templateIdParam = route.params.id
  if (templateIdParam) {
    await fetchTemplateById(Number(templateIdParam))
  }
  saveToElasticMail.value = false
})

// Thêm ref để lưu trữ files
const imageFiles = ref<Map<string, File>>(new Map())

const convertImageToBase64 = async (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const handlePaste = async (e: ClipboardEvent) => {
  const items = e.clipboardData?.items
  if (!items) return

  for (let i = 0; i < items.length; i++) {
    const item = items[i]

    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      if (file) {
        try {
          // Tạo key cho ảnh
          const key = `image_${Date.now()}.${file.type.split('/')[1] || 'png'}`

          // Lưu file gốc vào Map
          imageFiles.value.set(key, file)

          // Convert sang base64 để hi���n thị
          const base64 = await convertImageToBase64(file)

          const imageHtml = `<img 
            src="${base64}" 
            alt="pasted image" 
            data-key="${key}"
            data-type="${file.type}"
          />`
          editorData.value += imageHtml
        } catch (error) {
          console.error('Error processing pasted image:', error)
          message.error('Không thể xử lý ảnh')
        }
      }
    }
  }
}

// Thêm hàm xử lý khi drop ảnh
const handleDrop = async (e: DragEvent) => {
  e.preventDefault()

  const files = e.dataTransfer?.files
  if (!files?.length) return

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    if (file.type.indexOf('image') !== -1) {
      try {
        const base64Data = await convertImageToBase64(file)
        const quill = (e.target as any)?.quill
        const range = quill.getSelection() || { index: quill.getLength() }
        quill.insertEmbed(range.index, 'image', base64Data)
      } catch (error) {
        console.error('Error processing dropped image:', error)
        message.error('Không thể xử lý ảnh')
      }
    }
  }
}

const processTemplateContent = async (html: string): Promise<{
  processedHtml: string,
  imageFiles: File[]
}> => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const images = doc.getElementsByTagName('img')
  const processedImages: File[] = []

  for (const img of Array.from(images)) {
    try {
      const imageKey = img.getAttribute('data-key')

      if (imageKey && imageFiles.value.has(imageKey)) {
        // Lấy file gốc từ Map
        const file = imageFiles.value.get(imageKey)
        processedImages.push(file as File)

        // Cập nhật đường dẫn ảnh trong HTML
        img.src = imageKey
      } else if (img.src.startsWith('data:image')) {
        // Xử lý ảnh base64 (nếu còn)
        const base64Data = img.src.split(',')[1]
        const imageType = img.src.split(';')[0].split('/')[1]
        const binaryData = atob(base64Data)
        const array = new Uint8Array(binaryData.length)
        for (let j = 0; j < binaryData.length; j++) {
          array[j] = binaryData.charCodeAt(j)
        }
        const blob = new Blob([array], { type: `image/${imageType}` })
        const filename = `image-${Date.now()}.${imageType}`
        const file = new File([blob], filename, { type: `image/${imageType}` })
        processedImages.push(file)
        img.src = filename
      }
    } catch (error) {
      console.error('Error processing image:', error)
      message.warning(`Không thể xử lý ảnh: ${img.src}`)
    }
  }

  return {
    processedHtml: doc.documentElement.outerHTML,
    imageFiles: processedImages
  }
}

const handleCreateOrSaveTemplate = async () => {
  try {
    await handleSave()
    message.success(isEdit.value ? 'Update template successfully' : 'Create new template successfully')
    router.push('/mail/template-mail')
  } catch (error) {
    console.error('Lỗi khi xử lý template:', error)
    message.error('An error occurred, please try again later')
  }
}



const handleSave = async () => {
  try {
    if (!templateName.value.trim()) {
      return message.error('Please enter template name')
    }

    if (!subject.value.trim()) {
      return message.error('Please enter email subject')
    }

    if (!editorData.value.trim()) {
      return message.error('Please enter template content')
    }

    const authStore = useAuthStore()
    const token = authStore.token

    if (!token) {
        return message.error('Please login again')
    }

    // Set trạng thái đang save
    isSaving.value = true

    // Xử lý HTML và ảnh
    const { processedHtml, imageFiles: processedImages } = await processTemplateContent(editorData.value)

    // Tạo FormData
    const formData = new FormData()

    // Thêm file HTML đã xử lý
    //Từ file HTML này phải đọc đ��ợc merge field merge data
    const htmlFile = new File([processedHtml], 'template.html', {
      type: 'text/html'
    })
    formData.append('html', htmlFile)

    // Thêm các file ảnh đã xử lý
    processedImages.forEach(file => {
      formData.append('image[]', file)
    })

    // Thêm các trường khác
    formData.append('templateName', templateName.value)
    formData.append('templateTypeID', templateType.value.toString())
    formData.append('templateCategoryID', templateCategory.value.toString())
    formData.append('saveToElasticMail', saveToElasticMail.value.toString())

    // Lưu thông tin style của editor
    const editorElement = document.querySelector('.ql-editor') as HTMLElement
    if (editorElement) {
      const styles = window.getComputedStyle(editorElement)
      const styleData = {
        fontSize: styles.fontSize,
        fontFamily: styles.fontFamily,
        color: styles.color,
        lineHeight: styles.lineHeight,
        textAlign: styles.textAlign,
        backgroundColor: styles.backgroundColor,
        padding: styles.padding,
        margin: styles.margin
      }
      formData.append('editorStyles', JSON.stringify(styleData))
    }

    // Chụp và thêm preview
    const previewImage = await captureEditorPreview()
    if (previewImage) {
      formData.append('previewPicture', previewImage, 'preview.jpg')
    }

    // Gọi API upload với token trong header
    const response = await fetch(isEdit.value ? `/api/membership/mail/update-template/${templateId.value}` : '/api/membership/mail/upload-template', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Upload failed')
    }

    message.success('Save template successfully')

    // Chuyển về trang templates sau khi lưu thành công
  } catch (error) {
    console.error('Error saving template:', error)
    message.error((error as Error).message || 'Save template failed')
  } finally {
    // Reset trạng thái save
    isSaving.value = false
  }
}

const downloadTemplateAsZip = async () => {
  const zip = new JSZip()

  // Thêm file HTML
  zip.file('template.html', editorData.value)

  // Xử lý và thêm ảnh
  const parser = new DOMParser()
  const doc = parser.parseFromString(editorData.value, 'text/html')
  const images = doc.getElementsByTagName('img')

  for (let i = 0; i < images.length; i++) {
    const img = images[i]
    const imageKey = img.getAttribute('data-key')

    try {
      if (imageKey && imageFiles.value.has(imageKey)) {
        // Lấy file gốc từ Map
        const file = imageFiles.value.get(imageKey)
        const filename = `images/${imageKey}`
        zip.file(filename, file as Blob)

        // Cập nhật đường dẫn ảnh trong HTML
        img.src = filename
      } else if (img.src.startsWith('data:image')) {
        // Xử lý ảnh base64 (nếu còn)
        const base64Data = img.src.split(',')[1]
        const imageType = img.src.split(';')[0].split('/')[1]
        const binaryData = atob(base64Data)
        const array = new Uint8Array(binaryData.length)
        for (let j = 0; j < binaryData.length; j++) {
          array[j] = binaryData.charCodeAt(j)
        }
        const blob = new Blob([array], { type: `image/${imageType}` })
        const filename = `images/image-${i + 1}.${imageType}`
        zip.file(filename, blob)
        img.src = filename
      }
    } catch (error) {
      console.error('Error processing image:', error)
      message.warning(`Cannot load image: ${img.src}`)
    }
  }

  // Cập nhật HTML với đường dẫn ảnh mới
  zip.file('template.html', doc.documentElement.outerHTML)

  // Tạo và tải file zip
  try {
    const content = await zip.generateAsync({
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 9
      }
    })
    const url = window.URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${templateName.value || 'template'}.zip`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating zip:', error)
    message.error('Cannot create zip file')
  }
}

const handleWordUpload = async (file: File): Promise<boolean> => {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })
    editorData.value = result.value

    // Lấy tên file và bỏ phần mở rộng .doc/.docx
    const fileName = file.name.replace(/\.(doc|docx)$/i, '')
    templateName.value = fileName
    // tiêu đề email cũng vậy
    subject.value = fileName

    message.success('Upload successfully')
    return false // Ngăn upload mặc định của ant-design
  } catch (error) {
    console.error('Error processing Word file:', error)
    message.error('Cannot process Word file')
    return false
  }
}

const processHtmlContent = async (html: string): Promise<string> => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

  // Xử lý hyperlinks
  const links = tempDiv.getElementsByTagName('a')
  for (const link of Array.from(links)) {
    if (link.getAttribute('href')) {
      const href = link.getAttribute('href')
      if (href && !href.startsWith('http')) {
        link.setAttribute('href', new URL(href, window.location.origin).href)
      }
      link.setAttribute('target', '_blank')
    }
  }

  // Xử lý images (giữ nguyên code cũ của bạn)
  const images = tempDiv.getElementsByTagName('img')

  for (const img of Array.from(images)) {
    try {
      const src = img.src
      // Bỏ qua nếu đã là base64 hoặc đã có data-key
      if (src.startsWith('data:') || img.getAttribute('data-key')) continue

      // Xử lý ảnh từ link web
      if (src.startsWith('http') || src.startsWith('https')) {
        const imageBlob = await fetchImageAsBlob(src)
        const { key, base64, file } = await processImage(imageBlob, `web_image_${Date.now()}`)

        // Lưu file vào Map
        imageFiles.value.set(key, file)

        // Cập nhật src thành base64 và thêm data-key
        img.src = base64
        img.setAttribute('data-key', key)
        img.setAttribute('data-original-src', src)
      }
    } catch (error) {
      console.error('Error processing image from URL:', error)
      message.warning(`Cannot load image: ${img.src}`)
    }
  }

  return tempDiv.innerHTML
}

// Thêm watcher để tự động xử lý khi nội dung thay đổi
watch(editorData, async (newContent) => {
  if (newContent) {
    const processedContent = await processHtmlContent(newContent)
    if (processedContent !== newContent) {
      editorData.value = processedContent
    }
  }
}, { deep: true })

// Cleanup khi component unmount
onBeforeUnmount(() => {
  // Xóa tất cả blob URLs
  const images = document.querySelectorAll('img')
  images.forEach(img => {
    if (img.src.startsWith('blob:')) {
      URL.revokeObjectURL(img.src)
    }
  })
  // Clear map chứa files
  imageFiles.value.clear()
})

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Cannot load image')
  return await response.blob()
}

const processImage = async (imageBlob: Blob, originalName: string = ''): Promise<{
  key: string,
  base64: string,
  file: File
}> => {
  const extension = imageBlob.type.split('/')[1] || 'png'
  const imageKey = `image_${Date.now()}.${extension}`
  const optimizedFile = new File([imageBlob], originalName || imageKey, { type: imageBlob.type })
  const base64Data = await convertImageToBase64(optimizedFile)

  return {
    key: imageKey,
    base64: base64Data,
    file: optimizedFile
  }
}

// Thêm hàm chụp preview
const captureEditorPreview = async (): Promise<File | null> => {
  try {
    await nextTick()

    const editorElement = document.querySelector('.ql-editor') as HTMLElement
    if (!editorElement) return null

    // Kích thước với tỷ lệ 2:3 (600x900 thay vì 800x1200)
    const width = 600 
    const height = 400
    
    // Tạo container tạm thời
    const tempContainer = document.createElement('div')
    tempContainer.style.width = `${width}px`
    tempContainer.style.height = `${height}px`
    tempContainer.style.backgroundColor = '#ffffff'
    tempContainer.style.position = 'absolute'
    tempContainer.style.left = '-9999px'
    
    // Copy nội dung từ editor
    const contentClone = editorElement.cloneNode(true) as HTMLElement
    contentClone.style.height = 'auto'
    tempContainer.appendChild(contentClone)
    
    document.body.appendChild(tempContainer)

    const canvas = await html2canvas(tempContainer, {
      scale: 1,
      useCORS: true,
      logging: false,
      width: width,
      height: height,
      backgroundColor: '#ffffff'
    })

    // Xóa container tạm
    document.body.removeChild(tempContainer)

    // Nén ảnh với chất lượng thấp hơn
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'preview.png', { 
              type: 'image/jpeg' // Đổi sang jpeg để nén tốt hơn
            })
            resolve(file)
          } else {
            resolve(null)
          }
        }, 
        'image/jpeg', 
        0.5  // Chất lượng 50%
      )
    })
  } catch (error) {
    console.error('Error capturing preview:', error)
    return null
  }
}

const fetchTemplateData = async (bodyPath: string): Promise<string> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL_TEMPLATE}/${bodyPath}`)
    if (!response.ok) throw new Error('Failed to fetch HTML content')
    return await response.text()
  } catch (error) {
    console.error('Error fetching template:', error)
    message.error('Cannot load template information')
    return '' // Trả về chuỗi rỗng trong trường hợp lỗi
  }
}

// Initial send mail handler - shows first drawer
const handleSendMail = async () => {
  try {
    if (!editorData.value) {
      return message.error('No template content')
    }

    // Extract fields from editor content
    const matches = editorData.value.match(/\{([^}]+)\}/g) || []
    templateFields.value = matches.map(match => ({
      key: match.replace(/[{}]/g, ''),
      value: ''
    }))
    
    if (templateFields.value.length === 0) {
      return message.warning('No merge fields found in template')
    }

    // Show first drawer
    showSendMailDrawer.value = true
  } catch (error) {
    console.error('Error preparing send mail:', error)
    message.error('Failed to prepare send mail form')
  }
}

// Handler to show second modal
// const handleShowSecondModal = () => {
//   // Validate if campaign/members are selected based on activeTab
//   if (activeTab.value === 'campaign' && !selectedCampaign.value.length) {
//     return message.error('Please select a campaign')
//   }
//   if (activeTab.value === 'membership' && !selectedMembers.value.length) {
//     return message.error('Please select at least one member')
//   }

//   showSendMailDrawer.value = false // Close first drawer
//   showSendMailModal.value = true // Show second modal
// }

// Campaign/Member selection handlers
const handleCampaignSelect = (campaigns: any[]) => {
  selectedCampaign.value = campaigns
}

const handleMembershipSelect = (members: any[]) => {
  selectedMembers.value = members
}

// Second modal handlers
const handleSendMailSuccess = () => {
  showSendMailModal.value = false
  message.success('Mail sent successfully')
}

const handleSendMailCancel = () => {
  showSendMailModal.value = false
}

// Mapping options helper
const getMappingOptions = (fieldKey: string) => {
  const key = fieldKey.toLowerCase()
  
  const commonOptions = [
    { label: 'Customer Name', value: 'fullName' },
    { label: 'Email', value: 'email' },
    { label: 'Phone', value: 'phoneNumber' },
    { label: 'Address', value: 'address' }
  ]

  const campaignOptions = [
    { label: 'Campaign Name', value: 'name' },
    { label: 'Start Date', value: 'startDate' },
    { label: 'End Date', value: 'endDate' }
  ]

  return activeTab.value === 'campaign' 
    ? [...commonOptions, ...campaignOptions]
    : commonOptions
}

// Thêm hàm xử lý sự kiện change
const handleElasticMailChange = (checked: boolean) => {
  saveToElasticMail.value = checked
}

// Interfaces
interface TemplateField {
  original: string
  key: string
  value?: string
}

// Extract merge fields from HTML content
const extractTemplateFields = (content: string): TemplateField[] => {
  // Extract content inside body tag first
  const bodyRegex = /<body\b[\s\S]*<\/body>/i
  const bodyMatch = content.match(bodyRegex)
  const bodyContent = bodyMatch ? bodyMatch[0] : content

  // Extract merge fields with pattern {field}
  const mergeFieldsRegex = /\{([^\n{}]+)\}/g
  const matches = bodyContent.match(mergeFieldsRegex) || []
  
  // Clean up and remove duplicates
  const uniqueFields = Array.from(new Set(
    matches.map(match => ({
      original: match,
      key: match.replace(/[{}]/g, '').trim(),
      value: ''
    }))
  ))
  
  console.log('Extracted fields:', uniqueFields)
  return uniqueFields
}

const handleCloseSendMailDrawer = () => {
  showSendMailDrawer.value = false
  selectedCampaign.value = []
}

// Khai báo interface cho template data
interface TemplateData {
  id: number
  content: string
  name: string
}

const templateData = ref<TemplateData | null>(null)

// Sửa lại hàm handleShowSendMailModal có sẵn
const handleShowSendMailModal = (campaigns: Campaign[]) => {
  console.log('handleShowSendMailModal called with campaigns:', campaigns)
  
  selectedCampaign.value = campaigns
  
  templateData.value = {
    id: Number(route.params.id),
    content: editorData.value,
    name: templateName.value
  }
  
  console.log('Template Data:', templateData.value)
  console.log('showSendMailModal before:', showSendMailModal.value)
  
  showSendMailModal.value = true
  
  console.log('showSendMailModal after:', showSendMailModal.value)
}

// Thêm watch để debug templateData trong SendTemplateMailModal
watch(() => templateData.value?.content, (newContent) => {
  if (newContent) {
    const mergeFields = extractMergeFields(newContent)
    console.log('Merge fields extracted:', mergeFields)
  }
}, { immediate: true })

// Handle when a campaign is removed from modal
const handleRemoveCampaign = (campaign: any) => {
  selectedCampaign.value = selectedCampaign.value.filter(
    (c: any) => c.id !== campaign.id
  )
  // Call updateSelection method in CampaignTab
  campaignTabRef.value?.updateSelection(selectedCampaign.value)
}

const handleRemoveMember = (member: any) => {
  // 1. Cập nhật selectedMembers
  selectedMembers.value = selectedMembers.value.filter(
    (m: any) => m.membershipWebsiteId !== member.membershipWebsiteId
  )

  // 2. Gọi method updateSelection trong MembershipTab để cập nhật table
  membershipTabRef.value?.updateSelection(selectedMembers.value.map(m => m.membershipWebsiteId))
}


// Add function to extract merge fields
const extractMergeFields = (content: string) => {
  const matches = content.match(/\{([^}]+)\}/g) || []
  return Array.from(new Set(
    matches.map(match => match.replace(/\{|\}/g, '').trim())
  ))
}

// Thêm hàm xử lý cho membership
const handleShowSendMailModalByMembership = (members: any[]) => {
  selectedMembers.value = members
  templateData.value = {
    id: Number(route.params.id),
    content: editorData.value,
    name: templateName.value
  }
  showSendMailModal.value = true
}
</script>
<style scoped>
.grid {
  display: grid;
  gap: 1.5rem;
}

.border {
  border: 1px solid #e5e7eb;
}

.rounded-lg {
  border-radius: 0.5rem;
}

.cursor-pointer {
  cursor: pointer;
}

.hover\:shadow-lg:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.transition-shadow {
  transition: box-shadow 0.3s ease;
}

/* Override switch styles */
:deep(:where(.css-dev-only-do-not-override-1p3hq3p).ant-switch) {
  background: rgba(0, 0, 0, 0.45);
}

:deep(:where(.css-dev-only-do-not-override-1p3hq3p).ant-switch.ant-switch-checked) {
  background: #1890ff;
}

:deep(:where(.css-dev-only-do-not-override-1p3hq3p).ant-switch:hover:not(.ant-switch-disabled)) {
  background: rgba(0, 0, 0, 0.45);
}

:deep(:where(.css-dev-only-do-not-override-1p3hq3p).ant-switch.ant-switch-checked:hover:not(.ant-switch-disabled)) {
  background: #1890ff;
}

</style>

