import { useSupabase } from '@/lib/supabase'
import { AppError } from '@/types/result'
import type { Result } from '@/types'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'

/**
 * Wraps a Supabase query that returns a single row.
 * Handles the Result<T> / AppError pattern automatically.
 */
export async function querySingle<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<T>> {
  const { data, error } = await builder.single()
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as T, error: null }
}

/**
 * Wraps a Supabase query that returns a single row or null (no row).
 * Uses .maybeSingle() so zero rows returns { data: null, error: null } instead of an error.
 */
export async function queryMaybeSingle<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<T | null>> {
  const { data, error } = await builder.maybeSingle()
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as T) || null, error: null }
}

/**
 * Wraps a Supabase query that returns multiple rows.
 */
export async function queryList<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<T[]>> {
  const { data, error } = await builder
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: (data as T[]) || [], error: null }
}

/**
 * Wraps a Supabase insert/update with select(), returning the created row.
 */
export async function mutationWithReturn<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['insert' | 'update'],
): Promise<Result<T>> {
  const { data, error } = await builder.select().single()
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: data as T, error: null }
}

/**
 * Wraps a Supabase delete or other write that returns no data.
 */
export async function mutationVoid(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['delete' | 'update'],
): Promise<Result<null>> {
  const { error } = await builder
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: null, error: null }
}

/**
 * Wraps a Supabase select with count — used for paginated queries.
 */
export async function queryWithCount<T>(
  builder: ReturnType<ReturnType<typeof useSupabase>['from']>['select'],
): Promise<Result<{ data: T[]; count: number }>> {
  const { data, error, count } = await builder
  if (error) return { data: null, error: new AppError(error.message, error.code, error) }
  return { data: { data: (data as T[]) || [], count: count || 0 }, error: null }
}
