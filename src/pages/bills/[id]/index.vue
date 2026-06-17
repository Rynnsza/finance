<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/bills')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <Skeleton class="h-10 w-32 rounded-xl bg-muted/50" />
      <Skeleton class="h-56 w-full rounded-4xl bg-muted/50" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton v-for="i in 3" :key="i" class="h-28 rounded-3xl bg-muted/50" />
      </div>
    </div>

    <!-- Not Found -->
    <div
      v-else-if="!billDetail"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
    >
      <div
        class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
      >
        <AppIcon name="hugeicons:calendar-03" :size="40" class="text-muted-foreground/40" />
      </div>
      <h3 class="text-xl font-black tracking-tight text-foreground">{{ $t('bills.no_bills') }}</h3>
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="router.push('/bills/new')"
      >
        {{ $t('bills.add_bill') }}
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
              :class="getIconBgClass"
            >
              <AppIcon name="hugeicons:calendar-03" :size="28" :class="getIconColorClass" />
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tighter text-foreground">
                {{ billDetail.title }}
              </h2>
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('bills.subtitle') }}
              </p>
            </div>
          </div>
          <div class="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              class="rounded-xl"
              @click="router.push(`/bills/${billDetail.id}/edit`)"
            >
              <AppIcon name="hugeicons:pencil-edit-01" :size="16" class="mr-1" />
              {{ $t('bills.edit_bill') }}
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

        <div class="mt-8 flex items-end justify-between">
          <div>
            <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
              {{ $t('bills.amount') }}
            </p>
            <p class="text-5xl font-black tracking-tighter text-foreground">
              {{ formatCurrency(billDetail.amount) }}
            </p>
          </div>
          <span
            v-if="billDetail.is_paid"
            class="rounded-full bg-emerald-500/10 px-4 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400"
          >
            {{ $t('bills.paid') }}
          </span>
          <span
            v-else
            class="rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-bold text-amber-600 dark:text-amber-400"
          >
            {{ $t('bills.unpaid') }}
          </span>
        </div>

        <!-- Mark as Paid button -->
        <div v-if="!billDetail.is_paid" class="mt-6">
          <Dialog v-model:open="showPayDialog">
            <DialogTrigger as-child>
              <Button class="w-full rounded-2xl">
                <AppIcon name="hugeicons:checkmark-circle-01" :size="16" class="mr-2" />
                {{ $t('bills.mark_paid') }}
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{{ $t('bills.mark_paid_title') }}</DialogTitle>
                <DialogDescription>
                  {{ $t('bills.mark_paid_desc') }}
                </DialogDescription>
              </DialogHeader>

              <div class="space-y-4 py-4">
                <div class="space-y-2">
                  <Label>{{ $t('transactions.form_account') }}</Label>
                  <NativeSelect v-model="selectedAccountId" class="w-full">
                    <NativeSelectOption value="" disabled>{{
                      $t('common.select_account')
                    }}</NativeSelectOption>
                    <NativeSelectOptGroup
                      v-if="bankAccounts.length"
                      :label="$t('accounts.type_bank')"
                    >
                      <NativeSelectOption v-for="acc in bankAccounts" :key="acc.id" :value="acc.id">
                        {{ acc.name }}
                      </NativeSelectOption>
                    </NativeSelectOptGroup>
                    <NativeSelectOptGroup
                      v-if="ewalletAccounts.length"
                      :label="$t('accounts.type_ewallet')"
                    >
                      <NativeSelectOption
                        v-for="acc in ewalletAccounts"
                        :key="acc.id"
                        :value="acc.id"
                      >
                        {{ acc.name }}
                      </NativeSelectOption>
                    </NativeSelectOptGroup>
                    <NativeSelectOptGroup
                      v-if="cashAccounts.length"
                      :label="$t('accounts.type_cash')"
                    >
                      <NativeSelectOption v-for="acc in cashAccounts" :key="acc.id" :value="acc.id">
                        {{ acc.name }}
                      </NativeSelectOption>
                    </NativeSelectOptGroup>
                  </NativeSelect>
                </div>
                <div class="flex items-center space-x-2 mt-4">
                  <Switch id="create-transaction" v-model="createTransactionRecord" />
                  <Label for="create-transaction" class="cursor-pointer">{{
                    $t('bills.create_transaction_record')
                  }}</Label>
                </div>
              </div>

              <DialogFooter class="sm:justify-end">
                <DialogClose as-child>
                  <Button type="button" variant="outline">{{ $t('common.cancel') }}</Button>
                </DialogClose>
                <Button
                  type="button"
                  @click="handleMarkPaid(billDetail.id)"
                  :disabled="!selectedAccountId || paying"
                >
                  <AppIcon
                    v-if="paying"
                    name="hugeicons:loading-03"
                    class="mr-2 h-4 w-4 animate-spin"
                  />
                  {{ $t('common.confirm') }}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('bills.form_due_date') }}
          </p>
          <p class="mt-2 text-2xl font-black tracking-tighter" :class="getDueDateColorClass">
            {{ formatDate(billDetail.due_date) }}
          </p>
          <p class="mt-1 text-xs font-bold" :class="getDueDateColorClass">
            {{ getDueDateStatusText }}
          </p>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('bills.status') }}
          </p>
          <p
            class="mt-2 text-2xl font-black tracking-tighter"
            :class="billDetail.is_paid ? 'text-emerald-600' : 'text-amber-500'"
          >
            {{ billDetail.is_paid ? $t('bills.paid') : $t('bills.unpaid') }}
          </p>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('bills.form_recurrence') }}
          </p>
          <p class="mt-2 text-2xl font-black tracking-tighter text-foreground">
            {{
              billDetail.recurrence === 'monthly'
                ? $t('bills.recurrence_monthly')
                : $t('bills.recurrence_none')
            }}
          </p>
        </div>
        <div
          v-if="billDetail.is_paid && paidWithAccount"
          class="rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm sm:col-span-3"
        >
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
            {{ $t('bills.paid_with') }}
          </p>
          <p
            class="mt-2 text-2xl font-black tracking-tighter text-foreground flex items-center gap-2"
          >
            <AppIcon :name="paidWithAccount.icon" class="text-primary" /> {{ paidWithAccount.name }}
          </p>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('bills.delete_confirm')"
      :description="`${$t('bills.delete_confirm_desc')} &quot;${billDetail?.title}&quot;?`"
      :confirm-text="$t('common.delete')"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesBillsDetailIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  NativeSelect,
  NativeSelectOptGroup,
  NativeSelectOption,
} from '@/components/ui/native-select'
import { formatDateSafe } from '@/lib/utils'


