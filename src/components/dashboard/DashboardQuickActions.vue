<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-6">
    <BaseCard class="md:col-span-3" no-padding>
      <button class="flex w-full items-center gap-6 p-6 group" @click="emit('navigate', action1.to)">
        <div
          class="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-500 group-hover:scale-110"
          :style="{ backgroundColor: action1.color }"
        >
          <AppIcon :name="action1.icon" :size="28" />
        </div>
        <div class="text-left">
          <p class="text-lg font-black tracking-tighter text-foreground">{{ action1.title }}</p>
          <p class="text-sm font-bold text-muted-foreground">{{ action1.desc }}</p>
        </div>
      </button>
    </BaseCard>
    <BaseCard class="md:col-span-3" no-padding>
      <button class="flex w-full items-center gap-6 p-6 group" @click="emit('navigate', action2.to)">
        <div
          class="flex size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-500 group-hover:scale-110"
          :style="{ backgroundColor: action2.color }"
        >
          <AppIcon :name="action2.icon" :size="28" />
        </div>
        <div class="text-left">
          <p class="text-lg font-black tracking-tighter text-foreground">{{ action2.title }}</p>
          <p class="text-sm font-bold text-muted-foreground">{{ action2.desc }}</p>
        </div>
      </button>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
interface ActionConfig {
  icon: string
  color: string
  title: string
  desc: string
  to: string
}

defineProps<{
  action1: ActionConfig
  action2: ActionConfig
}>()

const emit = defineEmits<{
  navigate: [to: string]
}>()
</script>
