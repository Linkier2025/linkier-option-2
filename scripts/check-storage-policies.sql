-- List all storage buckets and their policies
SELECT * FROM storage.buckets;

-- List all storage policies
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects';

-- Get current user role
SELECT current_user, current_role, session_user;