const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { bills, fetchBills, markAsPaid, deleteBill } = useBills()
const { formatCurrency, defaultCurrency } = useCurrency()
const { fetchAccounts, accounts, bankAccounts, ewalletAccounts, cashAccounts } = useAccounts()
const { addTransaction } = useTransactions()

const billId = route.params.id as string
const billDetail = ref<Bill | null>(null)
const loading = ref(true)
const showDeleteDialog = ref(false)

const showPayDialog = ref(false)
const selectedAccountId = ref('')
const createTransactionRecord = ref(true)
const paying = ref(false)

const paidWithAccount = computed(() => {
  if (!billDetail.value?.paid_with_account_id) return null
  return accounts.value.find((a) => a.id === billDetail.value?.paid_with_account_id) || null
})

const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)
  return Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

const getDueDateStatusText = computed(() => {
  if (!billDetail.value) return ''
  if (billDetail.value.is_paid) return t('bills.paid')
  const days = getDaysUntilDue(billDetail.value.due_date)
  if (days === 0) return t('bills.due_today')
  if (days < 0) return t('bills.overdue')
  return t('bills.due_in_days', { days })
})

const getDueDateColorClass = computed(() => {
  if (!billDetail.value) return 'text-foreground'
  if (billDetail.value.is_paid) return 'text-emerald-600 dark:text-emerald-400'
  const days = getDaysUntilDue(billDetail.value.due_date)
  if (days === 0) return 'text-amber-500'
  if (days < 0) return 'text-rose-500'
  return 'text-foreground'
})

const getIconBgClass = computed(() => {
  if (!billDetail.value) return 'bg-muted/50'
  if (billDetail.value.is_paid) return 'bg-emerald-500/10'
  const days = getDaysUntilDue(billDetail.value.due_date)
  if (days <= 0) return 'bg-rose-500/10'
  return 'bg-amber-500/10'
})

const getIconColorClass = computed(() => {
  if (!billDetail.value) return 'text-muted-foreground/40'
  if (billDetail.value.is_paid) return 'text-emerald-600 dark:text-emerald-400'
  const days = getDaysUntilDue(billDetail.value.due_date)
  if (days <= 0) return 'text-rose-600 dark:text-rose-400'
  return 'text-amber-600 dark:text-amber-400'
})

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
}

async function handleMarkPaid(id: string) {
  paying.value = true
  await markAsPaid(id, selectedAccountId.value)

  if (createTransactionRecord.value && billDetail.value) {
    await addTransaction({
      type: 'expense',
      amount: billDetail.value.amount,
      currency: defaultCurrency.value,
      category_id: null,
      description: billDetail.value.title,
      date: formatDateSafe(new Date()),
      account_id: selectedAccountId.value,
      image_url: null,
      splits: [],
    })
  }

  billDetail.value = {
    ...billDetail.value!,
    is_paid: true,
    paid_with_account_id: selectedAccountId.value,
  }
  paying.value = false
  showPayDialog.value = false
}

async function handleDelete() {
  if (!billDetail.value) return
  const { error } = await deleteBill(billDetail.value.id)
  if (!error) {
    router.push('/bills')
  }
  showDeleteDialog.value = false
}

onMounted(async () => {
  await fetchBills()
  if (accounts.value.length === 0) {
    await fetchAccounts()
  }
  billDetail.value = bills.value.find((b) => b.id === billId) || null
  loading.value = false
})
</script>
