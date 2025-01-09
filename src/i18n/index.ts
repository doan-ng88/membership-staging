import { createI18n, useI18n } from 'vue-i18n/dist/vue-i18n.mjs'
import { ref } from 'vue'

// Import các file translation
import enCommon from './locales/en/common.json'
import enHeader from './locales/en/header.json'
import enSidebar from './locales/en/sidebar.json'
import enMembership from './locales/en/membership-en.json'
import enBenefit from './locales/en/benefit.json'
import enBenefitModal from './locales/en/benefit-modal.json'
import enLevelUpDownRules from './locales/en/level-up-down-rules.json'
import enAutomaticAdjustment from './locales/en/automatic-adjustment.json'
import enProfileManagement from './locales/en/profile-management.json'
import enMembershipTable from './locales/en/membership-table.json'
import enSearchFilters from './locales/en/search-filters.json'
import enPurchaseHistory from './locales/en/purchase-history.json'
import enPointReward from './locales/en/point-reward.json'
import enPermissionManagement from './locales/en/permissionManagement.json'
import enMailCampaign from './locales/en/mailCampaign.json'
import enCampaignFilters from './locales/en/campaignFilters.json'
import enCampaignActions from './locales/en/campaignActions.json'
import enNewEmailCampaign from './locales/en/newEmailCampaign.json'
import enMembershipList from './locales/en/membershipList.json'
import enAddMemberModal from './locales/en/addMemberModal.json'
import enTemplateMail from './locales/en/templateMail.json'
import enTemplateEditor from './locales/en/templateEditor.json'
import enCampaignTabMail from './locales/en/campaignTabMail.json'
import enZaloTemplate from './locales/en/zaloTemplate.json'
import enZaloCampaignList from './locales/en/zaloCampaignList.json'
import enZaloCreateCampaign from './locales/en/zaloCreateCampaign.json'
import enCouponTypes from './locales/en/couponTypes.json'
import enCouponHistory from './locales/en/couponHistory.json'
import enLevelAnalysis from './locales/en/levelAnalysis.json'
import enMemberStatistics from './locales/en/memberStatistics.json'
import enTransitionAnalysis from './locales/en/transitionAnalysis.json'
import enBehaviorChart from './locales/en/behaviorChart.json'
import enPurchasePattern from './locales/en/purchasePattern.json'
import enMarketingPerformance from './locales/en/marketingPerformance.json'
import enSalesAnalysis from './locales/en/salesAnalysis.json'
import enCallCampaign from './locales/en/callCampaign.json'
import enEditCampaignModal from './locales/en/editCampaignModal.json'

import viCommon from './locales/vi/common.json'
import viHeader from './locales/vi/header.json'
import viSidebar from './locales/vi/sidebar.json'
import viMembership from './locales/vi/membership-vi.json'
import viBenefit from './locales/vi/benefit.json'
import viBenefitModal from './locales/vi/benefit-modal.json'
import viLevelUpDownRules from './locales/vi/level-up-down-rules.json'
import viAutomaticAdjustment from './locales/vi/automatic-adjustment.json'
import viProfileManagement from './locales/vi/profile-management.json'
import viMembershipTable from './locales/vi/membership-table.json'
import viSearchFilters from './locales/vi/search-filters.json'    
import viPurchaseHistory from './locales/vi/purchase-history.json'
import viPointReward from './locales/vi/point-reward.json'
import viPermissionManagement from './locales/vi/permissionManagement.json'
import viMailCampaign from './locales/vi/mailCampaign.json'
import viCampaignFilters from './locales/vi/campaignFilters.json'
import viCampaignActions from './locales/vi/campaignActions.json'
import viNewEmailCampaign from './locales/vi/newEmailCampaign.json'
import viMembershipList from './locales/vi/membershipList.json'
import viAddMemberModal from './locales/vi/addMemberModal.json'
import viTemplateMail from './locales/vi/templateMail.json'
import viTemplateEditor from './locales/vi/templateEditor.json'
import viCampaignTabMail from './locales/vi/campaignTabMail.json'
import viZaloTemplate from './locales/vi/zaloTemplate.json'
import viZaloCampaignList from './locales/vi/zaloCampaignList.json'
import viZaloCreateCampaign from './locales/vi/zaloCreateCampaign.json'
import viCouponTypes from './locales/vi/couponTypes.json'
import viCouponHistory from './locales/vi/couponHistory.json'
import viLevelAnalysis from './locales/vi/levelAnalysis.json'
import viMemberStatistics from './locales/vi/memberStatistics.json'
import viTransitionAnalysis from './locales/vi/transitionAnalysis.json'
import viBehaviorChart from './locales/vi/behaviorChart.json'
import viPurchasePattern from './locales/vi/purchasePattern.json'
import viMarketingPerformance from './locales/vi/marketingPerformance.json'
import viSalesAnalysis from './locales/vi/salesAnalysis.json'
import viCallCampaign from './locales/vi/callCampaign.json'
import viEditCampaignModal from './locales/vi/editCampaignModal.json'

