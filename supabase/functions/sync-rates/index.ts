import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'npm:@supabase/supabase-js@2';

serve(async () => {
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    // exchangerate.fun — free, no API key, allows custom base
    const res = await fetch('https://api.exchangerate.fun/latest?base=IDR');

    if (!res.ok) {
      console.error(`Frankfurter API returned ${res.status}`);
      return new Response('Failed to fetch rates', { status: 502 });
    }

    const data = await res.json();
    const rows = Object.entries(data.rates).map(([target, rate]) => ({
      base_currency: 'IDR',
      target_currency: target,
      rate: rate as number,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await supabase
      .from('exchange_rates')
      .upsert(rows, { onConflict: 'base_currency, target_currency' });

    if (error) {
      console.error('Upsert error:', error.message);
      return new Response('Failed to persist rates', { status: 500 });
    }

    console.log(`Synced ${rows.length} exchange rates`);
    return new Response(JSON.stringify({ ok: true, count: rows.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
