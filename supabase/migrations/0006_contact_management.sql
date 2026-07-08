-- Contact Enquiries Management — run this once in the Supabase SQL Editor.
-- Safe to re-run. Requires 0001–0005 to have been run first.
--
-- What this does:
--   1. Adds an `admin_notes` column for internal, customer-invisible notes.
--   2. Replaces the status enum ('new','responded','closed') with the admin
--      panel's set ('unread','read','replied','archived'), remapping
--      existing rows and the column default.
--   3. Grants authenticated (admin) users read/update/delete on
--      contact_enquiries (previously insert-only for everyone, readable by
--      no one).
--   4. Adds an authenticated INSERT policy too, mirroring the booking-table
--      fix — keeps the public Contact form working even when an admin
--      session is active in the same browser.
--   5. Enables Postgres realtime change events on contact_enquiries.
--
-- Attachment downloads reuse the `attachments` bucket's existing
-- authenticated read policy from 0004_booking_management.sql — no storage
-- changes needed here.

-- ---------------------------------------------------------------------------
-- 1. Internal notes
-- ---------------------------------------------------------------------------
alter table contact_enquiries add column if not exists admin_notes text;

-- ---------------------------------------------------------------------------
-- 2. Status enum migration
-- ---------------------------------------------------------------------------
update contact_enquiries set status = 'unread' where status = 'new';
update contact_enquiries set status = 'replied' where status = 'responded';
update contact_enquiries set status = 'archived' where status = 'closed';

alter table contact_enquiries alter column status set default 'unread';

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
  where t.relname = 'contact_enquiries'
    and c.contype = 'c'
    and a.attname = 'status'
    and a.attnum = any(c.conkey);

  if existing_constraint is not null then
    execute format('alter table contact_enquiries drop constraint %I', existing_constraint);
  end if;
end $$;

alter table contact_enquiries
  add constraint contact_enquiries_status_check
  check (status in ('unread', 'read', 'replied', 'archived'));

-- ---------------------------------------------------------------------------
-- 3 & 4. RLS: authenticated admins can manage enquiries; authenticated
-- insert mirrors the anon policy for same-browser admin sessions.
-- ---------------------------------------------------------------------------
drop policy if exists "authenticated users can submit a contact enquiry" on contact_enquiries;
create policy "authenticated users can submit a contact enquiry"
  on contact_enquiries for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can view contact enquiries" on contact_enquiries;
create policy "authenticated users can view contact enquiries"
  on contact_enquiries for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can update contact enquiries" on contact_enquiries;
create policy "authenticated users can update contact enquiries"
  on contact_enquiries for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete contact enquiries" on contact_enquiries;
create policy "authenticated users can delete contact enquiries"
  on contact_enquiries for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- 5. Realtime
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'contact_enquiries'
  ) then
    alter publication supabase_realtime add table contact_enquiries;
  end if;
end $$;
