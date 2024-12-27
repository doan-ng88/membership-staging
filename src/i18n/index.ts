import { createI18n, useI18n } from 'vue-i18n/dist/vue-i18n.mjs'
import { ref } from 'vue'

// Import các file translation
import enCommon from './locales/en/common.json'
import enMembership from './locales/en/membership-en.json'
import enBenefit from './locales/en/benefit.json'
import enBenefitModal from './locales/en/benefit-modal.json'
import enLevelUpDownRules from './locales/en/level-up-down-rules.json'
import enAutomaticAdjustment from './locales/en/automatic-adjustment.json'
import enProfileManagement from './locales/en/profile-management.json'

import viCommon from './locales/vi/common.json'
import viMembership from './locales/vi/membership-vi.json'
import viBenefit from './locales/vi/benefit.json'
import viBenefitModal from './locales/vi/benefit-modal.json'
import viLevelUpDownRules from './locales/vi/level-up-down-rules.json'
import viAutomaticAdjustment from './locales/vi/automatic-adjustment.json'
import viProfileManagement from './locales/vi/profile-management.json'

// Merge tất cả messages
const messages = {
  en: {
    ...enCommon,
    ...enMembership,
    ...enBenefit,
    ...enLevelUpDownRules,
    ...enBenefitModal,
    ...enAutomaticAdjustment,
    ...enProfileManagement
  },
  vi: {
    ...viCommon,
    ...viMembership,
    ...viBenefit,
    ...viLevelUpDownRules,
    ...viBenefitModal,
    ...viAutomaticAdjustment,
    ...viProfileManagement
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