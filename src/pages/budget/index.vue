<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesBudgetIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDateSafe } from '@/lib/utils'


const router = useRouter()
const { t, locale } = useI18n()
const { fetchCategories } = useCategories()
const { loading, fetchBudgetWithProgress, budgetsWithProgress, deleteBudget, getProgress } = useBudgets()
const { partner, isPartnered, partnerDisplayName } = usePartner()
const { formatCurrency: fmtCurrency } = useCurrency()
const { user, getSession } = useAuth()

const showDeleteDialog = ref(false)
const deletingBudget = ref<BudgetWithProgress | null>(null)

const ownerFilter = ref<'mine' | 'partner' | 'all'>('all')

const budgetList = computed(() => {
  let list = budgetsWithProgress.value
  if (ownerFilter.value === 'mine') {
    list = list.filter((b) => b.user_id === user.value?.id)
  } else if (ownerFilter.value === 'partner') {
    list = list.filter((b) => b.user_id === partner.value?.id)
  }
  return list
})

const totals = computed(() => {
  const totalLimit = budgetList.value.reduce((s: number, b: BudgetWithProgress) => s + b.amount, 0)
  const totalRollover = budgetList.value.reduce((s: number, b: BudgetWithProgress) => s + b.rollover, 0)
  const totalSpent = budgetList.value.reduce((s: number, b: BudgetWithProgress) => s + b.spent, 0)
  const effectiveLimit = totalLimit + totalRollover
  return {
    totalLimit,
    totalRollover,
    totalSpent,
    totalRemaining: Math.max(totalLimit - totalSpent, 0),
    totalOverspent: Math.max(totalSpent - totalLimit, 0),
    effectiveLimit: Math.max(effectiveLimit, 0),
    effectiveRemaining: Math.max(effectiveLimit - totalSpent, 0),
    effectiveOverspent: Math.max(totalSpent - effectiveLimit, 0),
  }
})

// Month Navigation
const selectedDate = ref(new Date())
const currentMonthStr = computed(() => {
  const d = new Date(selectedDate.value.getFullYear(), selectedDate.value.getMonth(), 1)
  return formatDateSafe(d)
})

const monthLabel = computed(() => {
  return selectedDate.value.toLocaleDateString(locale.value, {
    month: 'long',
    year: 'numeric',
  })
})

const changeMonth = async (delta: number) => {
  const d = new Date(selectedDate.value)
  d.setMonth(d.getMonth() + delta)
  selectedDate.value = d
  await loadBudget()
}

const loadData = async () => {
  await getSession()
  await fetchCategories()
  await loadBudget()
}

const loadBudget = async () => {
  await fetchBudgetWithProgress(currentMonthStr.value)
}

onMounted(() => {
  loadData()
})

const partnerInitial = computed(() => partner.value?.display_name?.charAt(0)?.toUpperCase() || 'P')

const onDeleteRequest = (budget: BudgetWithProgress) => {
  deletingBudget.value = budget
  showDeleteDialog.value = true
}

const onDeleteConfirm = async () => {
  if (!deletingBudget.value) {
    return
  }
  await deleteBudget(deletingBudget.value.id, currentMonthStr.value)
  await loadBudget()
  showDeleteDialog.value = false
  deletingBudget.value = null
}

const goToNew = () => {
  router.push(`/budget/new?month=${currentMonthStr.value}`)
}

const goToEdit = (budget: BudgetWithProgress) => {
  router.push(`/budget/edit?id=${budget.id}&month=${currentMonthStr.value}`)
}

