-- Portfolio Management (admin CRUD) — run this once in the Supabase SQL
-- Editor. Safe to re-run. Requires 0001 (schema.sql) to have been run first.
--
-- What this does:
--   1. Adds SEO fields to portfolio_projects.
--   2. Replaces the is_published boolean with a proper draft/published/
--      archived status column (needed for the admin Publish/Draft/Archive/
--      Restore actions), backfilling existing rows.
--   3. Grants authenticated (admin) users full CRUD on portfolio_projects
--      and portfolio_images, while keeping anon read access limited to
--      published rows only.

-- ---------------------------------------------------------------------------
-- 1. SEO fields
-- ---------------------------------------------------------------------------
alter table portfolio_projects add column if not exists seo_title text;
alter table portfolio_projects add column if not exists seo_description text;
alter table portfolio_projects add column if not exists seo_keywords text[] not null default '{}';

-- ---------------------------------------------------------------------------
-- 2. is_published boolean -> status enum
-- ---------------------------------------------------------------------------
alter table portfolio_projects add column if not exists status text;

update portfolio_projects
set status = case when is_published then 'published' else 'draft' end
where status is null;

alter table portfolio_projects alter column status set default 'draft';
alter table portfolio_projects alter column status set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'portfolio_projects_status_check'
  ) then
    alter table portfolio_projects
      add constraint portfolio_projects_status_check
      check (status in ('draft', 'published', 'archived'));
  end if;
end $$;

-- Drop the two policies that still reference is_published in their `using`
-- clause BEFORE dropping the column — Postgres refuses to drop a column
-- any policy still depends on.
drop policy if exists "published projects are publicly readable" on portfolio_projects;
drop policy if exists "images of published projects are publicly readable" on portfolio_images;

alter table portfolio_projects drop column if exists is_published;
drop index if exists idx_portfolio_projects_published;
create index if not exists idx_portfolio_projects_status on portfolio_projects(status);

-- ---------------------------------------------------------------------------
-- 3. RLS: recreate public-read policies to check status, add admin policies
-- ---------------------------------------------------------------------------
create policy "published projects are publicly readable"
  on portfolio_projects for select
  to anon, authenticated
  using (status = 'published');

create policy "images of published projects are publicly readable"
  on portfolio_images for select
  to anon, authenticated
  using (
    exists (
      select 1 from portfolio_projects p
      where p.id = portfolio_images.project_id
        and p.status = 'published'
    )
  );

-- Authenticated (admin) users manage all projects regardless of status.
-- Combined with the policy above via OR, so anon is unaffected.
drop policy if exists "authenticated users can view all projects" on portfolio_projects;
create policy "authenticated users can view all projects"
  on portfolio_projects for select
  to authenticated
  using (true);

drop policy if exists "authenticated users can insert projects" on portfolio_projects;
create policy "authenticated users can insert projects"
  on portfolio_projects for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated users can update projects" on portfolio_projects;
create policy "authenticated users can update projects"
  on portfolio_projects for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "authenticated users can delete projects" on portfolio_projects;
create policy "authenticated users can delete projects"
  on portfolio_projects for delete
  to authenticated
  using (true);

drop policy if exists "authenticated users can manage all images" on portfolio_images;
create policy "authenticated users can manage all images"
  on portfolio_images for all
  to authenticated
  using (true)
  with check (true);
