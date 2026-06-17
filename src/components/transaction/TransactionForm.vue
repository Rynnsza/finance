<template>
  <div class="mx-auto w-full space-y-5 md:space-y-8">
    <!-- HEADER -->
    <div class="text-center md:text-left">
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ isEdit ? $t('transaction_form.title_edit') : $t('transaction_form.title_new') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">
        {{ isEdit ? $t('transaction_form.subtitle_edit') : $t('transaction_form.subtitle') }}
      </p>
    </div>

    <TransactionTypeSelector v-model="form.type" />

    <!-- SCAN RECEIPT BUTTON -->
    <div v-if="form.type !== 'transfer'" class="flex justify-center">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button
            variant="outline"
            class="group relative h-12 w-full rounded-2xl border-dashed border-border/50 bg-transparent font-black uppercase tracking-widest text-xs transition-all hover:border-primary/50 hover:bg-primary/5 disabled:opacity-50"
            :disabled="uploading || scanning"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all group-hover:bg-primary/20"
              >
                <AppIcon
                  :name="scanning ? 'hugeicons:loading-03' : 'hugeicons:camera-01'"
                  :size="16"
                  :class="scanning ? 'animate-spin' : ''"
                />
              </div>
              <span>{{
                scanning ? $t('transaction_form.scanning') : $t('transaction_form.scan_receipt')
              }}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="center" class="min-w-48 p-2">
          <DropdownMenuItem
            class="rounded-xl px-3 py-2.5 cursor-pointer"
            @select.prevent="cameraDialogOpen = true"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
              >
                <AppIcon name="hugeicons:camera-01" :size="16" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold">{{ $t('transaction_form.scan_camera') }}</span>
                <span class="text-xs text-muted-foreground">{{
                  $t('transaction_form.scan_camera_desc')
                }}</span>
              </div>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            class="rounded-xl px-3 py-2.5 cursor-pointer"
            @select.prevent="fileInputRef?.click()"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground"
              >
                <AppIcon name="hugeicons:folder-01" :size="16" />
              </div>
              <div class="flex flex-col">
                <span class="text-sm font-bold">{{ $t('transaction_form.scan_gallery') }}</span>
                <span class="text-xs text-muted-foreground">{{
                  $t('transaction_form.scan_gallery_desc')
                }}</span>
              </div>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onFileSelected"
      />

      <!-- Camera capture dialog -->
      <CameraCapture v-model:open="cameraDialogOpen" @captured="onCameraCaptured" />
    </div>

    <!-- AMOUNT CARD -->
    <div
      class="relative overflow-hidden rounded-3xl md:rounded-4xl border border-border/50 bg-card/20 p-5 md:p-8 backdrop-blur-md shadow-2xl transition-all hover:border-border/80"
    >
      <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
        $t('transaction_form.amount')
      }}</Label>
      <div class="mt-3 md:mt-4 flex items-center gap-3 md:gap-4">
        <div
          class="flex h-11 md:h-14 items-center justify-center rounded-xl md:rounded-2xl bg-muted/50 px-4 md:px-5 text-base md:text-xl font-black text-foreground shadow-inner"
        >
          {{ form.currency }}
        </div>
        <CurrencyInput
          v-model="form.amount"
          :currency="form.currency"
          :placeholder="$t('transaction_form.amount_placeholder')"
          class="h-auto w-full border-none bg-transparent py-0 text-4xl font-black tracking-tighter text-foreground outline-none placeholder:text-muted-foreground/20 shadow-none focus-visible:ring-0 md:text-6xl"
        />
      </div>
      <div v-if="convertedAmount" class="mt-2 flex items-center gap-2 justify-center">
        <AppIcon name="hugeicons:arrow-right-01" :size="14" class="text-primary" />
        <span class="text-sm font-black text-primary">{{ convertedAmount }}</span>
        <span class="text-[10px] font-medium text-muted-foreground/60"
          >({{ $t('transaction_form.estimated_receive') }})</span
        >
      </div>
      <p
        v-if="hasDecimals(form.currency) && !convertedAmount"
        class="mt-2 text-[10px] font-medium text-muted-foreground/60 text-center"
      >
        {{
          $t('transaction_form.cents_hint', {
            value: '50000',
            formatted: formatNumberOnly(500, form.currency),
          })
        }}
      </p>

      <!-- DUPLICATE WARNING -->
      <div
        v-if="potentialDuplicates.length > 0"
        class="mt-4 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4"
      >
        <div
          class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <AppIcon name="hugeicons:alert-02" :size="16" />
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
            {{ $t('transaction_form.duplicate_found') }}
          </p>
          <p class="mt-1 text-sm font-medium text-muted-foreground">
            {{ $t('transaction_form.duplicate_desc', { count: potentialDuplicates.length }) }}
          </p>
          <div class="mt-2 flex flex-wrap gap-2">
            <span
              v-for="dup in potentialDuplicates.slice(0, 3)"
              :key="dup.id"
              class="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-700 dark:text-amber-300"
            >
              <AppIcon name="hugeicons:currency-dollar" :size="12" />
              {{ formatCurrency(dup.amount, dup.currency || form.currency) }}
              <span v-if="dup.description" class="opacity-70">— {{ dup.description }}</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- DETAIL FORM GRID -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- Category & Account (Left Side) -->
      <div class="space-y-4">
        <!-- Category Picker (Hidden for Transfer) -->
        <div
          v-if="form.type !== 'transfer'"
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:grid-view" :size="12" />
            {{ $t('transaction_form.category') }}
          </Label>
          <CategoryPicker
            v-model="form.category_id"
            :type="form.type"
            :placeholder="$t('transaction_form.select_category')"
            class="w-full"
          />
        </div>

        <!-- From Account / Main Account -->
        <div
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:wallet-01" :size="12" />
            {{
              form.type === 'transfer'
                ? $t('transaction_form.from_account')
                : $t('transaction_form.select_account')
            }}
          </Label>
          <Select v-model="form.account_id">
            <SelectTrigger
              class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80"
            >
              <SelectValue
                :placeholder="
                  form.type === 'transfer'
                    ? $t('transaction_form.from_account')
                    : $t('transaction_form.select_account')
                "
              />
            </SelectTrigger>
            <SelectContent class="rounded-2xl p-2">
              <SelectItem
                v-for="acct in accounts"
                :key="acct.id"
                :value="acct.id"
                :text-value="acct.name"
                class="rounded-xl px-3 py-2.5"
                :disabled="form.type === 'transfer' && acct.id === form.to_account_id"
              >
                <template #text>{{ acct.name }}</template>
                <div class="flex items-center gap-2">
                  <div
                    class="size-2 rounded-full"
                    :style="{ backgroundColor: acct.color || undefined }"
                  />
                  <div class="flex flex-col">
                    <span class="font-bold">{{ acct.name }}</span>
                    <span class="text-[10px] opacity-60">{{ acct.currency }}</span>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- To Account (Only for Transfer) -->
        <div
          v-if="form.type === 'transfer'"
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:wallet-01" :size="12" />
            {{ $t('transaction_form.to_account') }}
          </Label>
          <Select v-model="form.to_account_id">
            <SelectTrigger
              class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80"
            >
              <SelectValue :placeholder="$t('transaction_form.to_account')" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl p-2">
              <SelectItem
                v-for="acct in accounts"
                :key="acct.id"
                :value="acct.id"
                :text-value="acct.name"
                class="rounded-xl px-3 py-2.5"
                :disabled="acct.id === form.account_id"
              >
                <template #text>{{ acct.name }}</template>
                <div class="flex items-center gap-2">
                  <div
                    class="size-2 rounded-full"
                    :style="{ backgroundColor: acct.color || undefined }"
                  />
                  <div class="flex flex-col">
                    <span class="font-bold">{{ acct.name }}</span>
                    <span class="text-[10px] opacity-60">{{ acct.currency }}</span>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <!-- Currency & Date (Right Side) -->
      <div class="space-y-4">
        <div
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:coins-swap" :size="12" />
            {{ $t('transaction_form.currency') }}
          </Label>
          <Select v-model="form.currency">
            <SelectTrigger
              class="h-11 rounded-2xl border-border/50 bg-background/50 transition-all hover:bg-background/80"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent class="max-h-[300px] rounded-2xl p-2">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel
                  class="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50"
                >
                  {{ group.label }}
                </SelectLabel>
                <SelectItem
                  v-for="c in group.currencies"
                  :key="c.value"
                  :value="c.value"
                  :text-value="c.value"
                  class="rounded-xl px-3 py-2.5"
                >
                  <template #text>{{ c.value }}</template>
                  <div class="flex items-center gap-2">
                    <span class="font-black text-foreground">{{ c.value }}</span>
                    <span class="text-xs text-muted-foreground opacity-60">
                      - {{ c.label.split(' - ')[1] }}</span
                    >
                  </div>
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div
          class="space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30"
        >
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:calendar-01" :size="12" />
            {{ $t('transaction_form.select_date') }}
          </Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                class="h-11 w-full justify-between rounded-2xl border-border/50 bg-background/50 px-4 font-bold transition-all hover:bg-background/80"
                :class="!form.date && 'text-muted-foreground'"
              >
                {{
                  form.date
                    ? df.format(calendarDate!.toDate(getLocalTimeZone()))
                    : $t('transaction_form.select_date')
                }}
                <AppIcon name="hugeicons:arrow-down-01" :size="16" class="ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              class="w-auto p-0 rounded-3xl border-border/50 shadow-2xl backdrop-blur-xl"
            >
              <Calendar v-model="calendarDate" initial-focus class="rounded-3xl" />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <!-- Notes (Full Width) -->
      <div
        class="col-span-1 space-y-2 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30 md:col-span-2"
      >
        <Label
          class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
        >
          <AppIcon name="hugeicons:note-01" :size="12" />
          {{ $t('transaction_form.note_optional') }}
        </Label>
        <Textarea
          v-model="form.description"
          :placeholder="$t('transaction_form.note_optional')"
          rows="2"
          class="min-h-[68px] md:min-h-[80px] rounded-2xl border-border/50 bg-background/50 p-4 font-medium transition-all hover:bg-background/80 focus-visible:ring-primary/20"
        />
      </div>

      <TransactionAttachment
        :image-url="form.image_url"
        :uploading="uploadingImage"
        @upload="uploadAttachment"
        @remove="removeAttachment"
      />
    </div>

    <TransactionSplitEditor
      v-if="form.type !== 'transfer'"
      :enabled="splitEnabled"
      :items="splitItems"
      :type="form.type"
      :currency="form.currency"
      :total-mismatch="splitTotalMismatch"
      :formatted-split-total="formattedSplitTotal"
      :formatted-amount="formattedAmount"
      @toggle="toggleSplit"
      @add="addSplit"
      @remove="removeSplit"
    />

    <!-- ACTION BUTTONS -->
    <div class="flex items-center justify-end gap-3 md:gap-4 pt-4">
      <Button
        variant="ghost"
        class="h-11 md:h-12 rounded-2xl px-6 md:px-8 font-black uppercase tracking-widest transition-all hover:bg-secondary/50"
        @click="$emit('cancel')"
      >
        {{ $t('transaction_form.cancel') }}
      </Button>
      <Button
        class="h-11 md:h-12 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 md:px-10 font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        :disabled="submitting || !form.amount || !form.date"
        @click="onSubmit"
      >
        {{ submitting ? $t('transaction_form.saving') : $t('transaction_form.save') }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate, today } from '@internationalized/date'
