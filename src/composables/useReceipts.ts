import { ref, type Ref } from 'vue'
import { useSupabase } from '@/lib/supabase'
import { useAuth } from '@/composables/useAuth'
import { useToast } from '@/composables/useToast'
import { useI18n } from 'vue-i18n'

// Types defined locally (avoids cross-environment dependency with scripts/ocr.ts)
interface ScanResult {
  status: 'ok' | 'error'
  data: ReceiptData | null
  error?: string
}

interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

interface ReceiptData {
  type: 'expense' | 'income'
  amount: number
  currency: string
  category: string
  description: string | null
  date: string
  items: ReceiptItem[] | null
  merchant: string | null
}

export interface UseReceiptsReturn {
  uploading: Ref<boolean>
  scanning: Ref<boolean>
  statusMessage: Ref<string>
  lastResult: Ref<ScanResult | null>
  scanReceiptFromFile: (
    file: File,
    options?: { skipCompression?: boolean },
  ) => Promise<ReceiptData | null>
  reset: () => void
}

const MAX_IMAGE_DIMENSION = 1920
const JPEG_QUALITY = 0.7
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']

/**
 * Load an image File into an HTMLImageElement.
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

/**
 * Compress and resize an image file client-side using Canvas.
 * Resizes to max 1920px on the longest side, outputs JPEG at quality 0.7.
 */
async function compressImage(file: File): Promise<Blob> {
  const img = await loadImage(file)

  let { width, height } = img

  // Resize if larger than MAX_IMAGE_DIMENSION on either axis
  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height)
    width = Math.round(width * ratio)
    height = Math.round(height * ratio)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas 2D context unavailable')
  }

  ctx.drawImage(img, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas toBlob returned null'))
          return
        }
        resolve(blob)
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  })
}

/**
 * Validate the selected file before processing.
 * Returns an error message string, or null if valid.
 */
function validateFile(file: File): string | null {
  if (!file) return 'No file selected'

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return 'scan_error_format'
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'scan_error_size'
  }

  return null
}

export const useReceipts = (): UseReceiptsReturn => {
  const supabase = useSupabase()
  const { user } = useAuth()
  const { toast } = useToast()
  const { t } = useI18n()

  const uploading = ref(false)
  const scanning = ref(false)
  const statusMessage = ref('')
  const lastResult = ref<ScanResult | null>(null)

  /**
   * Upload a compressed image blob to Supabase Storage.
   * Returns a signed URL with 10-minute expiry for Edge Function access, or throws on error.
   */
  async function uploadToStorage(blob: Blob): Promise<string> {
    const userId = user.value?.id
    if (!userId) {
      toast.error(t('transaction_form.scan_error_auth'))
      throw new Error('Not authenticated')
    }

    const uuid = crypto.randomUUID()
    const path = `receipts/${userId}/${uuid}.jpg`

    const { error } = await supabase.storage.from('receipts').upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: false,
    })

    if (error) {
      if (error.message?.includes('23505')) {
        // Duplicate — extremely unlikely with UUID, but retry once
        // Remove the orphan file before retrying
        await supabase.storage
          .from('receipts')
          .remove([path])
          .catch(() => {})
        const retryUuid = crypto.randomUUID()
        const retryPath = `receipts/${userId}/${retryUuid}.jpg`
        const { error: retryError } = await supabase.storage
          .from('receipts')
          .upload(retryPath, blob, { contentType: 'image/jpeg', upsert: false })
        if (retryError) throw retryError
        const { data: retryUrl } = await supabase.storage
          .from('receipts')
          .createSignedUrl(retryPath, 600)
        if (!retryUrl) {
          throw new Error('Failed to create signed URL for receipt upload')
        }
        return retryUrl.signedUrl
      }

      if (error.message?.includes('401') || error.message?.includes('403')) {
        toast.error(t('transaction_form.scan_error_auth'))
        throw new Error('Auth failed')
      }

      throw error
    }

    // Use signed URL (10 min expiry) so Edge Function can access private bucket files
    const { data: urlData } = await supabase.storage.from('receipts').createSignedUrl(path, 600)

    if (!urlData) {
      throw new Error('Failed to create signed URL for receipt upload')
    }

    return urlData.signedUrl
  }

  /**
   * Call the ocr-receipt Edge Function with the image URL.
   */
  async function callScanEndpoint(imageUrl: string): Promise<ScanResult> {
    const supabaseUrl = import.meta.env.VITE_PUBLIC_SUPABASE_URL as string

    // Get the user's session token for Edge Function auth
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const token = session?.access_token

    const res = await fetch(`${supabaseUrl}/functions/v1/ocr-receipt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ imageUrl }),
    })

    const result: ScanResult = await res.json()

    if (!res.ok) {
      if (res.status === 400) {
        return { status: 'error', data: null, error: t('transaction_form.scan_error_format') }
      }
      if (res.status === 422) {
        return {
          status: 'error',
          data: null,
          error: result.error || t('transaction_form.scan_error'),
        }
      }
      return { status: 'error', data: null, error: t('transaction_form.scan_error_network') }
    }

    return result
  }

  /**
   * Main entry point: select file → validate → compress → upload → scan → return data.
   * Returns ReceiptData on success, null on failure (toast already shown).
   */
  async function scanReceiptFromFile(
    file: File,
    options?: { skipCompression?: boolean },
  ): Promise<ReceiptData | null> {
    // Reset previous state
    lastResult.value = null
    const validationError = validateFile(file)
    if (validationError) {
      toast.error(t(`transaction_form.${validationError}`))
      return null
    }

    // --- COMPRESS ---
    uploading.value = true
    statusMessage.value = t('transaction_form.uploading')

    let compressedBlob: Blob
    if (options?.skipCompression) {
      // Camera already outputs JPEG — skip re-encode to preserve OCR quality
      compressedBlob = file
    } else {
      try {
        compressedBlob = await compressImage(file)
      } catch {
        // Fallback: upload original file if compression fails
        compressedBlob = file
      }
    }

    // --- UPLOAD ---
    let imageUrl: string
    try {
      imageUrl = await uploadToStorage(compressedBlob)
    } catch (e) {
      uploading.value = false
      toast.error(e instanceof Error ? e.message : t('transaction_form.scan_error_network'))
      return null
    }

    uploading.value = false

    // --- SCAN ---
    scanning.value = true
    statusMessage.value = t('transaction_form.scanning')

    const result = await callScanEndpoint(imageUrl)
    scanning.value = false
    lastResult.value = result

    if (result.status === 'ok' && result.data) {
      toast.success(t('transaction_form.scan_success'))
      return result.data
    }

    toast.error(result.error || t('transaction_form.scan_error'))
    return null
  }

  function reset() {
    uploading.value = false
    scanning.value = false
    statusMessage.value = ''
    lastResult.value = null
  }

  return {
    uploading,
    scanning,
    statusMessage,
    lastResult,
    scanReceiptFromFile,
    reset,
  }
}
