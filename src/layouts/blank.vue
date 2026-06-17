<script setup lang="ts">
defineOptions({
  name: 'BlankLayout',
})
</script>

<template>
  <div class="min-h-screen bg-background font-sans">
    <slot />
  </div>
</template>
