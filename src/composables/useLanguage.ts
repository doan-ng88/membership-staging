import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Language, LanguageState } from '@/types/language'
import { LanguageService } from '@/services/languageService'

export function useLanguage() {
  const { locale } = useI18n()
  
  const state = ref<LanguageState>({
    current: 'vi',
    available: LanguageService.getAvailableLanguages()
  })

  const currentLanguage = computed(() => 
    LanguageService.getLanguageConfig(state.value.current)
  )

  const toggleLanguage = () => {
    const newLang: Language = state.value.current === 'vi' ? 'en' : 'vi'
    state.value.current = newLang
    locale.value = newLang
    LanguageService.saveLanguage(newLang)
  }

  return {
    currentLanguage,
    availableLanguages: state.value.available,
    toggleLanguage
  }
} 