<script setup lang="ts">
import { ref, watch, nextTick, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCamera } from '@/composables/useCamera'
import { useToast } from '@/composables/useToast'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

defineOptions({
  name: 'CameraCapture',
})

const emit = defineEmits<{
  captured: [file: File]
  close: []
}>()

const { t } = useI18n()
const { toast } = useToast()

const {
  isActive,
  stream,
  error: cameraError,
  hasCameraSupport,
  startCamera,
  stopCamera,
  captureImage,
  switchCamera,
  setVideoElement,
  checkPermission,
  permissionState,
  clearError,
} = useCamera()

const open = defineModel<boolean>('open', { required: true })

const videoRef = ref<HTMLVideoElement | null>(null)
const photoCaptured = ref(false)
const previewUrl = ref<string | null>(null)
const capturedBlob = ref<Blob | null>(null)
const flashVisible = ref(false)
const videoReady = ref(false)
const cameraStarted = ref(false)
const cameraStarting = ref(false)
const cameraFailed = ref(false)

let flashTimer: ReturnType<typeof setTimeout> | undefined
let watchCancelled = false

/*
 * UX State Machine
 *
 * Dialog opens -> show "Start Camera" button.
 *   No proactive permission check - let getUserMedia trigger the browser dialog.
 *
 * User taps "Mulai Kamera" -> startCamera()
 *   SUCCESS -> live preview -> capture -> preview -> confirm
 *   ERROR   -> error overlay + call checkPermission() for diagnostics
 *              - "Coba Lagi" button
 *              - "Upload dari Galeri" button
 *
 * User changes settings & comes back -> tap "Coba Lagi"
 *   -> startCamera() again
 */

/** Open dialog - do NOT check permission proactively */
watch(open, async (val) => {
  watchCancelled = false
  if (val) {
    photoCaptured.value = false
    previewUrl.value = null
    capturedBlob.value = null
    videoReady.value = false
    cameraStarted.value = false
    cameraStarting.value = false
    cameraFailed.value = false
    clearError()

    await nextTick()

    // NOTE: We do NOT call checkPermission() here.
    // On some Android Chrome versions, permissions.query({ name: 'camera' })
    // returns 'denied' even when the user has never been asked.
    // Calling it before getUserMedia would show a bogus "blocked" screen.
    // Instead, ALWAYS show the "Start Camera" button and let the browser
    // dialog appear when getUserMedia is called from a user gesture.
  } else {
    watchCancelled = true
    stopCamera()
    setVideoElement(null)
  }
})

/** Handle video element availability (which might be delayed due to v-if/v-else-if) */
watch(videoRef, (el) => {
  if (el) {
    setVideoElement(el)
    // If stream is already active but wasn't linked because el was null
    if (isActive.value && stream.value) {
      el.srcObject = stream.value
      el.play().catch(() => {})
    }
  }
})

/** Start camera from user click handler (preserves transient activation) */
async function startCameraClick() {
  if (cameraStarting.value || cameraStarted.value) return

  clearError()
  cameraFailed.value = false
  cameraStarting.value = true
  cameraStarted.value = true

  await startCamera()

  cameraStarting.value = false

  // If camera failed, check permission BEFORE showing error overlay
  // so the correct message (blocked vs denied) appears immediately
  if (cameraError.value) {
    await checkPermission()
    cameraFailed.value = true
  }
}

/** Retry after an error */
async function retryCamera() {
  clearError()
  cameraFailed.value = false
  cameraStarted.value = true
  cameraStarting.value = true

  await startCamera()

  cameraStarting.value = false

  if (cameraError.value) {
    await checkPermission()
    cameraFailed.value = true
  }
}

/** Whether permission is permanently denied (for error messaging) */
const isPermissionPermanentlyDenied = computed(() => permissionState.value === 'denied')

/** Capture a photo from the video stream */
async function capture() {
  if (!isActive.value) return

  try {
    const blob = await captureImage()
    if (watchCancelled) return
    capturedBlob.value = blob
    previewUrl.value = URL.createObjectURL(blob)
    photoCaptured.value = true

    // Flash effect
    flashVisible.value = true
    flashTimer = setTimeout(() => {
      flashVisible.value = false
      flashTimer = undefined
    }, 200)
  } catch (err) {
    console.warn('[CameraCapture] capture failed:', err)
    toast.error(t('transaction_form.scan_error'))
  }
}

onUnmounted(() => {
  if (flashTimer !== undefined) clearTimeout(flashTimer)
})

