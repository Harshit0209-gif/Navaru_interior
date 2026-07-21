-- Hero background video support — run this once in the Supabase SQL Editor.
-- Safe to re-run. Requires 0001–0009 to have been run first.
--
-- What this does:
--   1. Adds a `hero_video_url` column to `site_content` so an admin can set
--      a background video for the Hero section instead of a static image.
--   2. Widens the `website-assets` storage bucket's allowed MIME types to
--      include MP4/WEBM video, and raises its file size limit (videos are
--      much larger than the photos/logos it previously held) so the upload
--      isn't rejected server-side even after the client-side check passes.

alter table site_content add column if not exists hero_video_url text;

update storage.buckets
set
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'application/pdf', 'video/mp4', 'video/webm'],
  file_size_limit = 52428800 -- 50MB
where id = 'website-assets';
