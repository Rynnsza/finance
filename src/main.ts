import './styles/globals.css'
import { createApp } from 'vue'
import { RouterLink } from 'vue-router'
import { createHead } from '@unhead/vue/client'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'
import Icon from './components/Icon.vue'
import ClientOnly from './components/ClientOnly.vue'

const app = createApp(App)
const head = createHead()

app.use(router)
app.use(i18n)
app.use(head)
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  },
})

// Register Nuxt-compat global components
app.component('AppIcon', Icon)
app.component('ClientOnly', ClientOnly)
app.component('NuxtLinkLocale', RouterLink)
app.component('NuxtLink', RouterLink)

app.mount('#app')
