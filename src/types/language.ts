export type Language = 'vi' | 'en'

export interface LanguageConfig {
  code: Language
  name: string
  flag: string
}

export interface LanguageState {
  current: Language
  available: LanguageConfig[]
} 