<script setup lang="ts">
defineOptions({
  name: 'LoginPage',
})
const router = useRouter()
onMounted(() => {
  router.replace('/auth/login')
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-background">
    <div class="animate-pulse text-sm text-muted-foreground">{{ $t('auth.redirecting') }}</div>
  </div>
</template>
