import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { Buffer } from 'node:buffer'
import { randomBytes, randomInt, publicEncrypt, constants } from 'node:crypto'

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const UA =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'

const RSA_PEM = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCAdf/EyIbLBxjGqmh7qLU6/CP
Czru+75+82OSPZ+nf4BFvg88drpZ6KigNW0J8TNgxe6Yms1irCZNVDyu+RXsl4y/
7c2KOHc4OGTzHB5fUMiMasFUvcEs2P70e6yA/sKHZfBLG1XPhlb84Ibs3nhD3W5e
2SuC+4EuVkaqzN08LQIDAQAB
-----END PUBLIC KEY-----`

function encryptVisitorId(id: string) {
  return publicEncrypt(
    { key: RSA_PEM, padding: constants.RSA_PKCS1_PADDING },
    Buffer.from(id),
  ).toString('base64')
}

function createSession() {
  const id = randomBytes(16).toString('hex')
  return {
    visitorId: id,
    vtoken: encryptVisitorId(id),
    conversationId: randomInt(10000000, 99999999),
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

  if (!res.ok) {
    throw new Error(`Gagal fetch gambar: ${res.status}`)
  }

  const mime = (res.headers.get('content-type') || '').split(';')[0].toLowerCase()
  if (!/^image\/(jpeg|png)$/.test(mime)) {
    throw new Error(`Format gambar tidak didukung: ${mime}`)
  }

  const buf = await res.arrayBuffer()
  const base64 = btoa(String.fromCharCode(...new Uint8Array(buf)))
  return `data:${mime};base64,${base64}`
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
    .replace(/-=-n--/g, ' ')
    .replace(/-=-\s*--/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
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

interface ReceiptData {
  type: 'expense' | 'income'
  amount: number
  currency: string
  category: string
  description: string | null
  date: string
  items: Array<{ name: string; quantity: number; price: number }> | null
  merchant: string | null
}

interface ScanResult {
  status: 'ok' | 'error'
  data: ReceiptData | null
  error?: string
}

async function scanReceipt(imageUrl: string): Promise<ScanResult> {
  try {
    const session = createSession()
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
      return { status: 'error', data: null, error: 'Response body is empty' }
    }

    const raw = await streamToString(res)

    if (!raw) {
      return { status: 'error', data: null, error: 'Empty response from AI model' }
    }

    // Strip markdown code fences if the AI wraps the JSON
    let jsonStr = raw.trim()
    const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
    if (fenceMatch) jsonStr = fenceMatch[1]

    const parsed: ReceiptData = JSON.parse(jsonStr)

    return { status: 'ok', data: parsed }
  } catch (e) {
    return {
      status: 'error',
      data: null,
      error: e instanceof Error ? e.message : String(e),
    }
  }
}

serve(async (req) => {
  // CORS headers
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers })
  }

  // Only accept POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ status: 'error', data: null, error: 'Method not allowed. Use POST.' }),
      { status: 405, headers },
    )
  }

  try {
    const body = await req.json()
    const { imageUrl } = body

    if (!imageUrl || typeof imageUrl !== 'string') {
      return new Response(
        JSON.stringify({ status: 'error', data: null, error: 'Missing required field: imageUrl' }),
        { status: 400, headers },
      )
    }

    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
      return new Response(
        JSON.stringify({ status: 'error', data: null, error: 'imageUrl must be a valid HTTP(S) URL' }),
        { status: 400, headers },
      )
    }

    // Retry with exponential backoff on rate limits (429) or service unavailable (503)
    const MAX_RETRIES = 3
    const BASE_DELAY_MS = 1000
    let result: ScanResult = { status: 'error', data: null, error: 'Unexpected error' }
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      result = await scanReceipt(imageUrl)
      if (result.status === 'ok') break
      if (result.error?.includes('429') || result.error?.includes('503')) {
        if (attempt < MAX_RETRIES) {
          const delay = BASE_DELAY_MS * Math.pow(4, attempt) // 1s, 4s, 16s
          await sleep(delay)
          continue
        }
        result = {
          status: 'error',
          data: null,
          error: 'AI API rate limited after multiple retries. Please try again later.',
        }
      } else {
        break
      }
    }
    const httpStatus = result.status === 'ok' ? 200 : 422

    return new Response(JSON.stringify(result), { status: httpStatus, headers })
  } catch (e) {
    return new Response(
      JSON.stringify({
        status: 'error',
        data: null,
        error: e instanceof Error ? e.message : 'Invalid request body',
      }),
      { status: 400, headers },
    )
  }
})
