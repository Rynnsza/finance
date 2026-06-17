<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  'data-state'?: string
}>()
</script>

<template>
  <tr
    :data-state="props['data-state']"
    :class="
      cn(
        'border-b border-border/50 transition-colors hover:bg-muted/30 data-[state=selected]:bg-primary/5',
        props.class,
      )
    "
  >
    <slot />
  </tr>
</template>
