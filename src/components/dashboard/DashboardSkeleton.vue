<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
    <div class="h-64 animate-pulse rounded-4xl bg-muted/50 md:col-span-2 lg:col-span-3" />
    <div
      v-for="i in 3"
      :key="i"
      class="h-64 animate-pulse rounded-4xl bg-muted/50 md:col-span-1 lg:col-span-1"
    />
    <div class="h-96 animate-pulse rounded-4xl bg-muted/50 md:col-span-2 lg:col-span-4" />
    <div class="h-96 animate-pulse rounded-4xl bg-muted/50 md:col-span-2 lg:col-span-2" />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'DashboardSkeleton',
})
</script>
