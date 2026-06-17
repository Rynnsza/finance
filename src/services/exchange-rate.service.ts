import { useSupabase } from '@/lib/supabase'
import type { Result } from '@/types'
import { AppError } from '@/types/result'

export async function queryExchangeRates(): Promise<Result<Record<string, number>>> {
  const supabase = useSupabase()
  const { data, error } = await supabase.from('exchange_rates').select('target_currency, rate')

  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  const map: Record<string, number> = {}
  for (const row of data || []) {
    map[row.target_currency] = Number(row.rate)
  }
  return { data: map, error: null }
}
