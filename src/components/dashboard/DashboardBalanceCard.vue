<template>
  <BaseCard class="md:col-span-6 lg:col-span-3" no-padding>
    <div class="relative p-6 group h-full flex flex-col justify-between overflow-hidden">
      <div class="relative z-10">
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-200 dark:bg-zinc-100 dark:text-zinc-950 dark:shadow-none"
          >
            <AppIcon name="hugeicons:wallet-01" :size="20" />
          </div>
          <span class="text-sm font-bold tracking-tight text-muted-foreground uppercase">
            {{ $t('dashboard.balance_this_month') }}
          </span>
        </div>
        <div class="mt-4">
          <h1 class="text-5xl font-black tracking-tighter text-foreground leading-none md:text-6xl">
            {{ formattedBalance }}
          </h1>
          <div v-if="trendDisplay" class="mt-4 flex items-center gap-2">
            <div
              class="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black"
              :class="isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
            >
              <AppIcon :name="isPositive ? 'hugeicons:arrow-up-01' : 'hugeicons:arrow-down-01'" :size="14" />
              {{ trendDisplay }}
            </div>
            <span class="text-xs font-bold text-muted-foreground/90">
              {{ $t('dashboard.vs_last_month_short') }}
            </span>
          </div>
        </div>
      </div>
      <div class="absolute -right-12 -top-12 size-64 rounded-full bg-muted/30 transition-all duration-700 group-hover:scale-110 group-hover:bg-muted/50" />
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
defineProps<{
  formattedBalance: string
  trendDisplay: string | null
  isPositive: boolean
}>()
</script>
