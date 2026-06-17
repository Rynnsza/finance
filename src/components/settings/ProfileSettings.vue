<template>
  <section
    class="relative overflow-hidden rounded-4xl border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-md md:p-8"
  >
    <div class="absolute -right-12 -top-12 size-48 rounded-full bg-primary/5 blur-3xl" />

    <div class="relative flex flex-col items-center gap-6 md:flex-row md:gap-8">
      <Avatar class="size-20 border-2 border-background shadow-xl md:size-24">
        <AvatarImage
          v-if="user?.user_metadata?.avatar_url"
          :src="user.user_metadata.avatar_url"
          :alt="user?.user_metadata?.full_name"
        />
        <AvatarFallback class="bg-primary/10 text-2xl font-black text-primary md:text-3xl">
          {{ (profile.display_name || user?.user_metadata?.full_name || '?').charAt(0) }}
        </AvatarFallback>
      </Avatar>

      <div class="min-w-0 flex-1 text-center md:text-left">
        <h2 class="text-2xl font-black tracking-tight text-foreground md:text-3xl truncate">
          {{ profile.display_name || user?.user_metadata?.full_name }}
        </h2>
        <p class="mt-1 text-sm font-medium text-muted-foreground truncate">
          {{ user?.email }}
        </p>
        <div class="mt-4 flex flex-wrap justify-center gap-2 md:justify-start">
          <span
            class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-primary"
          >
            {{ isPartnered ? $t('settings.couple_mode') : $t('settings.personal_mode') }}
          </span>
          <span
            v-if="user?.app_metadata?.provider"
            class="inline-flex items-center rounded-full bg-muted px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground"
          >
            {{ user.app_metadata.provider }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ProfileSettings',
})

defineProps<{
  profile: { display_name: string; currency: string }
  user: any
  isPartnered: boolean
}>()
</script>
