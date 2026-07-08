-- Activity Logs — run this once in the Supabase SQL Editor. Safe to re-run.
-- Requires 0001–0007 to have been run first.
--
-- Tracks every meaningful admin action (project/media/booking/contact CRUD,
-- settings changes, profile changes, login/logout) for audit purposes.
-- Append-only: authenticated users can insert (only ever as themselves,
-- enforced below) and read; there is no update/delete policy, so history
-- can't be altered or erased from the admin panel.

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  user_email text,
  action text not null,
  record_type text,
  record_id uuid,
  description text not null,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);

create index if not exists idx_activity_logs_created on activity_logs(created_at desc);
create index if not exists idx_activity_logs_action on activity_logs(action);
create index if not exists idx_activity_logs_record on activity_logs(record_type, record_id);
create index if not exists idx_activity_logs_user on activity_logs(user_id);

alter table activity_logs enable row level security;

-- with check (user_id = auth.uid()) prevents an authenticated user from
-- logging an action under someone else's identity — they can only ever
-- insert a row attributed to themselves.
drop policy if exists "authenticated users can insert their own activity logs" on activity_logs;
create policy "authenticated users can insert their own activity logs"
  on activity_logs for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "authenticated users can view activity logs" on activity_logs;
create policy "authenticated users can view activity logs"
  on activity_logs for select
  to authenticated
  using (true);

-- Realtime so the Activity Log viewer picks up new entries live.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'activity_logs'
  ) then
    alter publication supabase_realtime add table activity_logs;
  end if;
end $$;
