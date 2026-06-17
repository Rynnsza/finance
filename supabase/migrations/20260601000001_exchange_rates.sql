create table if not exists exchange_rates (
  id bigint generated always as identity primary key,
  base_currency text not null,
  target_currency text not null,
  rate numeric not null,
  updated_at timestamptz not null default now(),
  unique (base_currency, target_currency)
);

alter table exchange_rates enable row level security;

drop policy if exists "Anyone can read exchange rates" on exchange_rates;
create policy "Anyone can read exchange rates"
  on exchange_rates for select
  using (true);
