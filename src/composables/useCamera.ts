import { ref, type Ref, onUnmounted } from 'vue'

export type CameraPermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported' | 'checking'

export interface UseCameraReturn {
  /** Reactive video stream from camera */
  stream: Ref<MediaStream | null>
  /** Whether camera is currently active */
  isActive: Ref<boolean>
  /** Error message key if camera access fails */
  error: Ref<string | null>
  /** Current facing mode */
  facingMode: Ref<'environment' | 'user'>
  /** Whether the device likely has a camera API */
  hasCameraSupport: boolean
  /** Start the camera. facingMode overrides the current setting. */
  startCamera: (facingModeOverride?: 'environment' | 'user') => Promise<void>
  /** Stop the camera and release all tracks */
  stopCamera: () => void
  /** Capture a single frame as a JPEG Blob */
  captureImage: () => Promise<Blob>
  /** Toggle between front and rear camera */
  switchCamera: () => Promise<void>
  /** Register the <video> element for capture (set by the component) */
  setVideoElement: (el: HTMLVideoElement | null) => void
  /** Check permission status — only use AFTER camera has failed */
  checkPermission: () => Promise<CameraPermissionState>
  /** Current detected permission state (for error messaging) */
  permissionState: Ref<CameraPermissionState>
  /** Reset error state so the user can retry */
  clearError: () => void
}

/**
 * Helper to build progressively relaxed video constraints for Android
 * compatibility. Some devices fail with resolution constraints.
 */
function buildVideoConstraints(facingMode: 'environment' | 'user'): MediaTrackConstraints {
  return {
    facingMode,
    // Intentionally omit width/height — some Android Chrome versions
    // fail with even ideal resolution constraints on certain hardware.
    // The browser picks the best matching resolution automatically.
  }
}

/**
 * Camera composable using navigator.mediaDevices.getUserMedia.
 *
 * IMPORTANT DESIGN DECISION:
 * We do NOT use navigator.permissions.query() to gate the UI proactively.
 * On some Android Chrome versions, permissions.query({ name: 'camera' })
 * can return 'denied' even when the user has never been asked.
 * Instead, we ALWAYS show the "Start Camera" button first. Only after
 * getUserMedia() fails do we check permission state to show the right
 * error message.
 *
 * Constraint strategy for Android compatibility:
 * 1. Try with facingMode only (no resolution constraints)
 * 2. If OverconstrainedError, retry without facingMode
 * 3. All errors are caught and mapped to user-facing keys
 */
