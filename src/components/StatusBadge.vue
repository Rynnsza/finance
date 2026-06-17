<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  type?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
}>()

const classes = computed(() => {
  const base = 'rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wider'
  const variants = {
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    danger: 'bg-rose-500/10 text-rose-500',
    warning: 'bg-amber-500/10 text-amber-600',
    info: 'bg-blue-500/10 text-blue-600',
    neutral: 'bg-muted text-muted-foreground',
  }
  return `${base} ${variants[props.type || 'neutral']}`
})
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