const goToDetail = (budget: BudgetWithProgress) => {
  router.push(`/budget/detail/${budget.id}?month=${currentMonthStr.value}`)
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div class="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 class="text-4xl font-black tracking-tighter text-foreground">
          {{ $t('budget.title') }}
        </h1>
        <p class="mt-1 font-medium text-muted-foreground">{{ $t('budget.subtitle') }}</p>
      </div>
      <Button
        class="flex h-11 items-center gap-2 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98]"
        @click="goToNew"
      >
        <AppIcon name="hugeicons:add-01" :size="20" />
        <span>{{ $t('budget.set_budget') }}</span>
      </Button>
    </div>

    <!-- OWNER FILTER (when partnered) -->
    <div v-if="isPartnered" class="inline-flex items-center gap-1 rounded-2xl bg-muted/50 p-1">
      <button
        class="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
        :class="
          ownerFilter === 'all'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="ownerFilter = 'all'"
      >
        {{ $t('budget.shared_all') }}
      </button>
      <button
        class="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
        :class="
          ownerFilter === 'mine'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="ownerFilter = 'mine'"
      >
        {{ $t('budget.shared_mine') }}
      </button>
      <button
        class="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
        :class="
          ownerFilter === 'partner'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="ownerFilter = 'partner'"
      >
        {{ partnerDisplayName || $t('budget.shared_partner') }}
      </button>
    </div>

    <!-- MONTH SELECTOR -->
    <div
      class="flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-2 shadow-sm backdrop-blur-md"
    >
      <Button variant="ghost" size="icon" class="rounded-2xl" @click="changeMonth(-1)">
        <AppIcon name="hugeicons:arrow-left-01" :size="20" />
      </Button>
      <span class="text-sm font-black uppercase tracking-widest text-foreground">
        {{ monthLabel }}
      </span>
      <Button variant="ghost" size="icon" class="rounded-2xl" @click="changeMonth(1)">
        <AppIcon name="hugeicons:arrow-right-01" :size="20" />
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <!-- Month selector skeleton -->
      <Skeleton class="h-14 w-full rounded-3xl bg-muted/50" />
      <!-- Summary row skeleton -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton v-for="i in 3" :key="i" class="h-24 rounded-3xl bg-muted/50" />
      </div>
      <!-- Cards grid -->
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <Skeleton v-for="i in 4" :key="i" class="h-44 w-full rounded-4xl bg-muted/50" />
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="budgetList.length === 0"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
    >
      <div
        class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
      >
        <AppIcon name="hugeicons:wallet-03" :size="40" class="text-muted-foreground/40" />
      </div>
      <h3 class="text-xl font-black tracking-tight text-foreground">
        {{ $t('budget.no_budgets') }}
      </h3>
      <p class="mt-2 max-w-xs text-sm font-medium text-muted-foreground">
        {{ $t('budget.empty') }}
      </p>
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="goToNew"
      >
        {{ $t('budget.set_budget') }}
      </Button>
    </div>

    <!-- Summary Bento (only if budgets exist) -->
    <div v-else class="space-y-6">
      <!-- Summary Cards Row -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
            {{ $t('budget.monthly_limit') }}
          </p>
          <p class="text-2xl font-black tracking-tighter text-foreground">
            {{ fmtCurrency(totals.totalLimit) }}
          </p>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
            {{ $t('budget.spent') }}
          </p>
          <p class="text-2xl font-black tracking-tighter text-foreground">
            {{ fmtCurrency(totals.totalSpent) }}
          </p>
        </div>
        <div
          class="rounded-3xl border border-border/50 p-5 backdrop-blur-sm"
          :class="totals.totalOverspent > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-card/20'"
        >
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
            {{ totals.totalOverspent > 0 ? $t('budget.overspent') : $t('budget.remaining') }}
          </p>
          <p
            class="text-2xl font-black tracking-tighter"
            :class="totals.totalOverspent > 0 ? 'text-red-600' : 'text-foreground'"
          >
            {{
              totals.totalOverspent > 0
                ? fmtCurrency(totals.totalOverspent)
                : fmtCurrency(totals.totalRemaining)
            }}
          </p>
        </div>
      </div>

      <!-- Budget Cards Grid (auto-fit) -->
      <div class="grid gap-4 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <div
          v-for="budget in budgetList"
          :key="budget.id"
          class="group rounded-3xl border border-border/50 bg-card/20 p-5 backdrop-blur-sm transition-all duration-300 hover:bg-card/25 hover:shadow-md cursor-pointer flex flex-col justify-between min-h-44"
          @click="goToDetail(budget)"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div
                class="flex size-10 items-center justify-center rounded-xl"
                :style="{ backgroundColor: budget.category_color + '20' }"
              >
                <AppIcon
                  v-if="budget.category_icon && budget.category_icon.startsWith('hugeicons:')"
                  :name="budget.category_icon"
                  :size="20"
                  :style="{ color: budget.category_color }"
                />
                <div
                  v-else
                  class="size-5 rounded-md"
                  :style="{ backgroundColor: budget.category_color }"
                />
              </div>
              <div>
                <p class="text-sm font-semibold text-foreground">{{ budget.name || budget.category_name }}</p>
                <p v-if="budget.name" class="text-xs text-muted-foreground">{{ budget.category_name }}</p>
                <p class="text-xs text-muted-foreground">
                  {{ $t('budget.monthly_limit') }}: {{ fmtCurrency(budget.amount) }}
                  <span
                    v-if="ownerFilter === 'all' && budget.user_id !== user?.id"
                    class="ml-1.5 inline-flex items-center gap-1 rounded-md bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-bold text-sidebar-foreground"
                  >
                    <AppIcon name="hugeicons:user-01" :size="10" />
                    {{ partnerInitial }}
                  </span>
                </p>
                <p
                  v-if="budget.rollover !== 0"
                  class="mt-0.5 text-[10px] font-semibold"
                  :class="budget.rollover > 0 ? 'text-emerald-600' : 'text-red-500'"
                >
                  <template v-if="budget.rollover > 0">
                    +{{ fmtCurrency(budget.rollover) }} {{ $t('budget.rollover_remaining') }}
                  </template>
                  <template v-else>
                    {{ fmtCurrency(budget.rollover) }} {{ $t('budget.rollover_overspent') }}
                  </template>
                </p>
              </div>
            </div>
            <div
              class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop
            >
              <Button variant="ghost" size="icon" class="size-8" @click="goToEdit(budget)">
                <AppIcon name="hugeicons:edit-01" :size="16" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-8 text-red-600 hover:text-red-600"
                @click="onDeleteRequest(budget)"
              >
                <AppIcon name="hugeicons:delete-01" :size="16" />
              </Button>
            </div>
          </div>

          <div class="mt-4 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground">
                {{ $t('budget.spent') }}: {{ fmtCurrency(budget.spent) }}
              </span>
              <span
                :class="
                  getProgress(budget).overspent > 0
                    ? 'text-red-600 font-semibold'
                    : 'text-muted-foreground'
                "
              >
                {{
                  getProgress(budget).overspent > 0
                    ? $t('budget.overspent')
                    : `${$t('budget.remaining')}: ${fmtCurrency(getProgress(budget).remaining)}`
                }}
              </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="
                  getProgress(budget).overspent > 0
                    ? 'bg-red-500'
                    : getProgress(budget).percentage >= 80
                      ? 'bg-amber-500'
                      : 'bg-primary'
                "
                :style="{ width: `${Math.min(getProgress(budget).percentage, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('budget.delete_budget')"
      :description="`${$t('budget.delete_budget')} &quot;${deletingBudget?.category_name}&quot;?`"
      :confirm-text="$t('common.delete')"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>
