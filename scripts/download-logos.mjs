/**
 * Wikimedia Commons Logo Downloader
 *
 * Downloads SVG logos for all registered banks and e-wallets from
 * Wikimedia Commons and saves them to public/accounts/{type}/{id}.svg.
 *
 * Usage: node scripts/download-logos.mjs
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROJECT_ROOT = path.resolve(__dirname, '..')
const OUTPUT_DIR = path.resolve(PROJECT_ROOT, 'public/accounts')

// ---------------------------------------------------------------------------
// Brand registry
// ---------------------------------------------------------------------------

const GROUPS = [
  {
    type: 'bank',
    brands: ['bca', 'mandiri', 'bri', 'bni', 'bsi', 'jago', 'seabank'],
  },
  {
    type: 'e-wallet',
    brands: ['gopay', 'ovo', 'dana', 'shopeepay', 'linkaja', 'isaku'],
  },
]

/**
 * Multi-query search terms ranked by relevance.
 * First SVG hit wins.
 */
const SEARCH_TERMS = {
  bca: [
    '"BCA" logo',
    '"Bank Central Asia" logo',
  ],
  mandiri: [
    '"Bank Mandiri" logo -2015 -1998',
    'Mandiri logo',
  ],
  bri: [
    '"Bank Rakyat Indonesia" logo -horizontal',
    'BRI logo',
  ],
  bni: [
    '"Bank Negara Indonesia" logo',
    'BNI 46 logo',
  ],
  bsi: [
    '"Bank Syariah Indonesia" logo -Bewize',
    'BSI logo Bank Syariah',
  ],
  jago: [
    '"Bank Jago" logo',
    'Logo-jago',
  ],
  seabank: [
    'SeaBank logo',
  ],

  // E-wallets
  gopay: [
    'GoPay logo -Gojek',
    'Gopay logo',
  ],
  ovo: [
    'OVO dompet digital logo',
    '"OVO" logo e-wallet',
    'OVO logo -Sound -Ableton',
  ],
  dana: [
    '"DANA" dompet digital logo',
    '"DANA" logo e-wallet',
  ],
  shopeepay: [
    'ShopeePay logo',
    'Shopee Pay logo',
  ],
  linkaja: [
    'LinkAja logo',
  ],
  isaku: [
    '"i.saku" logo BTPN',
    'isaku logo',
  ],
}

// ---------------------------------------------------------------------------
// API clients with retry & rate limiting
// ---------------------------------------------------------------------------

const API = 'https://commons.wikimedia.org/w/api.php'
const UA = 'FinanceVite/1.0 (logo-downloader)'
const REQUEST_DELAY_MS = 1500

let lastRequestTime = 0

/** Wait for rate-limit window */
async function throttle() {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS - elapsed))
  }
  lastRequestTime = Date.now()
}

/**
 * Fetch with automatic retry on 429 / 5xx.
 * Retries up to `tries` times with ~2× exponential backoff.
 */
async function fetchWithRetry(url, tries = 4) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    await throttle()
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA } })
      if (res.ok) return res
      if (res.status === 429 || res.status >= 500) {
        if (attempt < tries) {
          const wait = 2000 * Math.pow(2, attempt - 1) + Math.random() * 1000
          console.log(`  ⏳ 429/5xx — retry ${attempt}/${tries - 1} in ${Math.round(wait / 1000)}s`)
          await new Promise((r) => setTimeout(r, wait))
          continue
        }
      }
      console.warn(`  ⚠  HTTP ${res.status} for ${url}`)
      return null
    } catch (err) {
      if (attempt < tries) {
        const wait = 2000 * Math.pow(2, attempt - 1) + Math.random() * 1000
        console.log(`  ⏳ Network error — retry ${attempt}/${tries - 1} in ${Math.round(wait / 1000)}s`)
        await new Promise((r) => setTimeout(r, wait))
        continue
      }
      console.warn(`  ⚠  ${err.message}`)
      return null
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Search via Wikimedia Commons
// ---------------------------------------------------------------------------

async function searchOnCommons(term) {
  const searchParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    generator: 'search',
    gsrnamespace: '6', // File namespace
    gsrsearch: term,
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url',
    origin: '*',
  })

  const res = await fetchWithRetry(`${API}?${searchParams}`)
  if (!res) return null

  const data = await res.json()
  const pages = data.query?.pages ? Object.values(data.query.pages) : []
  const svgPages = pages
    .filter((p) => p.title?.toLowerCase().endsWith('.svg'))
    .sort((a, b) => (a.index || 999) - (b.index || 999))

  if (svgPages.length > 0) {
    return svgPages[0].imageinfo?.[0]?.url || null
  }

  return null
}

// ---------------------------------------------------------------------------
// Fallback: Wikipedia infobox logo
// ---------------------------------------------------------------------------

const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php'
const WIKIPEDIA_ID_API = 'https://id.wikipedia.org/w/api.php'

/**
 * Try to extract the logo URL from a Wikipedia page infobox.
 * Checks both English and Indonesian Wikipedia.
 */
