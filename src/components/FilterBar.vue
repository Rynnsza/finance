<template>
  <div class="space-y-3">
    <div class="flex gap-2">
      <Input
        v-model="filters.search"
        :placeholder="$t('transactions.search_placeholder')"
        class="flex-1"
        @input="debouncedEmit"
      />
      <Button variant="outline" size="icon" @click="showMore = !showMore">
        <HugeIcon name="hugeicons:filter" :size="18" />
      </Button>
    </div>

    <div v-if="showMore" class="space-y-3 rounded-lg border border-border p-3">
      <div class="grid grid-cols-2 gap-2">
        <div class="space-y-1">
          <Label class="text-xs">{{ $t('transactions.date_from') }}</Label>
          <Input v-model="filters.dateFrom" type="date" @change="emitFilters" />
        </div>
        <div class="space-y-1">
          <Label class="text-xs">{{ $t('transactions.date_to') }}</Label>
          <Input v-model="filters.dateTo" type="date" @change="emitFilters" />
        </div>
      </div>

      <div class="space-y-1">
        <Label class="text-xs">{{ $t('transactions.type') }}</Label>
        <Select v-model="filters.type" @update:model-value="emitFilters">
          <SelectTrigger>
            <SelectValue :placeholder="$t('transactions.all')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{{ $t('transactions.all') }}</SelectItem>
            <SelectItem value="income">{{ $t('transactions.income') }}</SelectItem>
            <SelectItem value="expense">{{ $t('transactions.expense') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-1">
        <Label class="text-xs">{{ $t('transactions.category') }}</Label>
        <CategoryPicker
          v-model="filters.category_id"
          :placeholder="$t('transactions.all')"
          @update:model-value="emitFilters"
        />
      </div>

      <Button variant="ghost" size="sm" class="w-full" @click="resetFilters">{{
        $t('transactions.reset_filter')
      }}</Button>
    </div>
  </div>
</template>

<script setup lang="ts">


import type { TransactionFilters, TransactionType } from '@/types'

const emit = defineEmits<{
  filter: [filters: TransactionFilters]
}>()

const showMore = ref(false)

const filters = reactive({
  search: '',
  type: '' as string,
  category_id: '',
  dateFrom: '',
  dateTo: '',
})

let debounceTimer: ReturnType<typeof setTimeout>

const debouncedEmit = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => emitFilters(), 300)
}

const emitFilters = () => {
  const f: TransactionFilters = {}
  if (filters.search) {
    f.search = filters.search
  }
  if (filters.type && filters.type !== 'all') {
    f.type = filters.type as TransactionType
  }
  if (filters.category_id) {
    f.category_id = filters.category_id
  }
  if (filters.dateFrom) {
    f.dateFrom = filters.dateFrom
  }
  if (filters.dateTo) {
    f.dateTo = filters.dateTo
  }
  emit('filter', f)
}

const resetFilters = () => {
  filters.search = ''
  filters.type = ''
  filters.category_id = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  emit('filter', {})
}
</script>
