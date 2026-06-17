<script setup lang="ts">
defineOptions({
  name: 'AppIcon',
})
import { Icon as IconifyIcon } from '@iconify/vue'

defineProps<{
  name: string
  size?: number | string
}>()
</script>

<template>
  <IconifyIcon :icon="name" :width="size" :height="size" class="icon-component" />
</template>

<style scoped>
.icon-component {
  display: inline-block;
  vertical-align: middle;
}
</style>
