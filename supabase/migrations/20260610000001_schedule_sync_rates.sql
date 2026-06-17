-- Schedule exchange rate sync every 10 minutes
-- Requires pg_net extension for HTTP calls from cron

-- Enable extensions if not already enabled
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Schedule: sync exchange rates every 10 minutes
-- The function is deployed with --no-verify-jwt so no auth header needed
select cron.schedule(
  'sync-exchange-rates',
  '*/10 * * * *',
  $$select
    net.http_post(
      url:='https://zgiirfsdfklwtwxqfyhr.supabase.co/functions/v1/sync-rates',
      headers:='{"Content-Type":"application/json"}'::jsonb
    ) as req_id$$
);

-- Remove old schedule if exists (idempotent)
-- cron.unschedule('sync-exchange-rates');
