<template>
  <div class="pb-10 pt-4">
    <!-- Header -->
    <div class="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h2 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('schedule.title') }}
        </h2>
        <p class="mt-1 text-sm font-medium text-muted-foreground">
          {{ $t('schedule.subtitle') }}
        </p>
      </div>
    </div>

    <ScheduleStats
      v-if="!loading"
      :unpaid-count="monthUnpaidBills.length"
      :paid-count="monthPaidBills.length"
      :total-bills="monthBills.length"
      :income-total="totalIncome"
      :expense-total="totalExpense"
    />

    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-2xl bg-muted/50" />
      </div>
      <Skeleton class="h-96 rounded-3xl bg-muted/50" />
    </div>

    <div v-else class="rounded-3xl border border-border/50 bg-card shadow-sm">
      <!-- Calendar Header: Month + Navigation -->
      <div
        class="flex flex-wrap items-center justify-center gap-3 border-b border-border/50 px-5 py-4 sm:justify-between md:px-8"
      >
        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            class="size-8 rounded-xl text-muted-foreground hover:text-foreground"
            @click="prevMonth"
          >
            <AppIcon name="hugeicons:arrow-left-01" :size="18" />
          </Button>
          <h3 class="text-lg font-black tracking-tighter text-foreground sm:text-xl">
            {{ monthLabel }}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            class="size-8 rounded-xl text-muted-foreground hover:text-foreground"
            @click="nextMonth"
          >
            <AppIcon name="hugeicons:arrow-right-01" :size="18" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          class="h-8 rounded-xl border-border/50 text-xs font-bold"
          @click="goToToday"
        >
          {{ $t('schedule.today') }}
        </Button>
      </div>

      <!-- Day-of-week Headers -->
      <div class="grid grid-cols-7 border-b border-border/50">
        <div
          v-for="day in dayHeaders"
          :key="day"
          class="px-2 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/60"
        >
          {{ day }}
        </div>
      </div>

      <!-- Calendar Grid -->
      <div class="grid grid-cols-7">
        <div
          v-for="(day, idx) in calendarDays"
          :key="idx"
          class="group relative min-h-[80px] border-b border-r border-border/30 p-1.5 transition-colors hover:bg-muted/30 sm:min-h-[100px] sm:p-2"
          :class="{
            'bg-muted/20': !day.isCurrentMonth,
            'border-l-0': idx % 7 === 0,
            'border-r-0': idx % 7 === 6,
          }"
          @click="selectedDay = day.date"
        >
          <!-- Day Number -->
          <div class="mb-1 flex items-center justify-between">
            <span
              class="flex size-5 items-center justify-center rounded-full text-[10px] font-bold sm:size-6 sm:text-xs"
              :class="getDayNumberClass(day)"
            >
              {{ day.day }}
            </span>
            <span
              v-if="day.isToday"
              class="hidden text-[8px] font-black uppercase tracking-widest text-primary sm:block"
            >
              {{ $t('schedule.today') }}
            </span>
            <div v-if="day.isToday" class="size-1 rounded-full bg-primary sm:hidden" />
          </div>

          <!-- Events -->
          <div class="space-y-0.5">
            <div
              v-for="bill in day.bills"
              :key="'b-' + bill.id"
              class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-[8px] font-bold transition-colors sm:px-1.5 sm:text-[10px]"
              :class="
                bill.is_paid
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
              "
              :title="bill.title"
              @click.stop="navigateToBill(bill.id)"
            >
              <span class="truncate">{{ bill.title }}</span>
            </div>
            <div
              v-for="rec in day.recurring"
              :key="'r-' + rec.id"
              class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-[8px] font-bold transition-colors sm:px-1.5 sm:text-[10px]"
              :class="
                rec.type === 'income'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              "
              :title="rec.description || $t('recurring.no_description')"
              @click.stop="navigateToRecurring(rec.id)"
            >
              <span class="truncate">{{ rec.description || $t('recurring.no_description') }}</span>
            </div>
            <div
              v-for="tx in day.transactions"
              :key="'t-' + tx.id"
              class="flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 text-[8px] font-bold transition-colors sm:px-1.5 sm:text-[10px]"
              :class="
                tx.type === 'income'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              "
              :title="tx.description || $t('transactions.no_description')"
              @click.stop="navigateToTransaction(tx.id)"
            >
              <span class="truncate">{{ tx.description || $t('transactions.no_description') }}</span>
            </div>
          </div>

          <!-- More indicator -->
          <div
            v-if="day.overflowCount > 0"
            class="mt-0.5 text-center text-[9px] font-bold text-muted-foreground/50"
          >
            +{{ day.overflowCount }}
          </div>
        </div>
      </div>
    </div>

    <ScheduleDayDetail
      :formatted-date="formatSelectedDate"
      :bills="selectedDayBills"
      :recurring="selectedDayRecurring"
      :transactions="selectedDayTransactions"
      :events="selectedDayEvents"
      @navigate-bill="navigateToBill"
      @navigate-recurring="navigateToRecurring"
      @navigate-transaction="navigateToTransaction"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import type { RecurringTransaction, Bill, Transaction } from '@/types'
