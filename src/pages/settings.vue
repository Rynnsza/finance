<template>
  <div class="mx-auto w-full max-w-2xl space-y-8 pb-12 pt-4">
    <!-- HEADER -->
    <div>
      <h1 class="text-4xl font-black tracking-tighter text-foreground">
        {{ $t('settings.account') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('settings.preferences') }}</p>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="space-y-6">
      <div class="h-48 w-full animate-pulse rounded-4xl bg-muted/50" />
      <div class="h-64 w-full animate-pulse rounded-4xl bg-muted/50" />
    </div>

    <div v-else class="space-y-8">
      <ProfileSettings
        :profile="profile"
        :user="user"
        :is-partnered="isPartnered"
      />

      <AppearanceSettings
        :profile="profile"
        :selected-currency-label="selectedCurrencyLabel"
        :theme-label="themeLabel"
        :locale-label="localeLabel"
        @edit-name="editName = true"
        @edit-currency="editCurrency = true"
        @cycle-theme="cycleTheme"
        @cycle-language="cycleLanguage"
      />

      <PartnerSettings
        :partner-loading="partnerLoading"
        :is-partnered="isPartnered"
        :partner-sending="partnerSending"
        :invite-email="inviteEmail"
        :sent-invitations="sentInvitations"
        :received-invitations="receivedInvitations"
        :partner="partner"
        :partner-display-name="partnerDisplayName"
        @update:invite-email="inviteEmail = $event"
        @send-invite="onSendInvite"
        @accept-invite="onAcceptInvite"
        @reject-invite="onRejectInvite"
        @cancel-invite="onCancelInvite"
        @show-disconnect="showDisconnectDialog = true"
      />

      <ExportSettings
        :export-label="exportLabel"
        @export-data="exportData"
      />

      <!-- DANGER ZONE -->
      <section>
        <h3
          class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90 text-rose-500/60 dark:text-rose-400/60"
        >
          {{ $t('settings.account') }}
        </h3>
        <div
          class="rounded-4xl border border-border/50 bg-card p-1.5 shadow-sm transition-all hover:shadow-md"
        >
          <Button
            variant="ghost"
            class="group w-full h-auto rounded-3xl p-4 transition-all hover:bg-rose-500/5"
            @click="onSignOut"
          >
            <div class="flex w-full items-center justify-between">
              <div class="flex items-center gap-4">
                <div
                  class="flex size-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-transform duration-300 group-hover:scale-110"
                >
                  <AppIcon name="hugeicons:logout-01" :size="22" />
                </div>
                <div class="min-w-0 text-left">
                  <p class="text-sm font-black text-foreground md:text-base">
                    {{ $t('settings.logout') }}
                  </p>
                  <p class="text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                    {{ $t('settings.logout_desc') }}
                  </p>
                </div>
              </div>
              <AppIcon
                name="hugeicons:arrow-right-01"
                :size="20"
                class="shrink-0 text-muted-foreground/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-muted-foreground/90"
              />
            </div>
          </Button>
        </div>
      </section>

      <div class="flex flex-col items-center gap-2 pb-8 opacity-40">
        <p class="text-[10px] font-black uppercase tracking-[0.3em]">
          {{ $t('settings.version') }}
        </p>
        <p class="text-[9px] font-medium tracking-tighter italic text-primary/80">
          {{ $t('dashboard.made_with') }}
        </p>
      </div>
    </div>

    <!-- DISCONNECT CONFIRMATION DIALOG -->
    <AlertDialog v-model:open="showDisconnectDialog">
      <AlertDialogContent class="rounded-4xl">
        <AlertDialogHeader>
          <AlertDialogTitle class="font-black tracking-tight">{{
            $t('settings.dialog_disconnect_title')
          }}</AlertDialogTitle>
          <AlertDialogDescription class="text-sm">
            {{ $t('settings.dialog_disconnect_desc') }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel class="rounded-xl font-bold">
            {{ $t('settings.cancel') }}
          </AlertDialogCancel>
          <AlertDialogAction
            class="rounded-xl bg-rose-500 px-6 font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600"
            @click="onConfirmDisconnect"
          >
            {{ $t('settings.disconnect_title') }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- DIALOGS -->
    <Dialog v-model:open="editName">
      <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm rounded-4xl">
        <DialogHeader>
          <DialogTitle class="font-black tracking-tight">{{
            $t('settings.dialog_name_title')
          }}</DialogTitle>
          <DialogDescription class="sr-only">{{
            $t('settings.dialog_name_desc')
          }}</DialogDescription>
        </DialogHeader>
        <div class="space-y-3 py-4">
          <Input
            v-model="profile.display_name"
            :placeholder="$t('settings.name_placeholder')"
            class="h-12 rounded-2xl bg-muted/30"
            autofocus
          />
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="ghost" class="rounded-xl font-bold" @click="editName = false">
            {{ $t('settings.cancel') }}
          </Button>
          <Button
            class="rounded-xl bg-primary px-6 font-bold text-white shadow-lg shadow-primary/20"
            :disabled="saving"
            @click="saveProfile"
          >
            {{ saving ? $t('settings.saving') : $t('settings.save') }}
          </Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog v-model:open="editCurrency">
      <DialogContent class="w-[calc(100vw-32px)] sm:max-w-sm rounded-4xl">
        <DialogHeader>
          <DialogTitle class="font-black tracking-tight">{{
            $t('settings.dialog_currency_title')
          }}</DialogTitle>
          <DialogDescription class="sr-only">{{
            $t('settings.dialog_currency_desc')
          }}</DialogDescription>
        </DialogHeader>
        <div class="max-h-80 overflow-y-auto py-2 space-y-4">
          <div v-for="group in currencyGroups" :key="group.label">
            <p
              class="sticky top-0 bg-background/80 backdrop-blur-sm z-10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
            >
              {{ group.label }}
            </p>
            <div class="mt-2 space-y-1 px-1">
              <Button
                v-for="c in group.currencies"
                :key="c.value"
                variant="ghost"
                class="w-full justify-between rounded-xl h-11 px-3 transition-all"
                :class="
                  profile.currency === c.value
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-foreground/80'
                "
                @click="selectCurrency(c.value)"
              >
                <span class="text-sm">{{ c.label }}</span>
                <AppIcon v-if="profile.currency === c.value" name="hugeicons:tick-01" :size="18" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { useExport } from '@/composables/useExport'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useSupabase } from '@/lib/supabase'
import { useQueryClient } from '@tanstack/vue-query'
import type { CoupleInvitation } from '@/types'

defineOptions({
  name: 'SettingsPage',
})

const { toast } = useToast()
const queryClient = useQueryClient()
const supabase = useSupabase()
const { user, signOut, getSession } = useAuth()
const {
  partner,
  sentInvitations,
  receivedInvitations,
  isPartnered,
  partnerDisplayName,
  loading: partnerLoading,
  sending: partnerSending,
  fetchPartner,
  fetchInvitations,
  sendInvite,
  acceptInvite,
  rejectInvite,
  cancelInvite,
  disconnectPartner,
} = usePartner()
const { currencies, currencyGroups, defaultCurrency } = useCurrency()
const colorMode = useColorMode()
const { locale, setLocale, t } = useI18n()

const loading = ref(true)
const saving = ref(false)
const editName = ref(false)
const editCurrency = ref(false)
const inviteEmail = ref('')
const showDisconnectDialog = ref(false)

const profile = reactive({
  display_name: '',
  currency: defaultCurrency.value,
})

const selectedCurrencyLabel = computed(() => {
  const c = currencies.value.find((c) => c.value === profile.currency)
  return c ? c.label : defaultCurrency.value
})

const localeLabel = computed(() => {
  const map: Record<string, string> = { id: t('settings.locale_id'), en: t('settings.locale_en') }
  return map[locale.value] ?? t('settings.locale_id')
})

const cycleLanguage = async () => {
  const locales = ['id', 'en']
  const idx = locales.indexOf(locale.value)
  await setLocale(locales[(idx + 1) % locales.length] || 'id')
}

const themeLabel = computed(() => {
  const map: Record<string, string> = {
    light: t('theme.light'),
    dark: t('theme.dark'),
    system: t('theme.system'),
  }
  return map[colorMode.preference] ?? t('theme.system')
})

const cycleTheme = () => {
  const modes = ['system', 'light', 'dark']
  const idx = modes.indexOf(colorMode.preference)
  colorMode.preference = modes[(idx + 1) % modes.length] || 'system'
}

onMounted(async () => {
  await getSession()
  if (!user.value) {
    return
  }

  const { data } = await supabase
    .from('profiles')
    .select('display_name, currency')
    .eq('id', user.value.id)
    .single()

  if (data) {
    profile.display_name = data.display_name ?? ''
    profile.currency = data.currency ?? defaultCurrency.value
  }
  loading.value = false

  // Fetch partner data
  await Promise.all([fetchPartner(), fetchInvitations()])
})

const saveProfile = async () => {
  if (!user.value) {
    return
  }
  saving.value = true

  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: profile.display_name,
      currency: profile.currency,
    })
    .eq('id', user.value.id)

  if (!error) {
    toast.success(t('settings.toast_saved'))
    queryClient.invalidateQueries({ queryKey: ['myProfile'] })
    loadCurrency()
  } else {
    toast.error(t('settings.toast_save_error'))
  }
  saving.value = false
  editName.value = false
}

