<template>
  <BaseCard
    class="flex-1"
    :title="$t('budget.dashboard_title')"
  >
    <template #action>
      <router-link
        to="/budget"
        class="text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
      >
        {{ $t('dashboard.view_all') }}
      </router-link>
    </template>
    <div class="flex h-full flex-col justify-center pb-4">
      <template v-if="budgetSummaries.length > 0">
        <div
          v-for="sbudget in budgetSummaries.slice(0, 3)"
          :key="sbudget.id"
          class="mb-4 last:mb-0"
        >
          <div class="flex items-center justify-between">
            <div class="min-w-0">
              <p class="text-xs font-bold text-foreground truncate">
                {{ sbudget.name || sbudget.category_name }}
              </p>
              <p v-if="sbudget.name" class="text-[10px] text-muted-foreground truncate">
                {{ sbudget.category_name }}
              </p>
            </div>
            <p class="text-[10px] font-black text-muted-foreground shrink-0 ml-2">
              {{ Math.round((sbudget.spent / sbudget.amount) * 100) }}%
            </p>
          </div>
          <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted shadow-inner">
            <div
              class="h-full rounded-full transition-all duration-700"
              :class="sbudget.spent > sbudget.amount ? 'bg-rose-500' : 'bg-primary'"
              :style="{ width: `${Math.min((sbudget.spent / sbudget.amount) * 100, 100)}%` }"
            />
          </div>
        </div>
      </template>
      <div v-else class="flex flex-col items-center justify-center py-6 text-center">
        <div class="mb-3 flex size-12 items-center justify-center rounded-2xl bg-muted/50">
          <AppIcon name="hugeicons:chart" :size="20" class="text-muted-foreground/40" />
        </div>
        <p class="text-xs text-muted-foreground font-bold uppercase tracking-tight">
          {{ $t('budget.empty') }}
        </p>
        <Button
          variant="outline"
          size="sm"
          class="mt-3 rounded-xl border-border/50 text-[10px] font-black uppercase tracking-widest"
          @click="router.push(`/budget/new?month=${currentMonthStr}`)"
        >
          <AppIcon name="hugeicons:add-01" :size="14" class="mr-1" />
          {{ $t('budget.set_budget') }}
        </Button>
      </div>
    </div>
  </BaseCard>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import type { BudgetWithProgress } from '@/types'

defineOptions({
  name: 'DashboardBudgetSummary',
})

const props = defineProps<{
  budgetSummaries: BudgetWithProgress[]
  currentMonthStr: string
}>()

const router = useRouter()
</script>
