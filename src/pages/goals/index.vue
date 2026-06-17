<template>
  <div class="mx-auto max-w-6xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <PageHeader
      :title="$t('goals.title')"
      :subtitle="$t('goals.subtitle')"
      :button-text="$t('goals.add')"
      button-icon="hugeicons:add-01"
      @action="router.push('/goals/new')"
    />

    <!-- OWNER FILTER (when partnered) -->
    <div v-if="isPartnered" class="inline-flex items-center gap-1 rounded-2xl bg-muted/50 p-1">
      <button
        class="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
        :class="
          ownerFilter === 'all'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="ownerFilter = 'all'"
      >
        {{ $t('goals.shared_all') }}
      </button>
      <button
        class="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
        :class="
          ownerFilter === 'mine'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="ownerFilter = 'mine'"
      >
        {{ $t('goals.shared_mine') }}
      </button>
      <button
        class="rounded-xl px-4 py-1.5 text-xs font-bold transition-all"
        :class="
          ownerFilter === 'partner'
            ? 'bg-card text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground'
        "
        @click="ownerFilter = 'partner'"
      >
        {{ partnerDisplayName || $t('goals.shared_partner') }}
      </button>
    </div>

    <!-- Summary Stats — bento top row -->
    <div v-if="allGoals.length > 0" class="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <StatCard
        :label="$t('goals.total_goals')"
        :value="allGoals.length"
        variant="primary"
      />
      <StatCard
        :label="$t('goals.completed')"
        :value="completedCount"
        variant="success"
      />
      <StatCard
        :label="$t('goals.total_target')"
        :value="totalTarget"
        variant="primary"
      />
      <StatCard
        :label="$t('goals.total_saved')"
        :value="totalSaved"
        variant="info"
      />
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="space-y-4">
      <!-- Summary row -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Skeleton v-for="i in 4" :key="i" class="h-24 rounded-3xl bg-muted/50" />
      </div>
      <!-- Cards grid -->
      <div
        class="grid gap-4"
        :style="{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }"
      >
        <Skeleton v-for="i in 4" :key="i" class="h-[220px] rounded-3xl bg-muted/50" />
      </div>
    </div>

    <template v-else>
      <!-- EMPTY STATE -->
      <EmptyState
        v-if="allGoals.length === 0"
        :title="$t('goals.empty')"
        :description="$t('goals.empty_desc')"
        icon="hugeicons:target-02"
        :button-text="$t('goals.add')"
        @action="router.push('/goals/new')"
      />

      <!-- BENTO AUTO-FIT GRID -->
      <div
        v-else
        class="grid gap-4"
        :style="{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }"
      >
        <BaseCard
          v-for="goal in allGoals"
          :key="goal.id"
          class="group relative flex cursor-pointer flex-col overflow-hidden transition-all hover:shadow-lg"
          :class="{ 'md:col-span-2 md:row-span-2': getIsFeatured(goal) }"
          :style="getIsFeatured(goal) ? { minHeight: '360px' } : { minHeight: '220px' }"
          no-padding
          @click="router.push(`/goals/${goal.id}`)"
        >
          <!-- Featured hero card (image background) -->
          <template v-if="getIsFeatured(goal)">
            <div class="absolute inset-0">
              <img
                :src="goal.image_url ?? ''"
                :alt="goal.name"
                class="h-full w-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10"
              />
            </div>
            <div class="relative z-10 mt-auto flex flex-col p-6 text-white">
              <div class="mb-2 flex items-center gap-2">
                <div
                  class="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
                >
                  {{ $t('goals.featured') }}
                </div>
                <div
                  v-if="getPercentage(goal) >= 100"
                  class="rounded-full bg-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold uppercase backdrop-blur-sm"
                >
                  {{ $t('goals.completed') }}
                </div>
              </div>
              <h3 class="text-xl font-black tracking-tight drop-shadow-sm">{{ goal.name }}</h3>
              <p v-if="goal.deadline" class="text-xs font-medium text-white/70 drop-shadow-sm">
                {{ formatDate(goal.deadline) }}
              </p>
              <div class="mt-4 space-y-1.5">
                <div class="flex justify-between text-xs font-bold">
                  <span
                    >{{ formatCurrency(Number(goal.current_amount)) }} /
                    {{ formatCurrency(Number(goal.target_amount)) }}</span
                  >
                  <span>{{ getPercentage(goal) }}%</span>
                </div>
                <div class="h-2.5 overflow-hidden rounded-full bg-white/20">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :style="{
                      width: `${Math.min(getPercentage(goal), 100)}%`,
                      backgroundColor: goal.color || '#ec4899',
                    }"
                  />
                </div>
              </div>
            </div>
          </template>

          <!-- Completed compact card -->
          <template v-else-if="getPercentage(goal) >= 100">
            <div class="flex h-full flex-col p-5">
              <div class="mb-3 flex items-center gap-3">
                <div
                  class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10"
                >
                  <AppIcon name="hugeicons:tick-01" :size="20" class="text-emerald-500" />
                </div>
                <div class="min-w-0 flex-1">
                  <h3 class="truncate text-sm font-bold text-foreground">{{ goal.name }}</h3>
                  <p class="text-[10px] font-medium text-emerald-600">
                    {{ $t('goals.completed') }}
                  </p>
                </div>
              </div>
              <p class="mt-auto text-2xl font-black tracking-tighter text-foreground">
                {{ formatCurrency(Number(goal.current_amount)) }}
              </p>
            </div>
          </template>

          <!-- Regular card -->
          <template v-else>
            <div class="flex h-full flex-col p-5">
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-3 min-w-0">
                  <div
                    class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl"
                    :style="{ backgroundColor: (goal.color || '#ec4899') + '20' }"
                  >
                    <div v-if="goal.image_url" class="h-full w-full overflow-hidden rounded-xl">
                      <img
                        :src="goal.image_url"
                        :alt="goal.name"
                        class="h-full w-full object-cover"
                      />
                    </div>
                    <div
                      v-else
                      class="size-3.5 rounded-full"
                      :style="{ backgroundColor: goal.color || '#ec4899' }"
                    />
                  </div>
                  <div class="min-w-0">
                    <h3 class="truncate text-sm font-bold text-foreground">{{ goal.name }}</h3>
                    <p
                      v-if="goal.deadline"
                      class="truncate text-[10px] font-medium text-muted-foreground"
                    >
                      {{ formatDate(goal.deadline) }}
                    </p>
                    <span
                      v-if="ownerFilter === 'all' && goal.user_id !== user?.id"
                      class="inline-flex items-center gap-1 rounded-md bg-sidebar-accent px-1.5 py-0.5 text-[10px] font-bold text-sidebar-foreground"
                    >
                      <AppIcon name="hugeicons:user-01" :size="10" />
                      {{ partnerInitial }}
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-4 space-y-1.5">
                <div class="flex justify-between text-xs">
                  <span class="font-bold text-foreground">{{
                    formatCurrency(Number(goal.current_amount))
                  }}</span>
                  <span class="font-black" :style="{ color: goal.color || undefined }"
                    >{{ getPercentage(goal) }}%</span
                  >
                </div>
                <Progress :model-value="getPercentage(goal)" class="h-2.5">
                  <template #indicator>
                    <div
                      class="h-full w-full rounded-full transition-all duration-500 ease-out"
                      :style="{
                        backgroundColor: goal.color || '#ec4899',
                        transform: `translateX(-${100 - Math.min(getPercentage(goal), 100)}%)`,
                      }"
                    />
                  </template>
                </Progress>
              </div>

              <div class="mt-auto flex items-center justify-between pt-4">
                <p class="text-[10px] font-bold text-muted-foreground">
                  {{ $t('goals.target_amount') }}: {{ formatCurrency(Number(goal.target_amount)) }}
                </p>
                <p class="text-[10px] font-bold text-muted-foreground">
                  {{ $t('goals.remaining') }}: {{ formatCurrency(remainingFor(goal)) }}
                </p>
              </div>
            </div>
          </template>

          <!-- Hover edit button -->
          <button
            class="absolute right-3 top-3 z-20 flex size-8 items-center justify-center rounded-full bg-background/80 text-muted-foreground opacity-0 shadow-sm backdrop-blur-sm transition-all hover:bg-background group-hover:opacity-100"
            @click.stop="router.push(`/goals/${goal.id}/edit`)"
          >
            <AppIcon name="hugeicons:pencil-edit-01" :size="14" />
          </button>
        </BaseCard>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesGoalsIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'


