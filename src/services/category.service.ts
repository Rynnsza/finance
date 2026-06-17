import { useSupabase } from '@/lib/supabase'
import { queryList, querySingle, mutationWithReturn, mutationVoid } from '@/lib/query-wrapper'
import { CATEGORY_FIELDS } from '@/services/fields'
import type { Result, CategoryRow, CategoryInsert, CategoryUpdate } from '@/types'

export async function queryCategories(userId: string): Promise<Result<CategoryRow[]>> {
  const supabase = useSupabase()
  return queryList<CategoryRow>(
    supabase
      .from('categories')
      .select(CATEGORY_FIELDS)
      .eq('user_id', userId)
      .order('created_at', { ascending: true }),
  )
}

export async function getCategory(id: string): Promise<Result<CategoryRow>> {
  const supabase = useSupabase()
  return querySingle<CategoryRow>(
    supabase.from('categories').select(CATEGORY_FIELDS).eq('id', id),
  )
}

export async function createCategory(category: CategoryInsert): Promise<Result<CategoryRow>> {
  const supabase = useSupabase()
  return mutationWithReturn<CategoryRow>(
    supabase.from('categories').insert(category),
  )
}

export async function updateCategory(
  id: string,
  updates: CategoryUpdate,
): Promise<Result<CategoryRow>> {
  const supabase = useSupabase()
  return mutationWithReturn<CategoryRow>(
    supabase.from('categories').update(updates).eq('id', id),
  )
}

export async function deleteCategory(id: string): Promise<Result<null>> {
  const supabase = useSupabase()
  return mutationVoid(
    supabase.from('categories').delete().eq('id', id),
  )
}

export async function createDefaultCategories(
  userId: string,
  defaults: Array<{ name: string; type: string; icon: string; color: string }>,
): Promise<Result<CategoryRow[]>> {
  const supabase = useSupabase()
  const items = defaults.map((d) => ({ ...d, user_id: userId }))
  return queryList<CategoryRow>(
    supabase.from('categories').insert(items).select(),
  )
}
