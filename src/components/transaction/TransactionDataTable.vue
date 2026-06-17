<template>
  <div>
    <Table>
      <TableHeader>
        <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
          <TableHead
            v-for="header in headerGroup.headers"
            :key="header.id"
            :style="{ width: header.getSize() !== 150 ? header.getSize() + 'px' : undefined }"
            class="px-0"
            :class="header.column.columnDef.meta?.headerClass"
          >
            <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow
          v-for="row in table.getRowModel().rows"
          :key="row.id"
          :data-state="row.getIsSelected() ? 'selected' : undefined"
          class="cursor-pointer hover:bg-muted/30 transition-colors"
          @click="emit('view', row.original.id)"
        >
          <TableCell
            v-for="cell in row.getVisibleCells()"
            :key="cell.id"
            :style="{ width: cell.column.getSize() !== 150 ? cell.column.getSize() + 'px' : undefined }"
            class="px-0"
            :class="cell.column.columnDef.meta?.cellClass"
          >
            <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>

    <div class="flex items-center justify-center border-t border-border/50 px-4 py-4 md:px-6">
      <Pagination
        v-if="totalPages > 1"
        :total="totalCount"
        :items-per-page="pageSize"
        :page="currentPage"
        :sibling-count="1"
        :show-edges="true"
        @update:page="emit('page', $event)"
      >
        <PaginationFirst />
        <PaginationPrev />
        <PaginationContent v-slot="{ items }">
          <template v-for="item in items" :key="item.type === 'page' ? `p-${item.value}` : `e-${item.type}`">
            <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === currentPage">
              <span class="text-xs font-bold">{{ item.value }}</span>
            </PaginationItem>
            <PaginationEllipsis v-else />
          </template>
        </PaginationContent>
        <PaginationNext />
        <PaginationLast />
      </Pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Table as VueTable } from '@tanstack/vue-table'
import { FlexRender } from '@tanstack/vue-table'
import type { Transaction } from '@/types'

const emit = defineEmits<{
  page: [page: number]
  view: [id: string]
}>()

defineProps<{
  table: VueTable<Transaction>
  totalPages: number
  totalCount: number
  pageSize: number
  currentPage: number
}>()
</script>
