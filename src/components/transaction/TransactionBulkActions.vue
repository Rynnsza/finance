<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-4 opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-4 opacity-0"
  >
    <div v-if="selectedCount > 0" class="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
      <div
        class="flex items-center gap-3 rounded-3xl border border-border/50 bg-card/95 px-5 py-3 shadow-2xl shadow-black/10 backdrop-blur-xl"
      >
        <span class="mr-2 whitespace-nowrap text-sm font-bold text-muted-foreground">
          {{ $t('transactions.bulk_selected', { count: selectedCount }) }}
        </span>

        <Button
          variant="outline"
          size="sm"
          class="h-9 rounded-2xl border-border/50 text-xs font-bold"
          @click="showCategoryDialog = true"
        >
          <AppIcon name="hugeicons:folder-01" :size="16" class="mr-1" />
          {{ $t('transactions.bulk_edit_category') }}
        </Button>

        <Button
          variant="outline"
          size="sm"
          class="h-9 rounded-2xl border-border/50 text-xs font-bold"
          @click="showAccountDialog = true"
        >
          <AppIcon name="hugeicons:bank" :size="16" class="mr-1" />
          {{ $t('transactions.bulk_move_account') }}
        </Button>

        <div class="mx-1 h-8 w-px bg-border/50" />

        <Button
          variant="destructive"
          size="sm"
          class="h-9 rounded-2xl text-xs font-bold"
          @click="showDeleteDialog = true"
        >
          <AppIcon name="hugeicons:delete-01" :size="16" class="mr-1" />
          {{ $t('transactions.bulk_delete') }}
        </Button>
      </div>
    </div>
  </Transition>

  <Dialog v-model:open="showCategoryDialog">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ $t('transactions.bulk_edit_category') }}</DialogTitle>
        <DialogDescription>
          {{ $t('transactions.bulk_selected', { count: selectedCount }) }}
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <CategoryPicker v-model="bulkCategoryId" :placeholder="$t('transactions.category')" />
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showCategoryDialog = false">
          {{ $t('common.cancel') }}
        </Button>
        <Button @click="applyCategory">
          {{ $t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <Dialog v-model:open="showAccountDialog">
    <DialogContent class="sm:max-w-sm">
      <DialogHeader>
        <DialogTitle>{{ $t('transactions.bulk_move_account') }}</DialogTitle>
        <DialogDescription>
          {{ $t('transactions.bulk_selected', { count: selectedCount }) }}
        </DialogDescription>
      </DialogHeader>
      <div class="py-4">
        <Select v-model="bulkAccountId">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="$t('transactions.all_accounts')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="acc in accounts" :key="acc.id" :value="acc.id" :text-value="acc.name">
              <div class="flex items-center gap-2">
                <div class="size-3 rounded-full" :style="{ backgroundColor: acc.color || undefined }" />
                {{ acc.name }}
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DialogFooter>
        <Button variant="outline" @click="showAccountDialog = false">
          {{ $t('common.cancel') }}
        </Button>
        <Button @click="applyAccount">
          {{ $t('common.save') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>

  <ConfirmDialog
    v-model:open="showDeleteDialog"
    :title="$t('transactions.bulk_confirm_delete', { count: selectedCount })"
    :description="$t('transactions.bulk_confirm_delete_desc')"
    :confirm-text="$t('transactions.bulk_delete')"
    variant="destructive"
    @confirm="emit('delete')"
  />
</template>

<script setup lang="ts">
import type { Account } from '@/types'
import ConfirmDialog from '@/components/ConfirmDialog.vue'
import AppIcon from '@/components/Icon.vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

defineProps<{
  selectedCount: number
  accounts: Account[]
}>()

const emit = defineEmits<{
  category: [categoryId: string]
  account: [accountId: string]
  delete: []
}>()

const showCategoryDialog = ref(false)
const showAccountDialog = ref(false)
const showDeleteDialog = ref(false)
const bulkCategoryId = ref('')
const bulkAccountId = ref('')

const applyCategory = () => {
  if (!bulkCategoryId.value) return
  emit('category', bulkCategoryId.value)
  showCategoryDialog.value = false
  bulkCategoryId.value = ''
}

const applyAccount = () => {
  if (!bulkAccountId.value) return
  emit('account', bulkAccountId.value)
  showAccountDialog.value = false
  bulkAccountId.value = ''
}

</script>
