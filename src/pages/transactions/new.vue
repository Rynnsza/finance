<template>
  <TransactionForm @saved="onSaved" @cancel="router.push('/transactions')" />
</template>

<script setup lang="ts">
defineOptions({
  name: 'PagesTransactionsNew',
})
const router = useRouter()
const { fetchCategories } = useCategories()

onMounted(async () => {
  await fetchCategories()
})

const onSaved = () => {
  router.push('/transactions')
}
</script>
