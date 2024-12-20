import { createRouter, createWebHistory } from 'vue-router'
// import CalendarView from '@/views/CalendarView.vue'
import BasicChartView from '@/views/Charts/BasicChartView.vue'
import ECommerceView from '@/views/Dashboard/ECommerceView.vue'
import FormElementsView from '@/views/Forms/FormElementsView.vue'
import FormLayoutView from '@/views/Forms/FormLayoutView.vue'
import SettingsView from '@/views/Pages/SettingsView.vue'
import TablesView from '@/views/TablesView.vue'
import AlertsView from '@/views/UiElements/AlertsView.vue'
import ButtonsView from '@/views/UiElements/ButtonsView.vue'
// Code generated by Cursor
// Authentication
import LoginView from '@/views/Authentication/LoginView.vue'
import RegisterView from '@/views/Authentication/RegisterView.vue'
import { useAuthStore } from '@/stores/auth'

// 1- Membership
import BenefitSettingsView from '@/views/MembershipManagement/MemberLevelDefinition/BenefitSettingsView.vue'
import LevelUpDownRulesView from '@/views/MembershipManagement/MemberLevelDefinition/LevelUpDownRulesView.vue'
import AutomaticLevelAdjustmentView from '@/views/MembershipManagement/MemberLevelDefinition/AutomaticLevelAdjustmentView.vue'

import ProfileView from '@/views/MembershipManagement/MemberInformation/ProfileView.vue'
import PurchaseHistoryView from '@/views/MembershipManagement/MemberInformation/PurchaseHistoryView.vue'
import PointRewardView from '@/views/MembershipManagement/MemberInformation/PointRewardView.vue'

import CustomSegmentCreationView from '@/views/MembershipManagement/MemberSegment/CustomSegmentCreationView.vue'
import TargetGroupSettingView from '@/views/MembershipManagement/MemberSegment/TargetGroupSettingView.vue'

// 2- Communication Management
//- Member Data Sync

// - Mail Campaign
// import MailCampaignView from '@/views/Mail/MailCampaignView.vue'
//- Mail Template
import { mailRoutes } from '@/features/mail/routes';
import TemplateMailView from '@/features/mail/views/TemplateMailView.vue'

//- Performance Analysis

// 3- Promotion
// - Coupon Voucher
import CouponTypesView from '@/views/Promotion/ProCouponVoucher/CouponTypesView.vue'
import IssueConditionsView from '@/views/Promotion/ProCouponVoucher/IssueConditionsView.vue'
import UsageHistoryView from '@/views/Promotion/ProCouponVoucher/UsageHistoryView.vue'

// 4 - Analysis Reporting
// - Member Analysis
import LevelAnalysisView from '@/views/AnalysisReporting/MemberAnalysis/LevelAnalysisView.vue'
import PurchasePatternAnalysisView from '@/views/AnalysisReporting/MemberAnalysis/PurchasePatternAnalysisView.vue'
// - Marketing Performance
import CampaignEffectAnalysisView from '@/views/AnalysisReporting/MarketingPerformance/CampaignEffectAnalysisView.vue'
import ChannelPerformanceView from '@/views/AnalysisReporting/MarketingPerformance/ChannelPerformanceView.vue'
// - Sales Analysis
import ProductSalesView from '@/views/AnalysisReporting/SalesAnalysis/ProductSalesView.vue'
import PromotionSalesView from '@/views/AnalysisReporting/SalesAnalysis/PromotionSalesView.vue'

// 5 - Call Campaign
import CallCampaignView from '@/features/call-campaign/views/CallCampaignView.vue';

// 6 - System Management

// End of code generated by Cursor

