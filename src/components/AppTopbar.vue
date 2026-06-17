<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl"
  >
    <!-- LEFT: Breadcrumbs & Mobile Toggle -->
    <div class="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        class="size-9 rounded-xl border border-border/50 bg-card/50 lg:hidden"
        :aria-label="$t('topbar.toggle_sidebar')"
        @click="$emit('toggleSidebar')"
      >
        <AppIcon name="hugeicons:menu-02" :size="18" />
      </Button>

      <Breadcrumb class="hidden md:block">
        <BreadcrumbList>
          <template v-for="(item, i) in breadcrumbItems" :key="i">
            <template v-if="i === breadcrumbItems.length - 1">
              <BreadcrumbItem>
                <BreadcrumbPage
                  class="text-xs font-black uppercase tracking-widest text-foreground"
                >
                  {{ item.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </template>
            <template v-else>
              <BreadcrumbItem class="hidden md:flex">
                <BreadcrumbLink
                  :to="item.to!"
                  class="text-xs font-black uppercase tracking-widest text-muted-foreground/90 transition-colors hover:text-foreground"
                >
                  {{ item.label }}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:flex">
                <AppIcon
                  name="hugeicons:arrow-right-01"
                  :size="10"
                  class="text-muted-foreground/30"
                />
              </BreadcrumbSeparator>
            </template>
          </template>
        </BreadcrumbList>
      </Breadcrumb>
    </div>

    <!-- RIGHT: Search, Notifications, Theme, CTA -->
    <div class="ml-auto flex items-center gap-4">
      <!-- SEARCH - Mobile -->
      <Button
        variant="ghost"
        size="icon"
        class="size-9 rounded-xl border border-border/50 bg-card/50 md:hidden"
        :aria-label="$t('topbar.search')"
        @click="showSearchDialog = true"
      >
        <AppIcon name="hugeicons:search-01" :size="18" />
      </Button>

      <!-- SEARCH - Desktop -->
      <div class="relative hidden md:block">
        <Button
          variant="outline"
          class="h-9 w-64 justify-start rounded-xl border-border/50 bg-muted/50 pl-9 pr-12 text-xs font-bold text-muted-foreground transition-all hover:bg-muted"
          @click="showSearchDialog = true"
        >
          <AppIcon
            name="hugeicons:search-01"
            :size="14"
            class="absolute left-3 text-muted-foreground/90"
          />
          <span>{{ $t('topbar.search') }}</span>
          <kbd
            class="absolute right-3 rounded bg-muted-foreground/10 px-1.5 py-0.5 text-[10px] font-black text-muted-foreground"
            >⌘K</kbd
          >
        </Button>
      </div>

      <!-- NOTIFICATIONS -->
      <Popover>
        <PopoverTrigger as-child>
          <Button
            variant="ghost"
            size="icon"
            :aria-label="$t('topbar.notifications')"
            class="relative size-9 rounded-xl border border-border/50 bg-card/50"
          >
            <AppIcon name="hugeicons:notification-03" :size="18" />
            <span
              v-if="activeReminders.length > 0"
              class="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-black text-primary-foreground ring-2 ring-background"
            >
              {{ activeReminders.length }}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          class="w-80 rounded-2xl border-border/50 p-0 shadow-2xl backdrop-blur-xl"
          align="end"
        >
          <div class="border-b border-border/50 p-4">
            <h4 class="text-xs font-black uppercase tracking-widest text-foreground">
              {{ $t('topbar.notifications') }}
            </h4>
          </div>
          <div class="max-h-[300px] overflow-y-auto p-2">
            <template v-if="activeReminders.length > 0">
              <div
                v-for="reminder in activeReminders"
                :key="reminder.id"
                class="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-muted/50"
              >
                <div
                  class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
                >
                  <AppIcon name="hugeicons:alert-01" :size="14" />
                </div>
                <div class="flex-1 space-y-0.5">
                  <p class="text-sm font-bold text-foreground">
                    {{ reminder.name }}
                  </p>
                  <p class="text-xs font-medium text-muted-foreground">
                    {{ formatCurrency(reminder.amount, reminder.currency || undefined) }} •
                    {{
                      reminder.days_left === 0
                        ? $t('recurring.due_today')
                        : reminder.days_left === 1
                          ? $t('recurring.due_tomorrow')
                          : $t('recurring.due_in_n_days', { days: reminder.days_left })
                    }}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  :aria-label="$t('topbar.dismiss_notification')"
                  class="size-7 rounded-lg text-muted-foreground/90 hover:bg-muted hover:text-foreground"
                  @click="dismissReminder(reminder.id)"
                >
                  <AppIcon name="hugeicons:cancel-01" :size="14" />
                </Button>
              </div>
            </template>
            <div v-else class="flex h-32 flex-col items-center justify-center space-y-2">
              <AppIcon
                name="hugeicons:notification-03"
                :size="24"
                class="text-muted-foreground/30"
              />
              <p class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/90">
                {{ $t('topbar.no_notifications') }}
              </p>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <!-- THEME -->
      <Button
        variant="ghost"
        size="icon"
        :aria-label="$t('topbar.toggle_theme')"
        class="size-9 rounded-xl border border-border/50 bg-card/50"
        @click="cycleColorMode"
      >
        <ClientOnly>
          <AppIcon v-if="colorMode.value === 'dark'" name="hugeicons:sun-01" :size="18" />
          <AppIcon v-else name="hugeicons:moon-01" :size="18" />
          <template #fallback>
            <div class="size-[18px]" />
          </template>
        </ClientOnly>
      </Button>

      <!-- PREMIUM CTA -->
      <Button
        v-if="route.path !== '/settings'"
        class="h-9 gap-2 rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90"
        @click="router.push('/transactions/new')"
      >
        <AppIcon name="hugeicons:add-01" :size="16" />
        <span class="hidden sm:inline">{{ $t('topbar.add') }}</span>
      </Button>
    </div>

    <SearchDialog v-model:open="showSearchDialog" />
  </header>
</template>

<script setup lang="ts">
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

defineEmits<{
  toggleSidebar: []
}>()

const route = useRoute()
const router = useRouter()
const colorMode = useColorMode()
const { t } = useI18n()
const { fetchRecurring } = useRecurring()
const { activeReminders, dismissReminder } = useReminders()
const { formatCurrency } = useCurrency()

const showSearchDialog = ref(false)

const searchKeydownHandler = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    showSearchDialog.value = true
  }
}

