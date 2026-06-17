<template>
  <section>
    <h3
      class="mb-4 px-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground/90"
    >
      {{ $t('settings.data') }}
    </h3>
    <div
      class="overflow-hidden rounded-4xl border border-border/50 bg-card shadow-sm transition-all hover:shadow-md"
    >
      <SettingsItem
        icon="download"
        :label="$t('settings.export')"
        :value="exportLabel"
        @click="$emit('exportData')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
defineOptions({
  name: 'ExportSettings',
})

defineProps<{
  exportLabel: string
}>()

defineEmits<{
  exportData: []
}>()
</script>
