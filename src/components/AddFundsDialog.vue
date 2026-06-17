<template>
  <BaseDialog
    :open="true"
    :title="$t('funds_form.title')"
    :description="$t('funds_form.subtitle', { name: goal.name })"
    size="sm"
    @update:open="$emit('close')"
  >
    <form class="space-y-4 pt-4" @submit.prevent="onSubmit">
      <div class="space-y-2">
        <Label for="amount">{{ $t('funds_form.amount') }}</Label>
        <CurrencyInput
          id="amount"
          v-model="rawAmount"
          :currency="defaultCurrency"
          placeholder="0"
          required
          auto-focus
        />
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" @click="$emit('close')">
          {{ $t('funds_form.cancel') }}
        </Button>
        <Button type="submit" :disabled="!rawAmount || Number(rawAmount) <= 0">
          {{ $t('funds_form.add') }}
        </Button>
      </div>
    </form>
  </BaseDialog>
</template>

<script setup lang="ts">
import type { Goal } from '@/types'

const props = defineProps<{
  goal: Goal
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const { addFunds } = useGoals()
const { defaultCurrency } = useCurrency()
const rawAmount = ref(0)

const onSubmit = async () => {
  const { error } = await addFunds(props.goal.id, Number(rawAmount.value))
  if (!error) {
    emit('saved')
  }
}
</script>
