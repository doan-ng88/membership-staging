<template>
  <div class="upload-tab">
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      :multiple="false"
      :before-upload="beforeUpload"
      @change="handleChange"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined />
      </p>
      <p class="ant-upload-text">Click or drag file to this area to upload</p>
      <p class="ant-upload-hint">
        Support for a single Excel file. Please use the template format.
      </p>
    </a-upload-dragger>

    <div class="mt-4">
      <a-button type="link" @click="downloadTemplate">
        Download Template
      </a-button>
    </div>

    <!-- Preview uploaded data -->
    <div v-if="uploadedData.length" class="mt-4">
      <h3 class="mb-2">Preview:</h3>
      <a-table
        :columns="columns"
        :data-source="uploadedData"
        :pagination="{ pageSize: 5 }"
        size="small"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { InboxOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadChangeParam, UploadFile } from 'ant-design-vue'
import * as XLSX from 'xlsx'

const emit = defineEmits<{
  (e: 'select', recipients: any[]): void
}>()

const fileList = ref<UploadFile[]>([])
const uploadedData = ref<any[]>([])

const columns = [
  {
    title: 'Phone Number',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  }
]

const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.type === 'application/vnd.ms-excel'
  if (!isExcel) {
    message.error('You can only upload Excel files!')
    return false
  }
  return true
}

const handleChange = async (info: UploadChangeParam) => {
  const { file } = info

  if (file.status === 'done') {
    try {
      const data = await readExcelFile(file.originFileObj as File)
      uploadedData.value = data
      emit('select', data)
    } catch (error) {
      console.error('Error reading file:', error)
      message.error('Failed to read file')
    }
  }
}

const readExcelFile = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet)
        resolve(jsonData)
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}

const downloadTemplate = () => {
  // Create template file
  const template = [
    { phone: '0123456789', name: 'Example Name' }
  ]
  
  const ws = XLSX.utils.json_to_sheet(template)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Template')
  
  // Download file
  XLSX.writeFile(wb, 'zalo-recipients-template.xlsx')
}
</script> 