<script setup lang="ts">
import type { SelectItemProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import { reactiveOmit } from '@vueuse/core'
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'], textValue?: string }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :text-value="textValue"
    :class="
      cn(
        'focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm [&_svg:not([class*=size-])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 relative flex w-full cursor-default items-center outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
        props.class,
      )
    "
  >
    <span class="pointer-events-none absolute right-2 flex size-4 items-center justify-center">
      <SelectItemIndicator>
        <slot name="indicator-icon">
          <AppIcon name="hugeicons:tick-01" class="pointer-events-none" />
        </slot>
      </SelectItemIndicator>
    </span>

    <SelectItemText class="min-w-0">
      <span v-if="$slots.text" class="sr-only"><slot name="text" /></span>
      <slot v-else />
    </SelectItemText>
    <div v-if="$slots.text" class="flex-1 min-w-0">
      <slot />
    </div>
  </SelectItem>
</template>
