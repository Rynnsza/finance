<template>
  <Select :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event as string)">
    <SelectTrigger :class="props.class">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
        <div class="flex items-center gap-2">
          <div class="size-3 rounded-full" :style="{ backgroundColor: cat.color || undefined }" />
          {{ cat.name }}
        </div>
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import type { TransactionType } from '@/types'

const props = defineProps<{
  modelValue?: string
  type?: TransactionType
  placeholder?: string
  class?: string
}>()

defineEmits<{
  'update:modelValue': [value: string | number | boolean | null]
}>()

const { categories, incomeCategories, expenseCategories, fetchCategories } = useCategories()

const filteredCategories = computed(() => {
  if (props.type === 'income') {
    return incomeCategories.value
  }
  if (props.type === 'expense') {
    return expenseCategories.value
  }
  return categories.value
})

onMounted(() => {
  if (categories.value.length === 0) {
    fetchCategories()
  }
})
</script>
