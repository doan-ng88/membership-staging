<!-- // src/layouts/MainLayout.vue -->
<template>
  <div class="main-layout">
    <SidebarMenu :collapsed="collapsed" />
    
    <div class="main-content">
      <header class="main-header">
        <MenuFoldOutlined
          v-if="!collapsed"
          class="trigger"
          @click="collapsed = true"
        />
        <MenuUnfoldOutlined
          v-else
          class="trigger"
          @click="collapsed = false"
        />
        
        <div class="header-right">
          <!-- Add header content here -->
        </div>
      </header>
      
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue';
import SidebarMenu from '@/features/call-campaign/components/layout/SidebarMenu.vue';

const collapsed = ref(false);
</script>

<style lang="scss" scoped>
.main-layout {
  @apply flex min-h-screen;

  .main-content {
    @apply flex-1 flex flex-col;
  }

  .main-header {
    @apply h-16 bg-white border-b flex items-center px-4;

    .trigger {
      @apply text-lg cursor-pointer;
      
      &:hover {
        @apply text-primary;
      }
    }

    .header-right {
      @apply ml-auto flex items-center gap-4;
    }
  }

  .content {
    @apply flex-1 p-6 overflow-auto;
    background-color: #f0f2f5;
  }
}
</style>