import ScheduleStats from '@/components/schedule/ScheduleStats.vue'
import ScheduleDayDetail from '@/components/schedule/ScheduleDayDetail.vue'

defineOptions({
  name: 'PagesScheduleIndex',
})

const router = useRouter()
const { t } = useI18n()
const { formatCurrency } = useCurrency()
const { bills, fetchBills, loading: billsLoading } = useBills()
const { recurring, fetchRecurring, loading: recurringLoading } = useRecurring()
const { transactions, fetchTransactions, loading: transactionsLoading } = useTransactions()
const { fetchCategories } = useCategories()

const loading = computed(() => billsLoading.value || recurringLoading.value || transactionsLoading.value)

// Calendar state
const currentMonth = ref(new Date().getMonth())
const currentYear = ref(new Date().getFullYear())
const selectedDay = ref<string | null>(null)

const dayHeaders = computed(() => {
  // Indonesian locale short day names: Min, Sen, Sel, Rab, Kam, Jum, Sab
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
  return days
})

const monthLabel = computed(() => {
  const date = new Date(currentYear.value, currentMonth.value, 1)
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const formatSelectedDate = computed(() => {
  if (!selectedDay.value) return ''
  const date = new Date(selectedDay.value + 'T00:00:00')
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

interface CalendarDay {
  date: string
  day: number
  isCurrentMonth: boolean
  isToday: boolean
  bills: Bill[]
  recurring: RecurringTransaction[]
  transactions: Transaction[]
  overflowCount: number
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay() // 0=Sun
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function isToday(year: number, month: number, day: number): boolean {
  const today = new Date()
  return year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
}

/**
 * For a recurring transaction, compute all occurrence dates within the current month view.
 */
function getOccurrencesInMonth(rec: RecurringTransaction): string[] {
  if (!rec.active) return []

  const nextDate = new Date(rec.next_date + 'T00:00:00')
  const year = currentYear.value
  const month = currentMonth.value
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0)

  switch (rec.frequency) {
    case 'daily': {
      // Show every day if next_date is before or during this month
      const dates: string[] = []
      const cursor = new Date(nextDate)
      while (cursor <= monthEnd) {
        if (cursor >= monthStart) {
          dates.push(formatDateStr(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))
        }
        cursor.setDate(cursor.getDate() + 1)
        // Safety: limit iterations
        if (dates.length > 31) break
      }
      return dates
    }
    case 'weekly': {
      const dates: string[] = []
      let cursor = new Date(nextDate)
      // If nextDate is in the future or past, find the first occurrence in this month
      // Find the day of week of next_date
      const dayOfWeek = nextDate.getDay()
      // Start from the first day of the month that matches this day-of-week
      const firstDate = new Date(monthStart)
      while (firstDate.getDay() !== dayOfWeek) {
        firstDate.setDate(firstDate.getDate() + 1)
      }
      // Now step through the month by weeks
      cursor = new Date(firstDate)
      while (cursor <= monthEnd && cursor >= monthStart) {
        // Only include if cursor >= nextDate (transaction has started)
        if (cursor >= nextDate) {
          dates.push(formatDateStr(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()))
        }
        cursor.setDate(cursor.getDate() + 7)
        if (dates.length > 5) break
      }
      return dates
    }
    case 'monthly': {
      // Show on the day-of-month of next_date, if within current month
      const targetDay = nextDate.getDate()
      // Only show if this month is >= the month of next_date
      const monthDiff = (year - nextDate.getFullYear()) * 12 + (month - nextDate.getMonth())
      if (monthDiff >= 0) {
        const targetDate = new Date(year, month, targetDay)
        // Handle short months (e.g., Jan 31 -> Feb 28)
        if (targetDate.getMonth() === month) {
          return [formatDateStr(year, month, targetDate.getDate())]
        }
      }
      return []
    }
    case 'yearly': {
      // Show on the same month/day if within current month
      const targetMonth = nextDate.getMonth()
      const targetDay = nextDate.getDate()
      if (targetMonth === month && year >= nextDate.getFullYear()) {
        return [formatDateStr(year, month, targetDay)]
      }
      return []
    }
    default:
      return []
  }
}

const dateMaps = computed(() => {
  const billsByDate = new Map<string, Bill[]>()
  const recurringByDate = new Map<string, RecurringTransaction[]>()
  const transactionsByDate = new Map<string, Transaction[]>()

  for (const bill of bills.value) {
    const d = new Date(bill.due_date + 'T00:00:00')
    const ds = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate())
    if (!billsByDate.has(ds)) billsByDate.set(ds, [])
    billsByDate.get(ds)!.push(bill)
  }

  for (const rec of recurring.value) {
    const dates = getOccurrencesInMonth(rec)
    for (const dateStr of dates) {
      if (!recurringByDate.has(dateStr)) recurringByDate.set(dateStr, [])
      recurringByDate.get(dateStr)!.push(rec)
    }
  }

  for (const tx of transactions.value) {
    const d = new Date(tx.date)
    const ds = formatDateStr(d.getFullYear(), d.getMonth(), d.getDate())
    if (!transactionsByDate.has(ds)) transactionsByDate.set(ds, [])
    transactionsByDate.get(ds)!.push(tx)
  }

  return { billsByDate, recurringByDate, transactionsByDate }
})

const calendarDays = computed(() => {
  const daysInMonth = getDaysInMonth(currentYear.value, currentMonth.value)
  const firstDay = getFirstDayOfMonth(currentYear.value, currentMonth.value)
  const { billsByDate, recurringByDate, transactionsByDate } = dateMaps.value

  const days: CalendarDay[] = []
  const MAX_VISIBLE = 2

  // Previous month's trailing days
  if (firstDay > 0) {
    const prevMonth = currentMonth.value === 0 ? 11 : currentMonth.value - 1
    const prevYear = currentMonth.value === 0 ? currentYear.value - 1 : currentYear.value
    const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth)
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i
      const dateStr = formatDateStr(prevYear, prevMonth, day)
      const dayBills = billsByDate.get(dateStr) || []
      const dayRecurring = recurringByDate.get(dateStr) || []
      const dayTransactions = transactionsByDate.get(dateStr) || []
      days.push({
        date: dateStr,
        day,
        isCurrentMonth: false,
        isToday: false,
        bills: dayBills.slice(0, MAX_VISIBLE),
        recurring: dayRecurring.slice(0, MAX_VISIBLE),
        transactions: dayTransactions.slice(0, MAX_VISIBLE),
        overflowCount: Math.max(0, dayBills.length + dayRecurring.length + dayTransactions.length - MAX_VISIBLE),
      })
    }
  }

  // Current month's days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateStr(currentYear.value, currentMonth.value, d)
    const dayBills = billsByDate.get(dateStr) || []
    const dayRecurring = recurringByDate.get(dateStr) || []
    const dayTransactions = transactionsByDate.get(dateStr) || []
    const today = isToday(currentYear.value, currentMonth.value, d)
    days.push({
      date: dateStr,
      day: d,
      isCurrentMonth: true,
      isToday: today,
      bills: dayBills.slice(0, MAX_VISIBLE),
      recurring: dayRecurring.slice(0, MAX_VISIBLE),
      transactions: dayTransactions.slice(0, MAX_VISIBLE),
      overflowCount: Math.max(0, dayBills.length + dayRecurring.length + dayTransactions.length - MAX_VISIBLE),
    })

    // Auto-select today is handled in watch
  }

  // Next month's leading days to fill the grid (always 42 = 6 rows for consistency)
  const totalCells = Math.ceil(days.length / 7) * 7
  const remaining = totalCells - days.length
  const nextMonth = currentMonth.value === 11 ? 0 : currentMonth.value + 1
  const nextYear = currentMonth.value === 11 ? currentYear.value + 1 : currentYear.value
  for (let d = 1; d <= remaining; d++) {
    const dateStr = formatDateStr(nextYear, nextMonth, d)
    const dayBills = billsByDate.get(dateStr) || []
    const dayRecurring = recurringByDate.get(dateStr) || []
    const dayTransactions = transactionsByDate.get(dateStr) || []
    days.push({
      date: dateStr,
      day: d,
      isCurrentMonth: false,
      isToday: false,
      bills: dayBills.slice(0, MAX_VISIBLE),
      recurring: dayRecurring.slice(0, MAX_VISIBLE),
      transactions: dayTransactions.slice(0, MAX_VISIBLE),
      overflowCount: Math.max(0, dayBills.length + dayRecurring.length + dayTransactions.length - MAX_VISIBLE),
    })
  }

  return days
})