const selectCurrency = async (value: string) => {
  profile.currency = value
  editCurrency.value = false
  if (!user.value) {
    return
  }

  const { error } = await supabase
    .from('profiles')
    .update({ currency: value })
    .eq('id', user.value.id)

  if (!error) {
    toast.success(t('settings.toast_currency_updated'))
    loadCurrency()
  } else {
    toast.error(t('settings.toast_currency_error'))
  }
}

const { exportAllData, exporting } = useExport()
const exportLabel = computed(() =>
  exporting.value ? t('settings.exporting') : t('settings.export'),
)
const exportData = () => {
  exportAllData()
}

const onSignOut = async () => {
  await signOut()
}

// === Couple handlers ===
const onSendInvite = async () => {
  if (!inviteEmail.value) {
    return
  }
  const { error } = await sendInvite(inviteEmail.value)
  if (!error) {
    inviteEmail.value = ''
  }
}

const onAcceptInvite = async (inv: CoupleInvitation) => {
  await acceptInvite(inv.id)
}

const onRejectInvite = async (inv: CoupleInvitation) => {
  await rejectInvite(inv.id)
}

const onCancelInvite = async (inv: CoupleInvitation) => {
  await cancelInvite(inv.id)
}

const onConfirmDisconnect = async () => {
  showDisconnectDialog.value = false
  await disconnectPartner()
}
</script>
