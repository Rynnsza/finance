<template>
  <header
    class="sticky top-0 z-50 w-full transition-all duration-500"
    :class="[
      isScrolled
        ? 'border-b border-border/40 bg-card/80 backdrop-blur-xl py-2'
        : 'bg-transparent py-4',
    ]"
  >
    <div class="mx-auto flex h-12 max-w-7xl items-center justify-between px-6 relative">
      <!-- Logo -->
      <div class="flex flex-1 justify-start">
        <router-link to="/" class="group flex items-center gap-2 transition-all duration-300">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-2xl bg-linear-to-b from-primary to-primary/90 text-white transition-all duration-500 group-hover:rotate-12 group-hover:scale-110 shadow-lg shadow-primary/20"
          >
            <AppIcon name="hugeicons:wallet-01" :size="22" />
          </div>
          <span
            class="text-2xl font-black tracking-tighter text-foreground group-hover:text-primary transition-all duration-500"
          >
            {{ brandParts.first }}<span class="hidden sm:inline">{{ brandParts.rest }}</span>
          </span>
        </router-link>
      </div>

      <!-- Center Navigation (Desktop) - Sliding Pill Animation -->
      <nav
        class="hidden md:flex items-center p-1 bg-card/50 rounded-full border border-border/40 absolute left-1/2 -translate-x-1/2 backdrop-blur-md shadow-sm"
      >
        <div class="relative flex items-center">
          <!-- Sliding Background -->
          <div
            class="absolute h-full transition-all duration-500 ease-out bg-linear-to-b from-primary to-primary/90 rounded-full shadow-lg shadow-primary/20"
            :style="pillStyle"
          />

          <Button
            v-for="(item, index) in navItems"
            :key="item.href"
            :ref="
              (el: any) => {
                if (el) navRefs[index] = (el.$el || el) as HTMLElement
              }
            "
            variant="ghost"
            class="relative z-10 px-6 py-2 text-xs font-black uppercase tracking-widest whitespace-nowrap rounded-full transition-all duration-300"
            :class="[
              activeSection === item.href.replace('#', '')
                ? 'text-white'
                : 'text-muted-foreground/90 hover:text-foreground',
              // Fallback for better visibility if the reddish pill is not yet visible
              activeSection === item.href.replace('#', '') && !pillStyle.opacity
                ? 'text-primary'
                : '',
            ]"
            @click="scrollToSection(item.href)"
          >
            {{ $t(item.label) }}
          </Button>
        </div>
      </nav>

      <!-- Right Actions -->
      <div class="flex flex-1 items-center justify-end gap-2 sm:gap-3">
        <!-- Utilitas Group (Desktop) -->
        <div
          class="hidden sm:flex items-center p-1 bg-card/50 rounded-2xl border border-border/40 shadow-sm"
        >
          <Button
            variant="ghost"
            size="icon"
            class="h-9 w-9 rounded-xl hover:bg-muted/50 transition-all duration-300 active:scale-90"
            @click="toggleTheme"
          >
            <AppIcon
              :name="colorMode.value === 'dark' ? 'hugeicons:sun-01' : 'hugeicons:moon-02'"
              :size="20"
              class="text-muted-foreground group-hover:text-foreground"
            />
          </Button>

          <div class="w-px h-5 bg-border/50 mx-1.5" />

          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button
                variant="ghost"
                size="icon"
                class="h-9 w-9 rounded-xl hover:bg-muted/50 transition-all duration-300 active:scale-90"
              >
                <AppIcon name="hugeicons:globe-02" :size="20" class="text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              class="w-40 rounded-3xl p-2 border-border/40 bg-card/80 backdrop-blur-xl"
            >
              <DropdownMenuItem
                v-for="locale in availableLocales"
                :key="locale.code"
                class="cursor-pointer rounded-2xl px-4 py-2.5 transition-all focus:bg-primary/10 focus:text-primary"
                @click="setLocale(locale.code)"
              >
                <span
                  class="text-xs font-bold uppercase tracking-widest"
                  :class="{ 'text-primary': currentLocale === locale.code }"
                >
                  {{ locale.name }}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <!-- Auth Buttons (Desktop) -->
        <div class="hidden md:flex items-center gap-2 ml-2">
          <Button
            variant="ghost"
            size="sm"
            class="rounded-2xl px-5 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
            @click="goToLogin"
          >
            {{ $t('auth.login_title') }}
          </Button>
          <Button
            size="sm"
            class="rounded-2xl bg-linear-to-b from-primary to-primary/90 px-6 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-[0.95] transition-all duration-300"
            @click="goToLogin"
          >
            {{ $t('auth.register') }}
          </Button>
        </div>

        <!-- Mobile Menu Trigger -->
        <Sheet>
          <SheetTrigger as-child>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menu"
              class="md:hidden h-11 w-11 rounded-2xl bg-card/50 border border-border/40 shadow-sm hover:bg-muted/50 transition-all"
            >
              <AppIcon name="hugeicons:menu-01" :size="26" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            class="w-80 sm:w-100 flex flex-col border-l-border/40 bg-card/80 backdrop-blur-xl"
          >
            <SheetHeader class="text-left pb-8">
              <SheetTitle class="text-2xl font-black tracking-tighter flex items-center gap-3">
                <div
                  class="h-10 w-10 rounded-2xl bg-linear-to-b from-primary to-primary/90 flex items-center justify-center text-white shadow-lg shadow-primary/20"
                >
                  <AppIcon name="hugeicons:wallet-01" :size="22" />
                </div>
                {{ brandParts.first }}<span class="hidden sm:inline">{{ brandParts.rest }}</span>
              </SheetTitle>
            </SheetHeader>

            <div class="flex-1 py-8 flex flex-col gap-8">
              <div class="flex flex-col gap-2">
                <p
                  class="text-[10px] font-black text-muted-foreground/90 uppercase tracking-[0.2em] px-2 mb-3"
                >
                  {{ $t('landing.navigation') }}
                </p>
                <SheetClose v-for="item in navItems" :key="item.href" as-child>
                  <Button
                    variant="ghost"
                    class="group w-full justify-between h-14 rounded-3xl px-4 hover:bg-muted/50 transition-all duration-300"
                    @click="scrollToSection(item.href)"
                  >
                    <span class="text-sm font-bold">{{ $t(item.label) }}</span>
                    <AppIcon
                      name="hugeicons:arrow-right-01"
                      :size="20"
                      class="text-muted-foreground/20 transition-all group-hover:translate-x-1 group-hover:text-primary"
                    />
                  </Button>
                </SheetClose>
              </div>

              <div class="flex flex-col gap-4">
                <p
                  class="text-[10px] font-black text-muted-foreground/90 uppercase tracking-[0.2em] px-2 mb-1"
                >
                  {{ $t('settings.preferences') }}
                </p>
                <div
                  class="flex items-center justify-between px-5 py-4 rounded-4xl bg-muted/30 border border-border/50"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="size-9 rounded-xl bg-card flex items-center justify-center shadow-sm"
                    >
                      <AppIcon
                        :name="
                          colorMode.value === 'dark' ? 'hugeicons:sun-01' : 'hugeicons:moon-01'
                        "
                        :size="18"
                        class="text-primary"
                      />
                    </div>
                    <span class="text-sm font-bold">{{ $t('settings.theme') }}</span>
                  </div>
                  <Switch :checked="colorMode.value === 'dark'" @update:checked="toggleTheme" />
                </div>

                <div class="flex flex-col gap-3 px-1">
                  <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {{ $t('settings.language') }}
                  </p>
                  <div class="flex gap-2">
                    <Button
                      v-for="locale in locales"
                      :key="locale.code"
                      variant="outline"
                      size="sm"
                      class="flex-1 h-11 rounded-2xl font-bold transition-all"
                      :class="[
                        currentLocale === locale.code
                          ? 'border-primary/50 bg-primary/10 text-primary shadow-sm'
                          : 'border-border/50 bg-transparent text-muted-foreground hover:bg-muted/50',
                      ]"
                      @click="setLocale(locale.code)"
                    >
                      {{ locale.name }}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-8 flex flex-col gap-3">
              <Button
                class="w-full h-14 rounded-3xl bg-linear-to-b from-primary to-primary/90 text-base font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                @click="goToLogin"
              >
                {{ $t('auth.register') }}
              </Button>
              <Button
                variant="ghost"
                class="w-full h-14 rounded-3xl text-base font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                @click="goToLogin"
              >
                {{ $t('auth.login_title') }}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ComponentsLandingNavbar',
})
const { locale: currentLocale, locales, setLocale, t } = useI18n()
const localePath = useLocalePath()
const router = useRouter()
const colorMode = useColorMode()
const { y } = useWindowScroll()

