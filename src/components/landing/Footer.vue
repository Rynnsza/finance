<template>
  <footer class="border-t border-border/40 bg-card/50 backdrop-blur-xl pt-20 pb-10 px-6">
    <div class="mx-auto max-w-7xl">
      <!-- Top Section: Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        <!-- Column 1: Brand -->
        <div class="space-y-6">
          <router-link to="/" class="flex items-center gap-3 group w-fit">
            <div
              class="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-b from-primary to-primary/90 text-white transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-primary/20"
            >
              <AppIcon name="hugeicons:wallet-01" :size="22" />
            </div>
            <span
              class="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-all duration-500"
            >
              {{ brandParts.first }}<span class="hidden sm:inline">{{ brandParts.rest }}</span>
            </span>
          </router-link>
          <p class="text-sm text-muted-foreground leading-relaxed font-medium max-w-60">
            {{ $t('landing.hero_title') }}
          </p>
          <div class="flex items-center gap-3">
            <a
              v-for="social in socialLinks"
              :key="social.labelKey"
              :href="social.href"
              class="h-10 w-10 flex items-center justify-center rounded-xl border border-border/50 bg-muted/30 text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-primary shadow-sm active:scale-90"
              :aria-label="$t(`landing.${social.labelKey}`)"
            >
              <AppIcon :name="social.icon" :size="18" />
            </a>
          </div>
        </div>

        <!-- Column 2: Product -->
        <div>
          <h2
            class="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-muted-foreground/90"
          >
            {{ $t('landing.footer_product') }}
          </h2>
          <ul class="space-y-4">
            <li v-for="link in productLinks" :key="link.labelKey">
              <Button
                variant="link"
                class="h-auto p-0 text-sm text-muted-foreground font-bold hover:text-primary hover:no-underline transition-colors"
                @click="scrollToSection(link.href)"
              >
                {{ $t(link.labelKey) }}
              </Button>
            </li>
          </ul>
        </div>

        <!-- Column 3: Company & Legal -->
        <div>
          <h2
            class="text-[10px] font-black uppercase tracking-[0.2em] mb-8 text-muted-foreground/90"
          >
            {{ $t('landing.footer_company') }}
          </h2>
          <ul class="space-y-4">
            <li v-for="link in companyLinks" :key="link.labelKey">
              <a
                :href="link.href"
                class="text-sm text-muted-foreground font-bold transition-colors hover:text-primary"
              >
                {{ $t(link.labelKey) }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 4: Newsletter -->
        <div class="space-y-6">
          <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/90">
            {{ $t('landing.footer_subscribe_title') }}
          </h2>
          <p class="text-sm text-muted-foreground font-medium leading-relaxed">
            {{ $t('landing.footer_subscribe_desc') }}
          </p>
          <div class="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
            <div class="relative flex-1">
              <AppIcon
                name="hugeicons:mail-01"
                :size="16"
                class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90"
              />
              <Input
                type="email"
                :placeholder="$t('landing.footer_subscribe_placeholder')"
                class="h-11 w-full pl-10 pr-3 rounded-2xl border border-border/50 bg-muted/30 text-sm font-bold focus:border-primary/50 transition-all"
              />
            </div>
            <Button
              size="sm"
              class="h-11 rounded-2xl bg-primary px-6 font-black uppercase tracking-widest text-[10px] text-white shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
            >
              {{ $t('landing.footer_subscribe_button') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Bottom Section: Copyright -->
      <div
        class="pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-6"
      >
        <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {{ $t('landing.footer_copyright', { year: new Date().getFullYear() }) }}
        </p>
        <div class="flex items-center gap-8">
          <a
            v-for="link in legalLinks"
            :key="link.labelKey"
            :href="link.href"
            class="text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/90 transition-colors hover:text-primary"
          >
            {{ $t(link.labelKey) }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComponentsLandingFooter',
})
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const { t } = useI18n()

const brandParts = computed(() => {
  const full = t('sidebar.finance')
  const parts = full.split(' ')
  if (parts.length > 1) {
    return {
      first: parts[0],
      rest: ' ' + parts.slice(1).join(' '),
    }
  }
  return { first: full, rest: '' }
})

const socialLinks = [
  { labelKey: 'footer_github', href: 'https://github.com/seaavey', icon: 'hugeicons:github' },
]

const productLinks = [
  { labelKey: 'landing.nav_features', href: '#features' },
  { labelKey: 'landing.nav_testimonials', href: '#testimonials' },
  { labelKey: 'landing.nav_faq', href: '#faq' },
]

const companyLinks = [
  { labelKey: 'landing.footer_about', href: '/about' },
  { labelKey: 'landing.footer_contact', href: '/contact' },
]

const legalLinks = [
  { labelKey: 'landing.footer_privacy', href: '/privacy-policy' },
  { labelKey: 'landing.footer_terms', href: '/terms-of-service' },
]

const scrollToSection = (href: string) => {
  const id = href.replace('#', '')
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}
</script>
