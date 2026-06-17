<template>
  <div class="pb-10 pt-4">
    <!-- Header -->
    <PageHeader
      :title="$t('transactions.title')"
      :subtitle="`${filteredTransactions.length} ${$t('transactions.title').toLowerCase()}`"
      :button-text="$t('topbar.add')"
      button-icon="hugeicons:add-01"
      @action="router.push('/transactions/new')"
    />

    <!-- Transactions Table Card -->
    <BaseCard
      :title="$t('transactions.title')"
      :subtitle="$t('dashboard.latest_activity')"
      no-padding
      class="mt-8"
    >
      <template #action>
        <div class="text-right">
          <p class="text-[10px] font-black tracking-widest text-muted-foreground uppercase mb-1">
            {{ $t('transactions.difference') }}
          </p>
          <div v-for="(total, cur) in balanceByCurrency" :key="cur">
            <p
              class="text-lg font-black tracking-tighter"
              :class="
                total >= 0
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-600 dark:text-rose-400'
              "
            >
              {{ formatCurrency(total, cur) }}
            </p>
          </div>
        </div>
      </template>

      <!-- Table Area -->
      <div class="p-0 md:p-0">
        <TransactionFilterBar
          v-model:category-filter="categoryFilter"
          v-model:owner-filter="ownerFilter"
          v-model:date-range="dateRange"
          :income-categories="incomeCategories"
          :expense-categories="expenseCategories"
          :category-counts="categoryCounts"
          :is-partnered="isPartnered"
          :user-avatar-url="user?.user_metadata?.avatar_url ?? ''"
          :user-initial="user?.email?.charAt(0)?.toUpperCase() || 'S'"
          :partner-avatar-url="partner?.avatar_url ?? ''"
          :partner-initial="partnerInitial"
          :partner-display-name="partnerDisplayName"
        />

          <!-- Top bar: info + per page -->

        <div class="flex items-center justify-between border-b border-border/50 px-4 py-2 md:px-6">
          <p class="text-sm font-medium text-muted-foreground">
            <template v-if="totalCount > 0">
              {{
                $t('transactions.pagination', {
                  start: (currentPage - 1) * pageSize + 1,
                  end: Math.min(currentPage * pageSize, totalCount),
                  total: totalCount,
                })
              }}
            </template>
            <template v-else>
              {{ totalCount }} {{ $t('transactions.title').toLowerCase() }}
            </template>
          </p>
          <div class="flex items-center gap-1.5">
            <span class="text-xs font-medium text-muted-foreground/60">{{
              $t('transactions.per_page')
            }}</span>
            <Select :model-value="pageSize" @update:model-value="pageSize = Number($event)">
              <SelectTrigger class="h-7 w-16 rounded-lg text-xs font-medium">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="n in [5, 10, 20, 50, 100]" :key="n" :value="n" class="text-xs">
                  {{ n }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="space-y-3 p-6">
          <Skeleton v-for="i in 5" :key="i" class="h-16 w-full rounded-2xl" />
        </div>

        <!-- Empty State -->
        <div
          v-else-if="filteredTransactions.length === 0"
          class="flex flex-col items-center justify-center py-16 text-center"
        >
          <div class="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/50">
            <AppIcon name="hugeicons:inbox" :size="32" class="text-muted-foreground/30" />
          </div>
          <div>
            <p class="text-base font-black text-foreground tracking-tight">
              {{ $t('transactions.empty') }}
            </p>
            <p class="text-sm font-medium text-muted-foreground">
              {{ $t('dashboard.empty_desc') }}
            </p>
          </div>
        </div>

        <!-- Table -->
        <TransactionDataTable
          v-else
          :table="table"
          :total-pages="totalPages"
          :total-count="totalCount"
          :page-size="pageSize"
          :current-page="currentPage"
          @page="goToPage"
          @view="viewTransaction"
        />
      </div>
    </BaseCard>
  </div>

  <TransactionBulkActions
    :selected-count="selectedCount"
    :accounts="accounts"
    @category="applyBulkCategory"
    @account="applyBulkAccount"
    @delete="applyBulkDelete"
  />
</template>

<script setup lang="ts">
import type { Transaction } from "@/types"
import { h, type VNode } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
} from '@tanstack/vue-table'
import type { RowData, SortingState } from '@tanstack/vue-table'
import type { DateRange } from 'reka-ui'

