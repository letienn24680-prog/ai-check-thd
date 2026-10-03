create table if not exists public.leaderboard_scores (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 1 and 24),
  activity text not null check (activity in ('rubric', 'assessment', 'practice')),
  score smallint not null check (score between 0 and 100),
  created_at timestamptz not null default now()
);

create index if not exists leaderboard_scores_activity_score_idx
  on public.leaderboard_scores (activity, score desc, created_at desc);

alter table public.leaderboard_scores enable row level security;
grant usage on schema public to anon, authenticated;
grant select, insert on public.leaderboard_scores to anon, authenticated;

drop policy if exists "Public can read leaderboard scores" on public.leaderboard_scores;
create policy "Public can read leaderboard scores"
  on public.leaderboard_scores for select
  to anon, authenticated
  using (true);

drop policy if exists "Public can submit leaderboard scores" on public.leaderboard_scores;
create policy "Public can submit leaderboard scores"
  on public.leaderboard_scores for insert
  to anon, authenticated
  with check (
    char_length(trim(display_name)) between 1 and 24
    and activity in ('rubric', 'assessment', 'practice')
    and score between 0 and 100
  );

create table if not exists public.research_summary (
  id smallint primary key default 1 check (id = 1),
  sample_size integer not null check (sample_size >= 0),
  ai_use_pct numeric(5, 2) not null check (ai_use_pct between 0 and 100),
  verify_often_pct numeric(5, 2) not null check (verify_often_pct between 0 and 100),
  before_mean numeric(5, 2) not null check (before_mean between 0 and 100),
  after_mean numeric(5, 2) not null check (after_mean between 0 and 100),
  good_rate_pct numeric(5, 2) not null check (good_rate_pct between 0 and 100),
  updated_at timestamptz not null default now()
);

alter table public.research_summary enable row level security;
grant select on public.research_summary to anon, authenticated;

drop policy if exists "Public can read approved research summary" on public.research_summary;
create policy "Public can read approved research summary"
  on public.research_summary for select
  to anon, authenticated
  using (true);
