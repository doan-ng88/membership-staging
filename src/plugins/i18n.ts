import { createI18n } from 'vue-i18n';
import { ref } from 'vue';
import enCommon from '@/i18n/locales/en/common.json';
import enBenefit from '@/i18n/locales/en/benefit.json';
import viCommon from '@/i18n/locales/vi/common.json';
import viBenefit from '@/i18n/locales/vi/benefit.json';

// Merge messages
const messages = {
  en: {
    ...enCommon,
    ...enBenefit
  },
  vi: {
    ...viCommon,
    ...viBenefit
  }
};

export const i18n = createI18n({
  legacy: false,          // Bắt buộc để sử dụng Composition API
  globalInjection: true,  // Cho phép inject global
  allowComposition: true, // Cho phép sử dụng composition API
  locale: localStorage.getItem('locale') || 'vi',
  fallbackLocale: 'en',
  messages
});

// Composable để sử dụng globally
export function useI18nGlobal() {
  // Đảm bảo useI18n được gọi trong setup context
  try {
    const i18n = useI18n({
      useScope: 'global',
      messages: {
        en,
        vi
      }
    });
    return i18n;
  } catch (error) {
    console.error('[i18n] Error in useI18nGlobal:', error);
    // Fallback để tránh crash app
    return {
      t: (key: string) => key,
      locale: ref('vi')
    };
  }
}

// Utility function để chuyển đổi ngôn ngữ
export function setLocale(locale: 'en' | 'vi') {
  try {
    i18n.global.locale.value = locale;
    localStorage.setItem('locale', locale);
    document.querySelector('html')?.setAttribute('lang', locale);
  } catch (error) {
    console.error('[i18n] Error setting locale:', error);
  }
}

// Export default để sử dụng trong main.ts
export default i18n;