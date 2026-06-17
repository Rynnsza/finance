<template>
  <div class="space-y-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold">{{ $t('dashboard.recent') }}</h3>
      <router-link to="/transactions" class="text-xs text-primary">{{
        $t('dashboard.view_all')
      }}</router-link>
    </div>
    <div v-if="recent.length === 0" class="py-4 text-center text-sm text-muted-foreground">
      {{ $t('dashboard.empty_title') }}
    </div>
    <TransactionList :transactions="recent" />
  </div>
</template>

<script setup lang="ts">
import type { Transaction } from '@/types'

defineProps<{
  recent: Transaction[]
}>()
</script>
