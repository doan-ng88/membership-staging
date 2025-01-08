<!-- // src/features/call-campaign/components/CampaignForm/CampaignFormModal.vue -->
<template>
  <a-modal
    :open="visible"
    :title="campaign ? 'Chỉnh sửa chiến dịch' : 'Thêm chiến dịch mới'"
    width="60%"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      layout="vertical"
    >
      <div class="flex gap-4">
        <a-form-item label="Tên chiến dịch" name="name" class="flex-1">
          <a-input v-model:value="formState.name" placeholder="Nhập tên chiến dịch" />
        </a-form-item>

        <a-form-item
          label="Thời Gian Gửi"
          :rules="[{ required: true, message: 'Vui lòng chọn thời gian gửi' }]"
          class="flex-1"
        >
          <a-range-picker
            v-model:value="dateRange"
            format="YYYY-MM-DD"
            :placeholder="['Thời gian bắt đầu', 'Thời gian kết thúc']"
            style="width: 100%"
            @change="onDateRangeChange"
          />
        </a-form-item>
      </div>

      <a-form-item label="Người phụ trách" name="pic">
        <a-select
          v-model:value="formState.pic"
          placeholder="Chọn người phụ trách"
          style="width: 100%"
        >
          <a-select-option value="Nguyễn Văn A">Nguyễn Văn A</a-select-option>
          <a-select-option value="Nguyễn Văn B">Nguyễn Văn B</a-select-option>
          <a-select-option value="Trần Thị C">Trần Thị C</a-select-option>
        </a-select>
      </a-form-item>

      <div class="mt-6 pt-4 border-t border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-medium">Danh sách thành viên được chọn</h4>
          <a-button type="primary" @click="showAddMemberModal">
            <template #icon><UserAddOutlined /></template>
            Thêm thành viên
          </a-button>
        </div>

        <a-table
          :columns="memberColumns"
          :data-source="formState.members"
          :pagination="false"
          size="small"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" @click="removeMember(record)">
                  <DeleteOutlined />
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-form>

    <MemberSelectionModal
      v-model:open="showMemberModal"
      @select="handleMemberSelect"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { Form } from 'ant-design-vue';
import { UserAddOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import type { Campaign, CampaignMember } from '../../types/campaign.types';
import MemberSelectionModal from '../CampaignForm/MemberSelectionModal.vue';
import type { Dayjs } from 'dayjs';

const props = defineProps<{
  visible: boolean;
  campaign?: Campaign;
}>();

const emit = defineEmits<{
  (e: 'update:visible', visible: boolean): void;
  (e: 'save', data: Partial<Campaign>): void;
  (e: 'cancel'): void;
}>();

const formRef = ref();
const showMemberModal = ref(false);
const dateRange = ref<[Dayjs, Dayjs] | null>(null);

const formState = reactive({
  name: '',
  startDate: null,
  endDate: null,
  pic: undefined,
  members: [] as CampaignMember[]
});

const memberColumns = [
  {
    title: 'Tên khách hàng',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phone',
    key: 'phone',
  },
  {
    title: 'Level',
    dataIndex: 'level',
    key: 'level',
  },
  {
    title: 'Thao tác',
    key: 'action',
    width: 100,
  },
];

const rules = {
  name: [{ required: true, message: 'Vui lòng nhập tên chiến dịch' }],
  startDate: [{ required: true, message: 'Vui lòng chọn ngày bắt đầu' }],
  endDate: [{ required: true, message: 'Vui lòng chọn ngày kết thúc' }],
  pic: [{ required: true, message: 'Vui lòng chọn người phụ trách' }],
};

const handleSubmit = async () => {
  try {
    await formRef.value.validate();
    emit('save', formState);
    handleCancel();
  } catch (error) {
    console.error('Validation failed:', error);
  }
};

const handleCancel = () => {
  formRef.value?.resetFields();
  emit('update:visible', false);
  emit('cancel');
};

const showAddMemberModal = () => {
  showMemberModal.value = true;
};

const handleMemberSelect = (members: CampaignMember[]) => {
  formState.members = [...formState.members, ...members];
};

const removeMember = (member: CampaignMember) => {
  formState.members = formState.members.filter(m => m.id !== member.id);
};

const onDateRangeChange = (dates: [Dayjs, Dayjs] | null, dateStrings: [string, string]) => {
  if (dates) {
    formState.startDate = dateStrings[0];
    formState.endDate = dateStrings[1];
  } else {
    formState.startDate = null;
    formState.endDate = null;
  }
};

// Watch for campaign prop changes to update form
watch(() => props.campaign, (newCampaign) => {
  if (newCampaign) {
    Object.assign(formState, {
      name: newCampaign.name,
      startDate: newCampaign.startDate,
      endDate: newCampaign.endDate,
      pic: newCampaign.pic,
      members: [...newCampaign.members],
    });
  }
}, { immediate: true });
</script>