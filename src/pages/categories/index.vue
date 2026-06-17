<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <PageHeader
      :title="$t('categories.title')"
      :subtitle="$t('categories.subtitle')"
      :button-text="$t('categories.add')"
      button-icon="hugeicons:add-01"
      @action="router.push('/categories/new')"
    />

    <!-- TABS -->
    <div
      class="inline-flex rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md"
    >
      <Button
        v-for="tab in tabs"
        :key="tab.value"
        :variant="activeTab === tab.value ? 'default' : 'ghost'"
        size="sm"
        class="rounded-xl px-6 transition-all duration-300"
        :class="activeTab === tab.value ? 'shadow-sm' : 'text-muted-foreground'"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
        <span class="ml-1.5 opacity-60">({{ tab.count }})</span>
      </Button>
    </div>

    <div v-if="loading" class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="i in 6"
        :key="i"
        class="flex animate-pulse items-center gap-4 rounded-4xl border border-border/50 bg-card p-4"
      >
        <Skeleton class="size-12 shrink-0 rounded-2xl bg-muted/50" />
        <div class="min-w-0 flex-1 space-y-2">
          <Skeleton class="h-4 w-32 rounded-md bg-muted/50" />
          <Skeleton class="h-3 w-48 rounded-md bg-muted/50" />
        </div>
        <Skeleton class="size-8 rounded-xl bg-muted/50" />
      </div>
    </div>

    <template v-else>
      <!-- EMPTY STATE -->
      <EmptyState
        v-if="filteredCategories.length === 0"
        :title="$t('categories.empty')"
        :description="$t('categories.empty_desc')"
        icon="hugeicons:grid-view"
        :button-text="$t('categories.add')"
        @action="router.push('/categories/new')"
      />

      <!-- CATEGORY GRID -->
      <Sortable
        v-else
        :list="filteredCategories"
        item-key="id"
        :options="{ handle: '.drag-handle', ghostClass: 'opacity-20', animation: 250 }"
        class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
        @end="onReorder"
      >
        <template #item="{ element: cat }">
          <div
            class="group flex items-center justify-between rounded-4xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border/80 hover:shadow-md"
          >
            <div class="flex items-center gap-4">
              <div
                class="drag-handle flex size-12 cursor-grab items-center justify-center rounded-2xl active:cursor-grabbing transition-transform group-hover:scale-105"
                :style="{ backgroundColor: (cat.color || '#6b7280') + '15' }"
              >
                <div
                  class="size-3.5 rounded-full shadow-sm"
                  :style="{ backgroundColor: cat.color || undefined }"
                />
              </div>
              <div>
                <h3 class="font-bold text-foreground">{{ cat.name }}</h3>
                <p class="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-tight">
                  {{
                    $t('categories.transaction_count', {
                      count: (categoryStats.get(cat.id) ?? { count: 0, total: 0 }).count,
                    })
                  }}
                  ·
                  {{ formatCurrency((categoryStats.get(cat.id) ?? { count: 0, total: 0 }).total) }}
                </p>
              </div>
            </div>
            <div class="flex gap-1 opacity-0 transition-all duration-200 group-hover:opacity-100">
              <Button
                variant="ghost"
                size="icon"
                class="size-9 rounded-xl hover:bg-muted"
                @click="router.push(`/categories/${cat.id}/edit`)"
              >
                <AppIcon name="hugeicons:pencil-edit-01" :size="16" class="text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                class="size-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
                @click="confirmDelete(cat)"
              >
                <AppIcon name="hugeicons:delete-01" :size="16" />
              </Button>
            </div>
          </div>
        </template>
      </Sortable>
    </template>

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('categories.delete_title')"
      :description="`${t('categories.delete_confirm')} &quot;${deletingCategory?.name}&quot;? ${t('categories.delete_confirm_suffix')}`"
      :confirm-text="$t('categories.delete_action')"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesCategoriesIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Sortable } from 'sortablejs-vue3'
import type { Category, TransactionType } from '@/types'

const router = useRouter()
const { t, locale } = useI18n()
const { formatCurrency } = useCurrency()

const {
  categories,
  loading: categoriesLoading,
  incomeCategories,
  expenseCategories,
  fetchCategories,
  seedDefaults,
  deleteCategory,
} = useCategories()
const { user, getSession } = useAuth()

const userId = computed(() => user.value?.id)
const { data: statsData, isLoading: statsLoading } = useCategoryStats(userId)

const loading = computed(() => categoriesLoading.value || statsLoading.value)

const categoryStats = computed(() => {
  const map = new Map<string, { count: number; total: number }>()
  if (statsData.value) {
    for (const item of statsData.value) {
      map.set(item.category_id, {
        count: Number(item.transaction_count),
        total: Number(item.total_amount),
      })
    }
  }
  return map
})

const activeTab = ref<TransactionType>('expense')
const showDeleteDialog = ref(false)
const deletingCategory = ref<Category | undefined>()

const tabs = computed(() => [
  {
    value: 'expense' as const,
    label: t('categories.expense'),
    count: expenseCategories.value.length,
  },
  { value: 'income' as const, label: t('categories.income'), count: incomeCategories.value.length },
])

const filteredCategories = computed(() =>
  activeTab.value === 'income' ? incomeCategories.value : expenseCategories.value,
)

const onReorder = (evt: { oldIndex: number; newIndex: number }) => {
  const list = [...filteredCategories.value]
  const [moved] = list.splice(evt.oldIndex, 1)
  if (!moved) return
  list.splice(evt.newIndex, 0, moved)
}

onMounted(async () => {
  await getSession()
  await fetchCategories()
  if (categories.value.length === 0 && user.value) {
    await seedDefaults(user.value.id)
  }
})

const confirmDelete = (cat: Category) => {
  deletingCategory.value = cat
  showDeleteDialog.value = true
}

const onDelete = async () => {
  if (deletingCategory.value) {
    await deleteCategory(deletingCategory.value.id)
  }
  showDeleteDialog.value = false
  deletingCategory.value = undefined
}
</script>
