<template>
  <div
    class="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-300"
  >
    <LandingNavbar />

    <main class="flex-1 px-6 pt-32 pb-24">
      <div class="mx-auto max-w-4xl">
        <!-- Hero Section -->
        <div class="mb-16 text-center md:mb-24">
          <h1 class="text-5xl font-black tracking-tighter md:text-7xl leading-none mb-6">
            {{ $t('terms.hero_title') }}
          </h1>
          <p class="mx-auto max-w-2xl text-lg font-medium text-muted-foreground md:text-xl">
            {{ $t('terms.last_updated') }}
          </p>
        </div>

        <!-- Content Sections -->
        <div class="space-y-8">
          <div
            v-for="(section, index) in sections"
            :key="index"
            class="rounded-4xl border border-border/50 bg-card p-8 md:p-12 shadow-sm relative group"
          >
            <div
              class="absolute -top-24 -right-24 size-96 rounded-full bg-primary/5 blur-[100px] group-hover:bg-primary/10 transition-colors duration-700"
            />
            <div class="relative z-10">
              <span
                class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block"
              >
                {{ $t(section.sectionKey) }}
              </span>
              <h2 class="text-2xl font-black tracking-tight text-foreground md:text-3xl mb-6">
                {{ $t(section.titleKey) }}
              </h2>
              <div
                v-if="section.paragraphs"
                class="space-y-4 text-base font-medium leading-relaxed text-muted-foreground md:text-lg"
              >
                <p v-for="(p, i) in section.paragraphs.length" :key="i">
                  {{ $t(section.paragraphs[i] || '') }}
                </p>
              </div>
              <ul v-if="section.list" class="space-y-3">
                <li
                  v-for="(item, i) in section.list.length"
                  :key="i"
                  class="flex items-start gap-3 text-base font-medium leading-relaxed text-muted-foreground md:text-lg"
                >
                  <AppIcon
                    name="hugeicons:checkmark-circle-01"
                    :size="22"
                    class="mt-0.5 shrink-0 text-primary"
                  />
                  <span>{{ $t(section.list[i] || '') }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="mt-12 rounded-4xl border border-border/50 bg-muted/20 p-8 md:p-12 text-center">
          <h2 class="text-2xl font-black tracking-tight text-foreground md:text-3xl mb-4">
            {{ $t('terms.contact_title') }}
          </h2>
          <p class="text-base font-medium leading-relaxed text-muted-foreground md:text-lg mb-6">
            {{ $t('terms.contact_desc') }}
          </p>
          <a
            href="mailto:me@seaavey.com"
            class="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 font-black text-sm text-white shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all"
          >
            <AppIcon name="hugeicons:mail-01" :size="20" />
            {{ $t('contact.email_label') }}
          </a>
        </div>
      </div>
    </main>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import LandingNavbar from '@/components/landing/Navbar.vue'
import LandingFooter from '@/components/landing/Footer.vue'

const sections = [
  {
    sectionKey: 'terms.section_acceptance',
    titleKey: 'terms.acceptance_title',
    paragraphs: ['terms.acceptance_p1'],
  },
  {
    sectionKey: 'terms.section_account',
    titleKey: 'terms.account_title',
    paragraphs: ['terms.account_p1'],
    list: ['terms.account_item_1', 'terms.account_item_2', 'terms.account_item_3'],
  },
  {
    sectionKey: 'terms.section_usage',
    titleKey: 'terms.usage_title',
    paragraphs: ['terms.usage_p1'],
    list: [
      'terms.usage_item_1',
      'terms.usage_item_2',
      'terms.usage_item_3',
      'terms.usage_item_4',
      'terms.usage_item_5',
    ],
  },
  {
    sectionKey: 'terms.section_intellectual',
    titleKey: 'terms.intellectual_title',
    paragraphs: ['terms.intellectual_p1'],
  },
  {
    sectionKey: 'terms.section_limitation',
    titleKey: 'terms.limitation_title',
    paragraphs: ['terms.limitation_p1', 'terms.limitation_p2'],
  },
  {
    sectionKey: 'terms.section_termination',
    titleKey: 'terms.termination_title',
    paragraphs: ['terms.termination_p1'],
  },
  {
    sectionKey: 'terms.section_changes',
    titleKey: 'terms.changes_title',
    paragraphs: ['terms.changes_p1'],
  },
]

const { t: tSeo } = useI18n()
useSeoMeta({
  title: tSeo('terms_of_service.title'),
  ogTitle: tSeo('terms_of_service.title'),
  description: tSeo('terms_of_service.intro_desc'),
  ogDescription: tSeo('terms_of_service.intro_desc'),
})
</script>
