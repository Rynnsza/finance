<script setup lang="ts">
import { DonutChart } from '@/components/ui/chart-donut'
import type { ChartConfig } from '@/components/ui/chart'

const props = defineProps<{
  categories: { name: string; color: string; total: number }[]
}>()

const chartConfig = computed<ChartConfig>(() => {
  const config: ChartConfig = {}
  props.categories.forEach((c) => {
    config[c.name] = {
      label: c.name,
      color: c.color,
    }
  })
  return config
})
</script>

<template>
  <div class="relative h-[220px]">
    <DonutChart
      v-if="categories.length > 0"
      :data="categories"
      index="name"
      category="total"
      :config="chartConfig"
      class="h-full w-full"
    />
    <div v-else class="flex size-full items-center justify-center">
      <p class="text-xs text-muted-foreground">{{ $t('chart.no_data') }}</p>
    </div>
  </div>
</template>
