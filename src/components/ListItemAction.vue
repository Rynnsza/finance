<script setup lang="ts">
import { Button } from '@/components/ui/button'

defineProps<{
  showEdit?: boolean
  showDelete?: boolean
}>()

defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="flex gap-1">
    <Button
      v-if="showEdit !== false"
      variant="ghost"
      size="icon"
      class="size-9 rounded-xl hover:bg-muted"
      @click="$emit('edit')"
    >
      <AppIcon name="hugeicons:pencil-edit-01" :size="16" class="text-muted-foreground" />
    </Button>
    <Button
      v-if="showDelete !== false"
      variant="ghost"
      size="icon"
      class="size-9 rounded-xl hover:bg-rose-500/10 hover:text-rose-500"
      @click="$emit('delete')"
    >
      <AppIcon name="hugeicons:delete-01" :size="16" />
    </Button>
  </div>
</template>
