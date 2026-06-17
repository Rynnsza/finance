<template>
  <div class="mb-6 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
    <div class="rounded-2xl border border-border/50 bg-card p-3 sm:p-4">
      <p class="text-[9px] font-black uppercase tracking-widest text-amber-500/70 sm:text-[10px]">
        {{ $t('schedule.unpaid') }}
      </p>
      <p class="mt-0.5 text-xl font-black tracking-tighter text-amber-500 sm:mt-1 sm:text-2xl">
        {{ unpaidCount }}
      </p>
      <p class="text-[9px] font-medium text-muted-foreground/60 sm:text-[10px]">
        {{ $t('schedule.bills_due') }}
      </p>
    </div>
    <div class="rounded-2xl border border-border/50 bg-card p-3 sm:p-4">
      <p class="text-[9px] font-black uppercase tracking-widest text-green-500/70 sm:text-[10px]">
        {{ $t('schedule.paid') }}
      </p>
      <p class="mt-0.5 text-xl font-black tracking-tighter text-green-500 sm:mt-1 sm:text-2xl">
        {{ paidCount }}
      </p>
      <p class="text-[9px] font-medium text-muted-foreground/60 sm:text-[10px]">
        {{ $t('schedule.total_bills', { count: totalBills }) }}
      </p>
    </div>
    <div class="rounded-2xl border border-border/50 bg-card p-3 sm:p-4">
      <p class="text-[9px] font-black uppercase tracking-widest text-emerald-600/70 sm:text-[10px]">
        {{ $t('schedule.income') }}
      </p>
      <p class="mt-0.5 text-lg font-black tracking-tighter text-emerald-600 sm:mt-1 sm:text-2xl">
        {{ formatCurrency(incomeTotal) }}
      </p>
      <p class="text-[9px] font-medium text-muted-foreground/60 sm:text-[10px]">
        {{ $t('schedule.total_income') }}
      </p>
    </div>
    <div class="rounded-2xl border border-border/50 bg-card p-3 sm:p-4">
      <p class="text-[9px] font-black uppercase tracking-widest text-rose-500/70 sm:text-[10px]">
        {{ $t('schedule.expense') }}
      </p>
      <p class="mt-0.5 text-lg font-black tracking-tighter text-rose-500 sm:mt-1 sm:text-2xl">
        {{ formatCurrency(expenseTotal) }}
      </p>
      <p class="text-[9px] font-medium text-muted-foreground/60 sm:text-[10px]">
        {{ $t('schedule.total_expense') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  unpaidCount: number
  paidCount: number
  totalBills: number
  incomeTotal: number
  expenseTotal: number
}>()

const { formatCurrency } = useCurrency()
</script>
