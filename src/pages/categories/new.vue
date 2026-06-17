<template>
  <div class="mx-auto max-w-2xl space-y-8 pb-12 pt-4">
    <div>
      <Button variant="ghost" size="sm" class="mb-4 rounded-xl" @click="router.push('/categories')">
        <AppIcon name="hugeicons:arrow-left-01" :size="16" class="mr-1" />
        {{ $t('common.back') }}
      </Button>
      <h1 class="text-3xl font-black tracking-tighter text-foreground">
        {{ $t('category_form.title_new') }}
      </h1>
      <p class="mt-1 font-medium text-muted-foreground">{{ $t('categories.subtitle') }}</p>
    </div>

    <form
      class="space-y-6 rounded-3xl border border-border/50 bg-card/20 p-6 backdrop-blur-sm"
      @submit.prevent="onSubmit"
    >
      <div class="space-y-2">
        <Label for="name">{{ $t('category_form.name') }}</Label>
        <Input
          id="name"
          v-model="form.name"
          :placeholder="$t('category_form.name_placeholder')"
          required
        />
      </div>

      <div class="space-y-2">
        <Label for="type">{{ $t('category_form.type') }}</Label>
        <Select v-model="form.type">
          <SelectTrigger>
            <SelectValue :placeholder="$t('category_form.select_type')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">{{ $t('category_form.income') }}</SelectItem>
            <SelectItem value="expense">{{ $t('category_form.expense') }}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="space-y-2">
        <Label>{{ $t('category_form.color') }}</Label>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="color in colorOptions"
            :key="color"
            variant="outline"
            class="size-8 rounded-full p-0"
            :class="form.color === color && 'scale-110 ring-2 ring-foreground'"
            :style="{ backgroundColor: color }"
            @click="form.color = color"
          />
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" @click="router.push('/categories')">
          {{ $t('category_form.cancel') }}
        </Button>
        <Button type="submit" :disabled="!form.name || !form.type">
          {{ $t('category_form.save') }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesCategoriesNew',
})
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CategoryInsert, TransactionType } from '@/types'

const router = useRouter()
const { addCategory } = useCategories()

const colorOptions = [
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#ec4899',
  '#ef4444',
  '#a855f7',
  '#14b8a6',
  '#6b7280',
  '#eab308',
  '#f43f5e',
]

const form = reactive({
  name: '',
  type: 'expense' as TransactionType,
  icon: 'hugeicons:wallet-01',
  color: '#3b82f6',
})

const onSubmit = async () => {
  const result = await addCategory({
    name: form.name,
    type: form.type,
    icon: form.icon,
    color: form.color,
  } as CategoryInsert)
  if (!result?.error) {
    router.push('/categories')
  }
}
</script>
