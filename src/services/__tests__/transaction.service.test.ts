import { describe, expect, it, mock } from 'bun:test'
import { queryTransactions, createTransfer, deleteTransaction } from '../transaction.service'

interface MockSupabaseChain {
  from: () => MockSupabaseChain
  select: () => MockSupabaseChain
  insert: (data: any) => MockSupabaseChain
  update: (data: any) => MockSupabaseChain
  delete: () => MockSupabaseChain
  single: () => MockSupabaseChain
  eq: () => MockSupabaseChain
  order: () => MockSupabaseChain
  range: () => MockSupabaseChain
  ilike: () => MockSupabaseChain
  gte: () => MockSupabaseChain
  lte: () => MockSupabaseChain
  in: () => MockSupabaseChain
  then: (resolve: (val: { data: any; count: number; error: any }) => void) => void
}

let mockReturnData: any = []

const mockSupabase: MockSupabaseChain = {
  from: () => mockSupabase,
  select: () => mockSupabase,
  insert: (data) => {
    mockReturnData = data
    return mockSupabase
  },
  update: (data) => {
    mockReturnData = data
    return mockSupabase
  },
  delete: () => mockSupabase,
  single: () => {
    if (Array.isArray(mockReturnData)) {
      mockReturnData = mockReturnData[0]
    }
    return mockSupabase
  },
  eq: () => mockSupabase,
  order: () => mockSupabase,
  range: () => mockSupabase,
  ilike: () => mockSupabase,
  gte: () => mockSupabase,
  lte: () => mockSupabase,
  in: () => mockSupabase,
  then: (resolve) => resolve({ data: mockReturnData, count: Array.isArray(mockReturnData) ? mockReturnData.length : 1, error: null }),
}

mock.module('@/lib/supabase', () => ({
  useSupabase: () => mockSupabase,
}))

describe('Transaction Service: queryTransactions', () => {
  it('calls Supabase with correct filters', async () => {
    mockReturnData = []
    const result = await queryTransactions('user-123', { type: 'expense' }, 1, 20)

    expect(result.data).not.toBeNull()
    expect(result.data?.data).toEqual([])
    expect(result.error).toBeNull()
  })
})

describe('Transaction Service: createTransfer', () => {
  it('creates two transactions for a transfer', async () => {
    mockReturnData = []
    const transferData = {
      from_account_id: 'acc-1',
      to_account_id: 'acc-2',
      amount: 1000,
      currency: 'IDR',
      date: '2026-06-07',
      description: 'Pocket money',
      category_id: 'cat-transfer'
    }
    const result = await createTransfer('user-123', transferData)

    expect(result.error).toBeNull()
    expect(result.data).toHaveLength(2)
    // Check that both transactions have the same transfer_id
    expect(result.data![0].transfer_id).toBe(result.data![1].transfer_id)
    expect(result.data![0].transfer_id).toBeDefined()
  })
})

describe('Transaction Service: deleteTransaction', () => {
  it('deletes all linked transactions if it is a transfer', async () => {
    mockReturnData = { id: 'tx-1', transfer_id: 'transfer-123' }
    const result = await deleteTransaction('tx-1')
    expect(result.error).toBeNull()
  })

  it('deletes only the single transaction if no transfer_id', async () => {
    mockReturnData = { id: 'tx-1', transfer_id: null }
    const result = await deleteTransaction('tx-1')
    expect(result.error).toBeNull()
  })
})
