import crypto from 'node:crypto'

const UA =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'

function encryptVisitorId(id: string) {
  const pem =
    '-----BEGIN PUBLIC KEY-----\nMIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCAdf/EyIbLBxjGqmh7qLU6/CPCzru+75+82OSPZ+nf4BFvg88drpZ6KigNW0J8TNgxe6Yms1irCZNVDyu+RXsl4y/7c2KOHc4OGTzHB5fUMiMasFUvcEs2P70e6yA/sKHZfBLG1XPhlb84Ibs3nhD3W5e2SuC+4EuVkaqzN08LQIDAQAB\n-----END PUBLIC KEY-----'

  return crypto
    .publicEncrypt({ key: pem, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(id))
    .toString('base64')
}

function createSession() {
  const id = crypto.randomBytes(16).toString('hex')
  return {
    visitorId: id,
    vtoken: encryptVisitorId(id),
    conversationId: crypto.randomInt(10000000, 99999999),
  }
}

async function toDataUrl(url: string) {
  const res = await fetch(url, {
    headers: {
      'user-agent': UA,
      accept: 'image/jpeg,image/png,*/*;q=0.8',
      referer: 'https://www.google.com/',
    },
  })

  const mime = (res.headers.get('content-type') || '').split(';')[0].toLowerCase()
  if (!/^image\/(jpeg|png)$/.test(mime))
    throw new Error(`Format gambar tidak didukung: ${mime}`)

  return `data:${mime};base64,${Buffer.from(await res.arrayBuffer()).toString('base64')}`
}

async function streamToString(res: Response): Promise<string> {
  const reader = res.body!.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let answer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const lines = buf.split(/\r?\n/)
    buf = lines.pop() || ''
    for (const line of lines) {
      const data = line.trim().slice(5)
      if (data && !data.includes('--@DONE@--')) answer += data
    }
  }

  return answer
    .replace(/-=-n--/g, ' ')   // strip SSE newline markers
    .replace(/-=-\s*--/g, ' ') // handle any remaining -=- + whitespace + --
    .replace(/\s+/g, ' ')
    .trim()
}

export interface ScanResult {
  status: 'ok' | 'error'
  data: ReceiptData | null
  error?: string
}

export interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

export interface ReceiptData {
  type: 'expense' | 'income'
  amount: number
  currency: string
  category: string
  description: string | null
  date: string
  items: ReceiptItem[] | null
  merchant: string | null
}

const SYSTEM_PROMPT = `You are a receipt scanner for a personal finance app. Extract transaction details from receipt/struk photos and return ONLY valid JSON.

Rules:
1. Respond with a single JSON object — no markdown, no code fences, no explanation.
2. The user's locale is "id" (Indonesian). Receipts may be in Indonesian or English.
3. All monetary values must be parsed as numbers (not strings).
4. If any field cannot be determined, use null (never omit the field).
5. For "type", determine if this is an expense (pengeluaran/pembayaran) or income (pemasukan). Default to "expense" for shopping receipts.
6. For "category", map to one of these exact Indonesian category names based on the receipt:
   - Makanan (food/dining/groceries)
   - Transport (transportation/fuel/parking/taxi)
   - Belanja (shopping/clothes/electronics/general retail)
   - Tagihan (bills/utilities/subscriptions)
   - Hiburan (entertainment/games/movies)
   - Kesehatan (health/pharmacy/medical)
   - Lainnya (others — fallback)
7. The "description" should be a concise summary: "[store name] — [brief item summary]" in Indonesian.
8. "currency" must be a 3-letter ISO code. Default to "IDR" for Indonesian receipts, "USD" for US receipts.
9. "date" must be in YYYY-MM-DD format. Use the receipt date, or today's date if unclear.

Return JSON with this exact structure:
{
  "type": "expense" | "income",
  "amount": number,
  "currency": "IDR",
  "category": string,
  "description": string | null,
  "date": "YYYY-MM-DD",
  "items": [{ "name": string, "quantity": number, "price": number }] | null,
  "merchant": string | null
}`

