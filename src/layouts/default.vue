<script setup lang="ts">
defineOptions({
  name: 'DefaultLayout',
})
import { ref, onMounted, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'

const isDesktop = useMediaQuery('(min-width: 1024px)')
const sidebarOpen = ref(false)

// Auto open sidebar on desktop if not manually closed (simplified for now)
onMounted(() => {
  if (isDesktop.value) {
    sidebarOpen.value = true
  }
})

// Watch for desktop switch to auto-open
watch(isDesktop, (val) => {
  if (val) {
    sidebarOpen.value = true
  } else {
    sidebarOpen.value = false
  }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background font-sans">
    <AppSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex flex-1 flex-col overflow-hidden">
      <AppTopbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <main class="flex-1 p-3 md:p-6 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Mobile Overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>
