<template>
  <div class="flex flex-wrap items-center gap-3 border-b border-border/50 px-4 py-3 md:px-6">
    <Select :model-value="categoryFilter" @update:model-value="emit('update:categoryFilter', String($event))">
      <SelectTrigger class="h-8 w-44 rounded-xl text-xs font-medium">
        <SelectValue :placeholder="$t('transactions.all_categories')" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">
          <span class="text-muted-foreground">{{ $t('transactions.all_categories') }}</span>
        </SelectItem>

        <SelectGroup>
          <SelectLabel class="text-[11px] font-bold text-emerald-600 tracking-wider uppercase px-2 py-1.5">
            {{ $t('transactions.income') }}
          </SelectLabel>
          <SelectItem v-for="cat in incomeCategories" :key="cat.id" :value="cat.id" class="w-full">
            <div class="flex w-full items-center gap-2">
              <div class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: cat.color || undefined }" />
              <span class="truncate">{{ cat.name }}</span>
              <span class="ml-auto text-xs font-bold text-muted-foreground/50">{{ categoryCounts[cat.id] || 0 }}</span>
            </div>
          </SelectItem>
        </SelectGroup>

        <SelectSeparator class="mx-2 my-1" />

        <SelectGroup>
          <SelectLabel class="text-[11px] font-bold text-rose-600 tracking-wider uppercase px-2 py-1.5">
            {{ $t('transactions.expense') }}
          </SelectLabel>
          <SelectItem v-for="cat in expenseCategories" :key="cat.id" :value="cat.id" class="w-full">
            <div class="flex w-full items-center gap-2">
              <div class="size-2.5 shrink-0 rounded-full" :style="{ backgroundColor: cat.color || undefined }" />
              <span class="truncate">{{ cat.name }}</span>
              <span class="ml-auto text-xs font-bold text-muted-foreground/50">{{ categoryCounts[cat.id] || 0 }}</span>
            </div>
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <Select v-if="isPartnered" :model-value="ownerFilter" @update:model-value="emit('update:ownerFilter', $event as OwnerFilter)">
      <SelectTrigger class="h-8 w-fit min-w-[100px] rounded-xl text-xs font-medium">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">{{ $t('transactions.owner_filter_all') }}</SelectItem>
        <SelectItem value="mine">
          <div class="flex items-center gap-2">
            <Avatar class="size-5">
              <AvatarImage :src="userAvatarUrl" />
              <AvatarFallback class="text-[9px]">{{ userInitial }}</AvatarFallback>
            </Avatar>
            {{ $t('transactions.owner_filter_mine') }}
          </div>
        </SelectItem>
        <SelectItem value="partner">
          <div class="flex items-center gap-2">
            <Avatar class="size-5">
              <AvatarImage :src="partnerAvatarUrl" />
              <AvatarFallback class="text-[9px]">{{ partnerInitial }}</AvatarFallback>
            </Avatar>
            {{ partnerDisplayName || $t('transactions.owner_filter_partner') }}
          </div>
        </SelectItem>
      </SelectContent>
    </Select>

    <DateRangePicker :model-value="dateRange" @update:model-value="emit('update:dateRange', $event)" />
  </div>
</template>

<script setup lang="ts">
import type { DateRange } from 'reka-ui'
import type { Category } from '@/types'
import type { OwnerFilter } from '@/composables/useTransactions'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

defineProps<{
  categoryFilter: string
  ownerFilter: OwnerFilter
  dateRange: DateRange
  incomeCategories: Category[]
  expenseCategories: Category[]
  categoryCounts: Record<string, number>
  isPartnered: boolean
  userAvatarUrl: string
  userInitial: string
  partnerAvatarUrl: string
  partnerInitial: string
  partnerDisplayName?: string | null
}>()

const emit = defineEmits<{
  'update:categoryFilter': [value: string]
  'update:ownerFilter': [value: OwnerFilter]
  'update:dateRange': [value: DateRange]
}>()
</script>
