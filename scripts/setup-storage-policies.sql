-- Enable RLS on the storage.objects table if not enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated uploads to properties" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own files" ON storage.objects;

-- Create a policy that allows authenticated users to upload files to the properties bucket
CREATE POLICY "Allow authenticated uploads to properties"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'properties' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own files
CREATE POLICY "Allow users to view their own files"
ON storage.objects FOR SELECT TO authenticated
USING (
    bucket_id = 'properties' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Allow users to update their own files"
ON storage.objects FOR UPDATE TO authenticated
USING (
    bucket_id = 'properties' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Allow users to delete their own files"
ON storage.objects FOR DELETE TO authenticated
USING (
    bucket_id = 'properties' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Create the properties bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;
