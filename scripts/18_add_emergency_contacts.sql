-- Add emergency contact information to users table for students
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(200),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact_relationship VARCHAR(100);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update the updated_at column on users table
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create a view for student emergency contacts
CREATE OR REPLACE VIEW student_emergency_contacts AS
SELECT 
    id,
    first_name || ' ' || surname AS student_name,
    email AS student_email,
    phone AS student_phone,
    emergency_contact_name,
    emergency_contact_phone,
    emergency_contact_relationship,
    university
FROM users
WHERE user_type = 'student' 
AND (emergency_contact_name IS NOT NULL OR emergency_contact_phone IS NOT NULL);

-- Add a comment to the view
COMMENT ON VIEW student_emergency_contacts IS 'View for accessing student emergency contact information';

-- Create an index for faster emergency contact lookups
CREATE INDEX IF NOT EXISTS idx_student_emergency_contacts 
ON users(user_type, emergency_contact_phone) 
WHERE user_type = 'student' AND emergency_contact_phone IS NOT NULL;
