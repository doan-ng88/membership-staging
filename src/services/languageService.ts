import type { Language, LanguageConfig } from '@/types/language'

export class LanguageService {
  private static STORAGE_KEY = 'app-language'

  private static LANGUAGES: LanguageConfig[] = [
    {
      code: 'vi',
      name: 'Tiếng Việt',
      flag: '/flags/vn.svg'
    },
    {
      code: 'en', 
      name: 'English',
      flag: ''
    }
  ]

  static getDefaultLanguage(): Language {
    const saved = localStorage.getItem(this.STORAGE_KEY)
    return (saved as Language) || 'vi'
  }

  static saveLanguage(lang: Language): void {
    localStorage.setItem(this.STORAGE_KEY, lang)
  }

  static getAvailableLanguages(): LanguageConfig[] {
    return this.LANGUAGES
  }

  static getLanguageConfig(code: Language): LanguageConfig {
    return this.LANGUAGES.find(lang => lang.code === code) || this.LANGUAGES[0]
  }
} 