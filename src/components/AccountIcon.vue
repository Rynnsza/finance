<script setup lang="ts">
defineOptions({ name: 'AccountIcon' })
import { Icon as IconifyIcon } from '@iconify/vue'

const props = defineProps<{
  icon: string
  type?: string // account type: bank, e-wallet, etc.
  size?: number | string
  color?: string
}>()

const isIconify = computed(() => props.icon?.includes(':'))
const imageError = ref(false)

const localIconPath = computed(() => {
  if (!props.icon || isIconify.value) return null
  const folder = props.type === 'bank' ? 'bank' : 'e-wallet'
  return `/accounts/${folder}/${props.icon}.svg`
})

const brandColors: Record<string, { bg: string; text: string; label: string }> = {
  // Banks
  bca: { bg: '#005dab', text: '#ffffff', label: 'BCA' },
  mandiri: { bg: '#00467f', text: '#ffcc00', label: 'M' },
  bri: { bg: '#00529b', text: '#ffffff', label: 'BRI' },
  bni: { bg: '#f15a22', text: '#ffffff', label: 'BNI' },
  bsi: { bg: '#006a67', text: '#ffffff', label: 'BSI' },
  jago: { bg: '#ff7a00', text: '#ffffff', label: 'J' },
  seabank: { bg: '#ff5722', text: '#ffffff', label: 'Sea' },

  // E-Wallets
  gopay: { bg: '#00aed6', text: '#ffffff', label: 'GP' },
  ovo: { bg: '#4c2a86', text: '#ffffff', label: 'OVO' },
  dana: { bg: '#008fe5', text: '#ffffff', label: 'D' },
  shopeepay: { bg: '#ee4d2d', text: '#ffffff', label: 'SP' },
  linkaja: { bg: '#e02027', text: '#ffffff', label: 'LA' },
  isaku: { bg: '#ffcc00', text: '#005dab', label: 'iS' },
}

const brandInfo = computed(() => brandColors[props.icon] || null)

watch(
  () => props.icon,
  () => {
    imageError.value = false
  },
)

const handleImageError = () => {
  imageError.value = true
}
</script>

<template>
  <div
    class="flex items-center justify-center overflow-hidden shrink-0"
    :style="{ width: (Number(size) || 24) + 'px', height: (Number(size) || 24) + 'px' }"
  >
    <!-- Iconify icon -->
    <IconifyIcon
      v-if="isIconify && icon"
      :icon="icon"
      :width="size"
      :height="size"
      class="icon-component"
      :class="!color && 'text-white dark:text-zinc-950'"
      :style="{ color: color }"
    />

    <!-- Local brand PNG with fallback -->
    <template v-else-if="localIconPath">
      <img
        v-if="!imageError"
        :src="localIconPath"
        class="size-full object-contain"
        :alt="icon"
        @error="handleImageError"
      />

      <!-- Stylized SVG Placeholder -->
      <div
        v-else-if="brandInfo"
        class="flex size-full items-center justify-center rounded-lg font-black tracking-tighter shadow-inner"
        :style="{
          backgroundColor: brandInfo.bg,
          color: brandInfo.text,
          fontSize: Number(size) * 0.4 + 'px',
        }"
      >
        {{ brandInfo.label }}
      </div>

      <!-- Generic Fallback -->
      <div
        v-else
        class="flex size-full items-center justify-center rounded-lg"
      >
        <AppIcon
          :name="type === 'bank' ? 'hugeicons:bank' : 'hugeicons:wallet-03'"
          :size="Number(size) * 0.6"
          class="text-white/60 dark:text-zinc-950/60"
        />
      </div>
    </template>

    <!-- Fallback colored box -->
    <div
      v-else
      class="rounded-lg shadow-inner border border-white/10 dark:border-black/10"
      :style="{ backgroundColor: color || '#6b7280', width: '100%', height: '100%' }"
    />
  </div>
</template>

<style scoped>
.icon-component {
  display: inline-block;
  vertical-align: middle;
}
</style>
