<!-- <template>
  <DefaultLayout>
    <div class="p-6">
      <PageHeader>
        <template #title>
          <h2 class="text-2xl font-bold">Test Editor</h2>
        </template>
        <template #extra>
          <a-space>
            <a-upload accept=".docx" :showUploadList="false" :beforeUpload="handleWordUpload">
              <a-button>
                <template #icon>
                  <upload-outlined />
                </template>
                Upload Word
              </a-button>
            </a-upload>

            <!-- <a-button @click="captureEditorPreview">
              <template #icon>
                <camera-outlined />
              </template>
              Tải Preview
            </a-button> -->
            <a-button @click="handleSendMail">
              <template #icon>
                <mail-outlined />
              </template>
              Gửi Mail
            </a-button>

            <a-button type="primary" @click="handleCreateOrSaveTemplate" :disabled="isSaving">
              <template #icon>
                <SaveOutlined />
              </template>
              {{ isEdit ? 'Lưu Template' : 'Tạo Template' }}
            </a-button>
          </a-space>
        </template>
      </PageHeader>

      <div class="bg-white rounded-lg shadow p-6">
        <a-form-item class="mb-4">
          <a-input v-model:value="templateName" placeholder="Nhập tên template" />
        </a-form-item>

        <a-form-item class="mb-4">
          <a-input v-model:value="subject" placeholder="Nhập tiêu đề mail" />
        </a-form-item>

        <a-form-item class="mb-4">
          <a-select v-model:value="templateType" placeholder="Chọn loại template" :options="templateTypes.map(type => ({
            label: type.templateTypeName,
            value: type.templateTypeID
          }))">
          </a-select>
        </a-form-item>

        <a-form-item class="mb-4">
          <a-select v-model:value="templateCategory" placeholder="Chọn danh mục" :options="templateCategories.map(category => ({
            label: category.templateCategoryName,
            value: category.templateCategoryID
          }))">
          </a-select>
        </a-form-item>

        <a-form-item class="mb-4">
          <a-switch v-model:checked="saveToElasticMail" checked-children="Lưu ElasticMail"
            un-checked-children="Không lưu" :default-checked="false" />
        </a-form-item>

        <div class="editor-container">
          <QuillEditor v-model:content="editorData" contentType="html" toolbar="full" theme="snow" @paste="handlePaste"
            @drop="handleDrop" />
        </div>
      </div>
    </div>
  </DefaultLayout>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SaveOutlined, UploadOutlined } from '@ant-design/icons-vue'
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

const route = useRoute()
const router = useRouter()

const editorData = ref('')
const templateName = ref('')
const subject = ref('')
const templateType = ref(11)
const templateCategory = ref(10)
const saveToElasticMail = ref(false)
const isSaving = ref(false)
const isEdit = ref(false)
const templateId = ref<number | null>(null)

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

// Cập nhật onMounted để gọi API
onMounted(async () => {
  await Promise.all([
    fetchTemplateTypes(),
    fetchTemplateCategories()
  ])

  // Xử lý template từ query params nếu có
  const templateStr = route.query.template as string
  if (templateStr) {
    try {
      const template = JSON.parse(templateStr) as MailTemplate
      isEdit.value = true
      templateId.value = template.mailTemplateID
      templateName.value = template.templateName
      subject.value = template.templateName
      templateType.value = template.templateTypeID
      templateCategory.value = template.templateCategoryID
      saveToElasticMail.value = template.enabled

      // Fetch HTML content
      fetchTemplateData(template.body)
    } catch (error) {
      console.error('Error parsing template:', error)
      message.error('Không thể đọc thông tin template')
    }
  }
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

          // Convert sang base64 để hiển thị
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
    message.success(isEdit.value ? 'Cập nhật template thành công' : 'Tạo mới template thành công')
    router.push('/mail/templates')
  } catch (error) {
    console.error('Lỗi khi xử lý template:', error)
    message.error('Có lỗi xảy ra, vui lòng thử lại sau')
  }
}



const handleSave = async () => {
  try {
    if (!templateName.value.trim()) {
      return message.error('Vui lòng nhập tên template')
    }

    if (!subject.value.trim()) {
      return message.error('Vui lòng nhập tiêu đề mail')
    }

    if (!editorData.value.trim()) {
      return message.error('Vui lòng nhập nội dung template')
    }

    const authStore = useAuthStore()
    const token = authStore.token

    if (!token) {
      return message.error('Vui lòng đăng nhập lại')
    }

    // Set trạng thái đang save
    isSaving.value = true

    // Xử lý HTML và ảnh
    const { processedHtml, imageFiles: processedImages } = await processTemplateContent(editorData.value)

    // Tạo FormData
    const formData = new FormData()

    // Thêm file HTML đã xử lý
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

    message.success('Lưu template thành công')

    // Chuyển về trang templates sau khi lưu thành công
  } catch (error) {
    console.error('Error saving template:', error)
    message.error((error as Error).message || 'Lưu template thất bại')
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
      message.warning(`Không thể tải ảnh: ${img.src}`)
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
    message.error('Không thể tạo file zip')
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

    message.success('Upload thành công')
    return false // Ngăn upload mặc định của ant-design
  } catch (error) {
    console.error('Error processing Word file:', error)
    message.error('Không thể xử lý file Word')
    return false
  }
}

const processHtmlContent = async (html: string): Promise<string> => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html

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
      message.warning(`Không thể tải ảnh: ${img.src}`)
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
  if (!response.ok) throw new Error('Không thể tải ảnh')
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

    const canvas = await html2canvas(editorElement, {
      scale: 1,
      useCORS: true,
      logging: false,
      width: editorElement.clientWidth,
      height: Math.min(editorElement.clientHeight, 800)
    })

    // Tạo URL để download
    const dataUrl = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = dataUrl
    // a.download = 'preview.png'
    a.click()

    // Vẫn trả về File để upload
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'preview.png', { type: 'image/png' })
          resolve(file)
        } else {
          resolve(null)
        }
      }, 'image/png')
    })
  } catch (error) {
    console.error('Error capturing preview:', error)
    return null
  }
}

const fetchTemplateData = async (bodyPath: string) => {
  try {
    const response = await fetch(`${baseUrl}/public/${bodyPath}`)
    if (!response.ok) throw new Error('Failed to fetch HTML content')

    const htmlContent = await response.text()
    editorData.value = htmlContent
  } catch (error) {
    console.error('Error fetching template:', error)
    message.error('Không thể tải thông tin template')
    // router.push('/mail/templates') // Quay về trang danh sách nếu có lỗi
  }
}


const formRef = ref()


const handleSendMail = async () => {
  if (!formRef.value) return

  try {
    // Validate form trước khi lưu
    await formRef.value.validate()
    await handleSave()


    let templateId = route.params.id



    // Chuyển đến trang chọn đối tượng gửi mail
    router.push(`/mail/send/${templateId}`)
  } catch (error) {
    console.error('Error saving template:', error)
    if ((error as any)?.response?.status === 401) {
      message.error('Phiên làm việc đã hết hạn, vui lòng đăng nhập lại!')
      authStore.logout()
      router.push('/login')
    } else {
      message.error('Có lỗi xảy ra khi lưu template!')
    }
  }
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
</style> -->
