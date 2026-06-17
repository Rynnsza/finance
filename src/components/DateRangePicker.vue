<script setup lang="ts">
import { computed } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { RangeCalendar } from '@/components/ui/range-calendar'
import type { DateRange } from 'reka-ui'
import { getLocalTimeZone } from '@internationalized/date'
import { cn } from '@/lib/utils'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  modelValue: DateRange
  placeholder?: string
  class?: string
}>()

const emit = defineEmits(['update:modelValue'])

const { t, locale } = useI18n()

const rangeLabel = computed(() => {
  const start = props.modelValue.start
  const end = props.modelValue.end
  if (!start && !end) return props.placeholder || t('common.select_date')

  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  const l = locale.value === 'id' ? 'id-ID' : 'en-US'

  if (start && end) {
    const startDate = start.toDate(getLocalTimeZone())
    const endDate = end.toDate(getLocalTimeZone())
    const sameMonth =
      startDate.getMonth() === endDate.getMonth() &&
      startDate.getFullYear() === endDate.getFullYear()

    if (sameMonth && startDate.getFullYear() === new Date().getFullYear()) {
      return `${startDate.toLocaleDateString(l, opts)} – ${endDate.toLocaleDateString(l, { ...opts, year: 'numeric' })}`
    }
    return `${startDate.toLocaleDateString(l, opts)} – ${endDate.toLocaleDateString(l, { ...opts, year: 'numeric' })}`
  }

  if (start) return start.toDate(getLocalTimeZone()).toLocaleDateString(l, { ...opts, year: 'numeric' })
  return props.placeholder || t('common.select_date')
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn('h-9 justify-start text-left font-medium rounded-xl border-border/50 bg-card/30 px-4 text-xs', !props.modelValue.start && 'text-muted-foreground', props.class)"
      >
        <AppIcon name="hugeicons:calendar-03" :size="16" class="mr-2 opacity-50" />
        {{ rangeLabel }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <RangeCalendar
        :model-value="props.modelValue"
        initial-focus
        :number-of-months="2"
        @update:model-value="emit('update:modelValue', $event)"
      />
    </PopoverContent>
  </Popover>
</template>
