declare module 'vue-i18n/dist/vue-i18n.mjs' {
  import type { Composer, ComposerOptions, VueI18n, I18n } from 'vue-i18n'
  
  export * from 'vue-i18n'
  export { VueI18n }
  export { Composer }
  export { ComposerOptions }
  export { I18n }

  export function useI18n(options?: ComposerOptions): Composer
  export function createI18n(options?: I18nOptions): I18n

  export interface I18nOptions {
    locale?: string
    fallbackLocale?: string
    messages?: Record<string, any>
    legacy?: boolean
    globalInjection?: boolean
    allowComposition?: boolean
  }
} 