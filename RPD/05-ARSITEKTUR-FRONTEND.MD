## 5. Arsitektur Frontend

<sub>Struktur komponen, aliran data, auto-import, layout · 7 Jun 2026</sub>

---

### 5.1 Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    PAGES (file-based routing)                 │
│  dashboard.vue │ transactions/ │ budget/ │ goals/ │ bills/  │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                 COMPOSABLES (domain logic)                    │
│  useTransactions │ useBudgets │ useAccounts │ useGoals ...   │
│  TanStack Query │ Supabase SDK │ Activity Log │ Toast       │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              COMPONENTS (presentation layer)                  │
│  ui/ (shadcn-vue) │ charts/ │ landing/ │ custom components  │
│  Button │ Card │ Dialog │ Table │ Progress │ Badge ...      │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   SERVICE LAYER (API calls)                   │
│  transaction.service │ budget.service │ account.service ...  │
│  supabase-js → PostgreSQL RLS → Response                     │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Struktur Folder

```
src/                                                        # ~18,000+ LOC
├── components/                  # Auto-imported via unplugin-vue-components
│   ├── ui/                     # shadcn-vue primitives (136+ komponen)
│   │   ├── button/             # Variants: default, secondary, destructive, ghost, outline, link
│   │   ├── card/               # Card, CardHeader, CardContent, CardFooter
│   │   ├── dialog/             # Modal dengan backdrop + keyboard dismiss
│   │   ├── select/             # Native-feeling select dengan search
│   │   ├── table/              # TanStack Table wrapper + sorting/filtering
│   │   ├── toast/              # Toast notification system (sonner-style)
│   │   ├── progress/           # Progress bar dengan animated fill
│   │   ├── badge/              # Status badges dengan variant color
│   │   ├── separator/          # Divider horizontal/vertikal
│   │   ├── chart-*             # Recharts-style chart components
│   │   └── ...                 # 136+ total komponen primitif
│   ├── charts/                 # Unovis chart wrappers (3 komponen)
│   │   ├── ExpenseDonut.vue    # Donut chart: pengeluaran per kategori
│   │   ├── MonthlyBar.vue      # Bar chart: income vs expense per bulan
│   │   └── NetWorthChart.vue   # Area chart: net worth historical
│   ├── landing/                # Landing page sections
│   │   ├── HeroSection.vue     # Hero + CTA
│   │   ├── FeaturesSection.vue # Grid fitur dengan icons
│   │   └── FooterSection.vue   # Footer dengan links
│   ├── AppSidebar.vue          # Sidebar navigasi (default layout)
│   ├── AppTopbar.vue           # Topbar (breadcrumb, search, profile)
│   ├── AppToast.vue            # Global toast container
│   ├── DashboardSummary.vue    # Kartu ringkasan dashboard
│   ├── TransactionForm.vue     # Form transaksi (digunakan di new + edit)
│   ├── TransactionItem.vue     # Baris transaksi di tabel/list
│   ├── CategoryPicker.vue      # Picker kategori reusable
│   ├── AccountSelect.vue       # Select akun reusable
│   ├── CurrencyInput.vue       # Input dengan formatting currency
│   ├── CameraCapture.vue       # Kamera untuk OCR receipt
│   ├── BillDashboardWidget.vue # Widget tagihan di dashboard
│   └── ...                     # Total ~25+ custom components
├── composables/                # 18 domain logic files (auto-imported)
│   ├── useAuth.ts              # Auth state + Google OAuth flow
│   ├── useCurrency.ts          # Multi-currency formatting & conversion
│   ├── useTransactions.ts      # CRUD + optimistic pagination + search
│   ├── useAccounts.ts          # CRUD + balance calculation + conversion
│   ├── useCategories.ts        # CRUD + seed defaults
│   ├── useBudgets.ts           # CRUD + progress + rollover + alerts
│   ├── useBills.ts             # CRUD + mark as paid + recurrence
│   ├── useRecurring.ts         # CRUD + active toggle + auto-create
│   ├── useGoals.ts             # CRUD + add funds + image upload
│   ├── useNetWorth.ts          # Historical net worth single-pass calc
│   ├── useReminders.ts         # Bill due date reminders (7 days)
│   ├── usePartner.ts           # Couple mode CRUD + invitations
│   ├── useActivityLog.ts       # Audit trail logging
│   ├── useExport.ts            # CSV export
│   ├── useReceipts.ts          # OCR receipt scanning pipeline
│   ├── useToast.ts             # Toast notification system
│   ├── useCamera.ts            # Camera capture wrapper
│   └── nuxt-compat.ts          # 🔴 Dead code — migrasi Nuxt→Vue shims
├── layouts/
│   ├── default.vue             # Sidebar + topbar + main content slot
│   └── blank.vue               # No chrome (landing, login, static pages)
├── lib/
│   ├── supabase.ts             # Supabase client singleton
│   └── utils.ts                # cn() helper, formatDateSafe()
├── pages/                      # 37 file-based routes
│   ├── index.vue               # Landing page (/)
│   ├── dashboard.vue           # Main dashboard (/dashboard)
│   ├── transactions/           # index, new, [id]/edit
│   ├── categories/             # index, new, [id]/edit
│   ├── accounts/               # index, new, [id]/edit, [id]
│   ├── budget/                 # index, new, edit, detail/[id]
│   ├── bills/                  # index, new, [id], [id]/edit
│   ├── recurring/              # index, new, [id]/edit
│   ├── goals/                  # index, new, [id], [id]/edit
│   ├── schedule/               # Calendar view
│   ├── converter/              # Currency converter
│   ├── activities/             # Activity log
│   ├── settings.vue            # User settings (profile, currency, partner)
│   ├── about.vue               # About page
│   ├── contact.vue             # Contact page
│   ├── privacy-policy.vue      # Privacy policy (static)
│   ├── terms-of-service.vue    # Terms (static)
│   └── auth/                   # login.vue, callback.vue
├── services/                   # Service layer (API calls — dipisah dari composables)
│   ├── transaction.service.ts
│   ├── budget.service.ts
│   ├── account.service.ts
│   ├── category.service.ts
│   ├── bill.service.ts
│   ├── recurring.service.ts
│   ├── goal.service.ts
│   └── partner.service.ts
├── types/                      # TypeScript type definitions
│   ├── index.ts                # Shared types
│   └── transaction.ts          # Transaction-specific types
├── plugins/
│   └── i18n.ts                 # vue-i18n setup (ID default, EN fallback)
├── locales/
│   ├── id.json                 # ~900+ keys — Indonesian (default)
│   └── en.json                 # ~900+ keys — English (fallback)
├── router/
│   └── index.ts                # Router setup + beforeEach auth guard
└── styles/
    └── globals.css             # Tailwind directives + CSS variables + dark mode
```

