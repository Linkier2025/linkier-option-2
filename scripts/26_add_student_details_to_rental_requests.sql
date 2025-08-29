-- Add columns to store student details separately
ALTER TABLE rental_requests
ADD COLUMN IF NOT EXISTS student_phone TEXT,
ADD COLUMN IF NOT EXISTS student_university TEXT,
ADD COLUMN IF NOT EXISTS student_year TEXT,
ADD COLUMN IF NOT EXISTS student_gender TEXT;