// Merge tất cả messages
const messages = {
  en: {
    ...enCommon,
    ...enHeader,
    ...enSidebar,
    ...enMembership,
    ...enBenefit,
    ...enLevelUpDownRules,
    ...enBenefitModal,
    ...enAutomaticAdjustment,
    ...enProfileManagement,
    ...enMembershipTable,
    ...enSearchFilters,
    ...enPurchaseHistory,
    ...enPointReward,
    ...enPermissionManagement,
    ...enMailCampaign,
    ...enCampaignFilters,
    ...enCampaignActions,
    ...enNewEmailCampaign,
    ...enMembershipList,
    ...enAddMemberModal,
    ...enTemplateMail,
    ...enTemplateEditor,
    ...enCampaignTabMail,
    ...enZaloTemplate,
    ...enZaloCampaignList,
    ...enZaloCreateCampaign,
    ...enCouponTypes,
    ...enCouponHistory,
    ...enLevelAnalysis,
    ...enMemberStatistics,
    ...enTransitionAnalysis,
    ...enBehaviorChart,
    ...enPurchasePattern,
    ...enMarketingPerformance,
    ...enSalesAnalysis,
    ...enCallCampaign,
    ...enEditCampaignModal
  },
  vi: {
    ...viCommon,
    ...viHeader,
    ...viSidebar,
    ...viMembership,
    ...viBenefit,
    ...viLevelUpDownRules,
    ...viBenefitModal,
    ...viAutomaticAdjustment,
    ...viProfileManagement,
    ...viMembershipTable,
    ...viSearchFilters,
    ...viPurchaseHistory,
    ...viPointReward,
    ...viPermissionManagement,
    ...viMailCampaign,
    ...viCampaignFilters,
    ...viCampaignActions,
    ...viNewEmailCampaign,
    ...viMembershipList,
    ...viAddMemberModal,
    ...viTemplateMail,
    ...viTemplateEditor,
    ...viCampaignTabMail,
    ...viZaloTemplate,
    ...viZaloCampaignList,
    ...viZaloCreateCampaign,
    ...viCouponTypes,
    ...viCouponHistory,
    ...viLevelAnalysis,
    ...viMemberStatistics,
    ...viTransitionAnalysis,
    ...viBehaviorChart,
    ...viPurchasePattern,
    ...viMarketingPerformance,
    ...viSalesAnalysis,
    ...viCallCampaign,
    ...viEditCampaignModal
  }
}


// Tạo i18n instance
export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'vi',
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  allowComposition: true
})
// Composable để sử dụng globally
export function useI18nGlobal() {
  try {
    return useI18n({
      useScope: 'global',
      messages
    })
  } catch (error) {
    console.error('[i18n] Error in useI18nGlobal:', error)
    return {
      t: (key: string) => key,
      locale: ref('vi')
    }
  }
}

export default i18n 