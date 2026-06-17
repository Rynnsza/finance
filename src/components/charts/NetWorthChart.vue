<script setup lang="ts">
import { AreaChart } from '@/components/ui/chart-area'
import type { ChartConfig } from '@/components/ui/chart'

defineProps<{
  data: { label: string; netWorth: number; assets: number; debts: number }[]
}>()

const { t } = useI18n()

const chartConfig = computed<ChartConfig>(() => ({
  netWorth: {
    label: t('dashboard.net_worth'),
    color: '#3b82f6',
  },
  assets: {
    label: t('dashboard.assets'),
    color: '#22c55e',
  },
  debts: {
    label: t('dashboard.debts'),
    color: '#ef4444',
  },
}))

const yFormatter = (val: number | string) => {
  const v = Number(val)
  if (v === 0) {
    return '0'
  }
  const absV = Math.abs(v)
  const suffix = v < 0 ? '-' : ''
  if (absV >= 1000000) {
    return `${suffix}${absV / 1000000}${t('chart.million')}`
  }
  if (absV >= 1000) {
    return `${suffix}${absV / 1000}${t('chart.thousand')}`
  }
  return `${suffix}${absV}`
}
</script>

<template>
  <div class="relative h-[220px]">
    <AreaChart
      v-if="data.length > 0"
      :data="data"
      index="label"
      :categories="['netWorth']"
      :config="chartConfig"
      :y-formatter="yFormatter"
      class="h-full w-full"
    />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('chart.no_data') }}</p>
    </div>
  </div>
</template>