### 5.2 Auto-import Configuration

Semua Vue APIs (`ref`, `computed`, `watch`, dll.), vue-router hooks (`useRouter`, `useRoute`), dan composables di `src/composables/` otomatis di-import via `unplugin-auto-import`.

Semua komponen di `src/components/` otomatis di-register via `unplugin-vue-components`.

> **Tidak perlu import manual** — cukup pakai langsung di template/script.

### 5.3 Aliran Data

```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌────────────┐
│  User   │ ──> │  Page    │ ──> │Composable│ ──> │  Service   │
│ Action  │     │ (Vue)   │     │(useXxx)  │     │ (.service) │
└─────────┘     └──────────┘     └──────────┘     └─────┬──────┘
                                                         │
                                                         ▼
                                                  ┌────────────┐
                                                  │ supabase-js│
                                                  │  + RLS     │
                                                  └─────┬──────┘
                                                         │
                                                         ▼
                                                  ┌────────────┐
                                                  │PostgreSQL  │
                                                  │  (RPC)     │
                                                  └────────────┘
       ┌──────────┐     ┌──────────┐
       │  Toast   │ <── │Composable│
       │ success  │     │  return  │
       │ /error   │     │ {error?} │
       └──────────┘     └──────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ invalidateQuery  │
                     │ (refetch otomatis)│
                     └──────────────────┘
```

