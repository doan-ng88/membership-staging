<template>
  <a-tabs v-model:activeKey="activeTab">
    <a-tab-pane key="members" tab="Select Members">
      <member-selector @select="handleMemberSelect" />
    </a-tab-pane>
    <a-tab-pane key="file" tab="Upload File">
      <file-uploader @upload="handleFileUpload" />
    </a-tab-pane>
  </a-tabs>
</template>

<script setup lang="ts">
// ... component logic
</script> 