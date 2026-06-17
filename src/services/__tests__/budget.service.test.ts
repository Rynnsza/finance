import { describe, expect, it } from 'bun:test'
import { getBudgetProgress } from '../budget.service'
import type { BudgetWithProgress } from '../budget.service'

// Mock Supabase is handled via individual service methods if we want to test I/O
// but calculateProgress is a pure function, easiest to test first.

describe('Budget Service: getBudgetProgress', () => {
  it('calculates basic progress correctly', () => {
    const budget: Partial<BudgetWithProgress> = {
      amount: 1000,
      spent: 400,
      rollover: 0,
    }

    const progress = getBudgetProgress(budget as BudgetWithProgress)

    expect(progress.percentage).toBe(40)
    expect(progress.remaining).toBe(600)
    expect(progress.overspent).toBe(0)
  })

  it('handles overspending', () => {
    const budget: Partial<BudgetWithProgress> = {
      amount: 1000,
      spent: 1200,
      rollover: 0,
    }

    const progress = getBudgetProgress(budget as BudgetWithProgress)

    expect(progress.percentage).toBe(100) // capped at 100 for percentage
    expect(progress.remaining).toBe(0)
    expect(progress.overspent).toBe(200)
  })

  it('calculates effective progress with positive rollover', () => {
    const budget: Partial<BudgetWithProgress> = {
      amount: 1000,
      spent: 1200,
      rollover: 500, // effective budget = 1500
    }

    const progress = getBudgetProgress(budget as BudgetWithProgress)

    expect(progress.effectiveRemaining).toBe(300)
    expect(progress.effectiveOverspent).toBe(0)
  })

  it('calculates effective progress with negative rollover (overspent last month)', () => {
    const budget: Partial<BudgetWithProgress> = {
      amount: 1000,
      spent: 900,
      rollover: -200, // effective budget = 800
    }

    const progress = getBudgetProgress(budget as BudgetWithProgress)

    expect(progress.effectiveRemaining).toBe(0)
    expect(progress.effectiveOverspent).toBe(100)
  })

  it('handles zero budget amount', () => {
    const budget: Partial<BudgetWithProgress> = {
      amount: 0,
      spent: 100,
      rollover: 0,
    }

    const progress = getBudgetProgress(budget as BudgetWithProgress)

    expect(progress.percentage).toBe(0)
    expect(progress.remaining).toBe(0)
  })
})
