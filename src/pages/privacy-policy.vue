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
            {{ $t('privacy.hero_title') }}
          </h1>
          <p class="mx-auto max-w-2xl text-lg font-medium text-muted-foreground md:text-xl">
            {{ $t('privacy.last_updated') }}
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
            {{ $t('privacy.contact_title') }}
          </h2>
          <p class="text-base font-medium leading-relaxed text-muted-foreground md:text-lg mb-6">
            {{ $t('privacy.contact_desc') }}
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
    sectionKey: 'privacy.section_info',
    titleKey: 'privacy.info_title',
    paragraphs: ['privacy.info_p1', 'privacy.info_p2', 'privacy.info_p3'],
  },
  {
    sectionKey: 'privacy.section_usage',
    titleKey: 'privacy.usage_title',
    paragraphs: ['privacy.usage_p1'],
    list: [
      'privacy.usage_item_1',
      'privacy.usage_item_2',
      'privacy.usage_item_3',
      'privacy.usage_item_4',
      'privacy.usage_item_5',
    ],
  },
  {
    sectionKey: 'privacy.section_sharing',
    titleKey: 'privacy.sharing_title',
    paragraphs: ['privacy.sharing_p1'],
  },
  {
    sectionKey: 'privacy.section_security',
    titleKey: 'privacy.security_title',
    paragraphs: ['privacy.security_p1', 'privacy.security_p2'],
  },
  {
    sectionKey: 'privacy.section_rights',
    titleKey: 'privacy.rights_title',
    paragraphs: ['privacy.rights_p1'],
    list: [
      'privacy.rights_item_1',
      'privacy.rights_item_2',
      'privacy.rights_item_3',
      'privacy.rights_item_4',
    ],
  },
  {
    sectionKey: 'privacy.section_cookies',
    titleKey: 'privacy.cookies_title',
    paragraphs: ['privacy.cookies_p1', 'privacy.cookies_p2'],
  },
  {
    sectionKey: 'privacy.section_changes',
    titleKey: 'privacy.changes_title',
    paragraphs: ['privacy.changes_p1'],
  },
]

const { t: tSeo } = useI18n()
useSeoMeta({
  title: tSeo('privacy_policy.title'),
  ogTitle: tSeo('privacy_policy.title'),
  description: tSeo('privacy_policy.intro_desc'),
  ogDescription: tSeo('privacy_policy.intro_desc'),
})
</script>
