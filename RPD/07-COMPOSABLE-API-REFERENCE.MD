## 7. Composable API Reference

<sub>18 domain composables · pola konsisten · auto-imported · 7 Jun 2026</sub>

---

### 📐 Pola Umum

Setiap composable mengikuti kontrak yang sama:

```typescript
export const useXxx = () => {
  // Return: { data, loading, mutations, computeds }
}
```

**Lifecycle:**

1. Mount → `useQuery` fetch otomatis (enabled saat user tersedia)
2. Mutation → insert/update/delete → `invalidateQueries` → toast → activity log
3. Unmount → TanStack Query cache tetap (staleTime) — tidak refetch unless invalidated

**Error Handling:**

- Semua mutation return `{ error? }` — komponen tidak perlu try/catch
- Toast otomatis dari composable (success / error)
- Activity log fire-and-forget (tidak blocking UI)

---

### 🧩 Daftar Composable

### 7.1 `useAuth()`

```typescript
// Module-level reactive state
export const user: Ref<User | null>      // Current user object
export const loading: Ref<boolean>       // Session loading state

// Functions
signInWithGoogle(): Promise<void>         // Redirect ke Google OAuth
signOut(): Promise<void>                  // Logout + redirect + activity log
getSession(): Promise<Session | null>     // Inisialisasi session dari Supabase
```

**Flow:** `getSession()` dipanggil di `router.beforeEach` → set `user` ref → semua composable react terhadap `user.value`.

### 7.2 `useCurrency()`

```typescript
// Module-level (shared state)
defaultCurrency: Ref<string>             // Dari profile user
loadCurrency(): Promise<void>            // Load currency dari profile

// Return values
formatCurrency(amount, currency?): string     // Rp 1.000.000 / $ 1,000.00
formatNumberOnly(amount, currency?): string   // 1.000.000 (without symbol)
parseLocalizedNumber(str, currency?): number  // Parse input lokal ke number
hasDecimals(currency?): boolean               // Cek apakah pake desimal
convertTo(amount, from, to): number | null    // Konversi antar mata uang
currencies: CurrencyOption[]                  // Flat list semua currency
currencyGroups: CurrencyGroup[]               // Grouped by region
exchangeRates: Ref<Record<string, number>>    // Kurs dari Supabase (1h stale)
```

**Fallback Logic:** Jika rate tidak ditemukan di Supabase, fetch langsung dari `exchangerate.fun` → cache di module-level `fallbackRates` ref.

### 7.3 `useTransactions()`

```typescript
// Types
interface Transaction { id, user_id, type, amount, currency, category_id, description, date, account_id, created_at }
interface TransactionFilters { type?, category_id?, search?, dateFrom?, dateTo? }

// Return values
transactions: ComputedRef<Transaction[]>      // All loaded transactions
loading: Ref<boolean>                          // Loading state
hasMore: Ref<boolean>                          // Masih ada data?
loadingMore: Ref<boolean>                      // Loading more state

// Functions
fetchTransactions(filters?): Promise<void>                // Reset + fetch page 1
loadMore(): Promise<void>                                 // Append page N+1
searchTransactions(term): Promise<Transaction[]>           // Quick search (limit 10)
addTransaction(tx): Promise<{ error? }>                   // Insert + invalidate + toast
updateTransaction(id, updates): Promise<{ error? }>        // Update + invalidate + toast
deleteTransaction(id): Promise<{ error? }>                 // Delete + invalidate + toast
getTransaction(id): Promise<{ data, error }>               // Single fetch

// Computed
monthlySummary: ComputedRef<{ income, expense, balance }>  // Ringkasan bulan ini
```

**Pagination:** 50 items per page, optimistic append ke `loadedTransactions`.

### 7.4 `useAccounts()`

```typescript
interface Account { id, user_id, name, type, currency, color, icon, initial_balance, created_at, updated_at }
interface AccountWithBalance extends Account { balance: number }

// Return values
accounts, loading, bankAccounts, ewalletAccounts, cashAccounts, investmentAccounts, liabilityAccounts

// Functions
addAccount(data), updateAccount(id, updates), deleteAccount(id)
getAccountBalance(id): Promise<number>             // Saldo real-time
getAccountBalances(): Promise<AccountWithBalance[]>        // Semua saldo (raw)
getConvertedBalances(): Promise<AccountWithBalance[]>     // Saldo dalam base currency
```

**Balance Calculation:** `initial_balance + SUM(income) - SUM(expense)` dari tabel transactions.

### 7.5 `useCategories()`

```typescript
interface Category { id, user_id, name, type, icon, color, created_at }

// Return values
categories, loading, incomeCategories, expenseCategories

// Functions
addCategory(data), updateCategory(id, updates), deleteCategory(id)
seedDefaults(userId): Promise<void>    // Insert 4 income + 7 expense default categories
```

**Default Categories:** Di-define sebagai constant `DEFAULT_CATEGORIES` di file yang sama.\

### 7.6 `useBudgets()`

```typescript
interface Budget { id, user_id, category_id, month, amount, created_at, updated_at }
interface BudgetWithProgress extends Budget { category_name, category_color, category_icon, spent, rollover }

// Return values
budgets, loading

// Functions
fetchBudgets(month): Promise<void>                                    // Set month + refetch
fetchBudgetWithProgress(month): Promise<BudgetWithProgress[]>          // Budget + spending + rollover
setBudget(categoryId, month, amount): Promise<{ error? }>             // Upsert budget
deleteBudget(id, month): Promise<{ error? }>
getProgress(budget): { percentage, remaining, overspent, effectiveRemaining, effectiveOverspent }
```

