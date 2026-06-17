<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesBudgetDetailDetail',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'


const router = useRouter()
const route = useRoute()
useI18n()
const { fetchBudgetWithProgress, getProgress, deleteBudget } = useBudgets()
const { formatCurrency: fmtCurrency } = useCurrency()

const budgetDetail = ref<BudgetWithProgress | null>(null)
const loading = ref(true)
const showDeleteDialog = ref(false)

const month = ref((route.query.month as string) || '')
const budgetId = route.params.id as string

const progress = computed(() => {
  if (!budgetDetail.value) return { percentage: 0, remaining: 0, overspent: 0 }
  return getProgress(budgetDetail.value)
})

const hasValidIcon = computed(() => budgetDetail.value?.category_icon?.startsWith('hugeicons:'))

const progressColor = computed(() => {
  if (progress.value.overspent > 0) return 'bg-red-500'
  if (progress.value.percentage >= 80) return 'bg-amber-500'
  return 'bg-primary'
})

const loadBudget = async () => {
  loading.value = true
  // Default to current month if not specified
  if (!month.value) {
    const d = new Date()
    month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }
  const list = await fetchBudgetWithProgress(month.value)
  budgetDetail.value = list.find((b) => b.id === budgetId) || null
  loading.value = false
}

const handleDelete = async () => {
  if (!budgetDetail.value) return
  const { error } = await deleteBudget(budgetDetail.value.id, month.value)
  if (!error) {
    router.push('/budget')
  }
  showDeleteDialog.value = false
}

const goToEdit = () => {
  if (!budgetDetail.value) return
  router.push(
    `/budget/edit?id=${budgetDetail.value.id}&month=${month.value}`,
  )
}

onMounted(loadBudget)
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/budget')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <Skeleton class="h-10 w-32 rounded-xl bg-muted/50" />
      <Skeleton class="h-52 w-full rounded-4xl bg-muted/50" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton v-for="i in 3" :key="i" class="h-28 rounded-3xl bg-muted/50" />
      </div>
    </div>

    <!-- Not Found -->
    <div
      v-else-if="!budgetDetail"
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
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="router.push('/budget/new')"
      >
        {{ $t('budget.set_budget') }}
      </Button>
    </div>

    <!-- Detail -->
    <div v-else class="space-y-6">
      <!-- Hero Card -->
      <div class="rounded-4xl border border-border/50 bg-card p-8 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div
              class="flex size-14 items-center justify-center rounded-2xl"
              :style="{ backgroundColor: budgetDetail.category_color + '20' }"
            >
              <AppIcon
                v-if="hasValidIcon"
                :name="budgetDetail.category_icon"
                :size="28"
                :style="{ color: budgetDetail.category_color }"
              />
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tighter text-foreground">
                {{ budgetDetail.name || budgetDetail.category_name }}
              </h2>
              <p v-if="budgetDetail.name" class="text-sm font-medium text-muted-foreground">
                {{ budgetDetail.category_name }}
              </p>
              <p class="text-sm font-medium text-muted-foreground">
                {{ month }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <Button variant="outline" size="sm" class="rounded-xl" @click="goToEdit">
              <AppIcon name="hugeicons:edit-01" :size="16" class="mr-1" />
              {{ $t('budget.edit_budget') }}
            </Button>
            <Button
              variant="outline"
              size="sm"
              class="rounded-xl text-red-600 hover:text-red-600"
              @click="showDeleteDialog = true"
            >
              <AppIcon name="hugeicons:delete-01" :size="16" />
            </Button>
          </div>
        </div>

        <!-- Progress Bar (large) -->
        <div class="mt-8 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="font-bold text-foreground">
              {{ fmtCurrency(budgetDetail.spent) }} / {{ fmtCurrency(budgetDetail.amount) }}
            </span>
            <span
              class="font-black"
              :class="progress.overspent > 0 ? 'text-red-600' : 'text-muted-foreground'"
            >
              {{ Math.round(progress.percentage) }}%
            </span>
          </div>
          <div class="h-4 w-full overflow-hidden rounded-full bg-muted">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="progressColor"
              :style="{ width: `${Math.min(progress.percentage, 100)}%` }"
            />
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('budget.monthly_limit') }}
          </p>
          <p class="mt-2 text-2xl font-black tracking-tighter text-foreground">
            {{ fmtCurrency(budgetDetail.amount) }}
          </p>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('budget.spent') }}
          </p>
          <p class="mt-2 text-2xl font-black tracking-tighter text-foreground">
            {{ fmtCurrency(budgetDetail.spent) }}
          </p>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ progress.overspent > 0 ? $t('budget.overspent') : $t('budget.remaining') }}
          </p>
          <p
            class="mt-2 text-2xl font-black tracking-tighter"
            :class="progress.overspent > 0 ? 'text-red-600' : 'text-foreground'"
          >
            {{
              progress.overspent > 0
                ? fmtCurrency(progress.overspent)
                : fmtCurrency(progress.remaining)
            }}
          </p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('budget.delete_budget')"
      :description="`${$t('budget.delete_budget')} &quot;${budgetDetail?.category_name}&quot;?`"
      :confirm-text="$t('common.delete')"
      @confirm="handleDelete"
    />
  </div>
</template>
