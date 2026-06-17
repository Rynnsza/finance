<template>
  <div
    class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md"
  >
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
        {{ $t('bills.title') }}
      </h3>
      <router-link
        to="/bills"
        class="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
      >
        {{ $t('dashboard.view_all') }}
      </router-link>
    </div>
    <div v-if="upcomingBills.length > 0" class="space-y-2">
      <div
        v-for="bill in upcomingBills"
        :key="bill.id"
        class="group flex gap-4 rounded-2xl bg-muted/30 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <!-- Icon remains left-aligned -->
        <div
          class="flex size-10 shrink-0 items-center justify-center rounded-xl"
          :class="
            isOverdue(bill.due_date)
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
          "
        >
          <AppIcon name="hugeicons:calendar-03" :size="20" />
        </div>

        <!-- Main Content Area: Stacked -->
        <div class="flex min-w-0 flex-1 flex-col gap-2.5">
          <!-- Top Row: Title and Amount -->
          <div class="flex items-start justify-between gap-2">
            <p class="truncate text-sm font-bold text-foreground">{{ bill.title }}</p>
            <p class="shrink-0 text-sm font-black text-foreground">
              {{ formatCurrency(bill.amount) }}
            </p>
          </div>

          <!-- Bottom Row: Due Date and Action -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <AppIcon name="hugeicons:calendar-03" :size="12" class="text-muted-foreground/60" />
              <p class="text-[10px] font-bold" :class="getDueDateClass(bill.due_date)">
                {{ getDueDateText(bill.due_date) }}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              class="h-7 px-3 text-[10px] font-bold"
              :aria-label="$t('bills.mark_paid_for', { name: bill.title })"
              @click="handleMarkPaid(bill.id)"
            >
              {{ $t('bills.mark_paid') }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="flex flex-col items-center justify-center py-6 text-center">
      <div class="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted/50">
        <AppIcon name="hugeicons:calendar-03" :size="20" class="text-muted-foreground/40" />
      </div>
      <p class="text-xs text-muted-foreground font-bold uppercase tracking-tight">
        {{ $t('bills.no_bills') }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { Bill } from '@/types'

const { toast } = useToast()
const { t } = useI18n()

const { bills, fetchBills, markAsPaid } = useBills()
const { formatCurrency } = useCurrency()

const upcomingBills = computed(() =>
  [...bills.value]
    .filter((b: Bill) => !b.is_paid)
    .sort((a: Bill, b: Bill) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 3),
)

const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

const isOverdue = (dueDate: string): boolean => getDaysUntilDue(dueDate) < 0

const getDueDateText = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate)
  if (days === 0) return t('bills.due_today')
  if (days < 0) return t('bills.overdue')
  return t('bills.due_in_days', { days })
}

const getDueDateClass = (dueDate: string): string => {
  const days = getDaysUntilDue(dueDate)
  if (days === 0) return 'text-amber-500 dark:text-amber-400'
  if (days < 0) return 'text-rose-500 dark:text-rose-400'
  return 'text-muted-foreground'
}

const handleMarkPaid = async (id: string) => {
  try {
    await markAsPaid(id)
  } catch {
    toast.error('Failed to mark bill as paid')
  }
}

onMounted(() => {
  fetchBills()
})
</script>
