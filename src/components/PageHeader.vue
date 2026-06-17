<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  title: string
  subtitle?: string
  buttonText?: string
  buttonIcon?: string
}>()

defineEmits(['action'])
</script>

<template>
  <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
    <div>
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ title }}
      </h1>
      <p v-if="subtitle" class="mt-1 font-medium text-muted-foreground">
        {{ subtitle }}
      </p>
    </div>
    <Button
      v-if="buttonText"
      class="flex h-11 items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
      @click="$emit('action')"
    >
      <AppIcon v-if="buttonIcon" :name="buttonIcon" :size="20" />
      <span>{{ buttonText }}</span>
    </Button>
  </div>
</template>
