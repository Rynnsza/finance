-- Restrict exchange_rates to authenticated users only
drop policy if exists "Anyone can read exchange rates" on exchange_rates;

create policy "Authenticated users can read exchange rates"
  on exchange_rates for select
  using (auth.role() = 'authenticated');