const brandParts = computed(() => {
  const full = t('sidebar.finance')
  const parts = full.split(' ')
  if (parts.length > 1) {
    return {
      first: parts[0],
      rest: ' ' + parts.slice(1).join(' '),
    }
  }
  return { first: full, rest: '' }
})

const isScrolled = computed(() => y.value > 20)
const activeSection = ref('')
const navRefs = ref<HTMLElement[]>([])

// Cached nav positions to avoid forced reflow from offsetWidth/offsetLeft reads
const navPositions = ref<{ width: number; left: number }[]>([])
const pageHeight = ref(0)

const updateCachedLayout = () => {
  pageHeight.value = document.documentElement.scrollHeight
  navPositions.value = navRefs.value.map((el) => ({
    width: el.offsetWidth,
    left: el.offsetLeft,
  }))
}

// Clear active section when at the top, and handle bottom of page for FAQ
watch(y, (newY) => {
  if (newY < 200) {
    activeSection.value = ''
    return
  }

  // Detect if we are at the bottom of the page
  // Use cached scrollHeight + fast window.innerHeight instead of reading DOM layout
  if (newY + window.innerHeight >= pageHeight.value - 100) {
    activeSection.value = 'faq'
  }
})

const navItems = [
  { label: 'landing.nav_features', href: '#features' },
  { label: 'landing.nav_testimonials', href: '#testimonials' },
  { label: 'landing.nav_faq', href: '#faq' },
]

const availableLocales = computed(() => {
  return (locales.value as { code: string; name: string }[]).filter(
    (l) => l.code !== currentLocale.value,
  )
})

const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const pillStyle = computed(() => {
  const activeIndex = navItems.findIndex(
    (item) => item.href.replace('#', '') === activeSection.value,
  )
  if (activeIndex === -1 || !navPositions.value[activeIndex]) {
    return { width: '0px', left: '0px', opacity: 0 }
  }

  const pos = navPositions.value[activeIndex]
  return {
    width: `${pos.width}px`,
    left: `${pos.left}px`,
    opacity: 1,
  }
})

const scrollToSection = (href: string) => {
  const id = href.replace('#', '')
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }
}

const goToLogin = () => router.push(localePath('/auth/login'))

onMounted(() => {
  updateCachedLayout()
  window.addEventListener('resize', updateCachedLayout)

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    {
      threshold: 0.1,
      rootMargin: '-10% 0px -40% 0px',
    },
  )

  navItems.forEach((item) => {
    const el = document.getElementById(item.href.replace('#', ''))
    if (el) {
      observer.observe(el)
    }
  })
})
</script>
