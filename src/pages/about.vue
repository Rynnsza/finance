<template>
  <div
    class="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300"
  >
    <LandingNavbar />

    <main class="flex-1 px-6 pt-32 pb-24">
      <div class="mx-auto max-w-6xl">
        <!-- Hero Section -->
        <div class="mb-20 text-center md:mb-32">
          <h1 class="text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl leading-none">
            {{ $t('about.hero_title') }}
            <span
              class="block bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
            >
              {{ $t('about.hero_highlight') }}
            </span>
          </h1>
        </div>

        <!-- Mission Bento Block -->
        <div
          class="mb-8 overflow-hidden rounded-4xl border border-border/50 bg-card p-8 md:p-16 shadow-xl relative group"
        >
          <div
            class="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-[100px] group-hover:bg-primary/10 transition-colors duration-700"
          />

          <div class="relative z-10 max-w-3xl">
            <h2 class="mb-8 text-3xl font-black tracking-tighter text-foreground md:text-5xl">
              {{ $t('about.mission_title') }}
            </h2>
            <div
              class="space-y-6 text-lg font-medium leading-relaxed text-muted-foreground md:text-xl"
            >
              <p>{{ $t('about.mission_desc_1') }}</p>
              <p>{{ $t('about.mission_desc_2') }}</p>
            </div>
          </div>
        </div>

        <!-- Values Grid -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div
            v-for="value in values"
            :key="value.titleKey"
            class="rounded-4xl border border-border/50 bg-muted/20 p-8 transition-all hover:bg-muted/30"
          >
            <div
              class="mb-6 flex size-14 items-center justify-center rounded-2xl bg-card shadow-sm border border-border/50"
            >
              <AppIcon :name="value.icon" :size="28" class="text-primary" />
            </div>
            <h3 class="mb-3 text-xl font-black tracking-tight text-foreground">
              {{ $t(value.titleKey) }}
            </h3>
            <p class="font-medium leading-relaxed text-muted-foreground">{{ $t(value.descKey) }}</p>
          </div>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AboutPage',
})
import LandingNavbar from '@/components/landing/Navbar.vue'
import LandingFooter from '@/components/landing/Footer.vue'

const values = [
  {
    titleKey: 'about.value_privacy_title',
    descKey: 'about.value_privacy_desc',
    icon: 'hugeicons:shield-01',
  },
  {
    titleKey: 'about.value_couple_title',
    descKey: 'about.value_couple_desc',
    icon: 'hugeicons:user-group',
  },
  {
    titleKey: 'about.value_modern_title',
    descKey: 'about.value_modern_desc',
    icon: 'hugeicons:grid-view',
  },
]

const { t: tSeo } = useI18n()
useSeoMeta({
  title: tSeo('about.title'),
  ogTitle: tSeo('about.title'),
  description: tSeo('about.mission_desc_1'),
  ogDescription: tSeo('about.mission_desc_1'),
})
</script>
