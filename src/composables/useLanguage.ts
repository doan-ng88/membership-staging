import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface Language {
  code: string;
  name: string;
  flag: string;
}

// Tạo singleton instance để tránh lỗi setup
let cachedT: any = null;

export function useLanguage() {
  const i18n = useI18n()
  
  // Cache translation function
  if (!cachedT) {
    cachedT = i18n.t;
  }

  const languages: Language[] = [
    {
      code: 'vi',
      name: 'Tiếng Việt',
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/vn.svg'
    },
    {
      code: 'en',
      name: 'English',
      flag: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/gb.svg'
    }
  ];

  const currentLanguage = computed(() => {
    return languages.find(lang => lang.code === i18n.locale.value) || languages[0];
  });

  const toggleLanguage = () => {
    const currentIndex = languages.findIndex(lang => lang.code === i18n.locale.value);
    const nextIndex = (currentIndex + 1) % languages.length;
    i18n.locale.value = languages[nextIndex].code;
    localStorage.setItem('locale', i18n.locale.value);
    document.querySelector('html')?.setAttribute('lang', i18n.locale.value);
  };

  return {
    t: cachedT,
    currentLanguage,
    languages,
    toggleLanguage
  }
} 