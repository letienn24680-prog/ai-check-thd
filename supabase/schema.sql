create table if not exists public.leaderboard_scores (
  id uuid primary key default gen_random_uuid(),
  participant_id uuid,
  display_name text not null check (char_length(trim(display_name)) between 1 and 24),
  activity text not null check (activity in ('rubric', 'assessment', 'practice')),
  phase text,
  score smallint not null check (score between 0 and 100),
  created_at timestamptz not null default now()
);

alter table public.leaderboard_scores
  add column if not exists participant_id uuid;

alter table public.leaderboard_scores
  add column if not exists phase text;

update public.leaderboard_scores
set participant_id = gen_random_uuid()
where participant_id is null;

alter table public.leaderboard_scores
  alter column participant_id set default gen_random_uuid(),
  alter column participant_id set not null;

alter table public.leaderboard_scores
  drop constraint if exists leaderboard_scores_phase_check;

alter table public.leaderboard_scores
  add constraint leaderboard_scores_phase_check
  check (
    phase is null
    or (activity = 'assessment' and phase in ('pre', 'post'))
  );

create index if not exists leaderboard_scores_activity_score_idx
  on public.leaderboard_scores (activity, score desc, created_at desc);

create index if not exists leaderboard_scores_assessment_phase_idx
  on public.leaderboard_scores (participant_id, phase, created_at desc)
  where activity = 'assessment' and phase is not null;

-- Bảng lưu yêu cầu hỗ trợ/quên mật khẩu
create table if not exists public.support_requests (
  id uuid primary key default gen_random_uuid(),
  user_email text not null,
  display_name text,
  reason text not null,
  status text not null default 'pending' check (status in ('pending', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.support_requests enable row level security;
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.support_requests to anon, authenticated;

drop policy if exists "Anyone can submit support requests" on public.support_requests;
create policy "Anyone can submit support requests"
  on public.support_requests for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Authenticated users can read support requests" on public.support_requests;
create policy "Authenticated users can read support requests"
  on public.support_requests for select
  to authenticated
  using (true);

drop policy if exists "Authenticated users can update support requests" on public.support_requests;
create policy "Authenticated users can update support requests"
  on public.support_requests for update
  to authenticated
  using (true);

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
    and participant_id is not null
    and (phase is null or (activity = 'assessment' and phase in ('pre', 'post')))
    and score between 0 and 100
  );

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'leaderboard_scores'
  ) then
    alter publication supabase_realtime add table public.leaderboard_scores;
  end if;
end
$$;

create or replace view public.research_assessment_summary
with (security_invoker = true)
as
with latest_attempts as (
  select distinct on (participant_id, phase)
    participant_id,
    phase,
    score,
    created_at
  from public.leaderboard_scores
  where activity = 'assessment'
    and phase in ('pre', 'post')
  order by participant_id, phase, created_at desc
)
select
  phase,
  count(*)::integer as participant_count,
  round(avg(score)::numeric, 1) as average_score,
  count(*) filter (where score >= 51)::integer as good_count,
  round((count(*) filter (where score >= 51)::numeric * 100 / nullif(count(*), 0)), 1) as good_rate_pct,
  max(created_at) as updated_at,
  (
    select count(*)::integer
    from public.leaderboard_scores attempts
    where attempts.activity = 'assessment'
      and attempts.phase = latest_attempts.phase
  ) as attempt_count
from latest_attempts
group by latest_attempts.phase;

grant select on public.research_assessment_summary to anon, authenticated;

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