import { Checkbox } from '@/components/ui/checkbox'
import AppIcon from '@/components/Icon.vue'
import TransactionBulkActions from '@/components/transaction/TransactionBulkActions.vue'
import TransactionDataTable from '@/components/transaction/TransactionDataTable.vue'
import TransactionFilterBar from '@/components/transaction/TransactionFilterBar.vue'
import type { OwnerFilter } from '@/composables/useTransactions'

declare module '@tanstack/vue-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    headerClass?: string
    cellClass?: string
  }
}

defineOptions({
  name: 'PagesTransactionsIndex',
})

const {
  transactions, loading, totalCount, totalPages, currentPage, pageSize,
  categoryFilter, ownerFilter, dateRange, serverFilters,
  goToPage, bulkUpdateTransactions, bulkDeleteTransactions,
} = useTransactions()
const { fetchCategories } = useCategories()
const { partner, isPartnered, fetchPartner, partnerDisplayName } = usePartner()
const { accounts } = useAccounts()

const router = useRouter()
const { t } = useI18n()
const { formatCurrency, defaultCurrency } = useCurrency()
const { user, getSession } = useAuth()
const { categories } = useCategories()

const sorting = ref<SortingState>([])

const filteredTransactions = computed(() => transactions.value)

const incomeCategories = computed(() => categories.value.filter((c) => c.type === 'income'))
const expenseCategories = computed(() => categories.value.filter((c) => c.type === 'expense'))

const categoryCounts = computed(() => {
  const counts: Record<string, number> = {}
  for (const tx of transactions.value) {
    if (tx.category_id) {
      counts[tx.category_id] = (counts[tx.category_id] || 0) + 1
    }
  }
  return counts
})

// Category helpers
function getCategoryColor(categoryId: string | null) {
  if (!categoryId) return null
  return categories.value.find((c) => c.id === categoryId)?.color ?? null
}

function getCategoryName(categoryId: string | null) {
  if (!categoryId) return null
  return categories.value.find((c) => c.id === categoryId)?.name ?? null
}

function getAccountName(accountId: string | null) {
  if (!accountId) return null
  return accounts.value.find((a) => a.id === accountId)?.name ?? null
}

