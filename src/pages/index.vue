<template>
  <div
    class="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300"
  >
    <LandingNavbar />

    <main class="flex-1">
      <LandingHero />
      <LandingFeatures />
      <LandingTestimonials />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'LandingPage',
})
import { defineAsyncComponent } from 'vue'
import LandingNavbar from '@/components/landing/Navbar.vue'
import LandingHero from '@/components/landing/Hero.vue'
import { getOgImageUrl } from '@/lib/utils'

// Lazy load below-fold landing sections for faster initial load
const LandingFeatures = defineAsyncComponent(() => import('@/components/landing/Features.vue'))
const LandingTestimonials = defineAsyncComponent(
  () => import('@/components/landing/Testimonials.vue'),
)
const LandingFaq = defineAsyncComponent(() => import('@/components/landing/Faq.vue'))
const LandingCta = defineAsyncComponent(() => import('@/components/landing/Cta.vue'))
const LandingFooter = defineAsyncComponent(() => import('@/components/landing/Footer.vue'))

// Note: layout: 'blank' is handled in App.vue meta checks
// but we need to ensure the route meta is set in router/index.ts

const { t } = useI18n()

const title = t('landing.title')
const description = `${t('landing.hero_desc')} ${t('landing.hero_free')}.`

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
  ogImage: getOgImageUrl('Aemy Finance', description),
  twitterCard: 'summary_large_image',
})
</script>
