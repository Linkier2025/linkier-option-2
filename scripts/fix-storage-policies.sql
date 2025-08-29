-- Enable RLS on the storage.objects table if not enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to upload files to their own folder
CREATE POLICY "Allow users to upload to their own folder"
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

-- Create a public bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('properties', 'properties', true)
ON CONFLICT (id) DO NOTHING;