const routes = [
  // Refactor by cursor
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  // Redirect tất cả các route không xác định về trang login
  // Fix bug cursor
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  },
  {
    path: '/',
    name: 'eCommerce',
    component: ECommerceView,
    meta: {
      title: 'Membership Management',
      requiresAuth: true
    }
  },
  {
    path: '/forms/form-elements',
    name: 'formElements',
    component: FormElementsView,
    meta: {
      title: 'Form Elements'
    }
  },
  {
    path: '/forms/form-layout',
    name: 'formLayout',
    component: FormLayoutView,
    meta: {
      title: 'Form Layout'
    }
  },
  {
    path: '/tables',
    name: 'tables',
    component: TablesView,
    meta: {
      title: 'Tables'
    }
  },
  {
    path: '/pages/settings',
    name: 'settings',
    component: SettingsView,
    meta: {
      title: 'Settings'
    }
  },
  {
    path: '/charts/basic-chart',
    name: 'basicChart',
    component: BasicChartView,
    meta: {
      title: 'Basic Chart'
    }
  },
  {
    path: '/ui-elements/alerts',
    name: 'alerts',
    component: AlertsView,
    meta: {
      title: 'Alerts'
    }
  },
  {
    path: '/ui-elements/buttons',
    name: 'buttons',
    component: ButtonsView,
    meta: {
      title: 'Buttons'
    }
  },
  {
    path: '/member-level-definition/benefit-settings',
    name: 'benefitSettings',
    component: BenefitSettingsView,
    meta: {
      title: 'Benefit Settings',
      // requiresAuth: true // nếu cần xác thực
    }
  },
  {
    path: '/member-level-definition/level-up-down-rules',
    name: 'levelUpDownRules',
    component: LevelUpDownRulesView,
    meta: {
      title: 'Level Up/Down Rules',
      // requiresAuth: true
    }
  },
  {
    path: '/member-level-definition/automatic-level-adjustment',
    name: 'automaticLevelAdjustment',
    component: AutomaticLevelAdjustmentView,
    meta: {
      title: 'Automatic Level Adjustment',
      // requiresAuth: true
    }
  },
  {
    path: '/member-information/profile-management',
    name: 'profileManagement',
    component: ProfileView,
    meta: {
      title: 'Profile Management',
      // requiresAuth: true
    }
  },
  {
    path: '/member-information/purchase-history',
    name: 'purchaseHistory',
    component: PurchaseHistoryView,
    meta: {
      title: 'Purchase History'
    }
  },
  {
    path: '/member-information/point-reward-management',
    name: 'pointRewardManagement',
    component: PointRewardView,
    meta: {
      title: 'Point/Reward Management'
    }
  },
  {
    path: '/mbs-segment/custom-segment-creation',
    name: 'customSegmentCreation',
    component: CustomSegmentCreationView,
    meta: {
      title: 'Custom Segment Creation'
    }
  },
  {
    path: '/mbs-segment/targeting-group-settings',
    name: 'targetingGroupSettings',
    component: TargetGroupSettingView,
    meta: {
      title: 'Targeting Group Settings'
    }
  },
  {
    path: '/pro-coupon-voucher/coupon-types',
    name: 'CouponTypes',
    component: CouponTypesView,
    meta: {
      title: 'Create Coupon',
      requiresAuth: true,
    },
  },
  // {
  //   path: '/pro-coupon-voucher/issue-conditions',
  //   name: 'IssueConditions',
  //   component: IssueConditionsView,
  //   meta: {
  //     title: 'Issue Conditions',
  //     requiresAuth: true,
  //   },
  // },
  {
    path: '/pro-coupon-voucher/usage-history',
    name: 'UsageHistory',
    component: UsageHistoryView,
    meta: {
      title: 'Usage History',
      requiresAuth: true,
    },
  },
  {
    path: '/member-analysis/level-analysis',
    name: 'LevelAnalysis',
    component: LevelAnalysisView,
    meta: {
      title: 'Level Analysis',
      requiresAuth: true
    }
  },
  {
    path: '/member-analysis/purchase-pattern-analysis',
    name: 'PurchasePatternAnalysis',
    component: PurchasePatternAnalysisView,
    meta: {
      title: 'Purchase Pattern Analysis',
      requiresAuth: true
    }
  },
  {
    path: '/marketing-performance/campaign-effect-analysis',
    name: 'CampaignEffectAnalysis',
    component: CampaignEffectAnalysisView,
    meta: {
      title: 'Campaign Effect Analysis',
      requiresAuth: true
    }
  },
  {
    path: '/marketing-performance/channel-performance',
    name: 'ChannelPerformance',
    component: ChannelPerformanceView,
    meta: {
      title: 'Channel Performance',
      requiresAuth: true
    }
  },
  {
    path: '/sales-analysis/product-sales',
    name: 'ProductSales',
    component: ProductSalesView,
    meta: {
      title: 'Product Sales',
      requiresAuth: true
    }
  },
  {
    path: '/sales-analysis/promotion-sales',
    name: 'PromotionSales',
    component: PromotionSalesView,
    meta: {
      title: 'Promotion Sales',
      requiresAuth: true
    }
  },

  // Call Campaign
  {
    path: '/call-campaign',
    name: 'CallCampaign',
    component: CallCampaignView,
    meta: {
      requiresAuth: true,
      title: 'Call Campaign Management',
      permissions: ['view_campaign']
    }
  },
  // End Call Campaign

  // Mail Integration
  {
    path: '/mail/editor-test',
    name: 'editorTest', 
    component: () => import('@/features/mail/views/TemplateEditorView.vue'),
    meta: {
      title: 'Editor Test',
      requiresAuth: true
    }
  },
   // Template Mail
   ...mailRoutes,
   // End Template Mail
  
  //   path: '/mail/editor/:id?',
  //   name: 'MailEditor',
  //   component: () => import('@/features/mail/views/EditorView.vue'),
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/mail/editor/:id',
  //   name: 'MailEditorEdit',
  //   component: () => import('@/features/mail/views/EditorView.vue'),
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: '/mail/send/:id',
  //   name: 'SendPreview',
  //   component: () => import('@/views/Mail/SendPreviewView.vue'),
  //   meta: { requiresAuth: true }
  // },
  // End Mail Integration

  {
    path: '/system-management/permission-management',
    name: 'PermissionManagement',
    component: () => import('@/views/SystemManagement/PermissionManagementView.vue')
  }
]

const router = createRouter({
  // Fix bug 
  history: createWebHistory(''),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  }
})

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  // Nếu route yêu cầu auth và chưa đăng nhập -> chuyển đến login
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
    return;
  }

  // Nếu đã đăng nhập và cố truy cập trang login/register -> chuyển về home
  if (to.meta.requiresGuest && isAuthenticated) {
    next('/');
    return;
  }

  // Cho phép truy cập các route khác
  next();
})

export default router
