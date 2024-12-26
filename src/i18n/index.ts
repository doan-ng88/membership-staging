import { createI18n } from 'vue-i18n'
import enCommon from './locales/en/common.json'
import enMembership from './locales/en/membership-en.json'
import viCommon from './locales/vi/common.json'
import viMembership from './locales/vi/membership-vi.json'

// Merge các file translation
const messages = {
  en: {
    ...enCommon,
    ...enMembership
  },
  vi: {
    ...viCommon,
    ...viMembership
  }
}

export default createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'vi',
  fallbackLocale: 'en',
  messages,
  globalInjection: true,
  allowComposition: true
}) 