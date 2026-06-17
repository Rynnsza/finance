import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

let client: SupabaseClient<Database> | null = null

function getEnvOrThrow(key: string): string {
  const value = import.meta.env[key] as string | undefined
  if (!value) {
    throw new Error(
      `Missing environment variable: ${key}\n` +
        'Copy .env to .env.local and fill in the required values.',
    )
  }
  return value
}

export const useSupabase = () => {
  if (!client) {
    const supabaseUrl = getEnvOrThrow('VITE_PUBLIC_SUPABASE_URL')
    const supabaseKey = getEnvOrThrow('VITE_PUBLIC_SUPABASE_ANON_KEY')

    client = createClient<Database>(supabaseUrl, supabaseKey)
  }
  return client
}
