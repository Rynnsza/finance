import { describe, expect, it, mock } from 'bun:test'
import { ref } from 'vue'
import { useTransactions } from '../useTransactions'

// Mock dependencies
mock.module('../nuxt-compat', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}))

mock.module('@tanstack/vue-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mock(() => {})
  }),
  useQuery: () => ({
    data: ref({ data: [], count: 0 }),
    isLoading: ref(false),
    refetch: mock(async () => {})
  })
}))

mock.module('../useToast', () => ({
  useToast: () => ({
    toast: {
      success: mock(() => {}),
      error: mock(() => {})
    }
  })
}))

mock.module('../useActivityLog', () => ({
  useActivityLog: () => ({
    log: mock(() => {})
  })
}))

mock.module('../useAuth', () => ({
  useAuth: () => ({
    user: ref({ id: 'user-123' })
  })
}))

mock.module('../usePartner', () => ({
  usePartner: () => ({
    partner: ref(null)
  })
}))

mock.module('@/services/transaction.service', () => ({
  queryTransactions: mock(async () => ({ data: { data: [], count: 0 }, error: null })),
  createTransfer: mock(async () => ({ data: [], error: null })),
  getTransaction: mock(async () => ({ data: null, error: null })),
  createTransaction: mock(async () => ({ data: null, error: null })),
  updateTransaction: mock(async () => ({ data: null, error: null })),
  deleteTransaction: mock(async () => ({ data: null, error: null })),
  bulkUpdateTransactions: mock(async () => ({ data: null, error: null })),
  bulkDeleteTransactions: mock(async () => ({ data: null, error: null })),
  searchTransactions: mock(async () => ({ data: [], error: null })),
  getTransactionSummary: mock(async () => ({ data: null, error: null })),
  getCategoryStats: mock(async () => ({ data: [], error: null })),
  uploadTransactionImage: mock(async () => ({ data: null, error: null })),
  deleteTransactionImage: mock(async () => ({ data: null, error: null })),
}))

mock.module('../useCategories', () => ({
  useCategories: () => ({
    categories: ref([
      { id: 'cat-transfer', name: 'Transfer' },
      { id: 'cat-other', name: 'Other' }
    ])
  })
}))

describe('useTransactions', () => {
  it('should have addTransfer method', () => {
    const { addTransfer } = useTransactions()
    expect(addTransfer).toBeDefined()
    expect(typeof addTransfer).toBe('function')
  })

  it('addTransfer should call createTransfer service', async () => {
    const { addTransfer } = useTransactions()
    const { createTransfer } = await import('@/services/transaction.service')
    
    const transferData = {
      from_account_id: 'acc-1',
      to_account_id: 'acc-2',
      amount: 1000,
      currency: 'IDR',
      date: '2026-06-07',
      description: 'Test transfer'
    }

    await addTransfer(transferData)
    expect(createTransfer).toHaveBeenCalled()
  })
})
