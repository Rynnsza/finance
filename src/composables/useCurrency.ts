import { ref, computed } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { user } from './useAuth'
import i18n from '@/plugins/i18n'
import { getProfileCurrency } from '@/services/profile.service'
import { queryExchangeRates } from '@/services/exchange-rate.service'

const defaultCurrency = ref<string>('IDR')

export const loadCurrency = async () => {
  if (!user.value) {
    return
  }
  const { data, error } = await getProfileCurrency(user.value.id)
  if (!error && data) {
    defaultCurrency.value = data
  }
}

// In-memory fallback cache for exchange rates fetched directly from the API
// when the Supabase exchange_rates table is missing a needed currency.
const fallbackRates = ref<Record<string, number> | null>(null)
let fallbackFetchPromise: Promise<void> | null = null

const fetchFallbackRates = async () => {
  if (fallbackFetchPromise) return fallbackFetchPromise
  fallbackFetchPromise = (async () => {
    try {
      const res = await fetch('https://api.exchangerate.fun/latest?base=IDR')
      if (!res.ok) return
      const data = await res.json()
      if (data?.rates) {
        // Add the base currency itself (1 IDR = 1 IDR)
        fallbackRates.value = { IDR: 1, ...data.rates }
      }
    } catch {
      // Reset so next attempt can retry
      fallbackFetchPromise = null
    }
  })()
  await fallbackFetchPromise
}

// Eagerly kick off the fallback fetch so rates are ready ASAP
fetchFallbackRates()

