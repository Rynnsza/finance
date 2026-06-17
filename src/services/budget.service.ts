import { useSupabase } from '@/lib/supabase'
import { BUDGET_FIELDS } from '@/services/fields'
import { queryList, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { calculateSpendingByCategory, getNextMonth, getPrevMonth, calculateProgress as calcBudgetProgress, calculateRollover } from '@/lib/budget-util'
import type { Result, BudgetWithProgress, BudgetRow, BudgetUpdate } from '@/types'
import { AppError } from '@/types/result'
import { validateAmount } from '@/lib/utils'

export async function queryBudgets(userId: string, month: string): Promise<Result<BudgetRow[]>> {
  const supabase = useSupabase()
  return queryList<BudgetRow>(
    supabase.from('budgets').select(BUDGET_FIELDS).eq('user_id', userId).eq('month', month).order('created_at'),
  )
}

export async function createBudget(
  userId: string,
  categoryId: string,
  month: string,
  amount: number,
  name?: string | null,
): Promise<Result<BudgetRow>> {
  const supabase = useSupabase()
  const valid = validateAmount(amount, true)
  if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  return mutationWithReturn<BudgetRow>(
    supabase.from('budgets').insert({ user_id: userId, category_id: categoryId, month, amount: amount, name: name || null }),
  )
}

export async function updateBudget(
  id: string,
  updates: BudgetUpdate,
): Promise<Result<BudgetRow>> {
  const supabase = useSupabase()
  if (updates.amount !== undefined) {
    const valid = validateAmount(updates.amount, true)
    if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }
  }
  return mutationWithReturn<BudgetRow>(supabase.from('budgets').update(updates).eq('id', id))
}

export async function deleteBudget(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(supabase.from('budgets').delete().eq('id', id))
}

export async function queryBudgetWithProgress(
  userId: string,
  month: string,
): Promise<Result<BudgetWithProgress[]>> {
  const supabase = useSupabase()

  // 1. Fetch budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select(BUDGET_FIELDS)
    .eq('user_id', userId)
    .eq('month', month)

  if (budgetError)
    return { data: null, error: new AppError(budgetError.message, budgetError.code, budgetError) }
  if (!budgets?.length) return { data: [], error: null }

  const categoryIds = budgets.map((b) => b.category_id)

  // 2. Fetch categories
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, color, icon')
    .in('id', categoryIds)

  const categoryMap = new Map(
    (categories || []).map((c) => [c.id, { name: c.name, color: c.color, icon: c.icon }]),
  )

  // 3. Calculate spending for the month
  const nextMonth = getNextMonth(month)

  const { data: txData } = await supabase
    .from('transactions')
    .select('category_id, amount, splits')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', month)
    .lt('date', nextMonth)

  const spentMap = calculateSpendingByCategory(
    (txData || []) as Array<{
      category_id: string | null
      amount: number
      splits: Array<{ category_id: string; amount: number }> | null
    }>,
    categoryIds,
  )

  // 4. Fetch rollover from previous month
  const prevMonth = getPrevMonth(month)

  const rolloverMap = await getBudgetRollover(userId, categoryIds, prevMonth, month)

  // 5. Assemble result
  const result: BudgetWithProgress[] = budgets.map((b) => {
    const cat = categoryMap.get(b.category_id)
    return {
      ...b,
      category_name: cat?.name || '-',
      category_color: cat?.color || '#6b7280',
      category_icon: cat?.icon || '',
      spent: spentMap.get(b.category_id) || 0,
      rollover: rolloverMap.get(b.category_id) || 0,
    }
  })

  return { data: result, error: null }
}

// Extracted pure rollover logic
export async function getBudgetRollover(
  userId: string,
  categoryIds: string[],
  prevMonth: string,
  currentMonth: string,
): Promise<Map<string, number>> {
  const supabase = useSupabase()
  const rolloverMap = new Map<string, number>()

  const { data: prevBudgetData } = await supabase
    .from('budgets')
    .select('category_id, amount')
    .eq('user_id', userId)
    .eq('month', prevMonth)
    .in('category_id', categoryIds)

  if (!prevBudgetData?.length) return rolloverMap

  const prevCatIds = [...new Set(prevBudgetData.map((pb) => pb.category_id))]
  const prevBudgetMap = new Map<string, number>()
  for (const pb of prevBudgetData) {
    prevBudgetMap.set(pb.category_id, (prevBudgetMap.get(pb.category_id) || 0) + Number(pb.amount))
  }

  const { data: prevTxData } = await supabase
    .from('transactions')
    .select('category_id, amount, splits')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', prevMonth)
    .lt('date', currentMonth)

  const prevSpentMap = calculateSpendingByCategory(
    (prevTxData || []) as Array<{
      category_id: string | null
      amount: number
      splits: Array<{ category_id: string; amount: number }> | null
    }>,
    prevCatIds,
  )

  return calculateRollover(prevBudgetMap, prevSpentMap, prevCatIds)
}

// Pure calculation — no I/O, perfect for unit testing
export function getBudgetProgress(budget: BudgetWithProgress) {
  return calcBudgetProgress(budget.amount, budget.spent, budget.rollover)
}
