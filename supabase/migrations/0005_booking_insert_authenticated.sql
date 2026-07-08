-- Fix: the public "Book a Design Consultation" form uses the same Supabase
-- client instance as the admin panel. If an admin happens to be logged in
-- in the same browser, requests carry the admin's `authenticated` JWT
-- instead of `anon` — and previously there was no INSERT policy for
-- `authenticated` on book_design_requests, so the submission was rejected
-- by RLS ("new row violates row-level security policy"). This adds a
-- matching authenticated INSERT policy so the form works regardless of
-- whether an admin session is active in that browser. Safe to re-run.

drop policy if exists "authenticated users can submit a booking request" on book_design_requests;
create policy "authenticated users can submit a booking request"
  on book_design_requests for insert
  to authenticated
  with check (true);
