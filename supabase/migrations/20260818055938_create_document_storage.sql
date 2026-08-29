/*
# ReqGuard AI — Document Storage Bucket

## Overview
Creates a private storage bucket for uploaded requirement documents (PDF, DOCX, TXT).
Files are owner-scoped: users can only read/write/delete their own uploads.

## Storage
- Bucket `documents` (private)
- Folder structure: `{user_id}/{filename}`
- MIME-restricted via frontend validation; storage policies enforce ownership

## Security
- SELECT (read) policy: owner only
- INSERT (upload) policy: owner only, must be authenticated
- UPDATE policy: owner only
- DELETE policy: owner only
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (object-level)
DROP POLICY IF EXISTS "read_own_documents" ON storage.objects;
CREATE POLICY "read_own_documents" ON storage.objects
  FOR SELECT TO authenticated USING (
    bucket_id = 'documents' AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "insert_own_documents" ON storage.objects;
CREATE POLICY "insert_own_documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'documents' AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "update_own_documents" ON storage.objects;
CREATE POLICY "update_own_documents" ON storage.objects
  FOR UPDATE TO authenticated USING (
    bucket_id = 'documents' AND owner = auth.uid()
  ) WITH CHECK (
    bucket_id = 'documents' AND owner = auth.uid()
  );

DROP POLICY IF EXISTS "delete_own_documents" ON storage.objects;
CREATE POLICY "delete_own_documents" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'documents' AND owner = auth.uid()
  );
