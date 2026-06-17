<template>
  <section id="cta" class="relative py-24 md:py-40 overflow-hidden">
    <!-- background decorative elements -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div
        class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[600px] rounded-full bg-primary/10 blur-[150px]"
      />
    </div>

    <div class="mx-auto max-w-5xl px-6">
      <div
        class="relative overflow-hidden rounded-4xl border border-border/50 bg-card p-8 text-center shadow-xl md:p-20"
      >
        <!-- Inner glow -->
        <div
          class="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent"
        />

        <div class="relative z-10 mx-auto max-w-2xl">
          <h2 class="mb-6 text-4xl font-black tracking-tighter text-foreground md:text-6xl">
            {{ $t('landing.cta_title') }}
          </h2>
          <p class="mb-10 text-lg font-medium leading-relaxed text-muted-foreground md:text-xl">
            {{ $t('landing.cta_desc') }}
          </p>

          <div class="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              class="h-14 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-10 text-base font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.05] active:scale-[0.95]"
              as-child
            >
              <router-link to="/auth/login">
                {{ $t('landing.cta_button') }}
                <AppIcon
                  name="hugeicons:arrow-right-01"
                  :size="20"
                  class="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </router-link>
            </Button>
          </div>

          <p class="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {{ $t('landing.cta_footer') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComponentsLandingCta',
})
import { Button } from '@/components/ui/button'
</script>