const router = useRouter()
const { t } = useI18n()
const { goals, partnerGoals, loading, fetchGoals, setPartnerId } = useGoals()
const { partner, isPartnered, partnerDisplayName } = usePartner()
const { formatCurrency } = useCurrency()
const { user, getSession } = useAuth()

const ownerFilter = ref<'mine' | 'partner' | 'all'>('all')

const allGoals = computed(() => {
  const mine = goals.value
  const theirs = partnerGoals.value

  switch (ownerFilter.value) {
    case 'mine':
      return mine
    case 'partner':
      return theirs
    case 'all':
    default:
      return [...mine, ...theirs]
  }
})

const completedCount = computed(
  () =>
    allGoals.value.filter((g: Goal) => {
      const target = Number(g.target_amount)
      const current = Number(g.current_amount)
      return target > 0 && current >= target
    }).length,
)

const totalTarget = computed(() =>
  allGoals.value.reduce((sum: number, g: Goal) => sum + Number(g.target_amount), 0),
)
const totalSaved = computed(() =>
  allGoals.value.reduce((sum: number, g: Goal) => sum + Number(g.current_amount), 0),
)

// Pick first goal with an image as the featured hero card
const featuredGoalId = computed(() => {
  return allGoals.value.find((g: Goal) => !!g.image_url)?.id || null
})

const partnerInitial = computed(() => partner.value?.display_name?.charAt(0)?.toUpperCase() || 'P')

function getIsFeatured(goal: Goal): boolean {
  return goal.id === featuredGoalId.value
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function getPercentage(goal: Goal): number {
  const target = Number(goal.target_amount)
  const current = Number(goal.current_amount)
  if (!target || target <= 0) return 0
  return Math.round((current / target) * 100)
}

function remainingFor(goal: Goal): number {
  return Math.max(0, Number(goal.target_amount) - Number(goal.current_amount))
}

const loadData = async () => {
  await getSession()
  if (isPartnered.value && partner.value?.id) {
    setPartnerId(partner.value.id)
  }
  await fetchGoals()
}

onMounted(() => {
  loadData()
})
</script>
