<script setup lang="ts">
import { computed } from 'vue'
import { Input } from '@/components/ui/input'
import { useCurrency } from '@/composables/useCurrency'

const props = defineProps<{
  modelValue: number
  currency?: string
  placeholder?: string
  required?: boolean
  class?: string
}>()

const emit = defineEmits(['update:modelValue'])

const { formatNumberOnly, parseLocalizedNumber } = useCurrency()

const displayValue = computed({
  get: () => (props.modelValue ? formatNumberOnly(props.modelValue, props.currency) : ''),
  set: (val: string) => {
    emit('update:modelValue', parseLocalizedNumber(val, props.currency))
  },
})

const onKeydown = (e: KeyboardEvent) => {
  const allowed = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (allowed.includes(e.key)) return
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return
  if (/^[0-9]$/.test(e.key)) return
  if (e.key === ',' || e.key === '.') {
    e.preventDefault()
    return
  }
  e.preventDefault()
}
</script>

<template>
  <Input
    v-model="displayValue"
    type="text"
    inputmode="numeric"
    :placeholder="placeholder"
    :required="required"
    :class="props.class"
    @keydown="onKeydown"
  />
</template>
