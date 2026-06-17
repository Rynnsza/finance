<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/goals')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-6">
      <Skeleton class="h-10 w-32 rounded-xl bg-muted/50" />
      <Skeleton class="h-72 w-full rounded-4xl bg-muted/50" />
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Skeleton v-for="i in 3" :key="i" class="h-28 rounded-3xl bg-muted/50" />
      </div>
    </div>

    <!-- Not Found -->
    <div
      v-else-if="!goalDetail"
      class="flex flex-col items-center justify-center rounded-4xl border border-dashed border-border/50 bg-card/20 py-24 text-center"
    >
      <div
        class="mb-6 flex size-20 items-center justify-center rounded-3xl bg-muted/50 shadow-inner"
      >
        <AppIcon name="hugeicons:target-02" :size="40" class="text-muted-foreground/40" />
      </div>
      <h3 class="text-xl font-black tracking-tight text-foreground">{{ $t('goals.empty') }}</h3>
      <Button
        variant="outline"
        class="mt-8 rounded-2xl border-border/50 bg-background/50 px-8 font-bold transition-all hover:bg-muted"
        @click="router.push('/goals/new')"
      >
        {{ $t('goals.add') }}
      </Button>
    </div>

    <!-- Detail -->
    <div v-else class="space-y-6">
      <!-- Hero Card -->
      <BaseCard padding-size="lg">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-4">
            <div
              class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
              :style="
                !goalDetail.image_url
                  ? { backgroundColor: (goalDetail.color || '#ec4899') + '20' }
                  : {}
              "
            >
              <AspectRatio
                v-if="goalDetail.image_url"
                :ratio="16 / 9"
                class="overflow-hidden rounded-xl"
              >
                <img
                  :src="goalDetail.image_url"
                  :alt="goalDetail.name"
                  class="h-full w-full object-cover"
                />
              </AspectRatio>
              <div
                v-else
                class="size-4 rounded-full"
                :style="{ backgroundColor: goalDetail.color || '#ec4899' }"
              />
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tighter text-foreground">
                {{ goalDetail.name }}
              </h2>
              <p class="text-sm font-medium text-muted-foreground">
                {{ $t('goals.subtitle') }}
              </p>
            </div>
          </div>
          <ListItemAction
            @edit="router.push(`/goals/${goalDetail.id}/edit`)"
            @delete="showDeleteDialog = true"
          />
        </div>

        <!-- Progress -->
        <div class="mt-8 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="font-bold text-foreground">
              {{ formatCurrency(Number(goalDetail.current_amount)) }} /
              {{ formatCurrency(Number(goalDetail.target_amount)) }}
            </span>
            <span class="font-black" :style="{ color: goalDetail.color || undefined }"> {{ percentage }}% </span>
          </div>
          <Progress :model-value="percentage" class="h-4">
            <template #indicator>
              <div
                class="h-full w-full rounded-full transition-all duration-700"
                :style="{
                  backgroundColor: goalDetail.color || '#ec4899',
                  transform: `translateX(-${100 - Math.min(percentage, 100)}%)`,
                }"
              />
            </template>
          </Progress>
        </div>

        <!-- Status text -->
        <div class="mt-4 text-center">
          <template v-if="percentage >= 100">
            <span class="flex items-center justify-center gap-1 text-sm font-bold text-emerald-600">
              <AppIcon name="hugeicons:tick-01" :size="16" />
              {{ $t('goals.completed') }}
            </span>
          </template>
          <template v-else>
            <p class="text-sm font-bold text-muted-foreground">
              {{ $t('goals.remaining') }}: {{ formatCurrency(remaining) }}
            </p>
          </template>
        </div>

        <!-- Add Funds (if not completed) -->
        <div v-if="percentage < 100" class="mt-6">
          <Button class="w-full rounded-2xl shadow-lg shadow-primary/20" @click="showFundsDialog = true">
            <AppIcon name="hugeicons:add-01" :size="16" class="mr-2" />
            {{ $t('goals.add_funds') }}
          </Button>
        </div>
      </BaseCard>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          :label="$t('goals.target_amount')"
          :value="Number(goalDetail.target_amount)"
        />
        <StatCard
          :label="$t('goals.current_amount')"
          :value="Number(goalDetail.current_amount)"
          variant="info"
        />
        <StatCard
          :label="$t('goals.deadline')"
          :value="goalDetail.deadline ? formatDate(goalDetail.deadline) : '-'"
        />
      </div>
    </div>

    <!-- Add Funds Dialog -->
    <AddFundsDialog
      v-if="showFundsDialog && goalDetail"
      :goal="goalDetail"
      @close="showFundsDialog = false"
      @saved="onFundsSaved"
    />

    <!-- Delete Confirmation -->
    <ConfirmDialog
      v-model:open="showDeleteDialog"
      :title="$t('goals.delete_title')"
      :description="$t('goals.delete_confirm')"
      :confirm-text="$t('goals.delete_action')"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { Transaction, TransactionType, TransactionFilters, SplitItem, Account, AccountRow, AccountInsert, AccountUpdate, AccountWithBalance, AccountType, Budget, BudgetRow, BudgetInsert, BudgetUpdate, BudgetWithProgress, Category, CategoryRow, CategoryInsert, CategoryUpdate, Goal, GoalRow, GoalInsert, GoalUpdate, Bill, BillRow, BillInsert, BillUpdate, RecurringTransaction, RecurringRow, RecurringInsert, RecurringUpdate, RecurringFrequency, Profile, ProfileRow, PartnerProfile, Invitation, InvitationRow, CoupleInvitation, EntityType, ActionType, ActivityLog, ActivityLogRow, ActivityLogInsert, ActivityLogFilters, SafeJson, Result } from "@/types"
defineOptions({
  name: 'PagesGoalsDetailIndex',
})
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { AspectRatio } from '@/components/ui/aspect-ratio'


const router = useRouter()
const route = useRoute()
const { goals, fetchGoals, deleteGoal } = useGoals()
const { formatCurrency } = useCurrency()

const goalId = route.params.id as string
const goalDetail = ref<Goal | null>(null)
const loading = ref(true)
const showDeleteDialog = ref(false)
const showFundsDialog = ref(false)

const percentage = computed(() => {
  if (!goalDetail.value || !goalDetail.value.target_amount || goalDetail.value.target_amount <= 0)
    return 0
  return Math.round(
    (Number(goalDetail.value.current_amount) / Number(goalDetail.value.target_amount)) * 100,
  )
})

const remaining = computed(() => {
  if (!goalDetail.value) return 0
  return Math.max(
    0,
    Number(goalDetail.value.target_amount) - Number(goalDetail.value.current_amount),
  )
})

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

const onFundsSaved = () => {
  showFundsDialog.value = false
  // Refresh goal detail
  const updated = goals.value.find((g: Goal) => g.id === goalId)
  if (updated) goalDetail.value = updated
}

const handleDelete = async () => {
  if (!goalDetail.value) return
  const { error } = await deleteGoal(goalDetail.value.id)
  if (!error) {
    router.push('/goals')
  }
  showDeleteDialog.value = false
}

onMounted(async () => {
  await fetchGoals()
  goalDetail.value = goals.value.find((g) => g.id === goalId) || null
  loading.value = false
})
</script>
