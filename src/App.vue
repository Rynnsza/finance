<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { defineAsyncComponent } from 'vue'

const DefaultLayout = defineAsyncComponent(() => import('./layouts/default.vue'))
const BlankLayout = defineAsyncComponent(() => import('./layouts/blank.vue'))
const AppToast = defineAsyncComponent(() => import('./components/AppToast.vue'))

const route = useRoute()
const { t, locale } = useI18n()

const pageTitle = computed(() => {
  const titleKey = (route.meta.title as string) || ''
  if (titleKey && titleKey !== '') {
    return t(titleKey)
  }
  return ''
})

useHead({
  title: pageTitle,
  titleTemplate: (title) => (title ? `${title} | Aemy Finance` : 'Aemy Finance'),
  htmlAttrs: {
    lang: locale,
  },
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#cf284e' },
  ],
})

const { bills, fetchBills } = useBills()
const { toast } = useToast()

const online = useOnline()

watch(online, (val) => {
  if (!val) {
    toast.error(t('toast.offline'))
  } else {
    toast.info(t('toast.back_online'))
  }
})

onMounted(async () => {
  if (route.meta.layout === 'blank') return

  const { useAuth } = await import('@/composables/useAuth')
  const { formatDateSafe } = await import('@/lib/utils')
  const { useLocalStorage } = await import('@vueuse/core')
  const { user } = useAuth()

  const lastBillAlertDate = useLocalStorage<string | null>('last-bill-alert-date', null)

  watch(
    () => user.value,
    async (newUser) => {
      if (newUser) {
        await fetchBills()
        const today = formatDateSafe(new Date())

        // Only alert once per day
        if (lastBillAlertDate.value === today) return

        const dueToday = bills.value.filter((b) => b.due_date === today && !b.is_paid)

        if (dueToday.length > 0) {
          toast.info(`You have ${dueToday.length} bill(s) due today!`)
          lastBillAlertDate.value = today
        }
      }
    },
    { immediate: true },
  )
})

const layout = computed(() => {
  if (route.meta.layout === 'blank') {
    return BlankLayout
  }
  return DefaultLayout
})
</script>

<template>
  <!-- Offline notification banner -->
  <div
    v-if="!online"
    class="sticky top-0 z-50 bg-destructive text-destructive-foreground text-center text-sm py-1 px-3"
    role="alert"
    aria-live="assertive"
    aria-atomic="true"
  >
    {{ t('offline.banner') }}
  </div>
  <component :is="layout">
    <router-view />
  </component>
  <AppToast />
</template>