import type { TransactionType, Transaction, TransactionFilters, SplitItem, TransactionInsert, TransactionUpdate } from "@/types"
import type { Json } from '@/types/database'


import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDateSafe } from '@/lib/utils'
import { useReceipts } from '@/composables/useReceipts'
import { useBudgets } from '@/composables/useBudgets'
import { queryDuplicateTransactions } from '@/services/transaction.service'
import { useAuth } from '@/composables/useAuth'
import TransactionTypeSelector from '@/components/transaction/form/TransactionTypeSelector.vue'
import TransactionAttachment from '@/components/transaction/form/TransactionAttachment.vue'
import TransactionSplitEditor from '@/components/transaction/form/TransactionSplitEditor.vue'

const { locale, t } = useI18n()

const props = defineProps<{
  transaction?: Transaction & { to_account_id?: string | null }
}>()

const emit = defineEmits<{
  cancel: []
  saved: []
  dirty: [value: boolean]
}>()

const {
  currencyGroups,
  formatNumberOnly,
  parseLocalizedNumber,
  defaultCurrency,
  hasDecimals,
  formatCurrency,
  convertTo,
} = useCurrency()
const { toast } = useToast()

const { addTransaction, addTransfer, updateTransaction } = useTransactions()
const { uploadTransactionImage, deleteTransactionImage } = useTransactions()
const { accounts, fetchAccounts } = useAccounts()
const { checkBudgetAlerts } = useBudgets()

