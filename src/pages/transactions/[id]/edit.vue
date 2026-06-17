<template>
  <div>
    <Transition mode="out-in" name="fade-up">
      <div v-if="loading" key="loading" class="mx-auto w-full space-y-4 md:space-y-6">
        <Skeleton class="h-4 w-48 rounded-lg" />
        <div class="flex items-center justify-between rounded-3xl border border-border/50 p-6">
          <div class="flex items-center gap-4">
            <Skeleton class="size-11 rounded-xl" />
            <div class="space-y-2">
              <Skeleton class="h-3 w-24 rounded-md" />
              <Skeleton class="h-6 w-36 rounded-lg" />
              <Skeleton class="h-3 w-48 rounded-md" />
            </div>
          </div>
          <Skeleton class="h-9 w-20 rounded-2xl" />
        </div>
        <div class="space-y-6 rounded-3xl border border-border/50 p-8">
          <div class="grid grid-cols-2 gap-3">
            <Skeleton class="h-16 rounded-2xl" />
            <Skeleton class="h-16 rounded-2xl" />
          </div>
          <Skeleton class="h-32 rounded-3xl" />
          <div class="space-y-4">
            <Skeleton class="h-14 rounded-2xl" />
            <Skeleton class="h-14 rounded-2xl" />
            <Skeleton class="h-14 rounded-2xl" />
            <Skeleton class="h-20 rounded-2xl" />
          </div>
          <div class="flex justify-end gap-3">
            <Skeleton class="h-11 w-24 rounded-2xl" />
            <Skeleton class="h-11 w-28 rounded-2xl" />
          </div>
        </div>
      </div>

      <div v-else-if="fetchError" key="error" class="mx-auto max-w-md py-20">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-red-500/10">
            <AppIcon name="hugeicons:alert-circle" :size="28" class="text-red-600" />
          </div>
          <h3 class="text-lg font-semibold">{{ $t('transaction_edit.error_title') }}</h3>
          <p class="text-sm text-muted-foreground">{{ $t('transaction_edit.error_desc') }}</p>
          <div class="flex gap-3">
            <Button variant="outline" @click="router.push('/transactions')">{{
              $t('transaction_edit.back')
            }}</Button>
            <Button @click="loadTransaction">{{ $t('transaction_edit.retry') }}</Button>
          </div>
        </div>
      </div>

      <div v-else-if="!transaction" key="not-found" class="mx-auto max-w-md py-20">
        <div class="flex flex-col items-center gap-4 text-center">
          <div class="flex size-14 items-center justify-center rounded-2xl bg-muted">
            <AppIcon name="hugeicons:alert-circle" :size="28" class="text-muted-foreground" />
          </div>
          <h3 class="text-lg font-semibold">{{ $t('transaction_edit.not_found') }}</h3>
          <p class="text-sm text-muted-foreground">{{ $t('transaction_edit.not_found_desc') }}</p>
          <Button variant="outline" @click="router.push('/transactions')">{{
            $t('transaction_edit.back')
          }}</Button>
        </div>
      </div>

      <div v-else key="content" class="mx-auto w-full space-y-4 md:space-y-6">
        <!-- Back link -->
        <Button variant="ghost" size="sm" @click="router.push('/transactions')">
          <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
          {{ $t('transaction_edit.back') }}
        </Button>

        <!-- Header card -->
        <div
          class="flex items-center justify-between rounded-3xl border border-border/50 bg-card/40 p-4 md:p-6"
        >
          <div class="flex items-center gap-4">
            <div
              class="flex size-11 items-center justify-center rounded-xl"
              :class="transaction.type === 'income' ? 'bg-emerald-500/10' : 'bg-red-500/10'"
            >
              <AppIcon
                :name="
                  transaction.type === 'income'
                    ? 'hugeicons:arrow-down-01'
                    : 'hugeicons:arrow-up-01'
                "
                :size="22"
                :class="transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'"
              />
            </div>
            <div class="space-y-0.5">
              <p class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {{ $t('transaction_edit.edit_label') }}
              </p>
              <p class="text-xl font-bold">
                {{ formatCurrency(transaction.amount, transaction.currency || undefined) }}
              </p>
              <p class="text-sm text-muted-foreground">
                {{ categoryName }} &middot; {{ formattedDate }}
              </p>
            </div>
          </div>
          <Button variant="destructive" size="sm" @click="showDeleteDialog = true">
            <AppIcon name="hugeicons:delete-01" :size="16" />
            {{ $t('transaction_edit.delete') }}
          </Button>
        </div>

        <!-- Form -->
        <TransactionForm
          ref="formRef"
          :transaction="transaction"
          @saved="onSaved"
          @cancel="router.push('/transactions')"
          @dirty="isDirty = $event"
        />
      </div>
    </Transition>

    <!-- Unsaved changes warning -->
    <ConfirmDialog
      v-model:open="showUnsavedDialog"
      :title="$t('transaction_edit.unsaved_title')"
      :description="$t('transaction_edit.unsaved_desc')"
      :confirm-text="$t('transaction_edit.leave')"
      :cancel-text="$t('transaction_edit.stay')"
      @confirm="confirmLeave"
    />

    <!-- Delete confirmation dialog -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('transaction_edit.delete_title')"
      :description="$t('transaction_edit.delete_confirm')"
      :confirm-text="$t('transaction_edit.delete')"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesTransactionsDetailEdit',
})
import { onBeforeRouteLeave } from 'vue-router'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'

import TransactionForm from '@/components/transaction/TransactionForm.vue'

const router = useRouter()
const { locale } = useI18n()
const route = useRoute()
const { getTransaction, deleteTransaction } = useTransactions()
const { fetchCategories, categories } = useCategories()
const { formatCurrency } = useCurrency()

const transaction = ref<Transaction | null>(null)
const loading = ref(true)
const fetchError = ref(false)
const showDeleteDialog = ref(false)

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  dateStyle: 'long',
})

const categoryName = computed(() => {
  if (!transaction.value?.category_id) {
    return '-'
  }
  const cat = categories.value.find((c) => c.id === transaction.value!.category_id)
  return cat?.name || '-'
})

const formattedDate = computed(() => {
  if (!transaction.value?.date) {
    return ''
  }
  try {
    return df.format(parseDate(transaction.value.date).toDate(getLocalTimeZone()))
  } catch {
    return transaction.value.date
  }
})

const formRef = ref<InstanceType<typeof TransactionForm>>()
const isDirty = ref(false)
const showUnsavedDialog = ref(false)

onBeforeRouteLeave((to, from, next) => {
  if (isDirty.value) {
    next(false)
    showUnsavedDialog.value = true
  } else {
    next()
  }
})

const confirmLeave = () => {
  showUnsavedDialog.value = false
  isDirty.value = false
  router.push('/transactions')
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (isDirty.value) {
    e.preventDefault()
  }
}

const loadTransaction = async () => {
  loading.value = true
  fetchError.value = false
  try {
    const id = route.params.id as string
    const { data } = await getTransaction(id)
    transaction.value = data as unknown as Transaction
  } catch {
    fetchError.value = true
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchCategories(), loadTransaction()])
})

const onSaved = () => {
  isDirty.value = false
  router.push('/transactions')
}

const onDelete = async () => {
  if (!transaction.value) {
    return
  }
  await deleteTransaction(transaction.value.id)
  showDeleteDialog.value = false
  isDirty.value = false
  router.push('/transactions')
}
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 300ms ease-out;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
