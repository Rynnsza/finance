import { createI18n } from 'vue-i18n'
import { ref, type Ref } from 'vue'
import id from '../locales/id.json'
import en from '../locales/en.json'

const i18n = createI18n({
  legacy: false,
  locale: 'id',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    id,
    en,
  },
})

interface I18nGlobal {
  locales: Ref<{ code: string; name: string }[]>
}

// Inject locales into the global instance so our useI18n mock can find them
;(i18n.global as unknown as I18nGlobal).locales = ref([
  { code: 'id', name: 'Indonesia' },
  { code: 'en', name: 'English' },
])

export default i18n
