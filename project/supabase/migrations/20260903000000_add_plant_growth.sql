-- Persistent Garden Plan completion ledger used by My Plant growth and the
-- once-per-plan sparkle celebration. Dates are supplied as device-local
-- YYYY-MM-DD values by the app.

create table if not exists public.garden_daily_plans (
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_date date not null,
  task_count integer not null check (task_count >= 0),
  completed_at timestamptz,
  celebration_seen_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, plan_date)
);

create table if not exists public.garden_task_completions (
  user_id uuid not null,
  plan_date date not null,
  task_id text not null,
  task_category text not null,
  task_title text not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, plan_date, task_id),
  constraint garden_task_plan_fk
    foreign key (user_id, plan_date)
    references public.garden_daily_plans(user_id, plan_date)
    on delete cascade
);

alter table public.garden_daily_plans enable row level security;
alter table public.garden_task_completions enable row level security;

grant select, insert, update, delete on public.garden_daily_plans to authenticated;
grant select, insert, update, delete on public.garden_task_completions to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'garden_daily_plans'
      and policyname = 'Users manage their own daily garden plans'
  ) then
    create policy "Users manage their own daily garden plans"
      on public.garden_daily_plans
      for all
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'garden_task_completions'
      and policyname = 'Users manage their own task completions'
  ) then
    create policy "Users manage their own task completions"
      on public.garden_task_completions
      for all
      to authenticated
      using ((select auth.uid()) = user_id)
      with check ((select auth.uid()) = user_id);
  end if;
end
$$;
