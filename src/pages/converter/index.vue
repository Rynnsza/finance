<template>
  <div class="mx-auto max-w-2xl space-y-6 px-4 py-5 sm:space-y-10 sm:py-8 md:space-y-12 md:py-8 md:px-0">
    <!-- HEADER -->
    <div class="text-center space-y-1 sm:space-y-2">
      <h2 class="text-2xl font-black tracking-tighter text-foreground sm:text-4xl md:text-5xl">
        {{ $t('converter.title') }}
      </h2>
      <p class="text-[11px] font-medium text-muted-foreground sm:text-sm">
        {{ $t('converter.subtitle') }}
      </p>
    </div>

    <!-- HERO CONVERTER -->
    <div class="space-y-2 sm:space-y-4">
      <!-- FROM INPUT -->
      <div class="group relative rounded-2xl bg-card/10 p-3 transition-all hover:bg-card/20 sm:rounded-3xl sm:p-5 md:rounded-4xl md:p-8">
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Currency select as a prominent tappable badge on the left -->
          <Select v-model="fromCurrency">
            <SelectTrigger
              class="shrink-0 h-10 sm:h-14 md:h-16 w-auto rounded-xl border-2 border-primary/20 bg-primary/10 px-3 font-black tracking-tight shadow-sm hover:bg-primary/20 active:scale-95 transition-all sm:rounded-2xl sm:px-4 md:px-5"
            >
              <SelectValue>
                {{ fromCurrency }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border/50 backdrop-blur-xl">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel class="text-[10px] font-black uppercase tracking-widest text-primary">{{
                  group.label
                }}</SelectLabel>
                <SelectItem
                  v-for="cur in group.currencies"
                  :key="cur.value"
                  :value="cur.value"
                  :text-value="cur.value"
                  class="rounded-xl font-bold"
                >
                  {{ cur.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <!-- Amount input fills remaining space -->
          <input
            v-model="fromAmountString"
            type="text"
            inputmode="decimal"
            class="min-w-0 flex-1 bg-transparent text-right text-3xl font-black tracking-tighter text-foreground focus:outline-none sm:text-4xl md:text-5xl lg:text-6xl"
            @input="onFromInput"
          />
        </div>
      </div>

      <!-- SWAP DIVIDER -->
      <div class="relative -my-5 sm:-my-6 z-10 flex justify-center">
        <Button
          variant="outline"
          size="icon"
          class="size-9 sm:size-12 md:size-14 rounded-full border-2 sm:border-3 md:border-4 border-background bg-card shadow-xl transition-all hover:scale-110 active:scale-95 group/swap"
          @click="swapCurrencies"
        >
          <AppIcon
            name="hugeicons:exchange-01"
            :size="16"
            class="sm:size-5 md:size-6 text-primary transition-transform duration-500 group-active/swap:rotate-180"
          />
        </Button>
      </div>

      <!-- TO DISPLAY -->
      <div class="group relative rounded-2xl bg-card/5 p-3 transition-all hover:bg-card/10 sm:rounded-3xl sm:p-5 md:rounded-4xl md:p-8">
        <div class="flex items-center gap-3 sm:gap-4">
          <!-- Currency select on the left -->
          <Select v-model="toCurrency">
            <SelectTrigger
              class="shrink-0 h-10 sm:h-14 md:h-16 w-auto rounded-xl border-2 border-primary/20 bg-primary/10 px-3 font-black tracking-tight shadow-sm hover:bg-primary/20 active:scale-95 transition-all sm:rounded-2xl sm:px-4 md:px-5"
            >
              <SelectValue>
                {{ toCurrency }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border/50 backdrop-blur-xl">
              <SelectGroup v-for="group in currencyGroups" :key="group.label">
                <SelectLabel class="text-[10px] font-black uppercase tracking-widest text-primary">{{
                  group.label
                }}</SelectLabel>
                <SelectItem
                  v-for="cur in group.currencies"
                  :key="cur.value"
                  :value="cur.value"
                  :text-value="cur.value"
                  class="rounded-xl font-bold"
                >
                  {{ cur.label }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          <!-- Converted amount on the right -->
          <div
            class="flex-1 text-right text-3xl font-black tracking-tighter text-foreground/50 sm:text-4xl md:text-5xl lg:text-6xl transition-all duration-300"
          >
            {{ formatNumberOnly(toAmount, toCurrency) }}
          </div>
        </div>
      </div>

      <!-- RATE INFO -->
      <div v-if="displayRate" class="text-center transition-all duration-500">
        <span
          class="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-[11px] font-bold text-primary animate-in fade-in slide-in-from-bottom-2 sm:gap-2 sm:px-4 sm:py-1.5 sm:text-xs"
        >
          1 {{ displayRate.from }} =
          {{ formatNumberOnly(displayRate.amount, displayRate.to, 4) }} {{ displayRate.to }}
        </span>
      </div>
    </div>

    <!-- QUICK MULTI-CONVERT GRID -->
    <div class="grid grid-cols-2 gap-2 sm:gap-4 sm:grid-cols-4">
      <div
        v-for="item in quickConversions"
        :key="item.code"
        class="flex flex-col gap-1 rounded-xl border border-border/50 bg-card/10 p-3 transition-all duration-300 hover:bg-card/20 active:scale-[0.98] hover:shadow-lg sm:rounded-2xl sm:p-4 md:rounded-3xl md:p-5"
      >
        <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          {{ item.code }}
        </p>
        <p class="text-sm font-black tracking-tight text-foreground sm:text-lg md:text-xl">
          {{ formatNumberOnly(item.amount, item.code) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesConverterIndex',
})

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

const {
  currencyGroups,
  formatNumberOnly,
  parseLocalizedNumber,
  convertTo,
} = useCurrency()

const fromCurrency = ref('USD')
const toCurrency = ref('IDR')
const fromAmountString = ref('1')
const fromAmount = ref(1)

const onFromInput = (e: Event) => {
  const val = (e.target as HTMLInputElement).value
  fromAmount.value = parseLocalizedNumber(val, fromCurrency.value)
  fromAmountString.value = formatNumberOnly(fromAmount.value, fromCurrency.value)
}

const setFromAmount = (amount: number) => {
  fromAmount.value = amount
  fromAmountString.value = formatNumberOnly(amount, fromCurrency.value)
}

const toAmount = computed(() => {
  return convertTo(fromAmount.value, fromCurrency.value, toCurrency.value) || 0
})

const currentRate = computed(() => {
  return convertTo(1, fromCurrency.value, toCurrency.value)
})

const displayRate = computed(() => {
  const rate = currentRate.value
  if (!rate) return null

  // If rate is very small (e.g. IDR to USD), show inverse for better readability
  if (rate < 0.01) {
    const inverse = convertTo(1, toCurrency.value, fromCurrency.value)
    if (inverse) {
      return {
        amount: inverse,
        from: toCurrency.value,
        to: fromCurrency.value,
      }
    }
  }

  return {
    amount: rate,
    from: fromCurrency.value,
    to: toCurrency.value,
  }
})

const quickTargets = ['EUR', 'SGD', 'GBP', 'MYR']
const quickConversions = computed(() => {
  return quickTargets.map((code) => ({
    code,
    amount: convertTo(fromAmount.value, fromCurrency.value, code) || 0,
  }))
})

const swapCurrencies = () => {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  // Re-format the string for the new currency
  fromAmountString.value = formatNumberOnly(fromAmount.value, fromCurrency.value)
}

onMounted(() => {
  setFromAmount(1)
})
</script>
