<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button
        variant="ghost"
        size="sm"
        class="mb-4 rounded-xl"
        @click="router.push(`/bills/${billId}`)"
      >
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('bills.edit_bill') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('bills.edit_desc') }}</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
      <Skeleton class="h-8 w-32 rounded-xl bg-muted/50" />
      <Skeleton class="h-10 w-64 rounded-xl bg-muted/50" />
      <Skeleton class="h-6 w-48 rounded-lg bg-muted/50" />
      <Skeleton class="h-96 w-full rounded-4xl bg-muted/50" />
    </div>

    <!-- Form -->
    <form
      v-else
      class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm"
      @submit.prevent="handleSubmit"
    >
      <div class="space-y-2">
        <Label for="title">{{ $t('bills.form_title') }}</Label>
        <Input id="title" v-model="form.title" :placeholder="$t('bills.form_title')" required />
      </div>

      <div class="space-y-2">
        <Label for="amount">{{ $t('bills.form_amount') }}</Label>
        <Input
          id="amount"
          v-model="amountDisplay"
          type="text"
          inputmode="numeric"
          :placeholder="$t('bills.form_amount')"
          required
          @keydown="onNumberKeydown"
        />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('bills.form_due_date') }}</Label>
        <Popover>
          <PopoverTrigger as-child>
            <Button
              variant="outline"
              :class="
                cn(
                  'w-full justify-between text-left font-medium',
                  !form.due_date && 'text-muted-foreground',
                )
              "
            >
              <div class="flex items-center">
                <AppIcon name="hugeicons:calendar-01" :size="16" class="mr-2" />
                {{
                  form.due_date
                    ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                    : $t('bills.form_due_date')
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

      <div class="space-y-2">
        <Label for="recurrence">{{ $t('bills.form_recurrence') }}</Label>
        <Select v-model="form.recurrence">
          <SelectTrigger id="recurrence">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">{{ $t('bills.recurrence_none') }}</SelectItem>
            <SelectItem value="weekly">{{ $t('bills.recurrence_weekly') }}</SelectItem>
            <SelectItem value="monthly">{{ $t('bills.recurrence_monthly') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" @click="router.push(`/bills/${billId}`)">
          {{ $t('common.cancel') }}
        </Button>
        <Button type="submit" :disabled="!isFormValid">
          {{ $t('bills.save') }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesBillsDetailEdit',
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
import { Skeleton } from '@/components/ui/skeleton'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { cn } from '@/lib/utils'

const router = useRouter()
const route = useRoute()
const { locale } = useI18n()
const { bills, fetchBills, updateBill } = useBills()
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency } = useCurrency()

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', { dateStyle: 'long' })

const billId = route.params.id as string
const loading = ref(true)

const form = reactive({
  title: '',
  amount: 0,
  due_date: '',
  recurrence: 'none' as 'none' | 'weekly' | 'monthly',
})

const calendarDate = computed({
  get: () => (form.due_date ? parseDate(form.due_date) : undefined),
  set: (val) => {
    if (val) form.due_date = val.toString()
  },
})

const amountDisplay = computed({
  get: () => (form.amount ? formatNumberOnly(form.amount, defaultCurrency.value) : ''),
  set: (val: string) => {
    form.amount = parseLocalizedNumber(val, defaultCurrency.value)
  },
})

const isFormValid = computed(() => form.title.trim() && form.amount > 0 && form.due_date)

const onNumberKeydown = (e: KeyboardEvent) => {
  const allowed = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End',
  ]
  if (allowed.includes(e.key)) return
  if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return
  if (/^[0-9]$/.test(e.key)) return
  if (e.key === ',' || e.key === '.') {
    e.preventDefault()
    return
  }
  e.preventDefault()
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  const { error } = await updateBill(billId, {
    title: form.title.trim(),
    amount: form.amount,
    due_date: form.due_date,
    recurrence: form.recurrence,
  })
  if (!error) {
    router.push(`/bills/${billId}`)
  }
}

onMounted(async () => {
  await fetchBills()
  const bill = bills.value.find((b) => b.id === billId)
  if (bill) {
    form.title = bill.title
    form.amount = bill.amount
    form.due_date = bill.due_date
    form.recurrence = bill.recurrence as 'none' | 'weekly' | 'monthly'
  }
  loading.value = false
})
</script>
