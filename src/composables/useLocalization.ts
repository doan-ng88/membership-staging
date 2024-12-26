import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export function useLocalization() {
  const { t, locale, availableLocales } = useI18n();

  const currentLocale = computed(() => locale.value);
  
  const changeLocale = (newLocale: string) => {
    locale.value = newLocale;
    localStorage.setItem('locale', newLocale);
  };

  const formatDate = (date: string | Date, format = 'long') => {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat(locale.value, {
      dateStyle: format as 'full' | 'long' | 'medium' | 'short'
    }).format(dateObj);
  };

  return {
    t,
    currentLocale,
    availableLocales,
    changeLocale,
    formatDate
  };
} 