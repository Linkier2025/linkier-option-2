-- First, create the 'properties' bucket if it doesn't exist
-- This needs to be done through the Supabase dashboard:
-- 1. Go to Storage
-- 2. Click 'Create a new bucket'
-- 3. Name it 'properties' and make it public

-- Enable RLS on storage.objects if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_tables 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'Enabled RLS on storage.objects';
    ELSE
        RAISE NOTICE 'RLS already enabled on storage.objects';
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error enabling RLS: %', SQLERRM;
END $$;

-- Function to safely create a policy
CREATE OR REPLACE FUNCTION create_storage_policy_if_not_exists(
    policy_name text,
    table_name text,
    command text,
    role_name text,
    using_expr text DEFAULT NULL,
    with_check_expr text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE policyname = policy_name 
        AND tablename = table_name
    ) THEN
        EXECUTE format(
            'CREATE POLICY %I ON %I.%I 
             FOR %s TO %s %s %s',
            policy_name,
            'storage',
            table_name,
            command,
            role_name,
            CASE WHEN using_expr IS NOT NULL 
                 THEN 'USING (' || using_expr || ')' 
                 ELSE '' 
            END,
            CASE 
                WHEN with_check_expr IS NOT NULL AND command = 'INSERT' 
                THEN 'WITH CHECK (' || with_check_expr || ')'
                WHEN with_check_expr IS NOT NULL 
                THEN 'WITH CHECK (' || with_check_expr || ')'
                ELSE '' 
            END
        );
        RAISE NOTICE 'Created policy % on %.%', policy_name, 'storage', table_name;
    ELSE
        RAISE NOTICE 'Policy % on %.% already exists', policy_name, 'storage', table_name;
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating policy %: %', policy_name, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Create the storage policies
SELECT create_storage_policy_if_not_exists(
    'Allow authenticated uploads to properties',
    'objects',
    'INSERT',
    'authenticated',
    NULL,
    $$bucket_id = 'properties' AND (storage.foldername(name))[1] = auth.uid()::text$$
);

SELECT create_storage_policy_if_not_exists(
    'Allow users to view their own files',
    'objects',
    'SELECT',
    'authenticated',
    $$bucket_id = 'properties' AND (storage.foldername(name))[1] = auth.uid()::text$$
);

SELECT create_storage_policy_if_not_exists(
    'Allow users to update their own files',
    'objects',
    'UPDATE',
    'authenticated',
    $$bucket_id = 'properties' AND (storage.foldername(name))[1] = auth.uid()::text$$
);

SELECT create_storage_policy_if_not_exists(
    'Allow users to delete their own files',
    'objects',
    'DELETE',
    'authenticated',
    $$bucket_id = 'properties' AND (storage.foldername(name))[1] = auth.uid()::text$$
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA storage TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA storage TO authenticated;
