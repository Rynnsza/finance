<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesAccountsDetailIndex',
})


const router = useRouter()
const route = useRoute()
const { accountBalances, balancesLoading: loading, fetchAccountBalances } = useAccounts()
const { formatCurrency } = useCurrency()

const accountId = route.params.id as string
const accountDetail = computed(() => accountBalances.value.find((a) => a.id === accountId) || null)

const typeLabels: Record<string, string> = {
  bank: 'accounts.bank',
  'e-wallet': 'accounts.e-wallet',
  cash: 'accounts.cash',
  investment: 'accounts.investment',
  liability: 'accounts.liability',
}

onMounted(async () => {
  await fetchAccountBalances()
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/accounts')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <Skeleton class="h-10 w-32 rounded-xl bg-muted/50" />
      <Skeleton class="h-48 w-full rounded-4xl bg-muted/50" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton class="h-28 rounded-3xl bg-muted/50" />
        <Skeleton class="h-28 rounded-3xl bg-muted/50" />
      </div>
    </div>

    <!-- Not Found -->
    <div
      v-else-if="!accountDetail"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
    >
      <div
        class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
      >
        <AppIcon name="hugeicons:bank" :size="40" class="text-muted-foreground/40" />
      </div>
      <h3 class="text-xl font-black tracking-tight text-foreground">{{ $t('accounts.empty') }}</h3>
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="router.push('/accounts/new')"
      >
        {{ $t('accounts.add') }}
      </Button>
    </div>

    <!-- Detail -->
    <div v-else class="space-y-6">
      <!-- Hero Card -->
      <div class="rounded-4xl border border-border/50 bg-card p-8 shadow-sm">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div
              class="flex size-14 items-center justify-center rounded-2xl bg-zinc-950 dark:bg-white shadow-lg border border-border/50"
            >
              <AccountIcon
                :icon="accountDetail.icon || ''"
                :type="accountDetail.type"
                :size="28"
                :color="accountDetail.color || undefined"
              />
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tighter text-foreground">
                {{ accountDetail.name }}
              </h2>
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t(typeLabels[accountDetail.type] || '') }}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            class="rounded-xl"
            @click="router.push(`/accounts/${accountDetail.id}/edit`)"
          >
            <AppIcon name="hugeicons:pencil-edit-01" :size="16" class="mr-1" />
            {{ $t('accounts.edit') }}
          </Button>
        </div>

        <div class="mt-8">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
            {{ $t('dashboard.balance') }}
          </p>
          <p class="text-5xl font-black tracking-tighter text-foreground">
            {{ formatCurrency(accountDetail.balance, accountDetail.currency || undefined) }}
          </p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('accounts.initial_balance') }}
          </p>
          <p class="mt-2 text-2xl font-black tracking-tighter text-foreground">
            {{ formatCurrency(accountDetail.initial_balance || 0, accountDetail.currency || undefined) }}
          </p>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('accounts.currency') }}
          </p>
          <p class="mt-2 text-2xl font-black tracking-tighter text-foreground">
            {{ accountDetail.currency }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
