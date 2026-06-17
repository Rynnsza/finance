<template>
  <section
    class="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 pt-20 pb-24 md:pt-32 md:pb-40"
  >
    <!-- Premium Dynamic Background -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute top-0 left-1/2 h-full w-full max-w-7xl -translate-x-1/2 opacity-20">
        <div
          class="absolute left-[-10%] top-[-10%] size-[500px] animate-pulse rounded-full bg-primary/20 blur-[120px]"
        />
        <div
          class="absolute bottom-[-10%] right-[-10%] size-[400px] animate-pulse rounded-full bg-blue-500/10 blur-[100px] [animation-delay:3s]"
        />
      </div>
    </div>

    <div class="relative z-10 w-full max-w-6xl mx-auto">
      <!-- Animated Badge -->
      <div class="mb-10 flex justify-center">
        <div
          class="group inline-flex items-center gap-2 rounded-full border border-border/50 bg-card/50 px-5 py-2 text-[10px] font-black uppercase tracking-widest backdrop-blur-md transition-all hover:bg-card/80 shadow-sm"
        >
          <span class="relative flex h-2 w-2">
            <span
              class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"
            />
            <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span class="text-muted-foreground group-hover:text-foreground transition-colors">{{
            $t('landing.hero_badge')
          }}</span>
          <AppIcon
            name="hugeicons:arrow-right-01"
            :size="12"
            class="text-primary opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0"
          />
        </div>
      </div>

      <!-- Main Headline -->
      <div class="mx-auto max-w-4xl text-center">
        <h1
          class="text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1] text-foreground"
        >
          {{ heroTitleStart }}
          <span class="relative inline-block mt-2 sm:mt-0">
            <span
              class="relative z-10 bg-linear-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent"
            >
              {{ heroTitleHighlight }}
            </span>
            <div
              class="absolute -bottom-2 left-0 w-full h-4 bg-primary/10 -rotate-1 -z-10 rounded-full blur-[4px]"
            />
          </span>
        </h1>
        <p
          class="mx-auto mt-8 max-w-2xl text-lg font-medium leading-relaxed text-muted-foreground md:text-xl lg:text-2xl"
        >
          {{ $t('landing.hero_desc') }}
        </p>
      </div>

      <!-- Enhanced CTA -->
      <div class="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Button
          class="h-14 w-full gap-3 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-10 text-lg font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
          size="lg"
          @click="goToLogin"
        >
          {{ $t('landing.hero_cta') }}
          <AppIcon name="hugeicons:arrow-right-01" :size="22" class="animate-bounce-x" />
        </Button>
        <Button
          variant="ghost"
          class="h-14 w-full gap-3 rounded-2xl border border-border/50 bg-card/30 px-10 text-lg font-bold backdrop-blur-sm transition-all hover:bg-muted/50 sm:w-auto"
          size="lg"
          @click="scrollToFeatures"
        >
          <AppIcon name="hugeicons:play-circle" :size="22" />
          {{ $t('landing.hero_demo') }}
        </Button>
      </div>

      <!-- Micro-Trust Badges -->
      <div
        class="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
      >
        <span class="flex items-center gap-2 group cursor-default"
          ><div
            class="rounded-lg p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm"
          >
            <AppIcon name="hugeicons:checkmark-circle-02" :size="14" />
          </div>
          {{ $t('landing.hero_free') }}</span
        >
        <span class="flex items-center gap-2 group cursor-default"
          ><div
            class="rounded-lg p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm"
          >
            <AppIcon name="hugeicons:checkmark-circle-02" :size="14" />
          </div>
          {{ $t('landing.hero_noads') }}</span
        >
        <span class="flex items-center gap-2 group cursor-default"
          ><div
            class="rounded-lg p-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-sm"
          >
            <AppIcon name="hugeicons:checkmark-circle-02" :size="14" />
          </div>
          {{ $t('landing.hero_secure') }}</span
        >
      </div>

      <!-- Premium Dashboard Preview -->
      <div class="relative mt-20 md:mt-28 perspective-1000 group">
        <!-- Floating Glows -->
        <div
          class="absolute -top-10 -left-10 size-40 bg-primary/10 blur-[80px] rounded-full animate-float"
        />

        <!-- Main Card -->
        <div
          class="relative overflow-hidden rounded-4xl border border-border/50 bg-card shadow-2xl transition-all duration-700 group-hover:shadow-primary/5 hover:border-border"
        >
          <!-- Browser-like Top bar -->
          <div class="flex items-center gap-3 border-b border-border/50 px-6 py-4 bg-muted/30">
            <div class="flex gap-2">
              <div class="h-3 w-3 rounded-full bg-rose-500/40 border border-rose-500/20 dark:bg-rose-500/60 dark:border-rose-500/40" />
              <div class="h-3 w-3 rounded-full bg-amber-500/40 border border-amber-500/20 dark:bg-amber-500/60 dark:border-amber-500/40" />
              <div class="h-3 w-3 rounded-full bg-emerald-500/40 border border-emerald-500/20 dark:bg-emerald-500/60 dark:border-emerald-500/40" />
            </div>
            <div class="flex-1 flex justify-center">
              <div
                class="rounded-full bg-background/50 px-6 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 border border-border/40 flex items-center gap-2"
              >
                <AppIcon name="hugeicons:shield-01" :size="10" />
                seaavey.site/dashboard
              </div>
            </div>
          </div>

          <!-- Dashboard Mockup Content -->
          <div class="p-6 md:p-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- Bento Card 1 -->
              <div
                class="rounded-3xl border border-border/50 bg-muted/20 p-6 transition-all hover:bg-muted/30"
              >
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
                >
                  {{ $t('landing.hero_preview.balance') }}
                </p>
                <p class="mt-2 text-3xl font-black tracking-tighter">Rp 12.450.000</p>
                <div
                  class="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest"
                >
                  <AppIcon name="hugeicons:arrow-up-01" :size="12" />
                  <span>{{ $t('landing.hero_preview.trend') }}</span>
                </div>
              </div>

              <!-- Bento Card 2 -->
              <div
                class="rounded-3xl border border-border/50 bg-muted/20 p-6 transition-all hover:bg-muted/30"
              >
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
                >
                  {{ $t('landing.hero_preview.income') }}
                </p>
                <p class="mt-2 text-3xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">
                  Rp 18.200.000
                </p>
                <div class="mt-6 h-1.5 w-full rounded-full bg-emerald-500/10">
                  <div
                    class="h-full w-3/4 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  />
                </div>
              </div>

              <!-- Bento Card 3 -->
              <div
                class="rounded-3xl border border-border/50 bg-muted/20 p-6 transition-all hover:bg-muted/30"
              >
                <p
                  class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
                >
                  {{ $t('landing.hero_preview.expense') }}
                </p>
                <p class="mt-2 text-3xl font-black tracking-tighter text-rose-500 dark:text-rose-400">Rp 5.750.000</p>
                <div class="mt-6 h-1.5 w-full rounded-full bg-rose-500/10">
                  <div
                    class="h-full w-1/3 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]"
                  />
                </div>
              </div>
            </div>

            <!-- Enhanced Chart row -->
            <div class="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6 md:mt-8">
              <div class="md:col-span-3 rounded-3xl border border-border/50 bg-muted/20 p-6">
                <div class="flex items-center justify-between mb-8">
                  <p class="text-sm font-black uppercase tracking-widest text-foreground/80">
                    {{ $t('landing.hero_preview.chart_title') }}
                  </p>
                  <div
                    class="rounded-xl bg-card px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 shadow-sm border border-border/40"
                  >
                    {{ $t('landing.hero_preview.chart_period') }}
                  </div>
                </div>
                <div class="flex items-end gap-3 h-32 px-2">
                  <div
                    v-for="(h, i) in [40, 65, 45, 80, 55, 70, 50]"
                    :key="i"
                    class="flex-1 rounded-t-xl bg-primary/20 relative group/bar hover:bg-primary/40 transition-all duration-500"
                    :style="{ height: `${h}%` }"
                  >
                    <div
                      class="absolute -top-10 left-1/2 -translate-x-1/2 bg-card border border-border/50 shadow-xl text-foreground font-black text-[10px] px-3 py-1.5 rounded-xl opacity-0 group-hover/bar:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 whitespace-nowrap"
                    >
                      Rp {{ h }}0k
                    </div>
                  </div>
                </div>
                <div
                  class="flex justify-between mt-6 text-[9px] font-black text-muted-foreground uppercase tracking-widest px-1"
                >
                  <span>{{ $t('landing.hero_preview.days.mon') }}</span>
                  <span>{{ $t('landing.hero_preview.days.tue') }}</span>
                  <span>{{ $t('landing.hero_preview.days.wed') }}</span>
                  <span>{{ $t('landing.hero_preview.days.thu') }}</span>
                  <span>{{ $t('landing.hero_preview.days.fri') }}</span>
                  <span>{{ $t('landing.hero_preview.days.sat') }}</span>
                  <span>{{ $t('landing.hero_preview.days.sun') }}</span>
                </div>
              </div>

              <!-- Simplified Transaction List -->
              <div class="md:col-span-2 rounded-3xl border border-border/50 bg-muted/20 p-6">
                <p class="text-sm font-black uppercase tracking-widest text-foreground/80 mb-6">
                  {{ $t('landing.hero_preview.recent_title') }}
                </p>
                <div class="space-y-4">
                  <div
                    v-for="(tx, i) in previewTransactions"
                    :key="i"
                    class="flex items-center gap-4 group/tx cursor-default"
                  >
                    <div
                      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all shadow-sm"
                      :class="tx.bg"
                    >
                      <AppIcon :name="tx.icon" :size="20" :class="tx.color" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-sm font-bold truncate group-hover/tx:text-primary transition-colors"
                      >
                        {{ $t(tx.title) }}
                      </p>
                      <p
                        class="text-[10px] font-black uppercase tracking-tight text-muted-foreground"
                      >
                        {{ $t(tx.date) }}
                      </p>
                    </div>
                    <span class="text-sm font-black tracking-tighter" :class="tx.amountColor">{{
                      tx.amount
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Enhanced Floating stat card -->
        <div
          class="absolute -right-4 -bottom-6 md:right-8 md:-bottom-8 rounded-4xl border border-border/50 bg-card/95 p-6 shadow-2xl backdrop-blur-xl hidden sm:block animate-float"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm"
            >
              <AppIcon name="hugeicons:wallet-01" :size="24" />
            </div>
            <div>
              <p class="text-[10px] font-black text-muted-foreground/90 uppercase tracking-widest">
                {{ $t('landing.hero_preview.savings') }}
              </p>
              <p class="text-2xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">Rp 2.100.000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComponentsLandingHero',
})
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'

