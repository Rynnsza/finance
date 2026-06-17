<template>
  <section id="features" class="relative px-6 py-24 md:py-40 overflow-hidden">
    <!-- background decorative elements -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute top-1/2 left-0 size-96 rounded-full bg-primary/5 blur-[120px]" />
      <div class="absolute bottom-0 right-0 size-[500px] rounded-full bg-blue-500/5 blur-[150px]" />
    </div>

    <div class="mx-auto max-w-6xl">
      <!-- Section Header -->
      <div class="mx-auto mb-20 max-w-3xl text-center md:mb-28">
        <div
          class="mb-6 inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-primary backdrop-blur-md transition-all hover:bg-card/80 shadow-sm"
        >
          <AppIcon name="hugeicons:grid-view" :size="14" />
          {{ $t('landing.features_title') }}
        </div>
        <h2
          class="mb-6 text-4xl font-black tracking-tighter text-foreground md:text-5xl lg:text-6xl"
        >
          {{ $t('landing.features_heading') }}
        </h2>
        <p class="text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
          {{ $t('landing.features_desc') }}
        </p>
      </div>

      <!-- Features Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
        <div
          v-for="(feature, index) in features"
          :key="feature.titleKey"
          class="group relative overflow-hidden rounded-4xl border border-border/50 bg-card p-8 transition-all duration-500 hover:-translate-y-2 hover:border-border hover:shadow-xl hover:shadow-primary/5 dark:hover:shadow-none md:p-10"
          :style="{ animationDelay: `${index * 100 + 400}ms` }"
        >
          <!-- Hover Glow Effect -->
          <div
            class="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          <div
            class="relative mb-8 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-primary/20"
            :class="feature.iconBg"
          >
            <!-- Animated Icon Glow -->
            <div
              class="absolute inset-0 rounded-2xl opacity-0 blur-lg transition-opacity group-hover:opacity-50"
              :class="feature.iconBg"
            />
            <AppIcon
              :name="feature.icon"
              :size="32"
              :class="feature.iconColor"
              class="relative z-10"
            />
          </div>

          <div class="relative z-10">
            <h3
              class="mb-3 text-xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors"
            >
              {{ $t(feature.titleKey) }}
            </h3>
            <p
              class="font-medium leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors"
            >
              {{ $t(feature.descKey) }}
            </p>
          </div>

          <!-- Decorative Arrow on Hover -->
          <div
            class="absolute bottom-8 right-8 translate-x-4 opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
          >
            <div
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-border/50 bg-muted/50 text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
            >
              <AppIcon name="hugeicons:arrow-right-01" :size="16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComponentsLandingFeatures',
})
interface Feature {
  titleKey: string
  descKey: string
  icon: string
  iconBg: string
  iconColor: string
}

const features: Feature[] = [
  {
    titleKey: 'landing.feature_dashboard_title',
    descKey: 'landing.feature_dashboard_desc',
    icon: 'hugeicons:chart',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    titleKey: 'landing.feature_recurring_title',
    descKey: 'landing.feature_recurring_desc',
    icon: 'hugeicons:repeat',
    iconBg: 'bg-purple-500/10',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
  {
    titleKey: 'landing.feature_couple_title',
    descKey: 'landing.feature_couple_desc',
    icon: 'hugeicons:group',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-500 dark:text-pink-400',
  },
  {
    titleKey: 'landing.feature_wallet_title',
    descKey: 'landing.feature_wallet_desc',
    icon: 'hugeicons:wallet-01',
    iconBg: 'bg-green-500/10',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  {
    titleKey: 'landing.feature_export_title',
    descKey: 'landing.feature_export_desc',
    icon: 'hugeicons:file-02',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    titleKey: 'landing.feature_category_title',
    descKey: 'landing.feature_category_desc',
    icon: 'hugeicons:arrange',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
  },
]
</script>
