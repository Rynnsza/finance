<template>
  <div class="space-y-4 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30">
    <div class="flex items-start justify-between gap-3">
      <div>
        <Label class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
          <AppIcon name="hugeicons:share-07" :size="12" />
          {{ $t('transaction_form.split_transaction') }}
        </Label>
        <p class="mt-1 text-xs text-muted-foreground">{{ $t('transaction_form.split_desc') }}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        class="h-8 rounded-xl px-3 text-xs font-bold shrink-0"
        :class="enabled ? 'border-primary/40 bg-primary/5 text-primary' : ''"
        @click="emit('toggle')"
      >
        {{ enabled ? $t('transaction_form.split_disable') : $t('transaction_form.split_enable') }}
      </Button>
    </div>

    <template v-if="enabled">
      <div
        v-for="(split, index) in items"
        :key="index"
        class="flex flex-col gap-2 rounded-2xl border border-border/30 bg-background/30 p-3 md:flex-row md:items-center"
      >
        <div class="flex-1">
          <CategoryPicker
            v-model="split.category_id"
            :type="type"
            :placeholder="$t('transaction_form.split_category')"
          />
        </div>
        <div class="flex items-center gap-2">
          <div class="relative flex-1 md:w-36">
            <CurrencyInput
              v-model="split.amount"
              :currency="currency"
              :placeholder="$t('transaction_form.split_amount')"
              class="h-10"
              required
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            class="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:text-destructive"
            @click="emit('remove', index)"
          >
            <AppIcon name="hugeicons:delete-01" :size="16" />
          </Button>
        </div>
      </div>

      <div class="flex items-center justify-between gap-3">
        <div
          v-if="items.length > 0"
          class="flex items-center gap-2 text-xs font-medium"
          :class="totalMismatch ? 'text-destructive' : 'text-muted-foreground'"
        >
          <AppIcon :name="totalMismatch ? 'hugeicons:alert-circle' : 'hugeicons:tick-01'" :size="14" />
          {{ formattedSplitTotal }} / {{ formattedAmount }}
        </div>
        <div class="flex-1" />
        <Button variant="outline" size="sm" class="h-8 rounded-xl border-dashed px-3 text-xs font-bold" @click="emit('add')">
          <AppIcon name="hugeicons:plus-sign" :size="14" class="mr-1" />
          {{ $t('transaction_form.split_add') }}
        </Button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { SplitItem, TransactionType } from '@/types'

defineProps<{
  enabled: boolean
  items: SplitItem[]
  type: TransactionType
  currency: string
  totalMismatch: boolean
  formattedSplitTotal: string
  formattedAmount: string
}>()

const emit = defineEmits<{
  toggle: []
  add: []
  remove: [index: number]
}>()
</script>
