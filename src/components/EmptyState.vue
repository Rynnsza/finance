<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  title: string
  description?: string
  icon?: string
  buttonText?: string
}>()

defineEmits(['action'])
</script>

<template>
  <div
    class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
  >
    <div
      v-if="icon"
      class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
    >
      <AppIcon :name="icon" :size="40" class="text-muted-foreground/80" />
    </div>
    <h3 class="text-xl font-black tracking-tight text-foreground">{{ title }}</h3>
    <p v-if="description" class="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
      {{ description }}
    </p>
    <Button
      v-if="buttonText"
      variant="outline"
      class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
      @click="$emit('action')"
    >
      {{ buttonText }}
    </Button>
  </div>
</template>
