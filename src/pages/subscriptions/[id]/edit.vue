<script setup lang="ts">
defineOptions({
  name: 'PagesSubscriptionsEdit',
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
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import { cn } from '@/lib/utils'
import { useSubscriptions } from '@/composables/useSubscriptions'
import { useCategories } from '@/composables/useCategories'
import { useAccounts } from '@/composables/useAccounts'
import { useCurrency } from '@/composables/useCurrency'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { reactive, computed, onMounted, ref, watch } from 'vue'

const router = useRouter()
const route = useRoute()
const subId = route.params.id as string

const { t, locale } = useI18n()
const { currencies, defaultCurrency } = useCurrency()
const { subscriptions, updateSubscription, loading: subLoading } = useSubscriptions()
const { fetchCategories } = useCategories()
const { accounts, fetchAccounts } = useAccounts()

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'long' })

const form = reactive({
  name: '',
  amount: 0,
  currency: defaultCurrency.value,
  billing_cycle: 'monthly' as 'weekly' | 'monthly' | 'yearly',
  next_billing_date: '',
  category_id: '',
  account_id: '',
  reminder_days: 1,
  active: true,
})

const initialized = ref(false)

const calendarDate = computed({
  get: () => (form.next_billing_date ? parseDate(form.next_billing_date) : undefined),
  set: (val) => {
    if (val) form.next_billing_date = val.toString()
  },
})

const isFormValid = computed(() => form.name && form.amount > 0 && form.next_billing_date)

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchAccounts()])
})

watch(
  subscriptions,
  (list) => {
    if (initialized.value) return
    const sub = list.find((s) => s.id === subId)
    if (sub) {
      form.name = sub.name
      form.amount = Number(sub.amount)
      form.currency = sub.currency
      form.billing_cycle = sub.billing_cycle
      form.next_billing_date = sub.next_billing_date
      form.category_id = sub.category_id || ''
      form.account_id = sub.account_id || ''
      form.reminder_days = sub.reminder_days
      form.active = sub.active
      initialized.value = true
    }
  },
  { immediate: true },
)

const onSubmit = async () => {
  if (!isFormValid.value) return
  const result = await updateSubscription(subId, {
    name: form.name,
    amount: Number(form.amount),
    currency: form.currency,
    billing_cycle: form.billing_cycle,
    next_billing_date: form.next_billing_date,
    category_id: form.category_id || null,
    account_id: form.account_id || null,
    reminder_days: form.reminder_days,
    active: form.active,
  })
  if (result && !result.error) {
    router.push('/subscriptions')
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div v-if="!subLoading || initialized">
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/subscriptions')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('subscription_form.title_edit') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ form.name }}</p>
    </div>

    <div v-if="subLoading && !initialized" class="space-y-6">
      <Skeleton class="h-12 w-1/3" />
      <Skeleton class="h-64 w-full rounded-3xl" />
    </div>

    <form
      v-else
      class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-2">
        <Label>{{ $t('subscription_form.name') }}</Label>
        <Input v-model="form.name" placeholder="Netflix, Spotify, etc." required />
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>{{ $t('subscription_form.amount') }}</Label>
          <CurrencyInput
            v-model="form.amount"
            :currency="form.currency"
            :placeholder="$t('transaction_form.amount_placeholder')"
            required
          />
        </div>

        <div class="space-y-2">
          <Label>{{ $t('subscription_form.currency') }}</Label>
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
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>{{ $t('subscription_form.billing_cycle') }}</Label>
          <Select v-model="form.billing_cycle">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">{{ $t('subscriptions.weekly') }}</SelectItem>
              <SelectItem value="monthly">{{ $t('subscriptions.monthly') }}</SelectItem>
              <SelectItem value="yearly">{{ $t('subscriptions.yearly') }}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label>{{ $t('subscription_form.next_billing') }}</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="
                  cn(
                    'w-full justify-between text-left font-medium',
                    !form.next_billing_date && 'text-muted-foreground',
                  )
                "
              >
                <div class="flex items-center">
                  <AppIcon name="hugeicons:calendar-01" :size="16" class="mr-2" />
                  {{
                    form.next_billing_date
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
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div class="space-y-2">
          <Label>{{ $t('subscription_form.category') }}</Label>
          <CategoryPicker
            v-model="form.category_id"
            type="expense"
            :placeholder="$t('recurring_form.select_category')"
          />
        </div>

        <div class="space-y-2">
          <Label>{{ $t('subscription_form.account') }}</Label>
          <Select v-model="form.account_id">
            <SelectTrigger>
              <SelectValue :placeholder="$t('transaction_form.select_account')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="acct in accounts" :key="acct.id" :value="acct.id">
                {{ acct.name }} ({{ acct.currency }})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('subscription_form.reminder') }}</Label>
        <Input v-model.number="form.reminder_days" type="number" min="0" max="30" />
      </div>

      <div class="flex items-center space-x-2 pt-2">
        <Switch v-model="form.active" />
        <Label>{{ $t('subscription_form.active') }}</Label>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" @click="router.push('/subscriptions')">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="submit" :disabled="!isFormValid">
          {{ $t('common.save') }}
        </Button>
      </div>
    </form>
  </div>
</template>
