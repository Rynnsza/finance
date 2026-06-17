<template>
  <div class="grid grid-cols-3 gap-3 md:gap-4">
    <Button
      v-for="type in types"
      :key="type.id"
      variant="ghost"
      class="group relative h-auto flex-col items-center gap-2 md:gap-3 py-4 md:py-6 rounded-3xl transition-all duration-300 border border-transparent overflow-hidden"
      :class="
        modelValue === type.id
          ? `${type.activeClass} text-white shadow-xl border-${type.color}-500`
          : 'bg-secondary/40 hover:bg-secondary/60 text-muted-foreground border-border/50'
      "
      @click="emit('update:modelValue', type.id)"
    >
      <div
        class="flex size-10 md:size-12 items-center justify-center rounded-2xl transition-colors"
        :class="
          modelValue === type.id
            ? 'bg-white/20'
            : `${type.iconBgClass} ${type.iconTextClass}`
        "
      >
        <AppIcon :name="type.icon" :size="28" />
      </div>
      <span class="text-[10px] md:text-xs font-black uppercase tracking-widest text-center">
        {{ $t(`transaction_form.${type.id}`) }}
      </span>
    </Button>
  </div>
</template>

<script setup lang="ts">
import type { TransactionType } from '@/types'

defineProps<{
  modelValue: TransactionType
}>()

const emit = defineEmits<{
  'update:modelValue': [value: TransactionType]
}>()

const types = [
  {
    id: 'income' as const,
    icon: 'hugeicons:arrow-down-01',
    color: 'emerald',
    activeClass: 'bg-emerald-500 shadow-emerald-500/20',
    iconBgClass: 'bg-emerald-500/10',
    iconTextClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'expense' as const,
    icon: 'hugeicons:arrow-up-01',
    color: 'rose',
    activeClass: 'bg-rose-500 shadow-rose-500/20',
    iconBgClass: 'bg-rose-500/10',
    iconTextClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'transfer' as const,
    icon: 'hugeicons:exchange-01',
    color: 'blue',
    activeClass: 'bg-blue-500 shadow-blue-500/20',
    iconBgClass: 'bg-blue-500/10',
    iconTextClass: 'text-blue-600 dark:text-blue-400',
  },
]
</script>