const { t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const goToLogin = () => router.push(localePath('/auth/login'))
const scrollToFeatures = () =>
  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })

const heroTitleStart = computed(() => {
  const full = t('landing.hero_title')
  const idx = full.indexOf('tanpa')
  return idx === -1 ? full : full.slice(0, idx)
})
const heroTitleHighlight = computed(() => {
  const full = t('landing.hero_title')
  const idx = full.indexOf('tanpa')
  return idx === -1 ? '' : full.slice(idx)
})

const previewTransactions = [
  {
    icon: 'hugeicons:shopping-bag-01',
    title: 'landing.hero_preview.item_shopping',
    date: 'landing.hero_preview.today',
    amount: '-Rp 350rb',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    amountColor: 'text-red-600 dark:text-red-400',
  },
  {
    icon: 'hugeicons:money-receive-02',
    title: 'landing.hero_preview.item_salary',
    date: 'landing.hero_preview.days_ago_2',
    amount: '+Rp 15jt',
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10',
    amountColor: 'text-green-700 dark:text-green-400',
  },
  {
    icon: 'hugeicons:credit-card',
    title: 'landing.hero_preview.item_bill',
    date: 'landing.hero_preview.days_ago_3',
    amount: '-Rp 280rb',
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    amountColor: 'text-red-600 dark:text-red-400',
  },
]
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}

@keyframes bounce-x {
  0%,
  100% {
    transform: translateX(0);
  }
  50% {
    transform: translateX(5px);
  }
}

.animate-bounce-x {
  animation: bounce-x 1s infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}
</style>
