import { useSupabase } from '@/lib/supabase'
import { GOAL_FIELDS } from '@/services/fields'
import { deleteImage } from '@/lib/storage-util'
import { validateAmount } from '@/lib/utils'
import type { Result, GoalRow, GoalInsert, GoalUpdate } from '@/types'
import { AppError } from '@/types/result'

export async function queryGoals(userId: string): Promise<Result<GoalRow[]>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('goals')
    .select(GOAL_FIELDS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data || [], error: null }
}

export async function getGoal(id: string): Promise<Result<GoalRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('goals').select(GOAL_FIELDS).eq('id', id).single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function createGoal(goal: GoalInsert): Promise<Result<GoalRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('goals').insert(goal).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function updateGoal(id: string, updates: GoalUpdate): Promise<Result<GoalRow>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('goals').update(updates).eq('id', id).select().single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data, error: null }
}

export async function deleteGoal(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  const { error } = await supabase.from('goals').delete().eq('id', id)

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

export async function addGoalFunds(goalId: string, amount: number): Promise<Result<GoalRow>> {
  const valid = validateAmount(amount)
  if (valid.error) return { data: null, error: new AppError(valid.error, 'VALIDATION_ERROR') }

  const { data: goal, error: fetchError } = await getGoal(goalId)
  if (fetchError || !goal) return { data: null, error: fetchError || new AppError('Goal not found', 'NOT_FOUND') }

  const newAmount = Number(goal.current_amount) + (valid.value ?? 0)
  return updateGoal(goalId, { current_amount: newAmount })
}

export async function uploadGoalImage(userId: string, file: File): Promise<Result<string>> {
  const supabase = useSupabase()
  const ext = file.name.split('.').pop() || 'png'
  const path = `${userId}/${crypto.randomUUID()}.${ext}`

  const { error } = await supabase.storage.from('goal-images').upload(path, file)
  if (error) return { data: null, error: new AppError(error.message, 'UPLOAD_ERROR', error) }

  const { data } = supabase.storage.from('goal-images').getPublicUrl(path)
  return { data: data.publicUrl, error: null }
}

export async function deleteGoalImage(url: string, userId?: string): Promise<Result<null>> {
  return deleteImage(url, 'goal-images', userId)
}