onMounted(() => {
  fetchAccounts()
})

const isEdit = computed(() => !!props.transaction)

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  dateStyle: 'long',
})

const todayDate = today(getLocalTimeZone()).toString()

const form = reactive({
  type: (props.transaction?.type as TransactionType) ?? ('expense' as TransactionType),
  amount: props.transaction?.amount ?? 0,
  currency: props.transaction?.currency ?? defaultCurrency.value,
  category_id: props.transaction?.category_id ?? '',
  account_id: props.transaction?.account_id ?? '',
  to_account_id: props.transaction?.to_account_id ?? '',
  description: props.transaction?.description ?? '',
  date: props.transaction?.date ?? todayDate,
  image_url: props.transaction?.image_url ?? (null as string | null),
})

const submitting = ref(false)

const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadingImage = ref(false)

const { uploading, scanning, scanReceiptFromFile } = useReceipts()

const { categories } = useCategories()

const cameraDialogOpen = ref(false)

// --- Duplicate detection ---
const { user } = useAuth()
const potentialDuplicates = ref<Transaction[]>([])
const checkingDuplicates = ref(false)

const duplicateFormKey = computed(() => {
  const base = `${form.type}|${form.amount}|${form.date}|${form.account_id}|${form.category_id}`
  if (props.transaction?.id) {
    return `${base}|edit:${props.transaction.id}`
  }
  return base
})

