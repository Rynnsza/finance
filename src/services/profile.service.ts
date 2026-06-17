import { useSupabase } from '@/lib/supabase'
import type { Result } from '@/types'
import { AppError } from '@/types/result'

export async function getProfileCurrency(userId: string): Promise<Result<string | null>> {
  const supabase = useSupabase()
  const { data, error } = await supabase
    .from('profiles')
    .select('currency')
    .eq('id', userId)
    .single()

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data?.currency || null, error: null }
}
