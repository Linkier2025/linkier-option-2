-- Add academic information fields to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS faculty VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255),
ADD COLUMN IF NOT EXISTS program VARCHAR(255),
ADD COLUMN IF NOT EXISTS student_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(50) DEFAULT 'full-time',
ADD COLUMN IF NOT EXISTS expected_graduation DATE;

-- Create an index on student_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id) 
WHERE student_id IS NOT NULL;

-- Create a view for student academic information
CREATE OR REPLACE VIEW student_academic_info AS
SELECT 
    id,
    first_name || ' ' || surname AS student_name,
    email,
    university,
    year_of_study,
    faculty,
    department,
    program,
    student_id,
    enrollment_status,
    expected_graduation,
    created_at
FROM users
WHERE user_type = 'student';

-- Add a comment to the view
COMMENT ON VIEW student_academic_info IS 'View for accessing student academic information';
