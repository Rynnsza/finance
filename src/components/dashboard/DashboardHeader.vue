<template>
  <div class="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
    <div>
      <ClientOnly>
        <h2 class="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
          {{ $t('dashboard.greeting') }}, {{ displayName }}
        </h2>
        <template #fallback>
          <h2 class="text-4xl font-black tracking-tighter text-foreground md:text-5xl">
            {{ $t('dashboard.greeting_loading') }}
          </h2>
        </template>
      </ClientOnly>
      <p class="mt-2 font-bold uppercase tracking-widest text-muted-foreground/90">
        {{ monthLabel }}
      </p>
    </div>
    <div class="flex flex-wrap items-center gap-3">
      <div
        v-if="isPartnered"
        class="flex gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md"
      >
        <Button
          v-for="mode in viewModes"
          :key="mode.value"
          :variant="viewMode === mode.value ? 'default' : 'ghost'"
          size="sm"
          class="rounded-xl px-4 transition-all duration-300"
          :class="viewMode === mode.value ? 'shadow-sm' : 'text-muted-foreground'"
          @click="$emit('update:viewMode', mode.value)"
        >
          {{ mode.label }}
        </Button>
      </div>

      <div
        class="flex gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md"
      >
        <Button
          v-for="p in periodOptions"
          :key="p.value"
          :variant="period === p.value ? 'default' : 'ghost'"
          size="sm"
          class="h-8 rounded-xl px-3 text-[10px] font-black uppercase tracking-wider transition-all duration-300"
          :class="period === p.value ? 'shadow-sm' : 'text-muted-foreground'"
          @click="$emit('update:period', p.value)"
        >
          {{ p.label }}
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineOptions({
  name: 'DashboardHeader',
})

defineProps<{
  displayName: string
  monthLabel: string
  isPartnered: boolean
  viewMode: 'mine' | 'partner'
  viewModes: { value: 'mine' | 'partner'; label: string }[]
  period: '1d' | '7d' | '30d' | 'all'
  periodOptions: { value: '1d' | '7d' | '30d' | 'all'; label: string }[]
}>()

defineEmits<{
  'update:viewMode': [value: 'mine' | 'partner']
  'update:period': [value: '1d' | '7d' | '30d' | 'all']
}>()
</script>