watchDebounced(
  duplicateFormKey,
  async (newKey) => {
    if (checkingDuplicates.value) return

    const [type = '', amount, date, account_id, category_id] = newKey.split('|')
    if (!type || !amount || Number(amount) <= 0 || !date) {
      potentialDuplicates.value = []
      return
    }

    checkingDuplicates.value = true
    try {
      const result = await queryDuplicateTransactions(
        user.value?.id || '',
        {
          amount: Number(amount),
          date,
          type,
          account_id: account_id || null,
          category_id: category_id || null,
          exclude_id: props.transaction?.id,
        },
      )
      potentialDuplicates.value = (result.data as Transaction[]) || []
    } catch {
      potentialDuplicates.value = []
    } finally {
      checkingDuplicates.value = false
    }
  },
  { debounce: 600 },
)

/**
 * Auto-fill the form fields from scanned receipt data.
 * Shared by file selection and camera capture flows.
 */
function autoFillForm(receiptData: {
  type: TransactionType
  amount: number
  currency: string
  category: string | null
  description: string | null
  date: string | null
  merchant: string | null
}) {
  form.type = receiptData.type

  form.amount = receiptData.amount
  form.currency = receiptData.currency

  // Match category name from AI to local category_id
  if (receiptData.category) {
    const categoryName = receiptData.category.toLowerCase()
    const match = categories.value.find(
      (c: { name: string; type: string }) =>
        c.name.toLowerCase() === categoryName && c.type === form.type,
    )
    if (match) {
      form.category_id = match.id
    }
  }

  if (receiptData.description) {
    form.description = receiptData.description
  }

  if (receiptData.date) {
    form.date = receiptData.date
  }

  // merchant is appended to description if it exists and description doesn't already include it
  if (
    receiptData.merchant &&
    receiptData.description &&
    !receiptData.description.includes(receiptData.merchant)
  ) {
    form.description = `${receiptData.merchant} — ${receiptData.description}`
  }
}

async function onFileSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const receiptData = await scanReceiptFromFile(file)

  // Reset file input so the same file can be selected again
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  if (!receiptData) return

  autoFillForm(receiptData)
}

async function onCameraCaptured(file: File) {
  const receiptData = await scanReceiptFromFile(file, { skipCompression: true })
  if (!receiptData) return
  autoFillForm(receiptData)
}

async function uploadAttachment(file: File) {
  uploadingImage.value = true
  try {
    const url = await uploadTransactionImage(file)
    if (url) {
      form.image_url = url
    }
  } finally {
    uploadingImage.value = false
  }
}

async function removeAttachment() {
  if (form.image_url) {
    await deleteTransactionImage(form.image_url)
  }
  form.image_url = null
}

// --- Split transaction logic ---
const splitEnabled = ref(false)
const splitItems = ref<SplitItem[]>([])

const splitTotal = computed(() =>
  splitItems.value.reduce((sum: number, s) => sum + (Number(s.amount) || 0), 0),
)

const splitTotalMismatch = computed(
  () => splitItems.value.length > 0 && splitTotal.value !== Number(form.amount),
)

const formattedSplitTotal = computed(() => formatCurrency(splitTotal.value, form.currency))
const formattedAmount = computed(() => formatCurrency(form.amount, form.currency))

