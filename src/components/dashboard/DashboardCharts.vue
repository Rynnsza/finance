<template>
  <BaseCard
    class="md:col-span-6 lg:col-span-4"
    :title="$t('dashboard.expense_chart')"
    :subtitle="$t('dashboard.monthly_performance')"
  >
    <template #action>
      <div class="flex gap-4">
        <div class="flex items-center gap-2">
          <span
            class="size-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
          />
          <span class="text-xs font-bold text-muted-foreground">{{ $t('dashboard.income') }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="size-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]" />
          <span class="text-xs font-bold text-muted-foreground">{{ $t('dashboard.expense') }}</span>
        </div>
      </div>
    </template>
    <div class="h-[460px]">
      <ClientOnly>
        <ChartsMonthlyBar :data="monthlyData" />
        <template #fallback>
          <div class="flex h-full items-center justify-center">
            <Skeleton class="h-full w-full rounded-xl" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

defineOptions({
  name: 'DashboardCharts',
})

defineProps<{
  monthlyData: { label: string; income: number; expense: number }[]
}>()

const ChartsMonthlyBar = defineAsyncComponent(() => import('@/components/charts/MonthlyBar.vue'))
</script>