/**
 * Scan a receipt image and extract transaction data using GPT-4o-mini.
 * @param imageUrl - Public URL of the receipt image (JPEG or PNG)
 * @returns ScanResult with parsed ReceiptData on success
 */
export async function scanReceipt(imageUrl: string): Promise<ScanResult> {
  let session

  try {
    session = createSession()
    const dataUrl = await toDataUrl(imageUrl)

    const res = await fetch('https://aga-api.aichatting.net/aigc/chat/v2/professional/stream', {
      method: 'POST',
      headers: {
        'sec-ch-ua-platform': '"Android"',
        lang: 'en',
        'sec-ch-ua': '"Google Chrome";v="147","Not.A/Brand";v="8","Chromium";v="147"',
        'sec-ch-ua-mobile': '?1',
        vtoken: session.vtoken,
        source: 'web',
        'user-agent': UA,
        accept: 'text/event-stream,application/json,text/event-stream',
        'content-type': 'application/json',
        origin: 'https://www.aichatting.net',
        referer: 'https://www.aichatting.net/',
        'sec-fetch-site': 'same-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        priority: 'u=1, i',
      },
      body: JSON.stringify({
        spaceHandle: true,
        roleId: 0,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: SYSTEM_PROMPT },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        conversationId: session.conversationId,
        model: 'gpt-4o-mini',
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return {
        status: 'error',
        data: null,
        error: `API request failed (${res.status}): ${body}`,
      }
    }

    if (!res.body) {
      return {
        status: 'error',
        data: null,
        error: 'Response body is empty',
      }
    }

    const raw = await streamToString(res)

    if (!raw) {
      return {
        status: 'error',
        data: null,
        error: 'Empty response from AI model',
      }
    }

    // Parse the JSON returned by the AI (strip markdown fences if present)
    let jsonStr = raw.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (fenceMatch) jsonStr = fenceMatch[1]
    const parsed: ReceiptData = JSON.parse(jsonStr)

    return {
      status: 'ok',
      data: parsed,
    }
  } catch (e) {
    return {
      status: 'error',
      data: null,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

/** Sleep for ms milliseconds */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

/**
 * Scan a receipt image with automatic retry on retryable errors.
 * Retries with exponential backoff: 1s → 4s → 16s on 429/503 responses.
 */
export async function scanReceiptWithRetry(imageUrl: string): Promise<ScanResult> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const result = await scanReceipt(imageUrl)

    if (result.status === 'ok') return result

    // Only retry on 429 (rate limit) or 503 (service unavailable)
    if (result.error?.includes('429') || result.error?.includes('503')) {
      if (attempt < MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(4, attempt) // 1s, 4s, 16s
        console.warn(
          `[ocr] Retryable error (attempt ${attempt + 1}/${MAX_RETRIES}), ` +
          `retrying in ${delay}ms: ${result.error}`,
        )
        await sleep(delay)
        continue
      }
      return {
        status: 'error',
        data: null,
        error: `AI API rate limited after ${MAX_RETRIES + 1} attempts. Please try again later.`,
      }
    }

    // Non-retryable error — return immediately
    return result
  }

  // TypeScript exhaustiveness fallback
  return { status: 'error', data: null, error: 'Unknown retry error' }
}

// --- CLI usage ---
if (import.meta.url === `file://${process.argv[1]}`) {
  const imageUrl = process.argv[2] || 'https://upload.wikimedia.org/wikipedia/commons/0/0b/ReceiptSwiss.jpg'

  scanReceiptWithRetry(imageUrl)
    .then((r) => console.log(JSON.stringify(r, null, 2)))
    .catch((e) => {
      console.error(JSON.stringify({ status: 'error', data: null, error: e.message }, null, 2))
      process.exit(1)
    })
}
