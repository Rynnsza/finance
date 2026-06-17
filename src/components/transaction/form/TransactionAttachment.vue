<template>
  <div
    class="col-span-1 space-y-3 rounded-3xl border border-border/50 bg-card/20 p-4 md:p-5 shadow-sm transition-all hover:bg-card/30 md:col-span-2"
  >
    <Label
      class="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/70"
    >
      <AppIcon name="hugeicons:image-01" :size="12" />
      {{ $t('transaction_form.attachment') }}
    </Label>
    <p class="text-xs text-muted-foreground">{{ $t('transaction_form.attachment_desc') }}</p>

    <div
      v-if="imageUrl && !uploading"
      class="relative overflow-hidden rounded-2xl border border-border/50"
    >
      <img :src="imageUrl" alt="Transaction attachment" class="max-h-48 w-full object-cover" />
      <div class="absolute right-2 top-2 flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          class="h-8 rounded-xl px-3 text-xs font-bold shadow-sm backdrop-blur-sm"
          @click="attachmentInputRef?.click()"
        >
          {{ $t('transaction_form.attachment_change') }}
        </Button>
        <Button
          variant="destructive"
          size="sm"
          class="h-8 rounded-xl px-3 text-xs font-bold shadow-sm backdrop-blur-sm"
          @click="emit('remove')"
        >
          {{ $t('transaction_form.attachment_remove') }}
        </Button>
      </div>
    </div>

    <div v-else-if="!uploading" class="flex items-center gap-3">
      <input
        ref="attachmentInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        class="hidden"
        @change="onFileSelected"
      />
      <Button
        variant="outline"
        class="h-10 rounded-2xl border-dashed border-border/50 px-5 text-xs font-bold"
        @click="attachmentInputRef?.click()"
      >
        <AppIcon name="hugeicons:upload-01" :size="14" class="mr-1" />
        {{ $t('transaction_form.attachment_add') }}
      </Button>
    </div>

    <div v-else class="flex items-center gap-3 rounded-2xl bg-muted/30 px-4 py-3">
      <AppIcon name="hugeicons:loading-03" :size="18" class="animate-spin text-primary" />
      <span class="text-xs font-medium text-muted-foreground">
        {{ $t('transaction_form.attachment_uploading') }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  imageUrl: string | null
  uploading: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
  remove: []
}>()

const attachmentInputRef = ref<HTMLInputElement | null>(null)

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  emit('upload', file)
  if (attachmentInputRef.value) {
    attachmentInputRef.value.value = ''
  }
}
</script>
