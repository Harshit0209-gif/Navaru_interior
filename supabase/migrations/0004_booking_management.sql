-- Book Design Requests Management — run this once in the Supabase SQL
-- Editor. Safe to re-run. Requires 0001–0003 to have been run first.
--
-- What this does:
--   1. Adds an `admin_notes` column for internal, customer-invisible notes.
--   2. Replaces the status enum ('new','contacted','in_progress','converted',
--      'closed') with the admin panel's set ('new','pending','contacted',
--      'completed','rejected'), remapping existing rows.
--   3. Grants authenticated (admin) users read/update/delete on
--      book_design_requests (previously insert-only for everyone, readable
--      by no one).
--   4. Grants authenticated users read access to the `attachments` bucket
--      so signed download URLs can be generated for uploaded files.
--   5. Enables Postgres realtime change events on book_design_requests.

-- ---------------------------------------------------------------------------
-- 1. Internal notes
-- ---------------------------------------------------------------------------
alter table book_design_requests add column if not exists admin_notes text;

-- ---------------------------------------------------------------------------
-- 2. Status enum migration
-- ---------------------------------------------------------------------------
update book_design_requests set status = 'pending' where status = 'in_progress';
update book_design_requests set status = 'completed' where status = 'converted';
update book_design_requests set status = 'rejected' where status = 'closed';

-- Drop whatever the existing status check constraint is named (it was
-- declared inline in schema.sql, so Postgres auto-named it) before adding
-- the new one — done dynamically so this doesn't depend on guessing right.
do $$
declare
  existing_constraint text;
begin
  select c.conname into existing_constraint
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_attribute a on a.attrelid = t.oid
  where t.relname = 'book_design_requests'
    and c.contype = 'c'
    and a.attname = 'status'
    and a.attnum = any(c.conkey);

  if existing_constraint is not null then
    execute format('alter table book_design_requests drop constraint %I', existing_constraint);
  end if;
end $$;

alter table book_design_requests
  add constraint book_design_requests_status_check
  check (status in ('new', 'pending', 'contacted', 'completed', 'rejected'));

-- ---------------------------------------------------------------------------
-- 3. RLS: authenticated admins can manage booking requests
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated users can view booking requests" on book_design_requests;
create policy "authenticated users can view booking requests"
  on book_design_requests for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can update booking requests" on book_design_requests;
create policy "authenticated users can update booking requests"
  on book_design_requests for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete booking requests" on book_design_requests;
create policy "authenticated users can delete booking requests"
  on book_design_requests for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 4. Storage: admins can read attachments (to generate signed download URLs)
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated users can view attachments" on storage.objects;
create policy "authenticated users can view attachments"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'attachments');

-- ---------------------------------------------------------------------------
-- 5. Realtime
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'book_design_requests'
  ) then
    alter publication supabase_realtime add table book_design_requests;
  end if;
end $$;
