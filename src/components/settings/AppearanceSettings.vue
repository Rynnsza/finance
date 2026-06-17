<template>
  <section>
    <h3
      class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
    >
      {{ $t('settings.preferences') }}
    </h3>
    <div
      class="overflow-hidden rounded-4xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
    >
      <SettingsItem
        icon="user"
        :label="$t('settings.display_name')"
        :value="profile.display_name || $t('settings.not_set')"
        @click="$emit('editName')"
      />
      <div class="mx-6 border-t border-border/40" />
      <SettingsItem
        icon="currency"
        :label="$t('settings.currency')"
        :value="selectedCurrencyLabel"
        @click="$emit('editCurrency')"
      />
      <div class="mx-6 border-t border-border/40" />
      <SettingsItem
        icon="palette"
        :label="$t('settings.theme')"
        :value="themeLabel"
        @click="$emit('cycleTheme')"
      />
      <div class="mx-6 border-t border-border/40" />
      <SettingsItem
        icon="language"
        :label="$t('settings.language')"
        :value="localeLabel"
        @click="$emit('cycleLanguage')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'AppearanceSettings',
})

defineProps<{
  profile: { display_name: string; currency: string }
  selectedCurrencyLabel: string
  themeLabel: string
  localeLabel: string
}>()

defineEmits<{
  editName: []
  editCurrency: []
  cycleTheme: []
  cycleLanguage: []
}>()
</script>
