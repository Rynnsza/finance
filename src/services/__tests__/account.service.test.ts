import { describe, expect, it, mock } from 'bun:test'
import { queryAccounts } from '../account.service'

interface MockSupabaseChain {
  from: () => MockSupabaseChain
  select: () => MockSupabaseChain
  eq: () => MockSupabaseChain
  order: () => MockSupabaseChain
  then: (resolve: (val: { data: unknown[]; error: unknown }) => void) => void
}

const mockSupabase: MockSupabaseChain = {
  from: () => mockSupabase,
  select: () => mockSupabase,
  eq: () => mockSupabase,
  order: () => mockSupabase,
  then: (resolve) => resolve({ data: [], error: null }),
}

mock.module('@/lib/supabase', () => ({
  useSupabase: () => mockSupabase,
}))

describe('Account Service: queryAccounts', () => {
  it('fetches accounts for user', async () => {
    const result = await queryAccounts('user-123')

    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })
})
