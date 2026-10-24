-- McGruber Lab private encrypted snapshot sync.
-- Run in the owner's Supabase SQL editor; never commit service-role keys.
-- All uploaded contents are independently AES-256-GCM encrypted in the browser.
-- Only immutable ciphertext objects and a private per-account head pointer are stored.
BEGIN;

CREATE TABLE IF NOT EXISTS public.mcgruber_sync_heads (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  revision uuid NOT NULL,
  object_path text NOT NULL,
  size_bytes bigint NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 31457280),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT mcgruber_path_format CHECK (
    object_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.mcgruber$'
  )
);
ALTER TABLE public.mcgruber_sync_heads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.mcgruber_sync_heads FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.mcgruber_sync_heads TO authenticated;

DROP POLICY IF EXISTS "mcgruber_owner_read_head" ON public.mcgruber_sync_heads;
CREATE POLICY "mcgruber_owner_read_head" ON public.mcgruber_sync_heads
  FOR SELECT TO authenticated USING (user_id = (select auth.uid()));

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('mcgruber-private','mcgruber-private',false,31457280,ARRAY['application/octet-stream'])
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = 31457280,
    allowed_mime_types = ARRAY['application/octet-stream'];

DROP POLICY IF EXISTS "mcgruber_owner_upload" ON storage.objects;
CREATE POLICY "mcgruber_owner_upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id='mcgruber-private'
  AND name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.mcgruber$'
  AND split_part(name,'/',1) = (select auth.uid())::text
);
DROP POLICY IF EXISTS "mcgruber_owner_read_object" ON storage.objects;
CREATE POLICY "mcgruber_owner_read_object" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id='mcgruber-private'
  AND split_part(name,'/',1) = (select auth.uid())::text
);

-- No DELETE/UPDATE policy for now: historical encrypted snapshots are immutable,
-- and no client can delete a concurrently referenced object. Private storage is
-- quota-limited; operators must establish retention/cleanup before heavy use.

CREATE OR REPLACE FUNCTION public.mcgruber_commit_snapshot(
  p_expected_revision uuid,
  p_new_revision uuid,
  p_object_path text,
  p_size_bytes bigint
) RETURNS TABLE(revision uuid, object_path text, size_bytes bigint, updated_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $body$
DECLARE
  v_user uuid := (select auth.uid());
  v_row public.mcgruber_sync_heads%ROWTYPE;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED' USING ERRCODE='28000';
  END IF;
  IF p_new_revision IS NULL OR
     p_size_bytes IS NULL OR p_size_bytes <= 0 OR p_size_bytes > 31457280 OR
     p_object_path IS NULL OR
     p_object_path !~ ('^' || v_user::text || '/[0-9a-f-]{36}\.mcgruber$') THEN
    RAISE EXCEPTION 'INVALID_SYNC_SNAPSHOT' USING ERRCODE='22023';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM storage.objects AS o
    WHERE o.bucket_id='mcgruber-private'
      AND o.name=p_object_path
      AND o.owner_id=v_user::text
  ) THEN
    RAISE EXCEPTION 'MISSING_OR_UNOWNED_CIPHERTEXT' USING ERRCODE='42501';
  END IF;
  -- A non-null expected revision cannot create a brand-new head.
  IF p_expected_revision IS NOT NULL AND
     NOT EXISTS (SELECT 1 FROM public.mcgruber_sync_heads h WHERE h.user_id=v_user) THEN
    RAISE EXCEPTION 'SYNC_CONFLICT' USING ERRCODE='40001';
  END IF;
  INSERT INTO public.mcgruber_sync_heads AS h
    (user_id,revision,object_path,size_bytes,updated_at)
  VALUES (v_user,p_new_revision,p_object_path,p_size_bytes,now())
  ON CONFLICT (user_id) DO UPDATE
     SET revision=EXCLUDED.revision,object_path=EXCLUDED.object_path,
         size_bytes=EXCLUDED.size_bytes,updated_at=now()
     WHERE h.revision IS NOT DISTINCT FROM p_expected_revision
  RETURNING h.* INTO v_row;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'SYNC_CONFLICT' USING ERRCODE='40001';
  END IF;
  RETURN QUERY SELECT v_row.revision,v_row.object_path,v_row.size_bytes,v_row.updated_at;
END
$body$;

REVOKE ALL ON FUNCTION public.mcgruber_commit_snapshot(uuid,uuid,text,bigint)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.mcgruber_commit_snapshot(uuid,uuid,text,bigint)
TO authenticated;

COMMIT;
