<script setup lang="ts">
defineProps<{
  to:
    | string
    | { name: string; params?: Record<string, string | number>; query?: Record<string, string> }
}>()
</script>

<template>
  <router-link :to="to" class="transition-colors hover:text-foreground">
    <slot />
  </router-link>
</template>
