<script setup lang="ts">
defineOptions({
  name: 'PagesRecurringDetailEdit',
})
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { cn } from '@/lib/utils'
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from '@/types'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const { currencies, defaultCurrency } = useCurrency()
const { recurring, fetchRecurring, updateRecurring } = useRecurring()
const { fetchCategories } = useCategories()

const recurringId = route.params.id as string
const loading = ref(true)

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'long' })

const form = reactive({
  type: 'expense' as TransactionType,
  amount: 0,
  currency: defaultCurrency.value,
  category_id: '',
  description: '',
  frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
  next_date: '',
})

const calendarDate = computed({
  get: () => (form.next_date ? parseDate(form.next_date) : undefined),
  set: (val) => {
    if (val) form.next_date = val.toString()
  },
})

const isFormValid = computed(() => form.amount > 0 && form.next_date)

onMounted(async () => {
  await Promise.all([fetchRecurring(), fetchCategories()])
  const item = recurring.value.find((r: RecurringTransaction) => r.id === recurringId)
  if (item) {
    form.type = item.type as TransactionType
    form.amount = item.amount
    form.currency = item.currency || defaultCurrency.value
    form.category_id = item.category_id || ''
    form.description = item.description || ''
    form.frequency = item.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'

    form.next_date = item.next_date
  }
  loading.value = false
})

const onSubmit = async () => {
  if (!isFormValid.value) return
  await updateRecurring(recurringId, {
    type: form.type,
    amount: Number(form.amount),
    currency: form.currency,
    category_id: (form.category_id || null) as unknown as string,
    description: form.description || null,
    frequency: form.frequency,
    next_date: form.next_date,
    active: true,
  })
  router.push('/recurring')
}
</script>

<template>
  <div v-if="loading" class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <Skeleton class="h-8 w-32 rounded-xl bg-muted/50" />
    <Skeleton class="h-10 w-64 rounded-xl bg-muted/50" />
    <Skeleton class="h-6 w-48 rounded-lg bg-muted/50" />
    <Skeleton class="h-96 w-full rounded-4xl bg-muted/50" />
  </div>

  <div v-else class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/recurring')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('recurring_form.title_edit') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('recurring.empty_desc') }}</p>
    </div>

    <form
      class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-2">
        <Label>{{ $t('recurring_form.type') }}</Label>
        <div class="flex gap-2">
          <Button
            type="button"
            :variant="form.type === 'income' ? 'default' : 'outline'"
            class="flex-1"
            @click="form.type = 'income'"
          >
            {{ $t('recurring_form.income') }}
          </Button>
          <Button
            type="button"
            :variant="form.type === 'expense' ? 'default' : 'outline'"
            class="flex-1"
            @click="form.type = 'expense'"
          >
            {{ $t('recurring_form.expense') }}
          </Button>
        </div>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('recurring_form.amount') }}</Label>
        <CurrencyInput
          v-model="form.amount"
          :currency="form.currency"
          :placeholder="$t('transaction_form.amount_placeholder')"
          required
        />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('recurring_form.currency') }}</Label>
        <Select v-model="form.currency">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="c in currencies" :key="c.value" :value="c.value">{{
              c.label
            }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('recurring_form.category') }}</Label>
        <CategoryPicker
          v-model="form.category_id"
          :type="form.type"
          :placeholder="$t('recurring_form.select_category')"
        />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('recurring_form.description') }}</Label>
        <Input v-model="form.description" :placeholder="$t('recurring_form.note_optional')" />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('recurring_form.frequency') }}</Label>
        <Select v-model="form.frequency">
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">{{ $t('recurring_form.daily') }}</SelectItem>
            <SelectItem value="weekly">{{ $t('recurring_form.weekly') }}</SelectItem>
            <SelectItem value="monthly">{{ $t('recurring_form.monthly') }}</SelectItem>
            <SelectItem value="yearly">{{ $t('recurring_form.yearly') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('recurring_form.next_date') }}</Label>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              :class="
                cn(
                  'w-full justify-between text-left font-medium',
                  !form.next_date && 'text-muted-foreground',
                )
              "
            >
              <div class="flex items-center">
                <AppIcon name="hugeicons:calendar-01" :size="16" class="mr-2" />
                {{
                  form.next_date
                    ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                    : $t('recurring_form.select_date')
                }}
              </div>
              <AppIcon
                name="hugeicons:arrow-down-01"
                :size="16"
                class="text-muted-foreground opacity-50"
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar v-model="calendarDate" initial-focus />
          </PopoverContent>
        </Popover>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" @click="router.push('/recurring')">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="submit" :disabled="!isFormValid">
          {{ $t('recurring_form.save') }}
        </Button>
      </div>
    </form>
  </div>
</template>
