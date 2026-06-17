import { useLocalStorage } from '@vueuse/core'
import { useRecurring } from './useRecurring'
import { useSubscriptions } from './useSubscriptions'
import { computed } from 'vue'

export interface Reminder {
  id: string
  transaction_id: string
  name: string
  amount: number
  currency: string
  next_date: string
  days_left: number
}

export const useReminders = () => {
  const { recurring } = useRecurring()
  const { subscriptions } = useSubscriptions()
  const dismissedReminders = useLocalStorage<string[]>('dismissed-bill-reminders', [])

  const reminders = computed(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const recurringReminders = recurring.value
      .filter((tx) => {
        if (!tx.active || tx.type !== 'expense') {
          return false
        }
        const nextDate = new Date(tx.next_date)
        nextDate.setHours(0, 0, 0, 0)
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= 7
      })
      .map((tx) => {
        const nextDate = new Date(tx.next_date)
        nextDate.setHours(0, 0, 0, 0)
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          id: `${tx.id}-${tx.next_date}`,
          transaction_id: tx.id,
          name: tx.description || 'Recurring Bill',
          amount: tx.amount,
          currency: tx.currency || 'IDR',
          next_date: tx.next_date,
          days_left: diffDays,
        }
      })

    const subscriptionReminders = subscriptions.value
      .filter((sub) => {
        if (!sub.active) {
          return false
        }
        const nextDate = new Date(sub.next_billing_date)
        nextDate.setHours(0, 0, 0, 0)
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return diffDays >= 0 && diffDays <= (sub.reminder_days || 7)
      })
      .map((sub) => {
        const nextDate = new Date(sub.next_billing_date)
        nextDate.setHours(0, 0, 0, 0)
        const diffDays = Math.round((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        return {
          id: `${sub.id}-${sub.next_billing_date}`,
          transaction_id: sub.id,
          name: sub.name,
          amount: sub.amount,
          currency: sub.currency || 'IDR',
          next_date: sub.next_billing_date,
          days_left: diffDays,
        }
      })

    return [...recurringReminders, ...subscriptionReminders].sort((a, b) => a.days_left - b.days_left)
  })

  const activeReminders = computed(() => {
    return reminders.value.filter((r) => !dismissedReminders.value.includes(r.id))
  })

  const dismissReminder = (id: string) => {
    if (!dismissedReminders.value.includes(id)) {
      dismissedReminders.value.push(id)
    }
  }

  return {
    reminders,
    activeReminders,
    dismissReminder,
  }
}
