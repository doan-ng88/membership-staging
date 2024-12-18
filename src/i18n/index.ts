import { createI18n } from 'vue-i18n'
import { LanguageService } from '@/services/languageService'
import en from './locales/en'
import vi from './locales/vi'

export default createI18n({
  legacy: false,
  locale: 'vi',
  fallbackLocale: 'en',
  messages: {
    en,
    vi
  }
}) 