/** Revoke the preview blob URL if one exists */
function revokePreview() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
}

/** Retake - go back to live view */
function retakePhoto() {
  revokePreview()
  photoCaptured.value = false
  previewUrl.value = null
  capturedBlob.value = null
}

/** Confirm and emit the captured file */
function confirm() {
  if (!capturedBlob.value) return

  const file = new File([capturedBlob.value], 'receipt.jpg', {
    type: 'image/jpeg',
  })
  revokePreview()
  emit('captured', file)
  open.value = false
}

/** Close handler */
function handleClose() {
  revokePreview()
  open.value = false
  emit('close')
}

// Gallery fallback

const galleryInputRef = ref<HTMLInputElement | null>(null)

function openGallery() {
  galleryInputRef.value?.click()
}

function onGalleryFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  // Reset so the same file can be selected again
  input.value = ''

  // Emit the file directly and close the camera dialog
  emit('captured', file)
  open.value = false
}
</script>

<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogTitle class="sr-only">{{ t('transaction_form.scan_receipt') }}</DialogTitle>
    <DialogContent
      class="sm:max-w-lg p-0 overflow-hidden rounded-3xl border-border/50"
      :show-close-button="false"
    >
      <!-- Hidden file input for gallery fallback -->
      <input
        ref="galleryInputRef"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="onGalleryFile"
      />

      <!-- UNSUPPORTED: no camera API on this device -->
      <div
        v-if="!hasCameraSupport"
        class="flex flex-col items-center justify-center gap-5 p-12 text-center"
      >
        <div class="flex size-16 items-center justify-center rounded-2xl bg-muted">
          <AppIcon name="hugeicons:camera-off-01" :size="28" class="text-muted-foreground" />
        </div>
        <div class="space-y-1">
          <p class="font-bold text-foreground">
            {{ t('transaction_form.camera_error_unsupported') }}
          </p>
        </div>
        <div class="flex flex-col gap-2 w-full max-w-[200px]">
          <Button variant="secondary" class="rounded-2xl w-full" @click="openGallery">
            <AppIcon name="hugeicons:folder-01" :size="16" />
            {{ t('transaction_form.scan_gallery') }}
          </Button>
          <Button variant="ghost" class="rounded-2xl w-full" @click="handleClose">
            {{ t('transaction_form.cancel') }}
          </Button>
        </div>
      </div>

      <!-- START CAMERA: initial state for ALL users (never blocked at this point) -->
      <div
        v-else-if="!cameraStarted"
        class="flex flex-col items-center justify-center gap-5 p-12 text-center"
      >
        <div class="flex size-20 items-center justify-center rounded-3xl bg-primary/10">
          <AppIcon name="hugeicons:camera-01" :size="36" class="text-primary" />
        </div>
        <div class="space-y-1">
          <p class="text-lg font-black text-foreground">{{ t('transaction_form.camera_start') }}</p>
          <p class="text-sm font-medium text-muted-foreground max-w-xs">
            {{ t('transaction_form.camera_start_desc') }}
          </p>
        </div>
        <div class="flex flex-col gap-2 w-full max-w-[220px]">
          <Button
            class="h-12 rounded-2xl bg-primary px-10 font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 transition-all hover:bg-primary/90"
            :disabled="cameraStarting"
            @click="startCameraClick"
          >
            <div class="flex items-center gap-2">
              <AppIcon
                :name="cameraStarting ? 'hugeicons:loading-03' : 'hugeicons:camera-01'"
                :size="16"
                :class="cameraStarting ? 'animate-spin' : ''"
              />
              {{ t('transaction_form.camera_start') }}
            </div>
          </Button>
          <Button
            variant="ghost"
            class="rounded-2xl text-sm font-bold text-muted-foreground"
            @click="handleClose"
          >
            {{ t('transaction_form.cancel') }}
          </Button>
        </div>
      </div>

      <!-- Camera live preview (or error overlay) -->
      <div v-else-if="!photoCaptured" class="relative aspect-[4/3] w-full bg-black">
        <!-- Video element -->
        <video
          ref="videoRef"
          autoplay
          playsinline
          muted
          class="h-full w-full object-cover"
          :class="{ hidden: !isActive || cameraFailed }"
          @canplay="videoReady = true"
        />

        <!-- Loading state (camera is starting up, first attempt) -->
        <div
          v-if="cameraStarting"
          class="absolute inset-0 flex items-center justify-center bg-black/60"
        >
          <AppIcon name="hugeicons:loading-03" :size="32" class="animate-spin text-white" />
        </div>

        <!-- Camera error overlay - shown when getUserMedia failed -->
        <div
          v-else-if="cameraFailed || cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 p-8 text-center"
        >
          <AppIcon name="hugeicons:camera-off-01" :size="32" class="text-white/60" />

          <!-- Permission permanently denied -> show settings instructions -->
          <div v-if="isPermissionPermanentlyDenied" class="space-y-2">
            <p class="text-lg font-black text-white">
              {{ t('transaction_form.camera_permission_denied_title') }}
            </p>
            <p class="text-sm font-medium text-white/70 leading-relaxed max-w-xs">
              {{ t('transaction_form.camera_permission_denied_desc') }}
            </p>
          </div>

          <!-- Generic / other errors -->
          <p v-else class="font-bold text-white">
            {{ t('transaction_form.' + (cameraError || 'camera_error_generic')) }}
          </p>

          <div class="flex flex-col gap-2 w-full max-w-[200px]">
            <Button variant="secondary" class="rounded-2xl w-full" @click="retryCamera">
              <AppIcon name="hugeicons:refresh-01" :size="16" />
              {{ t('transaction_form.camera_retry') }}
            </Button>
            <Button
              variant="ghost"
              class="rounded-2xl w-full text-white/70 hover:text-white"
              @click="openGallery"
            >
              <AppIcon name="hugeicons:folder-01" :size="16" />
              {{ t('transaction_form.scan_gallery') }}
            </Button>
          </div>
        </div>

        <!-- Flash overlay -->
        <div
          v-if="flashVisible"
          class="pointer-events-none absolute inset-0 bg-white/80 transition-opacity duration-150"
        />

        <!-- Top bar (only visible when camera is active) -->
        <template v-if="isActive && !cameraFailed">
          <div class="absolute inset-x-0 top-0 flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon-sm"
              class="rounded-full bg-black/40 text-white hover:bg-black/60"
              @click="handleClose"
            >
              <AppIcon name="hugeicons:cancel-01" :size="20" />
            </Button>
            <span
              class="rounded-full bg-black/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white"
            >
              {{ t('transaction_form.scan_receipt') }}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              class="rounded-full bg-black/40 text-white hover:bg-black/60"
              :disabled="!videoReady"
              @click="switchCamera"
            >
              <AppIcon name="hugeicons:flip-camera" :size="20" />
            </Button>
          </div>

          <!-- Bottom capture button -->
          <div class="absolute inset-x-0 bottom-0 flex items-center justify-center p-6">
            <button
              class="flex size-16 items-center justify-center rounded-full border-4 border-white/80 bg-white/20 backdrop-blur-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-40"
              :disabled="!videoReady"
              @click="capture"
            >
              <div class="size-12 rounded-full bg-white" />
            </button>
          </div>
        </template>
      </div>

      <!-- Captured photo preview -->
      <div v-else-if="previewUrl" class="relative aspect-[4/3] w-full bg-black">
        <img :src="previewUrl" alt="Captured receipt" class="h-full w-full object-contain" />

        <!-- Top bar in preview -->
        <div class="absolute inset-x-0 top-0 flex items-center justify-between p-4">
          <Button
            variant="ghost"
            size="icon-sm"
            class="rounded-full bg-black/40 text-white hover:bg-black/60"
            @click="handleClose"
          >
            <AppIcon name="hugeicons:cancel-01" :size="20" />
          </Button>
          <span
            class="rounded-full bg-black/40 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white"
          >
            {{ t('transaction_form.camera_preview') }}
          </span>
          <div class="size-9" />
        </div>

        <!-- Bottom action buttons -->
        <div class="absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 p-6">
          <Button
            variant="ghost"
            class="rounded-2xl bg-black/40 px-6 font-black uppercase tracking-widest text-white backdrop-blur-sm hover:bg-black/60"
            @click="retakePhoto"
          >
            <div class="flex items-center gap-2">
              <AppIcon name="hugeicons:refresh-01" :size="16" />
              {{ t('transaction_form.camera_retake') }}
            </div>
          </Button>
          <Button
            class="rounded-2xl bg-primary px-8 font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 hover:bg-primary/90"
            @click="confirm"
          >
            <div class="flex items-center gap-2">
              <AppIcon name="hugeicons:tick-01" :size="16" />
              {{ t('transaction_form.camera_use') }}
            </div>
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
