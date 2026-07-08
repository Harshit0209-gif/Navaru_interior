# Supabase setup

1. Create a project at https://supabase.com/dashboard (free tier is fine).
2. Open **SQL Editor → New query**, paste the contents of `schema.sql`, and run it.
   This creates all tables, RLS policies, and the two storage buckets.
3. (Optional) Run `seed.sql` the same way to load 6 sample projects so the
   Portfolio page has content immediately. Delete these later via the Table
   Editor once you add your own projects.
4. Go to **Settings → API** and copy the **Project URL** and **anon public** key.
5. In the project root, copy `.env.example` to `.env.local` and fill in those
   two values:
   ```
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   ```
6. Restart `npm run dev`. The Portfolio page, project detail pages, Book
   Design requests, and Contact form are now all live against your project.

## Managing content

Projects, categories, and galleries are now managed from `/admin/portfolio`
in the app itself (Portfolio Management). Reading `book_design_requests` and
`contact_enquiries` (customer submissions) still requires the **service_role**
key, not the public anon key — use the Table Editor (logged into your
Supabase account) or a future admin screen to view them; the public site can
only insert into those two tables, never read them back, by design.

Images and files are managed from `/admin/media` (Media Library). Cover and
gallery images on a project are picked directly from there, or uploaded
on the spot, while editing a project.

Book Design requests submitted from the public site are managed from
`/admin/bookings` — search, filter, change status, add internal notes,
download attachments, and export to CSV. `contact_enquiries` still has no
management screen yet; view those via the Table Editor for now.

### Upgrading an existing project

Run any migrations under `migrations/` you haven't applied yet, **in order**,
in the SQL Editor. A fresh project that just ran today's `schema.sql` already
has everything and needs none of them.

- `0002_portfolio_admin.sql` — SEO fields, the draft/published/archived
  `status` column (replacing the old `is_published` boolean), and admin
  read/write access to portfolio content.
- `0003_media_library.sql` — the Media Library's `media_assets` table, a new
  `website-assets` storage bucket, SVG/PDF support, and admin upload/replace/
  delete rights on both image buckets (previously read-only for everyone).
- `0004_booking_management.sql` — an `admin_notes` field, a revised booking
  status set (New/Pending/Contacted/Completed/Rejected), admin read/update/
  delete access to `book_design_requests` (previously nobody could read
  submissions back), admin read access to the `attachments` bucket (for
  signed download URLs), and realtime change events on booking requests.

## Admin login setup

There's no public sign-up page by design — admin accounts are created
manually by you in the Supabase dashboard.

1. Go to **Authentication → Users → Add user → Create new user**.
2. Enter an email and password.
3. Turn **on** "Auto Confirm User" before saving. If you skip this, Supabase
   requires the user to click an email confirmation link before they can
   sign in, and login will fail with "Email not confirmed".
4. Go to **Authentication → URL Configuration** and add your dev URL to
   **Redirect URLs**: `http://localhost:5173/admin/login`. This is required
   for the "Forgot Password" email link to redirect back correctly. Add your
   production domain the same way once you deploy.
5. Visit `http://localhost:5173/admin/login` and sign in with the user you
   created in step 3.

The built-in Supabase email service (used for password-reset emails) is
rate-limited and meant for testing — configure custom SMTP under
**Project Settings → Auth → SMTP Settings** before relying on it in production.