**Read Strategy:**

| Entity         | staleTime | Reasoning                              |
| -------------- | --------- | -------------------------------------- |
| Transactions   | 30s       | Sering berubah (setiap transaksi baru) |
| Categories     | 5m        | Hampir tidak pernah berubah            |
| Accounts       | 2m        | Jarang berubah (kecuali transfer)      |
| Budgets        | 1m        | Relatif statis per bulan               |
| Bills          | 1m        | Status bayar bisa berubah              |
| Recurring      | 2m        | Jarang diubah                          |
| Goals          | 30s       | Dana bisa ditambah kapan saja          |
| Exchange Rates | 1h        | Kurs tidak berubah drastis per menit   |
| Activity Logs  | 5s        | Butuh realtime-ish                     |
| Net Worth      | 1m        | Komputasi berat, di-cache              |

**Write Pattern (Konsisten di semua composables):**

```
insert/update/delete → invalidateQueries(queryKey) → toast.success/error → activity.log()
```

### 5.4 Composable Pattern (Standar)

Setiap composable mengikuti template yang sama:

```typescript
export const useXxx = () => {
  // 1. Dependencies
  const queryClient = useQueryClient()
  const { t } = useI18n()
  const { toast } = useToast()
  const activity = useActivityLog()
  const { user } = useAuth()

  // 2. Query
  const { data, isLoading } = useQuery({
    queryKey: ['xxx', ...],
    queryFn: async () => { ... },
    enabled: computed(() => !!user.value),
  })

  // 3. Mutations
  const addXxx = async (data: XxxInsert) => {
    const { error } = await addXxxService(...)
    if (error) { toast.error(t('xxx.add_error')); return { error } }
    queryClient.invalidateQueries({ queryKey: ['xxx'] })
    activity.log('xxx', 'created', { ... })
    toast.success(t('xxx.add_success'))
    return {}
  }

  // 4. Computed
  const computedXxx = computed(() => ...)

  // 5. Return
  return { data, isLoading, addXxx, updateXxx, deleteXxx, computedXxx }
}
```

### 5.5 Layout System

**`default.vue`** — Layout utama untuk authenticated routes:

```
┌──────────────────────────────────────────────────┐
│  ☰ AppSidebar                     👤 Profile    │
│  ┌───────┐  ┌──────────────────────────────────┐ │
│  │       │  │  Topbar (breadcrumb + actions)    │ │
│  │       │  ├──────────────────────────────────┤ │
│  │ Side  │  │                                  │ │
│  │ Bar   │  │   <slot /> — main content        │ │
│  │       │  │   (full page scroll)             │ │
│  │       │  │                                  │ │
│  │       │  │                                  │ │
│  └───────┘  └──────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**`blank.vue`** — Layout untuk landing, auth, static pages:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│           <slot /> — full page                   │
│           (no sidebar, no topbar)                │
│                                                  │
└──────────────────────────────────────────────────┘
```

### 5.6 State Management (No Store)

Aemy Finance **tidak menggunakan** Pinia atau Vuex. Semua state dikelola dengan:

1. **TanStack Query** — Semua server state (data dari Supabase)
2. **`computed()` / `ref()`** — Client state lokal (form input, UI toggle)
3. **`localStorage`** — Persistence untuk preferences (dark mode, locale, dismissed reminders)
4. **Module-level `ref()`** — Shared state antar komponen tanpa prop drilling (di beberapa composables)

---