async function searchOnWikipedia(title, langs = ['en', 'id']) {
  for (const lang of langs) {
    const base = lang === 'id' ? WIKIPEDIA_ID_API : WIKIPEDIA_API
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'pageprops',
      titles: title,
      ppprop: 'page_image_free',
      origin: '*',
    })

    const res = await fetchWithRetry(`${base}?${params}`)
    if (!res) continue

    const data = await res.json()
    const page = Object.values(data.query?.pages || {})[0]
    if (page?.pageprops?.page_image_free) {
      const imageTitle = page.pageprops.page_image_free
      // Resolve image to actual URL
      const imgParams = new URLSearchParams({
        action: 'query',
        format: 'json',
        titles: `File:${imageTitle}`,
        prop: 'imageinfo',
        iiprop: 'url',
        origin: '*',
      })
      const imgRes = await fetchWithRetry(`${base}?${imgParams}`)
      if (!imgRes) continue

      const imgData = await imgRes.json()
      const imgPage = Object.values(imgData.query?.pages || {})[0]
      const url = imgPage?.imageinfo?.[0]?.url
      if (url && (url.endsWith('.svg') || imgPage?.title?.toLowerCase().endsWith('.svg'))) {
        return url
      }
    }
  }
  return null
}

const WIKIPEDIA_TITLES = {
  bca: ['Bank Central Asia', 'BCA'],
  mandiri: ['Bank Mandiri'],
  bri: ['Bank Rakyat Indonesia', 'BRI'],
  bni: ['Bank Negara Indonesia', 'BNI'],
  bsi: ['Bank Syariah Indonesia', 'BSI'],
  jago: ['Bank Jago', 'Jago'],
  seabank: ['SeaBank'],
  gopay: ['GoPay', 'Go-Pay'],
  ovo: ['OVO (e-wallet)', 'OVO (dompet digital)'],
  dana: ['DANA (dompet digital)', 'DANA (e-wallet)'],
  shopeepay: ['ShopeePay', 'Shopee Pay'],
  linkaja: ['LinkAja', 'LinkAja (dompet digital)'],
  isaku: ['i.saku', 'BTPN'],
}

// ---------------------------------------------------------------------------
// Resolve a brand's logo URL (Commons → Wikipedia fallback)
// ---------------------------------------------------------------------------

async function resolveLogo(brand) {
  const terms = SEARCH_TERMS[brand]
  if (terms) {
    for (const term of terms) {
      console.log(`  🔍 Commons: "${term}"`)
      const url = await searchOnCommons(term)
      if (url) return url
    }
  }

  // Fallback to Wikipedia
  const titles = WIKIPEDIA_TITLES[brand]
  if (titles) {
    for (const title of titles) {
      console.log(`  🔍 Wikipedia: "${title}"`)
      const url = await searchOnWikipedia(title)
      if (url) return url
    }
  }

  return null
}

// ---------------------------------------------------------------------------
// Download file
// ---------------------------------------------------------------------------

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': UA },
  })
  if (!res.ok) {
    console.warn(`  ⚠  Download failed (HTTP ${res.status})`)
    return 0
  }
  // Validate it looks like SVG
  const text = await res.text()
  if (!text.includes('<svg')) {
    console.warn(`  ⚠  Downloaded file is not SVG (no <svg> tag) — skipping`)
    return 0
  }
  await fs.writeFile(destPath, text, 'utf-8')
  return Buffer.byteLength(text, 'utf-8')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('')
  console.log('╔══════════════════════════════════════════╗')
  console.log('║     Logo Downloader (Commons + Wiki)     ║')
  console.log('╚══════════════════════════════════════════╝')
  console.log('')

  const stats = { succeeded: 0, failed: 0, skipped: 0 }

  for (const { type, brands } of GROUPS) {
    const groupDir = path.join(OUTPUT_DIR, type)
    await fs.mkdir(groupDir, { recursive: true })

    console.log(`── ${type.toUpperCase()} ──`)

    for (const brand of brands) {
      const destPath = path.join(groupDir, `${brand}.svg`)

      // Skip if exists and non-empty
      try {
        const stat = await fs.stat(destPath)
        if (stat.size > 0) {
          console.log(`  ✓ ${brand}.svg — already exists (${(stat.size / 1024).toFixed(1)} KB)`)
          stats.skipped++
          continue
        }
      } catch {
        // file doesn't exist, proceed
      }

      console.log(`\n  ${brand}:`)

      const url = await resolveLogo(brand)

      if (!url) {
        console.log(`  ✗ No logo found`)
        stats.failed++
        continue
      }

      console.log(`  → ${url}`)

      const bytes = await downloadFile(url, destPath)
      if (bytes > 0) {
        console.log(`  ✓ Saved (${(bytes / 1024).toFixed(1)} KB)`)
        stats.succeeded++
      } else {
        console.log(`  ✗ Download failed`)
        stats.failed++
      }
    }

    console.log('')
  }

  // Summary
  const total = stats.succeeded + stats.failed + stats.skipped
  console.log('──────────────────────────────────')
  console.log(`  Total:  ${total}`)
  console.log(`  Saved:  ${stats.succeeded}`)
  console.log(`  Found:  ${stats.skipped} (already on disk)`)
  console.log(`  Failed: ${stats.failed}`)
  console.log('')

  if (stats.failed > 0) {
    console.log('⚠  The following could not be downloaded automatically:')
    for (const { type, brands } of GROUPS) {
      for (const brand of brands) {
        const destPath = path.join(OUTPUT_DIR, type, `${brand}.svg`)
        try {
          const stat = await fs.stat(destPath)
          if (stat.size === 0) console.log(`   - ${type}/${brand}.svg (empty)`)
        } catch {
          console.log(`   - ${type}/${brand}.svg`)
        }
      }
    }
    console.log('')
    console.log('   You can manually find & place SVGs or use Clearbit:')
    console.log('   curl -o public/accounts/bank/bsi.svg https://logo.clearbit.com/bankbsi.co.id')
    console.log('')
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
