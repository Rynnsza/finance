<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ChartConfig } from '../chart'
import {
  VisAxis,
  VisCrosshair,
  VisGroupedBar,
  VisStackedBar,
  VisTooltip,
  VisXYContainer,
} from '@unovis/vue'
import { ChartContainer, ChartTooltipContent } from '../chart'
import { componentToString } from '../chart/utils'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    data: Record<string, unknown>[]
    config: ChartConfig
    index: string
    categories: string[]
    class?: HTMLAttributes['class']
    type?: 'grouped' | 'stacked'
    showXAxis?: boolean
    showYAxis?: boolean
    showGridLine?: boolean
    showTooltip?: boolean
    showLegend?: boolean
    xFormatter?: (tick: string | number) => string
    yFormatter?: (tick: string | number) => string
    roundedCorners?: number
  }>(),
  {
    type: 'grouped',
    showXAxis: true,
    showYAxis: true,
    showGridLine: true,
    showTooltip: true,
    showLegend: true,
    roundedCorners: 0,
  },
)

const x = (d: Record<string, unknown>) => d[props.index]
const y = props.categories.map((category) => (d: Record<string, unknown>) => d[category])

const color = (_d: Record<string, unknown>, i: number) => {
  const category = props.categories[i]
  return `var(--color-${category})`
}
</script>

<template>
  <div :class="cn('w-full h-full', props.class)">
    <ChartContainer :config="config">
      <VisXYContainer :data="data" :style="{ height: '100%', width: '100%' }">
        <VisGroupedBar
          v-if="type === 'grouped'"
          :x="x"
          :y="y"
          :color="color"
          :rounded-corners="roundedCorners"
        />
        <VisStackedBar v-else :x="x" :y="y" :color="color" :rounded-corners="roundedCorners" />

        <VisAxis v-if="showXAxis" type="x" :grid-line="false" :tick-format="xFormatter" />
        <VisAxis v-if="showYAxis" type="y" :grid-line="showGridLine" :tick-format="yFormatter" />

        <VisCrosshair
          v-if="showTooltip"
          :template="componentToString(config, ChartTooltipContent)"
        />
        <VisTooltip v-if="showTooltip" />
      </VisXYContainer>
    </ChartContainer>
  </div>
</template>
