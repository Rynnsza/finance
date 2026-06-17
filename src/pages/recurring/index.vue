<script setup lang="ts">
defineOptions({
  name: 'PagesRecurringIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from '@/types'
import { formatDateSafe } from '@/lib/utils'
import { useBudgets } from '@/composables/useBudgets'

const router = useRouter()
const { recurring, loading, fetchRecurring, toggleActive, deleteRecurring, processDueRecurring } =
  useRecurring()
const { checkBudgetAlerts } = useBudgets()
const { categories, fetchCategories } = useCategories()
const { formatCurrency } = useCurrency()
const { t, locale } = useI18n()

// Local reactive state for Switch v-model — synced from server data
const checkedStates = reactive<Record<string, boolean>>({})

// Sync from server whenever recurring data refetches
watch(
  recurring,
  (items) => {
    for (const item of items) {
      checkedStates[item.id] = !!item.active
    }
  },
  { immediate: true },
)

const handleToggle = async (id: string, newActive: boolean) => {
  const { error } = await toggleActive(id, newActive)
  if (error) {
    console.error('Toggle recurring failed:', error)
    // Revert local state on error
    const item = recurring.value.find((r) => r.id === id)
    if (item) checkedStates[id] = !!item.active
    return
  }
  // Item was turned ON — auto-process any due recurring right away.
  // Don't wait for it; the toggle already persisted.
  if (newActive) {
    processDueRecurring()
      .then(() => {
        const now = new Date()
        const monthStr = formatDateSafe(new Date(now.getFullYear(), now.getMonth(), 1))
        checkBudgetAlerts(monthStr).catch(() => {})
      })
      .catch((err) =>
        console.error('Auto-process after toggle failed (toggle persisted OK):', err),
      )
  }
}

const monthlyExpense = computed(() =>
  recurring.value
    .filter((r) => r.type === 'expense' && r.active)
    .reduce((s, r) => {
      if (r.frequency === 'daily') return s + r.amount * 30
      if (r.frequency === 'weekly') return s + r.amount * 4
      if (r.frequency === 'yearly') return s + r.amount / 12
      return s + r.amount
    }, 0),
)

const monthlyIncome = computed(() =>
  recurring.value
    .filter((r) => r.type === 'income' && r.active)
    .reduce((s, r) => {
      if (r.frequency === 'daily') return s + r.amount * 30
      if (r.frequency === 'weekly') return s + r.amount * 4
      if (r.frequency === 'yearly') return s + r.amount / 12
      return s + r.amount
    }, 0),
)

const categoryMap = computed(() => {
  const map = new Map<string, string>()
  for (const cat of categories.value) map.set(cat.id, cat.name)
  return map
})

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchRecurring()])
})

const categoryName = (id: string | null) => {
  if (!id) return ''
  return categoryMap.value.get(id) ?? ''
}

const frequencyLabel = (f: string) => {
  const map: Record<string, string> = {
    daily: t('recurring.daily'),
    weekly: t('recurring.weekly'),
    monthly: t('recurring.monthly'),
    yearly: t('recurring.yearly'),
  }
  return map[f] ?? f
}

const formatNextDate = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diff === 0) return t('recurring.today')
  if (diff === 1) return t('recurring.tomorrow')
  if (diff < 7) return `${diff} ${t('recurring.days_left')}`
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short' })
}

const showDeleteDialog = ref(false)
const deletingItem = ref<RecurringTransaction | undefined>()

const deleteDescription = computed(() => {
  const name = deletingItem.value?.description || t('recurring.no_description')
  return `${t('recurring.delete_confirm')} "${name}"?`
})

const goToNew = () => router.push('/recurring/new')

const goToEdit = (item: RecurringTransaction) => {
  router.push(`/recurring/${item.id}/edit`)
}

const onDelete = (item: RecurringTransaction) => {
  deletingItem.value = item
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (deletingItem.value) {
    await deleteRecurring(deletingItem.value.id)
  }
  showDeleteDialog.value = false
  deletingItem.value = undefined
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <PageHeader
      :title="$t('recurring.title')"
      :subtitle="`${recurring.length} ${$t('recurring.schedule_active')}`"
      :button-text="$t('recurring_form.title_new')"
      button-icon="hugeicons:add-01"
      @action="goToNew"
    />

    <!-- STATS -->
    <div v-if="!loading && recurring.length > 0" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        :label="$t('recurring.expense')"
        :value="monthlyExpense"
        icon="hugeicons:arrow-up-01"
      />
      <StatCard
        :label="$t('recurring.income')"
        :value="monthlyIncome"
        icon="hugeicons:arrow-down-01"
      />
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="space-y-4">
      <!-- Stats row skeleton -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton v-for="i in 2" :key="i" class="h-32 rounded-4xl bg-muted/50" />
      </div>
      <!-- List grid skeleton -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton v-for="i in 4" :key="i" class="h-44 rounded-4xl bg-muted/50" />
      </div>
    </div>

    <!-- EMPTY STATE -->
    <EmptyState
      v-else-if="recurring.length === 0"
      :title="$t('recurring.empty')"
      :description="$t('recurring.empty_desc')"
      icon="hugeicons:repeat"
      :button-text="$t('recurring.add')"
      @action="goToNew"
    />

    <!-- LIST -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div
        v-for="item in recurring"
        :key="item.id"
        class="group flex flex-col justify-between rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-border/80 hover:shadow-md"
        :class="{ 'opacity-50 grayscale-[0.5]': !(checkedStates[item.id] ?? item.active) }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="flex size-12 items-center justify-center rounded-2xl shadow-sm transition-transform group-hover:scale-110"
              :class="
                item.type === 'income'
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-rose-500/10 text-rose-500'
              "
            >
              <AppIcon
                :name="item.type === 'income' ? 'hugeicons:arrow-down-01' : 'hugeicons:arrow-up-01'"
                :size="24"
              />
            </div>
            <div>
              <h3 class="font-bold text-foreground">
                {{
                  item.description ||
                  categoryName(item.category_id) ||
                  $t('recurring.no_description')
                }}
              </h3>
              <div class="mt-1 flex items-center gap-2">
                <span
                  class="rounded-lg bg-muted px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-muted-foreground"
                >
                  {{ frequencyLabel(item.frequency) }}
                </span>
                <span class="text-[10px] font-bold text-muted-foreground/90">
                  {{ formatNextDate(item.next_date) }}
                </span>
              </div>
            </div>
          </div>
          <Switch v-model="checkedStates[item.id]" @update:modelValue="handleToggle(item.id, $event)" />
        </div>

        <div class="mt-6 flex items-end justify-between border-t border-border/50 pt-4">
          <div class="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              class="size-9 rounded-xl hover:bg-muted"
              @click="goToEdit(item)"
            >
              <AppIcon name="hugeicons:pencil-edit-01" :size="16" class="text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
              @click="onDelete(item)"
            >
              <AppIcon name="hugeicons:delete-01" :size="16" />
            </Button>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {{ $t('recurring.amount') }}
            </p>
            <p
              class="text-xl font-black tracking-tighter"
              :class="item.type === 'income' ? 'text-emerald-600' : 'text-foreground'"
            >
              {{ item.type === 'income' ? '+' : '-'
              }}{{ formatCurrency(Number(item.amount), item.currency || undefined) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('recurring.delete_title')"
      :description="deleteDescription"
      :confirm-text="$t('confirm.delete')"
      @confirm="confirmDelete"
    />
  </div>
</template>
