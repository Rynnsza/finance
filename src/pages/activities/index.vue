<template>
  <div class="pb-10 pt-4">
    <!-- Header -->
    <div class="mb-6 flex flex-col justify-between gap-4 md:mb-8 lg:flex-row lg:items-center">
      <div>
        <h2 class="text-3xl font-black tracking-tighter text-foreground md:text-4xl">
          {{ $t('activities.title') }}
        </h2>
        <p class="mt-1 text-sm font-medium text-muted-foreground">
          {{ $t('activities.total', { count: total }) }}
        </p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && logs.length === 0" class="space-y-4">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Skeleton v-for="i in 3" :key="i" class="h-24 rounded-3xl bg-muted/50 sm:h-28" />
      </div>
      <Skeleton class="h-10 w-full rounded-2xl bg-muted/50 sm:h-12 sm:w-96" />
      <div class="space-y-2 sm:space-y-3">
        <div
          v-for="i in 5"
          :key="i"
          class="flex animate-pulse items-center gap-3 rounded-2xl border border-border/50 bg-card p-3 sm:gap-4 sm:p-4"
        >
          <Skeleton class="size-8 shrink-0 rounded-xl bg-muted/50 sm:size-10" />
          <div class="min-w-0 flex-1 space-y-2">
            <Skeleton class="h-3 w-32 rounded-md bg-muted/50 sm:h-4 sm:w-48" />
            <Skeleton class="h-2 w-16 rounded-md bg-muted/50 sm:h-3 sm:w-24" />
          </div>
          <Skeleton class="hidden h-4 w-16 rounded-md bg-muted/50 sm:block" />
        </div>
      </div>
    </div>

    <template v-else>
      <!-- Summary Cards -->
      <div class="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div class="rounded-3xl border border-border/50 bg-card p-4 shadow-sm sm:p-5">
          <div class="flex items-center gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm sm:size-10"
            >
              <AppIcon name="hugeicons:note-01" :size="18" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {{ $t('activities.title') }}
              </p>
              <p class="text-lg font-black tracking-tighter text-foreground sm:text-xl">
                {{ total }}
              </p>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card p-4 shadow-sm sm:p-5">
          <div class="flex items-center gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600 shadow-sm dark:text-sky-400 sm:size-10"
            >
              <AppIcon name="hugeicons:calendar-01" :size="18" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {{ $t('activities.today') }}
              </p>
              <p class="text-lg font-black tracking-tighter text-foreground sm:text-xl">
                {{ todayCount }}
              </p>
            </div>
          </div>
        </div>
        <div class="rounded-3xl border border-border/50 bg-card p-4 shadow-sm sm:p-5">
          <div class="flex items-center gap-3">
            <div
              class="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-sm dark:text-emerald-400 sm:size-10"
            >
              <AppIcon name="hugeicons:arrow-left-right" :size="18" />
            </div>
            <div class="min-w-0">
              <p class="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                {{ $t('activities.transactions') }}
              </p>
              <p class="text-lg font-black tracking-tighter text-foreground sm:text-xl">
                {{ transactionCount }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-4 space-y-2 sm:mb-6 sm:space-y-3">
        <!-- Desktop Entity Tabs -->
        <div
          class="hidden gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md sm:inline-flex"
        >
          <Button
            v-for="tab in filterTabs"
            :key="tab.value"
            :variant="activeTab === tab.value ? 'default' : 'ghost'"
            size="sm"
            class="rounded-xl px-3 text-xs font-bold transition-all md:px-4"
            :class="activeTab === tab.value ? 'shadow-sm' : 'text-muted-foreground'"
            @click="handleTabClick(tab.value)"
          >
            <AppIcon v-if="tab.icon" :name="tab.icon" :size="14" class="mr-1" />
            {{ tab.label }}
          </Button>
        </div>

        <!-- Mobile Entity Select -->
        <div class="sm:hidden">
          <Select v-model="activeTab" @update:model-value="applyFilters()">
            <SelectTrigger
              class="w-full rounded-2xl border-border/50 bg-card shadow-sm backdrop-blur-md"
            >
              <SelectValue :placeholder="$t('activities.filter_placeholder')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="tab in filterTabs" :key="tab.value" :value="tab.value">
                {{ tab.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Action Buttons -->
        <div
          class="inline-flex gap-1 rounded-2xl border border-border/50 bg-card/30 p-1 shadow-sm backdrop-blur-md"
        >
          <Button
            :variant="filterAction === '' ? 'default' : 'ghost'"
            size="sm"
            class="rounded-xl px-3 text-xs font-bold transition-all"
            :class="filterAction === '' ? 'shadow-sm' : 'text-muted-foreground'"
            @click="handleActionFilterChange('')"
          >
            {{ $t('activities.filter_all') }}
          </Button>
          <Button
            :variant="filterAction === 'created' ? 'default' : 'ghost'"
            size="sm"
            class="rounded-xl px-3 text-xs font-bold transition-all"
            :class="filterAction === 'created' ? 'shadow-sm' : 'text-muted-foreground'"
            @click="handleActionFilterChange('created')"
          >
            <AppIcon name="hugeicons:add-01" :size="14" class="mr-1" />
            {{ $t('activities.filter_created') }}
          </Button>
          <Button
            :variant="filterAction === 'deleted' ? 'default' : 'ghost'"
            size="sm"
            class="rounded-xl px-3 text-xs font-bold transition-all"
            :class="filterAction === 'deleted' ? 'shadow-sm' : 'text-muted-foreground'"
            @click="handleActionFilterChange('deleted')"
          >
            <AppIcon name="hugeicons:delete-01" :size="14" class="mr-1" />
            {{ $t('activities.filter_deleted') }}
          </Button>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="logs.length === 0 && !loading"
        class="flex flex-col items-center gap-4 py-16 text-center"
      >
        <div class="flex size-14 items-center justify-center rounded-full bg-muted/50 sm:size-16">
          <AppIcon name="hugeicons:note-01" :size="28" class="text-muted-foreground/30" />
        </div>
        <div>
          <p class="text-base font-black text-foreground tracking-tight">
            {{ $t('activities.empty') }}
          </p>
          <p class="mt-1 text-sm font-medium text-muted-foreground">
            {{ $t('activities.empty_desc') }}
          </p>
        </div>
      </div>

      <template v-else>
        <!-- Activity Feed Bento Card -->
        <div class="rounded-3xl border border-border/50 bg-card shadow-sm sm:rounded-4xl">
          <!-- Feed Header -->
          <div
            class="flex items-center justify-between border-b border-border/50 px-4 py-4 sm:px-6 md:px-8 md:py-6"
          >
            <div>
              <h3 class="text-lg font-black tracking-tighter text-foreground sm:text-xl">
                {{ $t('activities.title') }}
              </h3>
              <p class="text-xs font-medium text-muted-foreground sm:text-sm">
                {{ $t('dashboard.latest_activity') }}
              </p>
            </div>
            <div v-if="loading" class="text-xs text-muted-foreground/90">
              {{ $t('activities.loading') }}
            </div>
          </div>

          <div class="p-3 sm:p-4 md:p-6">
            <!-- Loading Overlay -->
            <div v-if="loading && logs.length > 0" class="space-y-2 sm:space-y-3">
              <div
                v-for="i in 4"
                :key="i"
                class="flex animate-pulse items-center gap-3 rounded-2xl border border-border/50 p-3 sm:gap-4 sm:p-4"
              >
                <Skeleton class="size-8 shrink-0 rounded-xl bg-muted/50 sm:size-10" />
                <div class="min-w-0 flex-1 space-y-2">
                  <Skeleton class="h-3 w-36 rounded-md bg-muted/50 sm:h-4 sm:w-48" />
                  <Skeleton class="h-2 w-16 rounded-md bg-muted/50 sm:h-3 sm:w-24" />
                </div>
                <Skeleton class="hidden h-4 w-16 rounded-md bg-muted/50 sm:block" />
              </div>
            </div>

            <!-- Grouped Timeline -->
            <div v-else-if="groupedLogs.length > 0" class="space-y-6 sm:space-y-8">
              <div v-for="group in groupedLogs" :key="group.date" class="space-y-1 sm:space-y-2">
                <!-- Date Header -->
                <div class="flex items-center gap-3 px-1 sm:gap-4 sm:px-2">
                  <span
                    class="whitespace-nowrap text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 sm:text-xs"
                  >
                    {{ group.label }}
                  </span>
                  <div class="h-px w-full bg-border/40" />
                </div>

                <!-- Activity Items -->
                <div class="relative space-y-0.5 sm:space-y-1">
                  <!-- Timeline Line: hidden on mobile -->
                  <div
                    class="absolute bottom-0 left-[23px] top-3 w-px bg-border/40 max-sm:hidden"
                  />

                  <div
                    v-for="log in group.items"
                    :key="log.id"
                    class="group relative flex items-start gap-2 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted/30 sm:gap-3 sm:px-3 sm:py-3 md:gap-4 md:px-4"
                  >
                    <!-- Timeline Dot: hidden on mobile -->
                    <div
                      class="relative z-10 mt-1 flex size-[14px] shrink-0 items-center justify-center max-sm:hidden"
                    >
                      <div
                        class="size-[14px] rounded-full border-2"
                        :class="getDotClass(log.action as ActionType)"
                      />
                    </div>

                    <!-- Icon Badge: smaller on mobile -->
                    <div
                      class="flex size-8 shrink-0 items-center justify-center rounded-xl sm:size-9"
                      :class="getBadgeClass(log.entity_type as EntityType)"

                    >
                      <AppIcon :name="getActivityIcon(log.entity_type as EntityType, log.action as ActionType)" :size="14" />
                    </div>

                    <!-- Content -->
                    <div class="min-w-0 flex-1">
                      <p class="text-xs font-medium text-foreground sm:text-sm">
                        {{ $t(`activity.${log.entity_type}.${log.action}`, log.metadata) }}
                      </p>
                      <p class="mt-0.5 text-[10px] font-medium text-muted-foreground/90 sm:text-xs">
                        {{ formatTime(log.created_at || '') }}
                      </p>
                    </div>

                    <!-- Action Badge: pill on desktop, none on mobile -->
                    <span
                      class="hidden shrink-0 self-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:inline-block"
                      :class="getActionBadgeClass(log.action as ActionType)"
                    >
                      {{ log.action }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty within feed (filtered) -->
            <div v-else class="flex flex-col items-center gap-4 py-12 text-center sm:py-16">
              <div
                class="flex size-14 items-center justify-center rounded-full bg-muted/50 sm:size-16"
              >
                <AppIcon name="hugeicons:search-01" :size="28" class="text-muted-foreground/30" />
              </div>
              <div>
                <p class="text-sm font-bold text-muted-foreground sm:text-base">
                  {{ $t('activities.no_results') }}
                </p>
                <p class="mt-1 text-xs font-medium text-muted-foreground/90">
                  {{ $t('activities.no_results_desc') }}
                </p>
              </div>
            </div>

            <!-- Load More -->
            <div v-if="hasMore" class="flex justify-center pt-4 pb-2 sm:pt-6 sm:pb-4">
              <Button
                variant="outline"
                class="rounded-2xl px-6 text-xs font-bold sm:px-8 sm:text-sm"
                :disabled="loadingMore"
                @click="loadMore"
              >
                <AppIcon
                  v-if="loadingMore"
                  name="hugeicons:loading-01"
                  :size="14"
                  class="mr-2 animate-spin"
                />
                <AppIcon v-else name="hugeicons:arrow-down-01" :size="14" class="mr-2" />
                {{ $t('activities.load_more') }}
              </Button>
            </div>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'ActivityHistoryPage',
})
import { ref, computed } from 'vue'
import { Button } from '@/components/ui/button'
import { formatDateSafe } from '@/lib/utils'


const { logs, loading, total, fetchAll } = useActivityLog()
const { t, locale } = useI18n()

const activeTab = ref<string>('all')
const filterAction = ref<string>('')
const currentPage = ref(1)
const loadingMore = ref(false)

const pageSize = 50
const hasMore = computed(() => logs.value.length < total.value)

const filterTabs = computed(() => [
  { value: 'all', label: t('activities.filter_all'), icon: 'hugeicons:note-01' },
  { value: 'auth', label: 'Auth', icon: 'hugeicons:user' },
  { value: 'transaction', label: t('activities.transactions'), icon: 'hugeicons:arrow-left-right' },
  { value: 'category', label: t('nav.categories'), icon: 'hugeicons:grid-view' },
  { value: 'budget', label: t('nav.budget'), icon: 'hugeicons:wallet-03' },
  { value: 'goal', label: t('nav.goals'), icon: 'hugeicons:target-02' },
  { value: 'bill', label: t('nav.bills'), icon: 'hugeicons:calendar-03' },
  { value: 'account', label: t('nav.accounts'), icon: 'hugeicons:bank' },
  { value: 'recurring', label: t('nav.recurring'), icon: 'hugeicons:repeat' },
  { value: 'partner', label: t('sidebar.partner'), icon: 'hugeicons:user' },
])

const todayCount = computed(() => {
  const today = formatDateSafe(new Date())
  return logs.value.filter((l: ActivityLog) => l.created_at?.startsWith(today)).length
})

const transactionCount = computed(() => {
  return logs.value.filter((l: ActivityLog) => l.entity_type === 'transaction').length
})

interface LogGroup {
  date: string
  label: string
  items: typeof logs.value
}

const groupedLogs = computed<LogGroup[]>(() => {
  const groups: Record<string, typeof logs.value> = {}
  for (const log of logs.value) {
    const date = (log.created_at || '').slice(0, 10)
    if (!groups[date]) groups[date] = []
    groups[date].push(log)
  }
  return Object.entries(groups).map(([date, items]) => ({
    date,
    label: formatGroupLabel(date),
    items,
  }))
})

const formatGroupLabel = (date: string) => {
  const d = new Date(date)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (d.toDateString() === today.toDateString()) return t('activities.today')
  if (d.toDateString() === yesterday.toDateString()) return t('activities.yesterday')
  return d.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

const getActivityIcon = (entityType: EntityType, action: ActionType): string => {
  const icons: Record<string, string> = {
    'auth.login': 'hugeicons:user',
    'auth.logout': 'hugeicons:logout-01',
    'transaction.created': 'hugeicons:arrow-left-right',
    'transaction.updated': 'hugeicons:edit-01',
    'transaction.deleted': 'hugeicons:delete-01',
    'category.created': 'hugeicons:grid-view',
    'category.updated': 'hugeicons:edit-01',
    'category.deleted': 'hugeicons:delete-01',
    'budget.created': 'hugeicons:wallet-03',
    'budget.updated': 'hugeicons:edit-01',
    'budget.deleted': 'hugeicons:delete-01',
    'goal.created': 'hugeicons:target-02',
    'goal.updated': 'hugeicons:edit-01',
    'goal.deleted': 'hugeicons:delete-01',
    'bill.created': 'hugeicons:calendar-03',
    'bill.updated': 'hugeicons:edit-01',
    'bill.deleted': 'hugeicons:delete-01',
    'account.created': 'hugeicons:bank',
    'account.updated': 'hugeicons:edit-01',
    'account.deleted': 'hugeicons:delete-01',
    'recurring.created': 'hugeicons:repeat',
    'recurring.updated': 'hugeicons:edit-01',
    'recurring.deleted': 'hugeicons:delete-01',
    'partner.connected': 'hugeicons:user',
    'partner.disconnected': 'hugeicons:user',
  }
  return icons[`${entityType}.${action}`] || 'hugeicons:note-01'
}

const getDotClass = (action: ActionType): string => {
  if (action === 'created' || action === 'login' || action === 'connected') {
    return 'border-emerald-500 bg-emerald-500'
  }
  if (action === 'deleted' || action === 'logout' || action === 'disconnected') {
    return 'border-rose-400 bg-rose-400'
  }
  return 'border-amber-400 bg-amber-400'
}

const getBadgeClass = (entityType: EntityType): string => {
  const classes: Record<string, string> = {
    auth: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    transaction: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    category: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    budget: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    goal: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    bill: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    account: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    recurring: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    partner: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  }
  return classes[entityType] || 'bg-muted/50 text-muted-foreground'
}

const getActionBadgeClass = (action: ActionType): string => {
  if (action === 'created' || action === 'login' || action === 'connected') {
    return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  }
  if (action === 'deleted' || action === 'logout' || action === 'disconnected') {
    return 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
  }
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return t('activities.just_now')
  if (diffMins < 60) return t('activities.minutes_ago', { m: diffMins })
  if (diffHours < 24) return t('activities.hours_ago', { h: diffHours })
  if (diffDays < 7) return t('activities.days_ago', { d: diffDays })
  return date.toLocaleDateString(locale.value === 'en' ? 'en-US' : 'id-ID', {
    day: 'numeric',
    month: 'short',
  })
}

const applyFilters = () => {
  currentPage.value = 1
  fetchAll({
    page: 1,
    limit: pageSize,
    entityType: activeTab.value !== 'all' ? (activeTab.value as EntityType) : undefined,
    action: (filterAction.value as ActionType) || undefined,
  })
}

const handleTabClick = (tabValue: string) => {
  activeTab.value = tabValue
  applyFilters()
}

const handleActionFilterChange = (val: string) => {
  filterAction.value = val
  applyFilters()
}

const loadMore = async () => {
  loadingMore.value = true
  currentPage.value++
  await fetchAll({
    page: currentPage.value,
    limit: pageSize,
    entityType: activeTab.value !== 'all' ? (activeTab.value as EntityType) : undefined,
    action: (filterAction.value as ActionType) || undefined,
  })
  loadingMore.value = false
}

applyFilters()
</script>
