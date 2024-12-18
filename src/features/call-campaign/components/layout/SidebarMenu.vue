<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <!-- <img src="@/assets/logo.png" alt="Logo" class="logo" /> -->
      <h1 class="brand-name">{{ brandName }}</h1>
    </div>

    <a-menu
      v-model:selectedKeys="selectedKeys"
      v-model:openKeys="openKeys"
      mode="inline"
      theme="dark"
      class="sidebar-menu"
    >
      <!-- Membership Menu Item -->
      <a-menu-item key="membership">
        <template #icon>
          <UserOutlined />
        </template>
        <router-link to="/membership">Membership</router-link>
      </a-menu-item>

      <!-- Service Mail Menu Item -->
      <a-menu-item key="service-mail">
        <template #icon>
          <MailOutlined />
        </template>
        <router-link to="/service-mail">Service Mail</router-link>
      </a-menu-item>

      <!-- Coupons Menu Item -->
      <a-menu-item key="coupons">
        <template #icon>
          <GiftOutlined />
        </template>
        <router-link to="/coupons">Coupons</router-link>
      </a-menu-item>

      <!-- Service Call Menu Item -->
      <a-menu-item key="service-call">
        <template #icon>
          <PhoneOutlined />
        </template>
        <router-link to="/call-campaign">Service Call</router-link>
      </a-menu-item>

      <!-- Report SubMenu -->
      <a-sub-menu key="report">
        <template #icon>
          <BarChartOutlined />
        </template>
        <template #title>Report</template>
        
        <a-menu-item key="dashboard-report">
          <router-link to="/report/dashboard">
            <DashboardOutlined /> Dashboard
          </router-link>
        </a-menu-item>
        
        <a-menu-item key="callcampaign-report">
          <router-link to="/report/call-campaign">
            <PhoneOutlined /> CallCampaign
          </router-link>
        </a-menu-item>
        
        <a-menu-item key="product-report">
          <router-link to="/report/product">
            <ShoppingOutlined /> Product
          </router-link>
        </a-menu-item>
        
        <a-menu-item key="order-report">
          <router-link to="/report/order">
            <ShoppingCartOutlined /> Order
          </router-link>
        </a-menu-item>
        
        <a-menu-item key="level-report">
          <router-link to="/report/level">
            <RiseOutlined /> Level
          </router-link>
        </a-menu-item>
      </a-sub-menu>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import {
  UserOutlined,
  MailOutlined,
  GiftOutlined,
  PhoneOutlined,
  BarChartOutlined,
  DashboardOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
  RiseOutlined
} from '@ant-design/icons-vue';

const route = useRoute();
const brandName = ref('Admin Portal');

// Menu state
const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>(['report']);

// Watch route changes to update selected menu item
watch(
  () => route.path,
  (path) => {
    const key = path.split('/')[1];
    selectedKeys.value = [key];
    
    // Open report submenu if on a report page
    if (path.includes('/report')) {
      openKeys.value = ['report'];
    }
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
.sidebar {
  @apply h-screen bg-dark-blue flex flex-col;
  width: 250px;
  transition: width 0.3s;

  .sidebar-header {
    @apply flex items-center p-4 border-b border-gray-700;

    .logo {
      @apply w-8 h-8 mr-3;
    }

    .brand-name {
      @apply text-white text-lg font-semibold;
    }
  }

  .sidebar-menu {
    @apply flex-1 border-r-0;

    :deep(.ant-menu-item) {
      @apply h-12 leading-12 my-1;

      a {
        @apply text-gray-300;
      }

      &.ant-menu-item-selected {
        @apply bg-primary;

        a {
          @apply text-white;
        }
      }
    }

    :deep(.ant-menu-submenu) {
      .ant-menu-submenu-title {
        @apply h-12 leading-12;
      }
    }
  }

  // Collapsed state
  &.collapsed {
    width: 80px;

    .brand-name {
      @apply hidden;
    }
  }
}

// Dark theme overrides
:deep(.ant-menu-dark) {
  background: transparent;

  .ant-menu-item-selected {
    background-color: var(--ant-primary-color);
  }
}

// Custom scrollbar
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-600 rounded;
}
</style>
