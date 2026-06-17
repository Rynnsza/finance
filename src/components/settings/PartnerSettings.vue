<template>
  <section>
    <h3
      class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
    >
      {{ $t('sidebar.partner') }}
    </h3>

    <!-- LOADING: PASANGAN -->
    <div
      v-if="partnerLoading"
      class="flex w-full items-center justify-center rounded-4xl border border-border/50 bg-card p-10 shadow-sm"
    >
      <div class="flex flex-col items-center gap-3">
        <div
          class="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"
        />
        <span class="text-xs font-bold uppercase tracking-tight text-muted-foreground">{{
          $t('settings.loading_partner')
        }}</span>
      </div>
    </div>

    <!-- NOT CONNECTED -->
    <div v-else-if="!isPartnered" class="space-y-4">
      <!-- Kirim Undangan -->
      <div
        class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md"
      >
        <div class="mb-6 flex items-center gap-4">
          <div
            class="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm"
          >
            <AppIcon name="hugeicons:mail-send-01" :size="24" />
          </div>
          <div>
            <p class="text-sm font-black text-foreground">
              {{ $t('settings.invite_partner_title') }}
            </p>
            <p class="text-xs font-medium text-muted-foreground">
              {{ $t('settings.invite_partner_desc') }}
            </p>
          </div>
        </div>
        <div class="flex flex-col gap-3 sm:flex-row">
          <Input
            :model-value="inviteEmail"
            @update:model-value="$emit('update:inviteEmail', $event as string)"
            type="email"
            :placeholder="$t('settings.invite_email_placeholder')"
            class="h-11 flex-1 rounded-2xl bg-muted/30 border-border/50 focus:border-primary/50"
            @keyup.enter="$emit('sendInvite')"
          />
          <Button
            size="lg"
            :disabled="partnerSending || !inviteEmail"
            class="h-11 rounded-2xl bg-linear-to-b from-primary to-primary/90 font-bold text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            @click="$emit('sendInvite')"
          >
            {{ partnerSending ? $t('settings.inviting') : $t('settings.invite_button') }}
          </Button>
        </div>
      </div>

      <!-- Undangan Terkirim -->
      <div
        v-if="sentInvitations.length > 0"
        class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm"
      >
        <p
          class="mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
        >
          {{ $t('settings.sent_invitations_title') }}
        </p>
        <div class="space-y-3">
          <div
            v-for="inv in sentInvitations"
            :key="inv.id"
            class="flex items-center justify-between rounded-3xl border border-border/30 bg-muted/20 px-4 py-3"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-muted/50"
              >
                <AppIcon name="hugeicons:mail-01" :size="18" class="text-muted-foreground" />
              </div>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-foreground">
                  {{ inv.recipient_email }}
                </p>
                <p class="text-[9px] font-black uppercase tracking-widest text-primary">
                  {{ inv.status }}
                </p>
              </div>
            </div>
            <Button
              v-if="inv.status === 'pending'"
              variant="ghost"
              size="sm"
              class="rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted"
              @click="$emit('cancelInvite', inv)"
            >
              {{ $t('settings.cancel_invite') }}
            </Button>
          </div>
        </div>
      </div>

      <!-- Undangan Masuk -->
      <div
        v-if="receivedInvitations.length > 0"
        class="rounded-4xl border border-border/50 bg-card p-6 shadow-sm"
      >
        <p
          class="mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
        >
          {{ $t('settings.received_invitations_title') }}
        </p>
        <div class="space-y-3">
          <div
            v-for="inv in receivedInvitations"
            :key="inv.id"
            class="flex items-center justify-between rounded-3xl border border-border/30 bg-muted/20 px-4 py-3"
          >
            <div class="flex min-w-0 items-center gap-3">
              <Avatar class="size-10 border-2 border-background shadow-sm">
                <AvatarImage
                  v-if="inv.sender?.avatar_url"
                  :src="inv.sender.avatar_url"
                  :alt="inv.sender.display_name || ''"
                />
                <AvatarFallback class="bg-primary/10 text-xs font-black text-primary">
                  {{ (inv.sender?.display_name || '?').charAt(0) }}
                </AvatarFallback>
              </Avatar>
              <div class="min-w-0">
                <p class="truncate text-sm font-bold text-foreground">
                  {{ inv.sender?.display_name || $t('settings.someone') }}
                </p>
                <p class="text-[10px] font-medium text-muted-foreground">
                  {{ $t('settings.invite_wants_to_connect') }}
                </p>
              </div>
            </div>
            <div class="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                class="rounded-xl font-bold text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
                @click="$emit('rejectInvite', inv)"
              >
                {{ $t('settings.reject') }}
              </Button>
              <Button
                size="sm"
                class="rounded-xl bg-primary px-4 font-bold text-white shadow-sm hover:bg-primary/90"
                @click="$emit('acceptInvite', inv)"
              >
                {{ $t('settings.accept') }}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- CONNECTED -->
    <div v-else class="space-y-4">
      <div
        class="relative overflow-hidden rounded-4xl border border-emerald-500/20 bg-emerald-500/[0.03] p-6 shadow-sm transition-all hover:bg-emerald-500/[0.05] md:p-8"
      >
        <div class="absolute -right-8 -top-8 size-32 rounded-full bg-emerald-500/10 blur-2xl" />
        <div class="relative flex items-center gap-6">
          <Avatar class="size-16 border-2 border-background shadow-xl">
            <AvatarImage
              v-if="partner?.avatar_url"
              :src="partner.avatar_url"
              :alt="partner.display_name || ''"
            />
            <AvatarFallback class="bg-emerald-500/10 text-xl font-black text-emerald-600 dark:text-emerald-400">
              {{ (partnerDisplayName || '?').charAt(0) }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0">
            <p class="truncate text-xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 md:text-2xl">
              {{ partnerDisplayName }}
            </p>
            <div class="mt-1 flex items-center gap-2">
              <div
                class="size-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
              />
              <p class="text-[10px] font-black uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70">
                {{ $t('settings.connected_status') }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="ghost"
        class="group w-full h-auto rounded-4xl border border-rose-500/20 bg-rose-500/[0.02] p-4 transition-all hover:bg-rose-500/5 hover:border-rose-500/40"
        @click="$emit('showDisconnect')"
      >
        <div class="flex w-full items-center justify-between">
          <div class="flex items-center gap-4">
            <div
              class="flex size-11 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 dark:text-rose-400 transition-transform duration-300 group-hover:scale-110"
            >
              <AppIcon name="hugeicons:unlink-01" :size="22" />
            </div>
            <div class="min-w-0 text-left">
              <p class="text-sm font-black text-rose-500 dark:text-rose-400 md:text-base">
                {{ $t('settings.disconnect_title') }}
              </p>
              <p class="text-[10px] font-bold uppercase tracking-tight text-rose-500/60 dark:text-rose-400/60">
                {{ $t('settings.disconnect_desc') }}
              </p>
            </div>
          </div>
          <AppIcon
            name="hugeicons:arrow-right-01"
            :size="20"
            class="shrink-0 text-rose-500/30 dark:text-rose-400/30 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-rose-500/60 dark:group-hover:text-rose-400/60"
          />
        </div>
      </Button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

defineOptions({
  name: 'PartnerSettings',
})

const props = defineProps<{
  partnerLoading: boolean
  isPartnered: boolean
  partnerSending: boolean
  inviteEmail: string
  sentInvitations: any[]
  receivedInvitations: any[]
  partner: any
  partnerDisplayName: string
}>()

defineEmits<{
  'update:inviteEmail': [value: string]
  sendInvite: []
  acceptInvite: [inv: any]
  rejectInvite: [inv: any]
  cancelInvite: [inv: any]
  showDisconnect: []
}>()
</script>
