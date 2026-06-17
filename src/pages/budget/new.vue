<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import CurrencyInput from '@/components/CurrencyInput.vue'
import CategoryPicker from '@/components/CategoryPicker.vue'
import { useCurrency } from '@/composables/useCurrency'
import { useCategories } from '@/composables/useCategories'
import { useBudgets } from '@/composables/useBudgets'

defineOptions({
  name: 'PagesBudgetNew',
})

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const { fetchCategories } = useCategories()
const { createBudget, loading } = useBudgets()
const { defaultCurrency } = useCurrency()

const selectedCategoryId = ref('')
const rawAmount = ref(0)
const budgetName = ref('')
const month = ref((route.query.month as string) || '')

const displayMonth = computed(() => {
  if (!month.value) return ''
  const [year, m] = month.value.split('-')
  const date = new Date(parseInt(year!), parseInt(m!) - 1)
  return date.toLocaleDateString(locale.value, { month: 'long', year: 'numeric' })
})

const isFormValid = computed(() => selectedCategoryId.value && rawAmount.value > 0 && !!month.value)

const handleSave = async () => {
  if (!isFormValid.value) return
  const result = await createBudget(
    selectedCategoryId.value,
    month.value,
    rawAmount.value,
    budgetName.value || null,
  )
  if (!result.error) {
    router.push('/budget')
  }
}

onMounted(async () => {
  await fetchCategories()
  // Default to current month if not specified
  if (!month.value) {
    const d = new Date()
    month.value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
  }
})
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl px-2" @click="router.push('/budget')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ $t('budget.set_budget') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">
        {{ $t('budget.subtitle') }}
      </p>
    </div>

    <!-- HERO AMOUNT CARD -->
    <div
      class="relative overflow-hidden rounded-3xl border border-border/50 bg-card/20 p-5 shadow-2xl transition-all hover:border-border/80 md:rounded-4xl md:p-8 backdrop-blur-md"
    >
      <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{{
        $t('budget.monthly_limit')
      }}</Label>
      <div class="mt-3 flex items-center gap-3 md:mt-4 md:gap-4">
        <div
          class="flex h-11 items-center justify-center rounded-xl bg-muted/50 px-4 text-base font-black text-foreground shadow-inner md:h-14 md:rounded-2xl md:px-5 md:text-xl"
        >
          {{ defaultCurrency }}
        </div>
        <CurrencyInput
          v-model="rawAmount"
          :currency="defaultCurrency"
          :placeholder="t('budget.monthly_limit')"
          class="h-auto w-full border-none bg-transparent py-0 text-4xl font-black tracking-tighter text-foreground outline-none shadow-none placeholder:text-muted-foreground/20 focus-visible:ring-0 md:text-6xl"
        />
      </div>
    </div>

    <!-- DETAIL FORM -->
    <div
      class="space-y-4 rounded-3xl border border-border/50 bg-card/20 p-5 shadow-lg backdrop-blur-md md:p-8"
    >
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
        <!-- Category Selection -->
        <div class="space-y-2">
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:grid-view" :size="12" />
            {{ $t('categories.type_name') }}
          </Label>
          <CategoryPicker
            v-model="selectedCategoryId"
            type="expense"
            :placeholder="t('categories.type_name')"
            class="w-full"
          />
        </div>

        <!-- Month Selection (Styled Read-only) -->
        <div class="space-y-2">
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:calendar-01" :size="12" />
            {{ $t('budget.month') }}
          </Label>
          <div
            class="flex h-11 items-center rounded-2xl border border-border/50 bg-muted/20 px-4 font-bold text-muted-foreground/80"
          >
            {{ displayMonth }}
          </div>
        </div>

        <!-- Budget Name -->
        <div class="space-y-2 md:col-span-2">
          <Label
            class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
          >
            <AppIcon name="hugeicons:note-01" :size="12" />
            {{ $t('budget.name_label') }}
          </Label>
          <Input
            v-model="budgetName"
            type="text"
            maxlength="100"
            :placeholder="t('budget.name_placeholder')"
            class="h-11 rounded-2xl border-border/50 bg-background/50 px-4 font-bold transition-all hover:bg-background/80"
          />
        </div>
      </div>
    </div>

    <!-- ACTION BUTTONS -->
    <div class="flex items-center justify-end gap-3 md:gap-4 pt-4">
      <Button
        variant="ghost"
        class="h-11 md:h-12 rounded-2xl px-6 md:px-8 font-black uppercase tracking-widest transition-all hover:bg-secondary/50"
        @click="router.push('/budget')"
      >
        {{ $t('common.cancel') }}
      </Button>
      <Button
        class="h-11 md:h-12 rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 md:px-10 font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:from-primary/80 hover:to-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        :disabled="loading || !isFormValid"
        @click="handleSave"
      >
        {{ loading ? $t('common.saving') : $t('budget.set_budget') }}
      </Button>
    </div>
  </div>
</template>
