<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const props = defineProps<{
  open: boolean
  title: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  class?: string
}>()

const emit = defineEmits(['update:open'])

const sizeClasses = {
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  full: 'sm:max-w-[95vw] lg:max-w-6xl',
}
</script>

<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent :class="cn(sizeClasses[props.size || 'md'], props.class)">
      <DialogHeader>
        <DialogTitle class="text-xl font-black tracking-tighter text-foreground">
          {{ title }}
        </DialogTitle>
        <DialogDescription v-if="description">
          {{ description }}
        </DialogDescription>
      </DialogHeader>

      <div class="py-2">
        <slot />
      </div>

      <div v-if="$slots.footer" class="flex justify-end gap-2 pt-2">
        <slot name="footer" />
      </div>
    </DialogContent>
  </Dialog>
</template>