function getDayNumberClass(day: CalendarDay): string {
  if (day.isToday) {
    return 'bg-primary text-primary-foreground shadow-sm'
  }
  if (day.isCurrentMonth) {
    return 'text-foreground'
  }
  return 'text-muted-foreground/40'
}

// Navigation
function prevMonth() {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

function nextMonth() {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

function goToToday() {
  const now = new Date()
  currentMonth.value = now.getMonth()
  currentYear.value = now.getFullYear()
  selectedDay.value = formatDateStr(now.getFullYear(), now.getMonth(), now.getDate())
}

// Navigation
function navigateToBill(id: string) {
  router.push(`/bills/${id}`)
}

function navigateToRecurring(id: string) {
  router.push(`/recurring/${id}/edit`)
}

function navigateToTransaction(id: string) {
  router.push(`/transactions/${id}/edit`)
}

// Selected day details — reuse pre-built maps from dateMaps
const selectedDayBills = computed(() => {
  if (!selectedDay.value) return []
  return dateMaps.value.billsByDate.get(selectedDay.value) || []
})

const selectedDayRecurring = computed(() => {
  if (!selectedDay.value) return []
  return dateMaps.value.recurringByDate.get(selectedDay.value) || []
})

const selectedDayTransactions = computed(() => {
  if (!selectedDay.value) return []
  return dateMaps.value.transactionsByDate.get(selectedDay.value) || []
})

const selectedDayEvents = computed(() => {
  return [...selectedDayBills.value, ...selectedDayRecurring.value, ...selectedDayTransactions.value]
})

// Month stats
const monthBills = computed(() => {
  return bills.value.filter((b) => {
    const d = new Date(b.due_date + 'T00:00:00')
    return d.getMonth() === currentMonth.value && d.getFullYear() === currentYear.value
  })
})

const monthUnpaidBills = computed(() => monthBills.value.filter((b) => !b.is_paid))
const monthPaidBills = computed(() => monthBills.value.filter((b) => b.is_paid))

const monthRecurringIncome = computed(() => {
  let total = 0
  for (const rec of recurring.value) {
    if (!rec.active || rec.type !== 'income') continue
    const occurrences = getOccurrencesInMonth(rec)
    if (occurrences.length > 0) {
      total += Number(rec.amount) * occurrences.length
    }
  }
  return total
})

const monthRecurringExpense = computed(() => {
  let total = 0
  for (const rec of recurring.value) {
    if (!rec.active || rec.type !== 'expense') continue
    const occurrences = getOccurrencesInMonth(rec)
    if (occurrences.length > 0) {
      total += Number(rec.amount) * occurrences.length
    }
  }
  return total
})

const monthTransactionIncome = computed(() => {
  return transactions.value
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
})

const monthTransactionExpense = computed(() => {
  return transactions.value
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0)
})

const totalIncome = computed(() => monthRecurringIncome.value + monthTransactionIncome.value)
const totalExpense = computed(() => monthRecurringExpense.value + monthTransactionExpense.value)

function frequencyLabel(f: string) {
  const map: Record<string, string> = {
    daily: t('recurring.daily'),
    weekly: t('recurring.weekly'),
    monthly: t('recurring.monthly'),
    yearly: t('recurring.yearly'),
  }
  return map[f] ?? f
}

// Auto-select today when data loads or month changes
watch(calendarDays, (days) => {
  if (days.length > 0 && !selectedDay.value) {
    const today = days.find((d) => d.isToday)
    if (today) {
      selectedDay.value = today.date
    }
  }
})

// Refetch transactions when month/year changes to ensure we have data for the current view
watch([currentMonth, currentYear], async ([m, y]) => {
  const startDate = formatDateSafe(new Date(y, m, 1))
  const endDate = formatDateSafe(new Date(y, m + 1, 0))
  await fetchTransactions({ startDate, endDate })
})

onMounted(async () => {
  const now = new Date()
  const startDate = formatDateSafe(new Date(now.getFullYear(), now.getMonth(), 1))
  const endDate = formatDateSafe(new Date(now.getFullYear(), now.getMonth() + 1, 0))
  
  await Promise.all([
    fetchCategories(),
    fetchBills(),
    fetchRecurring(),
    fetchTransactions({ startDate, endDate })
  ])
})
</script>
