<template>
  <div
    class="group flex w-full cursor-pointer items-center gap-4 overflow-hidden px-5 py-4 transition-all hover:bg-muted/30 active:bg-muted/50"
    @click="$emit('click')"
  >
    <div
      class="flex size-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-300 group-hover:scale-110 group-active:scale-95"
      :class="iconBg"
    >
      <AppIcon :name="iconComponent" :size="22" :class="iconColor" />
    </div>

    <div
      class="flex min-w-0 flex-1 flex-col items-start justify-center gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <span class="truncate text-sm font-bold text-foreground transition-colors duration-200">
        {{ label }}
      </span>

      <div class="flex min-w-0 items-center gap-2 transition-colors duration-200">
        <span
          class="truncate text-left text-xs font-bold uppercase tracking-tight text-muted-foreground/90 transition-colors sm:text-right group-hover:text-muted-foreground"
        >
          {{ value }}
        </span>
        <AppIcon
          name="hugeicons:arrow-right-01"
          :size="16"
          class="shrink-0 text-muted-foreground/20 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-muted-foreground/40"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: 'user' | 'currency' | 'palette' | 'download' | 'language'
  label: string
  value: string
}>()

defineEmits(['click'])

const iconMap = {
  user: {
    component: 'hugeicons:user',
    bg: 'bg-blue-100 dark:bg-blue-950/50',
    color: 'text-blue-600 dark:text-blue-400',
  },
  currency: {
    component: 'hugeicons:currency',
    bg: 'bg-green-100 dark:bg-green-950/50',
    color: 'text-green-600 dark:text-green-400',
  },
  palette: {
    component: 'hugeicons:colors',
    bg: 'bg-purple-100 dark:bg-purple-950/50',
    color: 'text-purple-600 dark:text-purple-400',
  },
  download: {
    component: 'hugeicons:download-01',
    bg: 'bg-orange-100 dark:bg-orange-950/50',
    color: 'text-orange-600 dark:text-orange-400',
  },
  language: {
    component: 'hugeicons:globe',
    bg: 'bg-cyan-100 dark:bg-cyan-950/50',
    color: 'text-cyan-600 dark:text-cyan-400',
  },
}

const iconComponent = computed(() => iconMap[props.icon].component)
const iconBg = computed(() => iconMap[props.icon].bg)
const iconColor = computed(() => iconMap[props.icon].color)
</script>
