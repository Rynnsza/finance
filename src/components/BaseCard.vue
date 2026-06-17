<script setup lang="ts">
defineProps<{
  title?: string
  subtitle?: string
  noPadding?: boolean
  paddingSize?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div class="rounded-4xl border border-border/50 bg-card shadow-sm transition-all overflow-hidden">
    <!-- CARD HEADER -->
    <div
      v-if="title || subtitle || $slots.action"
      class="flex items-center justify-between border-b border-border/50 p-6 md:p-8"
    >
      <div>
        <h3 v-if="title" class="text-xl font-black tracking-tighter text-foreground">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-sm font-medium text-muted-foreground">
          {{ subtitle }}
        </p>
      </div>
      <div v-if="$slots.action">
        <slot name="action" />
      </div>
    </div>

    <!-- CARD CONTENT -->
    <div
      :class="[
        noPadding ? 'p-0' : {
          'p-4': paddingSize === 'sm',
          'p-6': paddingSize === 'md' || !paddingSize,
          'p-6 md:p-10': paddingSize === 'lg',
        }
      ]"
    >
      <slot />
    </div>

    <!-- CARD FOOTER -->
    <div v-if="$slots.footer" class="border-t border-border/50 bg-muted/20 px-6 py-4">
      <slot name="footer" />
    </div>
  </div>
</template>
