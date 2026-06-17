<script setup lang="ts">
defineOptions({
  name: 'PagesSubscriptionsIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { useSubscriptions } from '@/composables/useSubscriptions'
import { useCategories } from '@/composables/useCategories'
import { useCurrency } from '@/composables/useCurrency'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { reactive, watch, onMounted, computed, ref } from 'vue'
import type { Subscription } from '@/types'

const router = useRouter()
const { subscriptions, loading, fetchSubscriptions, toggleActive, deleteSubscription, monthlyTotal } = useSubscriptions()
const { categories, fetchCategories } = useCategories()
const { formatCurrency } = useCurrency()
const { t, locale } = useI18n()

// Local reactive state for Switch v-model — synced from server data
const checkedStates = reactive<Record<string, boolean>>({})

// Sync from server whenever subscriptions data refetches
watch(
  subscriptions,
  (items) => {
    for (const item of items) {
      checkedStates[item.id] = !!item.active
    }
  },
  { immediate: true },
)

const handleToggle = async (id: string, newActive: boolean) => {
  const { error } = await toggleActive(id, newActive)
  if (error) {
    console.error('Toggle subscription failed:', error)
    // Revert local state on error
    const item = subscriptions.value.find((s) => s.id === id)
    if (item) checkedStates[id] = !!item.active
    return
  }
}

const categoryMap = computed(() => {
  const map = new Map<string, string>()
  for (const cat of categories.value) map.set(cat.id, cat.name)
  return map
})

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchSubscriptions()])
})

const categoryName = (id: string | null) => {
  if (!id) return ''
  return categoryMap.value.get(id) ?? ''
}

const billingCycleLabel = (cycle: string) => {
  const map: Record<string, string> = {
    weekly: t('subscriptions.weekly'),
    monthly: t('subscriptions.monthly'),
    yearly: t('subscriptions.yearly'),
  }
  return map[cycle] ?? cycle
}

const formatNextBilling = (date: string) => {
  const d = new Date(date)
  return d.toLocaleDateString(locale.value, { day: 'numeric', month: 'short', year: 'numeric' })
}

const showDeleteDialog = ref(false)
const deletingItem = ref<Subscription | undefined>()

const deleteDescription = computed(() => {
  const name = deletingItem.value?.name || ''
  return `${t('subscriptions.delete_confirm')} "${name}"?`
})

const goToNew = () => router.push('/subscriptions/new')

const goToEdit = (item: Subscription) => {
  router.push(`/subscriptions/${item.id}/edit`)
}

const onDelete = (item: Subscription) => {
  deletingItem.value = item
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (deletingItem.value) {
    await deleteSubscription(deletingItem.value.id)
  }
  showDeleteDialog.value = false
  deletingItem.value = undefined
}
</script>

<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <PageHeader
      :title="$t('subscriptions.title')"
      :subtitle="`${subscriptions.length} ${$t('subscriptions.active')}`"
      :button-text="$t('subscriptions.add')"
      button-icon="hugeicons:add-01"
      @action="goToNew"
    />

    <!-- STATS -->
    <div v-if="!loading && subscriptions.length > 0" class="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <StatCard
        label="Total Est. Per Month"
        :value="monthlyTotal"
        icon="hugeicons:license"
      />
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="space-y-4">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Skeleton v-for="i in 1" :key="i" class="h-32 rounded-4xl bg-muted/50" />
      </div>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Skeleton v-for="i in 4" :key="i" class="h-44 rounded-4xl bg-muted/50" />
      </div>
    </div>

    <!-- EMPTY STATE -->
    <EmptyState
      v-else-if="subscriptions.length === 0"
      :title="$t('subscriptions.empty')"
      :description="$t('subscriptions.empty_desc')"
      icon="hugeicons:license"
      :button-text="$t('subscriptions.add')"
      @action="goToNew"
    />

    <!-- LIST -->
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div
        v-for="item in subscriptions"
        :key="item.id"
        class="group flex flex-col justify-between rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:border-border/80 hover:shadow-md"
        :class="{ 'opacity-50 grayscale-[0.5]': !(checkedStates[item.id] ?? item.active) }"
      >
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-center gap-4">
            <div
              class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm transition-transform group-hover:scale-110"
            >
              <AppIcon name="hugeicons:license" :size="24" />
            </div>
            <div>
              <h3 class="font-bold text-foreground">
                {{ item.name }}
              </h3>
              <div class="mt-1 flex items-center gap-2">
                <StatusBadge>
                  {{ billingCycleLabel(item.billing_cycle) }}
                </StatusBadge>
                <span class="text-[10px] font-bold text-muted-foreground/90">
                  {{ $t('subscriptions.next_billing') }}: {{ formatNextBilling(item.next_billing_date) }}
                </span>
              </div>
              <div v-if="item.category_id" class="mt-1">
                <span class="text-[10px] font-medium text-muted-foreground/70">
                  {{ categoryName(item.category_id) }}
                </span>
              </div>
            </div>
          </div>
          <Switch v-model="checkedStates[item.id]" @update:modelValue="handleToggle(item.id, $event)" />
        </div>

        <div class="mt-6 flex items-end justify-between border-t border-border/50 pt-4">
          <div class="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              class="size-9 rounded-xl hover:bg-muted"
              @click="goToEdit(item)"
            >
              <AppIcon name="hugeicons:pencil-edit-01" :size="16" class="text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              class="size-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
              @click="onDelete(item)"
            >
              <AppIcon name="hugeicons:delete-01" :size="16" />
            </Button>
          </div>
          <div class="text-right">
            <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {{ $t('subscriptions.amount') }}
            </p>
            <p class="text-xl font-black tracking-tighter text-foreground">
              {{ formatCurrency(Number(item.amount), item.currency) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('subscriptions.delete_title')"
      :description="deleteDescription"
      :confirm-text="$t('subscriptions.delete_action')"
      @confirm="confirmDelete"
    />
  </div>
</template>
