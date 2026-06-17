<script setup lang="ts">
defineOptions({
  name: 'PagesBudgetEdit',
})
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const { updateBudget, fetchBudgetWithProgress } = useBudgets()
const { formatNumberOnly, parseLocalizedNumber, defaultCurrency } = useCurrency()

const budgetId = ref((route.query.id as string) || '')
const selectedCategoryName = ref('')
const rawAmount = ref(0)
const budgetName = ref('')
const month = ref((route.query.month as string) || '')
const loadingData = ref(true)

const amountDisplay = computed({
  get: () =>
    rawAmount.value === 0 ? '' : formatNumberOnly(rawAmount.value, defaultCurrency.value),
  set: (val: string) => {
    rawAmount.value = parseLocalizedNumber(val, defaultCurrency.value)
  },
})

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

const isFormValid = computed(() => rawAmount.value > 0)

const handleSave = async () => {
  if (!isFormValid.value || !month.value || !budgetId.value) return
  const result = await updateBudget(
    budgetId.value,
    { amount: rawAmount.value, name: budgetName.value || null },
    month.value,
  )
  if (!result.error) {
    router.push('/budget')
  }
}

onMounted(async () => {
  if (!month.value) {
    const d = new Date()
    month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }
  if (budgetId.value) {
    const list = await fetchBudgetWithProgress(month.value)
    const budget = list.find((b) => b.id === budgetId.value)
    if (budget) {
      rawAmount.value = budget.amount
      budgetName.value = budget.name || ''
      selectedCategoryName.value = budget.category_name
    }
  }
  loadingData.value = false
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/budget')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('budget.edit_budget') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">
        {{ $t('budget.subtitle') }}
      </p>
    </div>

    <div class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm">
      <div class="space-y-2">
        <Label>{{ $t('budget.month') }}</Label>
        <Input v-model="month" type="month" :disabled="true" class="bg-muted/30" />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('categories.type_name') }}</Label>
        <Input v-model="selectedCategoryName" type="text" :disabled="true" class="bg-muted/30" />
      </div>

      <div class="space-y-2">
        <Label>{{ $t('budget.name_label') }}</Label>
        <Input
          v-model="budgetName"
          type="text"
          maxlength="100"
          :placeholder="t('budget.name_placeholder')"
        />
        <p class="text-xs text-muted-foreground">{{ $t('budget.name_hint') }}</p>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('budget.monthly_limit') }}</Label>
        <Input
          v-model="amountDisplay"
          type="text"
          inputmode="numeric"
          :placeholder="t('budget.monthly_limit')"
          autofocus
          @keydown="onNumberKeydown"
        />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button variant="outline" @click="router.push('/budget')">
          {{ $t('common.cancel') }}
        </Button>
        <Button :disabled="loadingData || !isFormValid" @click="handleSave">
          {{ loadingData ? $t('common.loading') : $t('budget.edit_budget') }}
        </Button>
      </div>
    </div>
  </div>
</template>