**Progress Calculation:** `spent = SUM(transactions.amount WHERE type='expense' AND category_id = X AND month = Y)`

**Rollover:** Budget sisa bulan sebelumnya (`prev_budget - prev_spent`) ditambahkan ke budget bulan ini sebagai `effective_amount`.

### 7.7 `useBills()`

```typescript
interface Bill { id, user_id, title, amount, due_date, is_paid, paid_with_account_id, recurrence, created_at }

// Return values
bills, loading

// Functions
addBill(data), updateBill(id, updates), deleteBill(id)
markAsPaid(id, accountId?): Promise<{ error? }>     // Set is_paid = true + account
```

### 7.8 `useRecurring()`

```typescript
interface RecurringTransaction { id, user_id, type, amount, currency, category_id, frequency, next_date, active, description, created_at }

// Return values
recurring, loading

// Functions
addRecurring(item), updateRecurring(id, updates), deleteRecurring(id)
toggleActive(id, active): Promise<{ error? }>
processDueRecurring(): Promise<number>     // Auto-create transactions from due recurring items
```

**Auto-Process Flow:** `processDueRecurring()` dijalankan saat dashboard mount dan saat recurring di-toggle aktif. Membuat transaksi nyata dari recurring items yang `active = true` dengan `next_date <= today`, lalu memajukan `next_date` sesuai frequency.

### 7.9 `useGoals()`

```typescript
interface Goal { id, user_id, name, target_amount, current_amount, deadline, icon, color, image_url, created_at }

// Return values
goals, loading

// Functions
addGoal(goal), updateGoal(id, updates), addFunds(goalId, amount), deleteGoal(id)
uploadGoalImage(file): Promise<string | null>          // Upload ke Supabase Storage
deleteGoalImage(url): Promise<void>                    // Hapus dari Storage
```

### 7.10 `useNetWorth()`

```typescript
interface NetWorthData { label, assets, debts, netWorth, date }

// Return values
history: Ref<NetWorthData[]>
loading: Ref<boolean>
currentNetWorth: ComputedRef<NetWorthData | null>     // Month terakhir

// Functions
fetchNetWorthHistory(months = 6): Promise<void>
```

**Algorithm:** Single-pass processing — sort semua transactions per tanggal, iterasi per month boundary, accumulate running balance per account.

### 7.11 `usePartner()`

```typescript
interface CoupleInvitation {
  id
  sender_id
  recipient_email
  status
  token
  created_at
}
interface PartnerProfile {
  id
  display_name
  avatar_url
  currency
}

// Return values
;(partner, sentInvitations, receivedInvitations, loading, sending)
;(isPartnered, partnerDisplayName)

// Functions
;(sendInvite(email),
  acceptInvite(invitationId),
  rejectInvite(invitationId),
  cancelInvite(invitationId))
disconnectPartner()
;(fetchPartner(), fetchInvitations())
```

**Flow:** `sendInvite(email)` → insert ke `couple_invitations` → fire-and-forget panggil Edge Function `send-couple-invite` untuk kirim email via Resend.

### 7.12 `useReminders()`

```typescript
interface Reminder { id, transaction_id, name, amount, currency, next_date, days_left }

// Return values
reminders: ComputedRef<Reminder[]>              // Semua reminder (raw)
activeReminders: ComputedRef<Reminder[]>         // Belum di-dismiss

// Functions
dismissReminder(id): void                        // Sembunyikan dari tampilan
```

**Logic:** Filter `recurring_transactions` yang active + expense + `next_date` dalam 7 hari ke depan. Dismiss state disimpan di `localStorage`.

### 7.13 `useActivityLog()`

```typescript
type EntityType = 'transaction' | 'category' | 'budget' | 'goal' | 'bill' | 'account' | 'recurring' | 'todo' | 'partner' | 'auth'
type ActionType = 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'connected' | 'disconnected'
interface ActivityLog { id, user_id, entity_type, entity_id, action, metadata, created_at }
interface ActivityLogFilters { page?, limit?, entityType?, action?, startDate?, endDate? }

// Return values
logs: ComputedRef<ActivityLog[]>, loading, total

// Functions
log(entityType, action, metadata?, entityId?): Promise<void>     // Fire-and-forget insert
fetchAll(filters?): Promise<void>                                 // Paginated fetch
fetchRecent(limit = 5): Promise<ActivityLog[]>                    // Quick recent fetch
```

### 7.14 `useExport()`

```typescript
// Return values
exporting: Ref<boolean>

// Functions
exportAllData(): Promise<void>     // Fetch + format CSV + download
```

**Format:** CSV dengan kolom No, Date, Type, Category, Amount, Currency, Description.

### 7.15 `useReceipts()`

```typescript
// Return values
uploading: Ref<boolean>, scanning: Ref<boolean>, statusMessage: Ref<string>, lastResult: Ref<ScanResult | null>

// Functions
scanReceiptFromFile(file, options?): Promise<ReceiptData | null>
reset(): void
```

**Pipeline:** `validateFile()` → `compressImage()` (max 1920px, JPEG 0.7) → `uploadToStorage()` (Supabase private bucket, signed URL 10min) → `callScanEndpoint()` (Edge Function) → return `ReceiptData`.

---
