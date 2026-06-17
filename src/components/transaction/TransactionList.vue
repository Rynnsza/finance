<template>
  <div class="space-y-2">
    <div v-if="transactions.length === 0" class="py-8 text-center text-sm text-muted-foreground">
      {{ $t('transactions.empty') }}
    </div>
    <router-link
      v-for="tx in transactions"
      :key="tx.id"
      :to="`/transactions/${tx.id}/edit`"
      class="block"
    >
      <TransactionItem :transaction="tx" />
    </router-link>
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types'

defineProps<{
  transactions: Transaction[]
}>()
</script>
