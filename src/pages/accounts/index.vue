<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesAccountsIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'



const router = useRouter()
useI18n()
const { loading, fetchAccounts, fetchAccountBalances, accountBalances, deleteAccount } = useAccounts()
const { fetchCategories } = useCategories()
const { formatCurrency, convertTo, defaultCurrency } = useCurrency()

const showDeleteDialog = ref(false)
const deletingAccount = ref<AccountWithBalance | null>(null)

const typeLabels: Record<string, string> = {
  bank: 'accounts.bank',
  'e-wallet': 'accounts.e-wallet',
  cash: 'accounts.cash',
  investment: 'accounts.investment',
  liability: 'accounts.liability',
}

const loadData = async () => {
  await Promise.all([fetchAccounts(), fetchAccountBalances(), fetchCategories()])
}

onMounted(() => {
  loadData()
})

const onDeleteRequest = (account: AccountWithBalance) => {
  deletingAccount.value = account
  showDeleteDialog.value = true
}

const onDeleteConfirm = async () => {
  if (!deletingAccount.value) return
  await deleteAccount(deletingAccount.value.id)
  showDeleteDialog.value = false
  deletingAccount.value = null
}

const goToNew = () => router.push('/accounts/new')

const goToEdit = (account: AccountWithBalance) => {
  router.push(`/accounts/${account.id}/edit`)
}

const goToDetail = (account: AccountWithBalance) => {
  router.push(`/accounts/${account.id}`)
}

const totalBalance = computed(() => {
  let total = 0
  for (const a of accountBalances.value) {
    const converted = convertTo(a.balance, a.currency || defaultCurrency.value, defaultCurrency.value)
    total += converted ?? a.balance
  }
  return total
})
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <PageHeader
      :title="$t('accounts.title')"
      :subtitle="$t('accounts.subtitle')"
      :button-text="$t('accounts.add')"
      button-icon="hugeicons:add-01"
      @action="goToNew"
    />

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <Skeleton class="h-24 w-full rounded-3xl bg-muted/50" />
      <div class="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        <Skeleton v-for="i in 4" :key="i" class="h-20 rounded-3xl bg-muted/50" />
      </div>
    </div>

    <!-- Empty State -->
    <EmptyState
      v-else-if="accountBalances.length === 0"
      :title="$t('accounts.empty')"
      :description="$t('accounts.empty_desc')"
      icon="hugeicons:bank"
      :button-text="$t('accounts.add')"
      @action="goToNew"
    />

    <!-- Account List -->
    <div v-else class="space-y-6">
      <!-- Total Balance Bar -->
      <StatCard
        :label="$t('dashboard.balance')"
        :value="totalBalance"
        icon="hugeicons:bank"
      />

      <!-- Account Cards -->
      <div class="grid gap-3 grid-cols-1 sm:grid-cols-[repeat(auto-fit,minmax(320px,1fr))]">
        <div
          v-for="account in accountBalances"
          :key="account.id"
          class="group flex items-center justify-between rounded-3xl border border-border/50 bg-card/30 p-4 transition-all hover:border-border hover:bg-card/50 cursor-pointer"
          @click="goToDetail(account)"
        >
          <div class="flex min-w-0 flex-1 items-center gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-950 dark:bg-white shadow-sm border border-border/50"
            >
              <AccountIcon
                :icon="account.icon || ''"
                :type="account.type"
                :size="20"
                :color="account.color || undefined"
              />
            </div>
            <div class="min-w-0">
              <h3 class="truncate font-medium text-foreground">{{ account.name }}</h3>
              <p class="text-xs text-muted-foreground">{{ $t(typeLabels[account.type] || '') }}</p>
            </div>
          </div>
          <div class="ml-3 shrink-0 text-right">
            <p class="font-semibold">{{ formatCurrency(account.balance, account.currency || undefined) }}</p>
          </div>
          <div
            class="ml-2 flex shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            @click.stop
          >
            <ListItemAction
              @edit="goToEdit(account)"
              @delete="onDeleteRequest(account)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('accounts.delete_title')"
      :description="`${$t('accounts.delete_confirm')} &quot;${deletingAccount?.name}&quot;? ${$t('accounts.delete_confirm_suffix')}.`"
      :confirm-text="$t('common.delete')"
      @confirm="onDeleteConfirm"
    />
  </div>
</template>
