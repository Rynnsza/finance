-- Add transfer_id to transactions table
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS transfer_id uuid;
CREATE INDEX IF NOT EXISTS idx_transactions_transfer_id ON public.transactions(transfer_id);

-- Add metadata if not exists (might be useful for exchange rates or transfer notes)
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS metadata jsonb;
