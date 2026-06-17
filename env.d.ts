/// <reference types="vite/client" />
/// <reference types="vite-plugin-pages/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

import '@vue/runtime-core'

declare module '@vue/runtime-core' {
  export interface ComponentCustomProperties {
    $t: (key: string, ...args: unknown[]) => string;
    $localePath: (path: string) => string;
  }
}

// Ensure global functions are typed
declare global {
  const $t: (key: string, ...args: unknown[]) => string;
  const useI18n: typeof import('./src/composables/nuxt-compat')['useI18n'];
  const useLocalePath: typeof import('./src/composables/nuxt-compat')['useLocalePath'];
  const useColorMode: typeof import('./src/composables/nuxt-compat')['useColorMode'];
  const useHead: typeof import('@unhead/vue')['useHead'];
  const useSeoMeta: typeof import('@unhead/vue')['useSeoMeta'];
  const useRouter: typeof import('vue-router')['useRouter'];
  const useRoute: typeof import('vue-router')['useRoute'];
  const ref: typeof import('vue')['ref'];
  const computed: typeof import('vue')['computed'];
  const watch: typeof import('vue')['watch'];
  const onMounted: typeof import('vue')['onMounted'];
  const onUnmounted: typeof import('vue')['onUnmounted'];
}