export function useCamera(): UseCameraReturn {
  const stream = ref<MediaStream | null>(null)
  const isActive = ref(false)
  const error = ref<string | null>(null)
  const facingMode = ref<'environment' | 'user'>('environment')
  const permissionState = ref<CameraPermissionState>('prompt')

  /** Check if the browser supports camera access */
  const hasCameraSupport = !!navigator.mediaDevices?.getUserMedia

  /** Internal reference to the video element for capture */
  let videoElement: HTMLVideoElement | null = null

  /** Reference to the PermissionStatus object so we can remove the listener on unmount */
  let permissionStatus: PermissionStatus | null = null

  /**
   * Helper: set srcObject and explicitly play the video.
   * On mobile Safari, `autoplay` alone doesn't work for MediaStream —
   * need an explicit `.play()` call.
   */
  function attachStream(el: HTMLVideoElement, mediaStream: MediaStream) {
    el.srcObject = mediaStream
    el.play().catch(() => {
      // Silently ignore — play() can reject if user hasn't interacted yet,
      // but the stream is still attached and will play once the browser allows it.
    })
  }

  /**
   * Register a video element so `captureImage` can draw from it.
   */
  function setVideoElement(el: HTMLVideoElement | null) {
    videoElement = el
    if (el && stream.value) {
      attachStream(el, stream.value)
    }
  }

  /**
   * Check camera permission status — only meaningful AFTER getUserMedia
   * has been called and failed with NotAllowedError.
   *
   * We keep this as a diagnostic tool for error messaging, NOT for UI gating.
   */
  async function checkPermission(): Promise<CameraPermissionState> {
    if (!navigator.permissions?.query) {
      permissionState.value = 'unsupported'
      return 'unsupported'
    }

    try {
      if (permissionStatus) {
        permissionStatus.onchange = null
      }

      const result = await navigator.permissions.query({ name: 'camera' as PermissionName })
      permissionStatus = result
      const state = result.state as CameraPermissionState
      permissionState.value = state

      result.onchange = () => {
        permissionState.value = result.state as CameraPermissionState
      }

      return state
    } catch {
      permissionState.value = 'unsupported'
      return 'unsupported'
    }
  }

  /**
   * Start the camera stream with constraint fallback for Android.
   *
   * Fallback chain:
   *   1. facingMode + no resolution constraints
   *   2. If OverconstrainedError → { video: true } (no facingMode)
   *   3. On any error → mapped to user-facing key
   */
  async function startCamera(facingModeOverride?: 'environment' | 'user'): Promise<void> {
    // Clean up any previous stream
    stopCamera()
    clearError()

    if (!navigator.mediaDevices?.getUserMedia) {
      error.value = 'camera_error_unsupported'
      return
    }

    // iOS standalone (PWA) mode — getUserMedia doesn't work on iOS < 16
    if (
      'standalone' in window.navigator &&
      (window.navigator as Navigator & { standalone: boolean }).standalone &&
      !/iphone os (1[6-9]|[2-9]\d)/i.test(navigator.userAgent)
    ) {
      error.value = 'camera_error_unsupported'
      return
    }

    if (facingModeOverride) {
      facingMode.value = facingModeOverride
    }

    // Attempt 1: with facingMode only (no resolution constraints)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: buildVideoConstraints(facingMode.value),
        audio: false,
      })

      stream.value = mediaStream
      isActive.value = true
      permissionState.value = 'granted'

      if (videoElement) {
        attachStream(videoElement, mediaStream)
      }
      return
    } catch (err: unknown) {
      // If OverconstrainedError, retry without facingMode
      if (err instanceof DOMException && err.name === 'OverconstrainedError') {
        console.warn(
          '[useCamera] OverconstrainedError with facingMode, retrying without facingMode',
        )
      } else {
        // Map other errors immediately, but still try fallback
        // Only NotAllowedError/NotFoundError are terminal — keep the first error
        // for all other errors we try the fallback
        const firstErrKey = getErrorMessage(err)

        // If it's a permanent error, don't bother with fallback
        if (
          firstErrKey === 'camera_error_not_allowed' ||
          firstErrKey === 'camera_error_not_found'
        ) {
          error.value = firstErrKey
          isActive.value = false
          return
        }

        if (firstErrKey !== 'camera_error_constraint') {
          // For NotReadableError or generic, still try fallback
          console.warn('[useCamera] First attempt failed, trying fallback:', err)
        }
      }

      // Attempt 2: simplest possible constraint — no facingMode, no resolution
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        })

        stream.value = fallbackStream
        isActive.value = true
        permissionState.value = 'granted'

        if (videoElement) {
          attachStream(videoElement, fallbackStream)
        }
        return
      } catch (fallbackErr: unknown) {
        // Both attempts failed — use the ORIGINAL error (more specific)
        // but if original was constraint and fallback was permission, use fallback
        const fallbackErrKey = getErrorMessage(fallbackErr)

        // If original was OverconstrainedError/constraint but fallback
        // gives us a different error, prefer the fallback error
        if (err instanceof DOMException && err.name === 'OverconstrainedError') {
          error.value = fallbackErrKey
        } else {
          error.value = getErrorMessage(err)
        }
        isActive.value = false
      }
    }
  }

  /**
   * Stop the camera and release all tracks.
   */
  function stopCamera(): void {
    if (stream.value) {
      stream.value.getTracks().forEach((track) => track.stop())
      stream.value = null
    }
    if (videoElement) {
      videoElement.srcObject = null
    }
    isActive.value = false
  }

  /**
   * Capture the current video frame as a JPEG Blob.
   */
  function captureImage(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const el = videoElement
      if (!el || !stream.value) {
        reject(new Error('Camera is not active'))
        return
      }

      if (el.videoWidth === 0 || el.videoHeight === 0) {
        reject(new Error('Video not ready — no frame available'))
        return
      }

      const canvas = document.createElement('canvas')
      canvas.width = el.videoWidth
      canvas.height = el.videoHeight
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('Canvas 2D context unavailable'))
        return
      }

      ctx.drawImage(el, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to encode image'))
            return
          }
          resolve(blob)
        },
        'image/jpeg',
        0.85,
      )
    })
  }

  /**
   * Toggle between front and rear camera.
   */
  async function switchCamera(): Promise<void> {
    const next = facingMode.value === 'environment' ? 'user' : 'environment'
    facingMode.value = next
    await startCamera(next)
  }

  /** Reset error state */
  function clearError(): void {
    error.value = null
  }

  /**
   * Map getUserMedia errors to user-facing keys.
   */
  function getErrorMessage(err: unknown): string {
    if (err instanceof DOMException) {
      switch (err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          // If we already know permission is permanently denied, use the
          // stronger "blocked" message with recovery instructions.
          if (permissionState.value === 'denied') {
            return 'camera_error_blocked'
          }
          return 'camera_error_not_allowed'
        case 'NotFoundError':
          return 'camera_error_not_found'
        case 'NotReadableError':
          return 'camera_error_busy'
        case 'OverconstrainedError':
          return 'camera_error_constraint'
        default:
          return 'camera_error_generic'
      }
    }
    return 'camera_error_generic'
  }

  // Clean up on unmount
  onUnmounted(() => {
    stopCamera()
    if (permissionStatus) {
      permissionStatus.onchange = null
      permissionStatus = null
    }
  })

  return {
    stream,
    isActive,
    error,
    facingMode,
    hasCameraSupport,
    startCamera,
    stopCamera,
    captureImage,
    switchCamera,
    setVideoElement,
    checkPermission,
    permissionState,
    clearError,
  }
}
