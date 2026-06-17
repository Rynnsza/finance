<script setup lang="ts">
const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
  }>(),
  {
    title: '',
    description: '',
    confirmText: '',
    cancelText: '',
    variant: 'destructive',
  },
)

const displayTitle = computed(() => props.title || t('common.confirm'))
const displayDescription = computed(() => props.description || t('common.confirm_desc'))
const displayConfirmText = computed(() => props.confirmText || t('common.delete'))
const displayCancelText = computed(() => props.cancelText || t('common.cancel'))

const emit = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
}>()
</script>

<template>
  <AlertDialog :open="open" @update:open="emit('update:open', $event)">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ displayTitle }}</AlertDialogTitle>
        <AlertDialogDescription>{{ displayDescription }}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel @click="emit('update:open', false)">{{
          displayCancelText
        }}</AlertDialogCancel>
        <AlertDialogAction
          :class="
            variant === 'destructive' ? 'bg-destructive text-white hover:bg-destructive/90' : ''
          "
          @click="emit('confirm')"
        >
          {{ displayConfirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