export const useCurrency = () => {
  // Use global i18n.global instance directly to avoid Vue's "inject() can only be used inside setup()" warnings.
  // This is the most robust way to support useCurrency calls from any context (async, top-level, etc.)
  const globalI18n = i18n.global as any
  const t = globalI18n.t
  const locale = globalI18n.locale

  // --- Exchange rates from Supabase (synced via Edge Function every 10 min) ---
  const { data: ratesData } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const result = await queryExchangeRates()
      if (result.error) throw result.error
      return result.data
    },
    staleTime: 0, // selalu dianggap stale, refetch tiap kali mount/focus
    refetchInterval: 60_000, // auto-refresh setiap 1 menit
    refetchOnWindowFocus: true, // refetch pas balik ke tab
    retry: 2,
  })

  const exchangeRates = ratesData

  const convertTo = (amount: number, fromCurrency: string, toCurrency: string): number | null => {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount
    if (amount === 0) return 0

    const baseCurrency = 'IDR' // The exchange_rates table is relative to IDR

    // Try DB-stored rates first
    const stored = exchangeRates.value
    if (stored) {
      const rateFrom = fromCurrency === baseCurrency ? 1 : stored[fromCurrency]
      const rateTo = toCurrency === baseCurrency ? 1 : stored[toCurrency]
      if (rateFrom && rateTo) {
        // amount / rateFrom gives the value in IDR
        // (amount / rateFrom) * rateTo gives the value in toCurrency
        return (amount / rateFrom) * rateTo
      }
    }

    // Fallback: try API-fetched rates (cached in memory)
    const fb = fallbackRates.value
    if (fb) {
      const rateFrom = fromCurrency === baseCurrency ? 1 : fb[fromCurrency]
      const rateTo = toCurrency === baseCurrency ? 1 : fb[toCurrency]
      if (rateFrom && rateTo) {
        return (amount / rateFrom) * rateTo
      }
    }

    // Neither source has the rate — trigger a one-shot API fetch for next time
    fetchFallbackRates()

    return null
  }

  const noDecimalCurrencies = ['IDR', 'JPY', 'KRW', 'VND', 'KHR', 'LAK', 'MMK']

  const hasDecimals = (currency?: string) => {
    return !noDecimalCurrencies.includes(currency || defaultCurrency.value)
  }

  const formatCurrency = (amount: number, currency?: string) => {
    const cur = currency || defaultCurrency.value
    return new Intl.NumberFormat(getLocale(cur), {
      style: 'currency',
      currency: cur,
      minimumFractionDigits: hasDecimals(cur) ? 2 : 0,
      maximumFractionDigits: hasDecimals(cur) ? 2 : 0,
    }).format(amount)
  }

  const getLocale = (currency: string) => {
    const localeMap: Record<string, string> = {
      IDR: 'id-ID',
      MYR: 'ms-MY',
      SGD: 'en-SG',
      THB: 'th-TH',
      PHP: 'en-PH',
      VND: 'vi-VN',
      MMK: 'my-MM',
      KHR: 'km-KH',
      LAK: 'lo-LA',
      BND: 'ms-BN',
      JPY: 'ja-JP',
      KRW: 'ko-KR',
      CNY: 'zh-CN',
      TWD: 'zh-TW',
      HKD: 'zh-HK',
      INR: 'en-IN',
      BDT: 'bn-BD',
      PKR: 'en-PK',
      LKR: 'si-LK',
      NPR: 'ne-NP',
      USD: 'en-US',
      EUR: 'de-DE',
      GBP: 'en-GB',
    }
    return localeMap[currency] ?? 'en-US'
  }

  const currencyGroups = computed(() => [
    {
      label: t('currencies.group_global'),
      currencies: [
        { value: 'USD', label: t('currencies.usd') },
        { value: 'EUR', label: t('currencies.eur') },
        { value: 'GBP', label: t('currencies.gbp') },
      ],
    },
    {
      label: t('currencies.group_southeast_asia'),
      currencies: [
        { value: 'IDR', label: t('currencies.idr') },
        { value: 'MYR', label: t('currencies.myr') },
        { value: 'SGD', label: t('currencies.sgd') },
        { value: 'THB', label: t('currencies.thb') },
        { value: 'PHP', label: t('currencies.php') },
        { value: 'VND', label: t('currencies.vnd') },
        { value: 'MMK', label: t('currencies.mmk') },
        { value: 'KHR', label: t('currencies.khr') },
        { value: 'LAK', label: t('currencies.lak') },
        { value: 'BND', label: t('currencies.bnd') },
      ],
    },
    {
      label: t('currencies.group_east_asia'),
      currencies: [
        { value: 'JPY', label: t('currencies.jpy') },
        { value: 'KRW', label: t('currencies.krw') },
        { value: 'CNY', label: t('currencies.cny') },
        { value: 'TWD', label: t('currencies.twd') },
        { value: 'HKD', label: t('currencies.hkd') },
      ],
    },
    {
      label: t('currencies.group_south_asia'),
      currencies: [
        { value: 'INR', label: t('currencies.inr') },
        { value: 'BDT', label: t('currencies.bdt') },
        { value: 'PKR', label: t('currencies.pkr') },
        { value: 'LKR', label: t('currencies.lkr') },
        { value: 'NPR', label: t('currencies.npr') },
      ],
    },
  ])

  const currencies = computed(() => currencyGroups.value.flatMap((g) => g.currencies))

  const formatNumberOnly = (amount: number, currency?: string, precision?: number) => {
    const cur = currency || defaultCurrency.value
    // If currency doesn't support decimals (like IDR), force 0 decimals
    const decimals = hasDecimals(cur) ? (precision !== undefined ? precision : 2) : 0
    return new Intl.NumberFormat(getLocale(cur), {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(amount)
  }

  const parseLocalizedNumber = (str: string, currency?: string): number => {
    const cur = currency || defaultCurrency.value
    const digits = str.replace(/\D/g, '')
    if (!digits) {
      return 0
    }
    const num = Number(digits)
    if (hasDecimals(cur)) {
      return num / 100
    }
    return num
  }

  const fetchHistoricalRates = async (from: string, to: string) => {
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    try {
      // Use EUR as stable base and fetch both currencies to calculate ratio
      // This avoids 404s for currencies that Frankfurter doesn't support as base (like IDR)
      // We use the open-ended range "startDate.." to avoid 404s if today's data isn't published yet
      const res = await fetch(
        `https://api.frankfurter.app/${startDate}..?base=EUR&symbols=${from},${to}`,
      )
      if (!res.ok) return null
      const data = await res.json()

      return Object.entries(data.rates || {}).map(([date, rates]: [string, any]) => {
        const rateFrom = from === 'EUR' ? 1 : rates[from]
        const rateTo = to === 'EUR' ? 1 : rates[to]

        return {
          date,
          // If we want from -> to, and we have EUR -> from and EUR -> to:
          // 1 from = (1/rateFrom) EUR
          // (1/rateFrom) EUR = (rateTo/rateFrom) to
          value: rateFrom && rateTo ? rateTo / rateFrom : undefined,
        }
      })
        .filter((item) => item.value !== undefined)
        .sort((a, b) => a.date.localeCompare(b.date)) as { date: string; value: number }[]
    } catch {
      return null
    }
  }

  return {
    formatCurrency,
    formatNumberOnly,
    parseLocalizedNumber,
    hasDecimals,
    currencies,
    currencyGroups,
    defaultCurrency,
    exchangeRates,
    convertTo,
    fetchHistoricalRates,
    locale,
  }
}
