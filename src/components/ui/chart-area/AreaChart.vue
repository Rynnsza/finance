<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ChartConfig } from '@/components/ui/chart'
import { VisArea, VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/vue'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { componentToString } from '@/components/ui/chart/utils'

const props = withDefaults(
  defineProps<{
    data: Record<string, unknown>[]
    config: ChartConfig
    index: string
    categories: string[]
    class?: HTMLAttributes['class']
    showXAxis?: boolean
    showYAxis?: boolean
    showGridLine?: boolean
    showTooltip?: boolean
    showLegend?: boolean
    yFormatter?: (tick: string | number) => string
  }>(),
  {
    showXAxis: true,
    showYAxis: true,
    showGridLine: true,
    showTooltip: true,
    showLegend: true,
  },
)

const x = (d: Record<string, unknown>) => d[props.index]
</script>

<template>
  <div :class="props.class">
    <ChartContainer :config="config">
      <VisXYContainer :data="data">
        <template v-for="(category, i) in categories" :key="category">
          <VisArea
            :x="x"
            :y="(d: Record<string, unknown>) => d[category]"
            :color="props.config[category]?.color || `var(--vis-color${i})`"
            :opacity="0.1"
          />
          <VisLine
            :x="x"
            :y="(d: Record<string, unknown>) => d[category]"
            :color="props.config[category]?.color || `var(--vis-color${i})`"
          />
        </template>

        <VisAxis v-if="showXAxis" type="x" :grid-line="false" :tick-format="(d: unknown) => d" />
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
