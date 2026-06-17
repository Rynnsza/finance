<script setup lang="ts">
import { DateFormatter, getLocalTimeZone, parseDate } from '@internationalized/date'
import { useTransactions } from '@/composables/useTransactions'
import type { Transaction } from '@/types'

const { searchTransactions } = useTransactions()
const { formatCurrency } = useCurrency()
const { categories } = useCategories()
const { t, locale } = useI18n()

const router = useRouter()
const open = defineModel<boolean>('open', { default: false })
const searchQuery = ref('')
const results = ref<Transaction[]>([])
const loading = ref(false)

const suggestions = computed(() => [
  { label: t('sidebar.dashboard'), icon: 'hugeicons:home-03', to: '/dashboard' },
  { label: t('sidebar.transactions'), icon: 'hugeicons:arrow-left-right', to: '/transactions' },
  { label: t('sidebar.categories'), icon: 'hugeicons:grid-view', to: '/categories' },
  { label: t('sidebar.recurring'), icon: 'hugeicons:repeat', to: '/recurring' },
])

const quickActions = computed(() => [
  {
    label: t('dashboard.actions_add_transaction'),
    icon: 'hugeicons:add-01',
    to: '/transactions/new',
  },
  { label: t('recurring.add'), icon: 'hugeicons:money-add-01', to: '/recurring' },
  { label: t('sidebar.settings'), icon: 'hugeicons:settings-01', to: '/settings', shortcut: '⌘S' },
])

const df = new DateFormatter(locale.value === 'id' ? 'id-ID' : 'en-US', {
  day: 'numeric',
  month: 'short',
})

let debounceTimer: ReturnType<typeof setTimeout>

const search = async (term: string) => {
  if (!term) {
    results.value = []
    return
  }
  loading.value = true
  results.value = await searchTransactions(term)
  loading.value = false
}

const onInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  searchQuery.value = target.value
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => search(searchQuery.value), 300)
}

const select = (to: string) => {
  open.value = false
  router.push(to)
}

const getCategory = (id: string | null) => categories.value.find((c) => c.id === id)

const formatDate = (date: string) => {
  try {
    return df.format(parseDate(date).toDate(getLocalTimeZone()))
  } catch {
    return date
  }
}
</script>

<template>
  <CommandDialog v-model:open="open" :title="$t('topbar.search')">
    <CommandInput :placeholder="$t('topbar.search')" @input="onInput" />
    <CommandList>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <p class="text-sm text-muted-foreground/90">{{ $t('topbar.searching') }}</p>
      </div>

      <CommandEmpty v-else-if="results.length === 0 && searchQuery">
        {{ $t('topbar.no_results') }}
      </CommandEmpty>

      <!-- RESULTS -->
      <CommandGroup v-if="results.length > 0 && searchQuery" :heading="$t('transactions.title')">
        <CommandItem
          v-for="tx in results"
          :key="tx.id"
          :value="tx.description || tx.id"
          class="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
          @select="select(`/transactions/${tx.id}/edit`)"
        >
          <div
            class="size-2 shrink-0 rounded-full"
            :style="{ backgroundColor: getCategory(tx.category_id)?.color || '#6b7280' }"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-foreground">
              {{
                tx.description ||
                getCategory(tx.category_id)?.name ||
                $t('transactions.no_description')
              }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ formatDate(tx.date) }}
              · {{ getCategory(tx.category_id)?.name || $t('transactions.all') }}
            </p>
          </div>
          <p
            class="shrink-0 text-sm font-semibold"
            :class="tx.type === 'income' ? 'text-emerald-600' : 'text-red-600'"
          >
            {{ tx.type === 'income' ? '+' : '-'
            }}{{ formatCurrency(Number(tx.amount), tx.currency || undefined) }}
          </p>
          <AppIcon
            name="hugeicons:pencil-edit-01"
            :size="14"
            class="shrink-0 text-muted-foreground/80"
          />
        </CommandItem>
      </CommandGroup>

      <!-- DEFAULT VIEW (SUGGESTIONS) -->
      <template v-if="!searchQuery && !loading">
        <CommandGroup :heading="$t('topbar.suggestions')">
          <CommandItem
            v-for="item in suggestions"
            :key="item.to"
            :value="item.label"
            class="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
            @select="select(item.to)"
          >
            <AppIcon :name="item.icon" :size="16" class="text-muted-foreground" />
            <span class="text-sm font-medium">{{ item.label }}</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup :heading="$t('topbar.quick_actions')">
          <CommandItem
            v-for="item in quickActions"
            :key="item.to"
            :value="item.label"
            class="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
            @select="select(item.to)"
          >
            <AppIcon :name="item.icon" :size="16" class="text-muted-foreground" />
            <span class="text-sm font-medium">{{ item.label }}</span>
            <CommandShortcut v-if="item.shortcut">
              {{ item.shortcut }}
            </CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </template>
    </CommandList>
  </CommandDialog>
</template>