onMounted(() => {
  document.addEventListener('keydown', searchKeydownHandler)
  fetchRecurring()
})
onUnmounted(() => document.removeEventListener('keydown', searchKeydownHandler))

interface BreadcrumbItemDef {
  label: string
  to?: string
}

const breadcrumbItems = computed<BreadcrumbItemDef[]>(() => {
  const path = route.path
  const items: BreadcrumbItemDef[] = [{ label: t('topbar.dashboard'), to: '/dashboard' }]

  if (path === '/dashboard') {
    return items
  }

  if (path.startsWith('/transactions')) {
    items.push({ label: t('topbar.transactions'), to: '/transactions' })
    if (path === '/transactions/new') {
      items.push({ label: t('topbar.add_title') })
    } else if (path.includes('/edit')) {
      items.push({ label: t('topbar.edit') })
    }
    return items
  }

  if (path.startsWith('/categories')) {
    items.push({ label: t('topbar.categories') })
    return items
  }

  if (path.startsWith('/recurring')) {
    items.push({ label: t('topbar.recurring') })
    return items
  }

  if (path.startsWith('/goals')) {
    items.push({ label: t('topbar.goals') })
    return items
  }

  if (path.startsWith('/budget')) {
    items.push({ label: t('topbar.budget') })
    return items
  }

  if (path.startsWith('/accounts')) {
    items.push({ label: t('topbar.accounts') })
    return items
  }

  if (path.startsWith('/schedule')) {
    items.push({ label: t('topbar.schedule') })
    return items
  }

  if (path.startsWith('/converter')) {
    items.push({ label: t('topbar.converter') })
    return items
  }

  if (path.startsWith('/settings')) {
    items.push({ label: t('topbar.settings') })
    return items
  }

  return items
})

const cycleColorMode = () => {
  colorMode.preference = colorMode.value === 'light' ? 'dark' : 'light'
}
</script>
