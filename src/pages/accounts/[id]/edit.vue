<script setup lang="ts">
defineOptions({
  name: 'PagesAccountsDetailEdit',
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

const router = useRouter()
const { t } = useI18n()
const { accounts, fetchAccounts, updateAccount, loading } = useAccounts()
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency, currencies } = useCurrency()

const accountId = useRoute().params.id as string

const form = reactive({
  name: '',
  type: 'bank' as 'bank' | 'e-wallet' | 'cash' | 'investment' | 'liability',
  currency: defaultCurrency.value,
  color: '#3b82f6',
  icon: 'hugeicons:bank',
  initial_balance: 0,
})

const balanceDisplay = computed({
  get: () =>
    form.initial_balance === 0 ? '' : formatNumberOnly(form.initial_balance, form.currency),
  set: (val: string) => {
    form.initial_balance = parseLocalizedNumber(val, form.currency)
  },
})

const typeOptions = [
  { value: 'bank', label: t('accounts.bank'), icon: 'hugeicons:bank' },
  { value: 'e-wallet', label: t('accounts.e-wallet'), icon: 'hugeicons:wallet-03' },
  { value: 'cash', label: t('accounts.cash'), icon: 'hugeicons:cash-01' },
  { value: 'investment', label: t('accounts.investment'), icon: 'hugeicons:chart-line-data-01' },
  { value: 'liability', label: t('accounts.liability'), icon: 'hugeicons:credit-card-change' },
]

const typeIcons: Record<string, string> = {
  bank: 'hugeicons:bank',
  'e-wallet': 'hugeicons:wallet-03',
  cash: 'hugeicons:cash-01',
  investment: 'hugeicons:chart-line-data-01',
  liability: 'hugeicons:credit-card-change',
}

const ewalletBrands = [
  { id: 'gopay', label: 'GoPay' },
  { id: 'ovo', label: 'OVO' },
  { id: 'dana', label: 'DANA' },
  { id: 'shopeepay', label: 'ShopeePay' },
  { id: 'linkaja', label: 'LinkAja' },
  { id: 'isaku', label: 'i.saku' },
]

const bankBrands = [
  { id: 'bca', label: 'BCA' },
  { id: 'mandiri', label: 'Mandiri' },
  { id: 'bri', label: 'BRI' },
  { id: 'bni', label: 'BNI' },
  { id: 'bsi', label: 'BSI' },
  { id: 'jago', label: 'Bank Jago' },
  { id: 'seabank', label: 'SeaBank' },
]

watch(
  () => form.type,
  (type) => {
    form.icon = typeIcons[type] || 'hugeicons:bank'
  },
)

const colorOptions = [
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#ec4899',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#eab308',
  '#f43f5e',
  '#6b7280',
]

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

onMounted(async () => {
  await fetchAccounts()
  const account = accounts.value.find((a) => a.id === accountId)
  if (account) {
    form.name = account.name
    form.type = account.type as 'bank' | 'e-wallet' | 'cash' | 'investment' | 'liability'
    form.currency = account.currency || defaultCurrency.value
    form.color = account.color || '#3b82f6'
    form.icon = account.icon || 'hugeicons:bank'
    form.initial_balance = Number(account.initial_balance)
  }
})

const isFormValid = computed(() => form.name.length > 0)

const onSubmit = async () => {
  if (!isFormValid.value) return
  const result = await updateAccount(accountId, {
    name: form.name,
    type: form.type,
    currency: form.currency,
    color: form.color,
    icon: form.icon,
    initial_balance: form.initial_balance,
  })
  if (!result.error) {
    router.push('/accounts')
  }
}

const selectBrand = (brandId: string, brandLabel: string) => {
  form.icon = brandId
  form.name = brandLabel
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/accounts')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('accounts.edit') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('accounts.subtitle') }}</p>
    </div>

    <form
      class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-8 backdrop-blur-md shadow-2xl"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-2">
        <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
          $t('accounts.name')
        }}</Label>
        <Input
          v-model="form.name"
          :placeholder="t('accounts.name')"
          class="h-12 rounded-xl bg-background/50 border-border/50 font-bold"
          required
        />
      </div>

      <div class="space-y-3">
        <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
          $t('accounts.type')
        }}</Label>
        <div class="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
          <Button
            v-for="opt in typeOptions"
            :key="opt.value"
            type="button"
            variant="ghost"
            class="h-auto flex-col items-center gap-2 py-4 rounded-2xl transition-all duration-300 border border-transparent"
            :class="
              form.type === opt.value
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 border-primary'
                : 'bg-secondary/40 hover:bg-secondary/60 text-foreground border-border/50'
            "
            @click="form.type = opt.value as 'bank' | 'e-wallet' | 'cash' | 'investment' | 'liability'"
          >
            <AppIcon :name="opt.icon" :size="24" />
            <span class="text-[10px] font-black tracking-tight uppercase">{{ opt.label }}</span>
          </Button>
        </div>
      </div>

      <!-- Brand icon picker (for bank) -->
      <div v-if="form.type === 'bank'" class="space-y-3">
        <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
          $t('accounts.icon')
        }}</Label>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          <button
            v-for="brand in bankBrands"
            :key="brand.id"
            type="button"
            class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            :class="
              form.icon === brand.id
                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10'
                : 'border-border/40 bg-background/40 hover:border-border/80'
            "
            @click="selectBrand(brand.id, brand.label)"
          >
            <div class="flex size-12 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
              <img
                :src="`/accounts/bank/${brand.id}.svg`"
                class="size-full object-contain"
                :alt="brand.label"
              />
            </div>
            <span class="text-[11px] font-bold tracking-tight">{{ brand.label }}</span>
          </button>
        </div>
      </div>

      <!-- Brand icon picker (for e-wallet) -->
      <div v-if="form.type === 'e-wallet'" class="space-y-3">
        <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
          $t('accounts.icon')
        }}</Label>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          <button
            v-for="brand in ewalletBrands"
            :key="brand.id"
            type="button"
            class="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            :class="
              form.icon === brand.id
                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10'
                : 'border-border/40 bg-background/40 hover:border-border/80'
            "
            @click="selectBrand(brand.id, brand.label)"
          >
            <div class="flex size-12 items-center justify-center rounded-xl bg-white p-2 shadow-sm">
              <img
                :src="`/accounts/e-wallet/${brand.id}.svg`"
                class="size-full object-contain"
                :alt="brand.label"
              />
            </div>
            <span class="text-[11px] font-bold tracking-tight">{{ brand.label }}</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div class="space-y-2">
          <Label
            class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
            >{{ $t('accounts.currency') }}</Label
          >
          <Select v-model="form.currency">
            <SelectTrigger class="h-12 rounded-xl bg-background/50 border-border/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="c in currencies" :key="c.value" :value="c.value" :text-value="c.value">
                {{ c.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label
            class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
            >{{ $t('accounts.initial_balance') }}</Label
          >
          <Input
            v-model="balanceDisplay"
            type="text"
            inputmode="numeric"
            :placeholder="t('accounts.initial_balance')"
            class="h-12 rounded-xl bg-background/50 border-border/50 font-bold"
            @keydown="onNumberKeydown"
          />
        </div>
      </div>

      <div class="space-y-3">
        <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
          $t('accounts.color')
        }}</Label>
        <div class="flex flex-wrap gap-2.5">
          <button
            v-for="c in colorOptions"
            :key="c"
            type="button"
            class="size-8 rounded-full transition-all duration-300 hover:scale-110 active:scale-90 border-2"
            :class="
              form.color === c
                ? 'border-foreground shadow-lg scale-110'
                : 'border-transparent opacity-60 hover:opacity-100'
            "
            :style="{ backgroundColor: c }"
            @click="form.color = c"
          />
        </div>
      </div>

      <div class="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="ghost"
          class="h-12 px-8 rounded-xl font-bold"
          @click="router.push('/accounts')"
        >
          {{ $t('common.cancel') }}
        </Button>
        <Button
          type="submit"
          :disabled="loading || !isFormValid"
          class="h-12 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
        >
          {{ loading ? $t('common.saving') : $t('accounts.edit') }}
        </Button>
      </div>
    </form>
  </div>
</template>
