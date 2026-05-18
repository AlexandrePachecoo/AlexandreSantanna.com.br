-- Timer na carta: contador regressivo ou cronômetro
-- timer_type: 'countdown' (regressivo) | 'countup' (cronômetro)
-- timer_label: título exibido acima do timer
-- timer_date: data-alvo (countdown) ou data-início (countup)

alter table public.letters
  add column if not exists timer_type  text check (timer_type in ('countdown', 'countup')),
  add column if not exists timer_label text,
  add column if not exists timer_date  timestamptz;