const convertedAmount = computed(() => {
  if (form.type !== 'transfer' || !form.to_account_id) return null
  const toAccount = accounts.value.find((a) => a.id === form.to_account_id)
  const toCurrency = toAccount?.currency || form.currency
  if (toCurrency === form.currency) return null

  const converted = convertTo(Number(form.amount), form.currency, toCurrency)
  if (converted === null) return null
  return formatCurrency(converted, toCurrency)
})

function toggleSplit() {
  splitEnabled.value = !splitEnabled.value
  if (!splitEnabled.value) {
    splitItems.value = []
  }
}

function addSplit() {
  splitItems.value.push({ category_id: '', amount: 0 })
}

function removeSplit(index: number) {
  splitItems.value.splice(index, 1)
}

function onSplitAmountInput(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/\D/g, '')
  const item = splitItems.value[index]
  if (item) {
    splitItems.value[index] = {
      ...item,
      amount: Number(input.value) || 0,
    }
  }
}

// Initialize splits from existing transaction
watch(
  () => props.transaction,
  (tx) => {
    const splits = (tx?.splits as unknown as SplitItem[]) || []
    if (splits.length > 0) {
      splitItems.value = splits.map((s) => ({ ...s }))
      splitEnabled.value = true
    }
  },
  { immediate: true },
)

const calendarDate = computed({
  get: () => (form.date ? parseDate(form.date) : undefined),
  set: (val) => {
    if (val) {
      form.date = val.toString()
    }
  },
})

watch(
  () => ({ ...form }),
  (newForm) => {
    if (!props.transaction) {
      return
    }
    const initial = {
      type: props.transaction.type,
      amount: props.transaction.amount,
      currency: props.transaction.currency,
      category_id: props.transaction.category_id,
      description: props.transaction.description,
      date: props.transaction.date,
    }
    const changed =
      newForm.type !== initial.type ||
      Number(newForm.amount) !== Number(initial.amount) ||
      newForm.currency !== initial.currency ||
      newForm.category_id !== (initial.category_id ?? '') ||
      newForm.account_id !== ((initial as Record<string, unknown>).account_id ?? '') ||
      newForm.description !== (initial.description ?? '') ||
      newForm.date !== initial.date
    emit('dirty', changed)
  },
  { deep: true, immediate: true },
)

const onAmountInput = (e: Event) => {
  const input = e.target as HTMLInputElement
  // Strip non-digits from paste via context menu / middle-click
  input.value = input.value.replace(/\D/g, '')
}

const onSubmit = async () => {
  if (submitting.value) {
    return
  }

  submitting.value = true
  try {
    if (splitEnabled.value && splitTotalMismatch.value) {
      toast.error(t('transaction_form.split_total_mismatch'))
      submitting.value = false
      return
    }
    const payload: Omit<TransactionInsert, 'user_id' | 'created_at'> = {
      type: form.type,
      amount: Number(form.amount),
      currency: form.currency,
      category_id: form.category_id || null,
      account_id: form.account_id || null,
      description: form.description || null,
      date: form.date!,
      image_url: form.image_url,
      splits: (splitEnabled.value ? splitItems.value : []) as unknown as Json,
    }

    let result
    if (form.type === 'transfer') {
      if (!form.account_id || !form.to_account_id) {
        toast.error(t('transaction_form.error_transfer_accounts'))
        submitting.value = false
        return
      }

      const toAccount = accounts.value.find((a) => a.id === form.to_account_id)
      const toCurrency = toAccount?.currency || form.currency

      let toAmount = Number(form.amount)
      if (toCurrency !== form.currency) {
        const converted = convertTo(Number(form.amount), form.currency, toCurrency)
        if (converted !== null) {
          toAmount = converted
        }
      }

      result = await addTransfer({
        from_account_id: form.account_id,
        to_account_id: form.to_account_id,
        amount: Number(form.amount),
        to_amount: toAmount,
        currency: form.currency,
        to_currency: toCurrency,
        date: form.date!,
        description: form.description || undefined,
      })
    } else {
      result = props.transaction
        ? await updateTransaction(props.transaction.id, payload as unknown as TransactionUpdate)
        : await addTransaction(payload)
    }

    if (!result.error) {
      emit('saved')
      // Fire-and-forget: check budget thresholds without blocking navigation
      const now = new Date()
      const monthStr = formatDateSafe(new Date(now.getFullYear(), now.getMonth(), 1))
      checkBudgetAlerts(monthStr).catch(() => {})
    }
  } finally {
    submitting.value = false
  }
}
</script>
