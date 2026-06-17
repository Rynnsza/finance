<script setup lang="ts">
import { BarChart } from '@/components/ui/chart-bar'
import type { ChartConfig } from '@/components/ui/chart'

const props = defineProps<{
  data: { label: string; income: number; expense: number }[]
}>()

const { t } = useI18n()

// Transform data to use numeric index for Unovis stability
const chartData = computed(() =>
  props.data.map((item, index) => ({
    ...item,
    xIndex: index,
  })),
)

const chartConfig = computed<ChartConfig>(() => ({
  income: {
    label: t('dashboard.income'),
    color: '#10b981', // emerald-500
  },
  expense: {
    label: t('dashboard.expense'),
    color: '#f43f5e', // rose-500
  },
}))

const xFormatter = (val: number | string) => {
  const index = Number(val)
  return props.data[index]?.label || ''
}

const yFormatter = (val: number | string) => {
  const v = Number(val)
  if (v === 0) {
    return '0'
  }
  return v >= 1000000
    ? `${(v / 1000000).toFixed(1)}${t('chart.million')}`
    : v >= 1000
      ? `${(v / 1000).toFixed(0)}${t('chart.thousand')}`
      : v.toString()
}
</script>

<template>
  <div class="relative h-full w-full">
    <BarChart
      v-if="data.length > 0"
      :data="chartData"
      index="xIndex"
      :categories="['income', 'expense']"
      :config="chartConfig"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :show-grid-line="true"
      :rounded-corners="6"
      class="h-full w-full"
    />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('chart.no_data') }}</p>
    </div>
  </div>
</template>
