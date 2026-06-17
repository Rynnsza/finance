<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ChartConfig } from '@/components/ui/chart'
import { VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { componentToString } from '@/components/ui/chart/utils'

const props = withDefaults(
  defineProps<{
    data: Record<string, unknown>[]
    config: ChartConfig
    index: string
    category: string
    class?: HTMLAttributes['class']
    showTooltip?: boolean
    showLegend?: boolean
  }>(),
  {
    showTooltip: true,
    showLegend: true,
  },
)

const value = (d: Record<string, unknown>) => d[props.category] as number

const color = (_d: Record<string, unknown>, i: number) => {
  const item = props.data[i]
  const key = (item as Record<string, unknown>)[props.index] as string
  return props.config[key]?.color || `var(--vis-color${i})`
}
</script>

<template>
  <div :class="props.class">
    <ChartContainer :config="config">
      <VisSingleContainer :data="data">
        <VisDonut :value="value" :color="color" :arc-width="0.3" :show-labels="false" />

        <VisTooltip v-if="showTooltip" :template="componentToString(config, ChartTooltipContent)" />
      </VisSingleContainer>
    </ChartContainer>
  </div>
</template>