function formatRowDate(date: string) {
  const d = new Date(date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  d.setHours(0, 0, 0, 0)
  const diff = (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)

  if (diff === 0) return t('transactions.today')
  if (diff === 1) return t('transactions.yesterday')
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

const partnerInitial = computed(() => partner.value?.display_name?.charAt(0)?.toUpperCase() || 'P')

const selectedCount = computed(() => table.getSelectedRowModel().rows.length)

function getSelectedIds() {
  return table.getSelectedRowModel().rows.map((r) => r.original.id)
}

const applyBulkCategory = async (categoryId: string) => {
  const ids = getSelectedIds()
  await bulkUpdateTransactions(ids, { category_id: categoryId })
  table.resetRowSelection()
}

const applyBulkAccount = async (accountId: string) => {
  const ids = getSelectedIds()
  await bulkUpdateTransactions(ids, { account_id: accountId })
  table.resetRowSelection()
}

const applyBulkDelete = async () => {
  const ids = getSelectedIds()
  await bulkDeleteTransactions(ids)
  table.resetRowSelection()
}

const incomeByCurrency = computed(() => {
  const totals: Record<string, number> = {}
  for (const tx of filteredTransactions.value) {
    if (tx.type === 'income') {
      const cur = tx.currency || defaultCurrency.value
      totals[cur] = (totals[cur] || 0) + tx.amount
    }
  }
  return totals
})

const expenseByCurrency = computed(() => {
  const totals: Record<string, number> = {}
  for (const tx of filteredTransactions.value) {
    if (tx.type === 'expense') {
      const cur = tx.currency || defaultCurrency.value
      totals[cur] = (totals[cur] || 0) + tx.amount
    }
  }
  return totals
})

const balanceByCurrency = computed(() => {
  const totals: Record<string, number> = { ...incomeByCurrency.value }
  for (const [cur, total] of Object.entries(expenseByCurrency.value)) {
    totals[cur] = (totals[cur] || 0) - total
  }
  return totals
})

onMounted(async () => {
  await getSession()
  await Promise.all([fetchCategories(), fetchPartner()])
})

const viewTransaction = (id: string) => {
  router.push(`/transactions/${id}/edit`)
}

// --- TanStack Table Columns ---
const columnHelper = createColumnHelper<Transaction>()

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        checked: table.getIsAllRowsSelected(),
        'onUpdate:checked': () => table.toggleAllRowsSelected(),
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        checked: row.getIsSelected(),
        'onUpdate:checked': () => {
          row.toggleSelected()
        },
        onClick: (e: MouseEvent) => {
          e.stopPropagation()
        },
      }),
    enableSorting: false,
    size: 48,
    meta: {
      headerClass: 'pl-4 w-[48px]',
      cellClass: 'pl-4 w-[48px]',
    },
  }),
  columnHelper.accessor('date', {
    header: ({ column }) =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap hover:text-foreground transition-colors ' +
            (column.getIsSorted() ? 'text-foreground' : ''),
          onClick: () => column.toggleSorting(),
        },
        [
          t('transactions.date'),
          h(AppIcon, {
            name:
              column.getIsSorted() === 'asc' ? 'hugeicons:arrow-up-01' : 'hugeicons:arrow-down-01',
            size: 14,
            class:
              'text-muted-foreground/40' + (column.getIsSorted() ? ' opacity-100' : ' opacity-0'),
          }),
        ],
      ),
    cell: ({ row }) =>
      h(
        'span',
        { class: 'whitespace-nowrap text-sm font-medium text-muted-foreground' },
        formatRowDate(row.original.date),
      ),
    size: 100,
    meta: {
      headerClass: 'hidden lg:table-cell',
      cellClass: 'hidden lg:table-cell',
    },
  }),
  columnHelper.accessor('description', {
    header: () =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors',
        },
        t('transactions.description_label'),
      ),
    cell: ({ row }) => {
      const description = row.original.description || t('transactions.no_description')
      const accountName = getAccountName(row.original.account_id)
      const catName = getCategoryName(row.original.category_id)
      const catColor = getCategoryColor(row.original.category_id)
      const isPartnerTx = isPartnered.value && row.original.user_id === partner.value?.id

      const children: (VNode | false)[] = [
        h('div', { class: 'flex items-center gap-2' }, [
          h('span', { class: 'truncate font-bold text-foreground' }, description),
          isPartnerTx &&
            h(
              'div',
              {
                class:
                  'flex size-4 shrink-0 items-center justify-center rounded-full bg-sidebar-accent',
                title: t('transactions.owned_by', { name: partnerDisplayName.value }),
              },
              [
                h(
                  'span',
                  { class: 'text-[8px] font-black text-sidebar-foreground' },
                  partnerInitial.value,
                ),
              ],
            ),
        ]),
      ]

      const subItems: VNode[] = []

      // Mobile-only: Date
      subItems.push(h('span', { class: 'lg:hidden' }, formatRowDate(row.original.date)))

      // Mobile-only: Account
      if (accountName) {
        subItems.push(
          h('span', { class: 'lg:hidden' }, [
            h('span', { class: 'mx-1 opacity-50' }, '·'),
            accountName,
          ]),
        )
      }

      // Mobile-only: Category
      if (catName) {
        subItems.push(
          h('span', { class: 'lg:hidden' }, [
            h('span', { class: 'mx-1 opacity-50' }, '·'),
            h('span', { style: { color: catColor || undefined } }, catName),
          ]),
        )
      }

      if (subItems.length > 0) {
        children.push(
          h(
            'div',
            {
              class:
                'flex items-center text-[11px] font-medium text-muted-foreground/60 mt-0.5 lg:hidden',
            },
            subItems,
          ),
        )
      }

      return h('div', { class: 'flex flex-col min-w-0 py-1' }, children)
    },
    size: 300,
    meta: {
      headerClass: 'pl-4 lg:pl-0',
      cellClass: 'pl-4 lg:pl-0',
    },
  }),
  columnHelper.display({
    id: 'attachment',
    header: () => null,
    cell: ({ row }) => {
      const tx = row.original
      if (!tx.image_url) return null
      return h('div', { class: 'flex justify-center' }, [
        h('img', {
          src: tx.image_url,
          class: 'size-7 rounded-lg object-cover border border-border/50',
          alt: '',
        }),
      ])
    },
    size: 36,
    meta: {
      headerClass: 'w-[36px]',
      cellClass: 'px-0',
    },
  }),
  columnHelper.accessor('category_id', {
    header: () =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap text-muted-foreground hover:text-foreground transition-colors',
        },
        t('transactions.category'),
      ),
    cell: ({ row }) => {
      const catColor = getCategoryColor(row.original.category_id)
      const catName = getCategoryName(row.original.category_id) || '—'
      const bgColor = (catColor ?? '#6b7280') + '20'

      return h('div', { class: 'flex items-center gap-2' }, [
        h(
          'div',
          {
            class: 'flex size-6 items-center justify-center rounded-lg shrink-0',
            style: { backgroundColor: bgColor },
          },
          [
            h('div', {
              class: 'size-2 rounded-full',
              style: { backgroundColor: catColor ?? '#6b7280' },
            }),
          ],
        ),
        h('span', { class: 'truncate text-sm font-medium text-muted-foreground' }, catName),
      ])
    },
    size: 160,
    meta: {
      headerClass: 'hidden lg:table-cell',
      cellClass: 'hidden lg:table-cell',
    },
  }),
  columnHelper.accessor('amount', {
    header: ({ column }) =>
      h(
        'button',
        {
          class:
            'inline-flex items-center gap-1 whitespace-nowrap ml-auto hover:text-foreground transition-colors ' +
            (column.getIsSorted() ? 'text-foreground' : ''),
          onClick: () => column.toggleSorting(),
        },
        [
          t('transactions.amount'),
          h(AppIcon, {
            name:
              column.getIsSorted() === 'asc'
                ? 'hugeicons:arrow-up-01'
                : column.getIsSorted() === 'desc'
                  ? 'hugeicons:arrow-down-01'
                  : 'hugeicons:arrow-up-down',
            size: 14,
            class: 'text-muted-foreground/40',
          }),
        ],
      ),
    cell: ({ row }) => {
      const isIncome = row.original.type === 'income'
      const symbol = isIncome ? '+' : '-'
      const colorClass = isIncome ? 'text-emerald-600' : 'text-rose-600'
      const amount = formatCurrency(Number(row.original.amount), row.original.currency || undefined)

      return h('div', { class: 'text-right' }, [
        h('p', { class: `text-base font-bold tabular-nums ${colorClass}` }, `${symbol}${amount}`),
        h(
          'div',
          { class: 'mt-0.5' },
          h(
            'StatusBadge',
            { type: isIncome ? 'success' : 'danger' },
            () => isIncome ? t('transactions.income') : t('transactions.expense'),
          ),
        ),
      ])
    },
    size: 140,
    meta: {
      headerClass: 'pr-4 lg:pr-0',
      cellClass: 'pr-4 lg:pr-0',
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: '',
    cell: ({ row }) =>
      h('div', { class: 'flex items-center justify-end gap-1' }, [
        h(
          'button',
          {
            class:
              'flex size-9 items-center justify-center rounded-xl text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-all',
            onClick: (e: MouseEvent) => {
              e.stopPropagation()
              router.push(`/transactions/${row.original.id}/edit`)
            },
          },
          [h(AppIcon, { name: 'hugeicons:pencil-edit-01', size: 18 })],
        ),
      ]),
    enableSorting: false,
    size: 60,
    meta: {
      headerClass: 'pr-4 w-[60px] hidden md:table-cell',
      cellClass: 'pr-4 w-[60px] hidden md:table-cell',
    },
  }),
]

const table = useVueTable({
  get data() {
    return filteredTransactions.value
  },
  columns,
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  enableRowSelection: true,
  enableMultiRowSelection: true,
  getRowId: (tx: Transaction) => tx.id,
  state: {
    rowSelection: {},
    get sorting() {
      return sorting.value
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
  },
})
</script>
