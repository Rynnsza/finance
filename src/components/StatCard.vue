<script setup lang="ts">
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps<{
  label: string
  value: number | string
  currency?: string
  icon?: string
  trend?: 'up' | 'down'
  trendValue?: number | string
  variant?: 'primary' | 'success' | 'danger' | 'info'
}>()

const { formatCurrency } = useCurrency()

const colorClasses = computed(() => {
  const map = {
    primary: 'text-primary',
    success: 'text-emerald-600 dark:text-emerald-400',
    danger: 'text-rose-600 dark:text-rose-400',
    info: 'text-indigo-600 dark:text-indigo-400',
  }
  return map[props.variant || 'primary']
})

const bgClasses = computed(() => {
  const map = {
    primary: 'border-primary/10 bg-primary/[0.03] hover:bg-primary/[0.06]',
    success: 'border-emerald-500/10 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.06]',
    danger: 'border-rose-500/10 bg-rose-500/[0.03] hover:bg-rose-500/[0.06]',
    info: 'border-indigo-500/10 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.06]',
  }
  return map[props.variant || 'primary']
})
</script>

<template>
  <div
    class="group relative overflow-hidden rounded-4xl border p-5 transition-all"
    :class="bgClasses"
  >
    <div class="relative z-10">
      <div class="flex items-center gap-2">
        <p class="text-[10px] font-black uppercase tracking-widest opacity-70 truncate" :class="colorClasses">
          {{ label }}
        </p>
        <div
          v-if="trend"
          class="flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-black shrink-0"
          :class="trend === 'up' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'"
        >
          <AppIcon :name="trend === 'up' ? 'hugeicons:arrow-up-01' : 'hugeicons:arrow-down-01'" :size="10" />
          {{ trendValue }}
        </div>
      </div>
      <h3 
        class="mt-2 text-2xl font-black tracking-tighter truncate" 
        :class="colorClasses"
        :title="typeof value === 'number' ? formatCurrency(value, currency) : String(value)"
      >
        {{ typeof value === 'number' ? formatCurrency(value, currency) : value }}
      </h3>
    </div>
    <AppIcon
      v-if="icon"
      :name="icon"
      class="absolute -right-4 -top-4 size-24 rotate-12 opacity-5 transition-transform group-hover:scale-110"
    />
  </div>
</template>
