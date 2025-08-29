-- Add student-specific fields to profiles table
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS student_id text,
  ADD COLUMN IF NOT EXISTS registration_number text,
  ADD COLUMN IF NOT EXISTS faculty text,
  ADD COLUMN IF NOT EXISTS program text,
  ADD COLUMN IF NOT EXISTS year_of_study text,
  ADD COLUMN IF NOT EXISTS expected_graduation_date text,
  ADD COLUMN IF NOT EXISTS university text,
  ADD COLUMN IF NOT EXISTS emergency_contact_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone text,
  ADD COLUMN IF NOT EXISTS emergency_contact_relationship text;

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_first text;
  v_surname text;
  v_full text;
  v_student_id text;
  v_registration_number text;
  v_faculty text;
  v_program text;
  v_year_of_study text;
  v_expected_graduation text;
  v_university text;
  v_emergency_name text;
  v_emergency_phone text;
  v_emergency_relation text;
BEGIN
  -- Extract basic info
  v_first := COALESCE(NEW.raw_user_meta_data->>'first_name', NULL);
  v_surname := COALESCE(NEW.raw_user_meta_data->>'surname', NULL);
  v_full := COALESCE(NEW.raw_user_meta_data->>'full_name', CONCAT(v_first, ' ', v_surname));
  
  -- Extract new student fields
  v_student_id := COALESCE(NEW.raw_user_meta_data->>'student_id', NULL);
  v_registration_number := COALESCE(NEW.raw_user_meta_data->>'registration_number', NULL);
  v_faculty := COALESCE(NEW.raw_user_meta_data->>'faculty', NULL);
  v_program := COALESCE(NEW.raw_user_meta_data->>'program', NULL);
  v_year_of_study := COALESCE(NEW.raw_user_meta_data->>'year_of_study', NULL);
  v_expected_graduation := COALESCE(NEW.raw_user_meta_data->>'expected_graduation_date', NULL);
  v_university := COALESCE(NEW.raw_user_meta_data->>'university', NULL);
  v_emergency_name := COALESCE(NEW.raw_user_meta_data->>'emergency_contact_name', NULL);
  v_emergency_phone := COALESCE(NEW.raw_user_meta_data->>'emergency_contact_phone', NULL);
  v_emergency_relation := COALESCE(NEW.raw_user_meta_data->>'emergency_contact_relationship', NULL);

  -- Insert the new profile with all fields
  INSERT INTO public.profiles (
    id, email, first_name, surname, full_name, phone, role,
    student_id, registration_number, faculty, program, year_of_study,
    expected_graduation_date, university, emergency_contact_name,
    emergency_contact_phone, emergency_contact_relationship
  ) VALUES (
    NEW.id, 
    NEW.email, 
    v_first, 
    v_surname, 
    v_full,
    NEW.phone,
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'student'),
    v_student_id,
    v_registration_number,
    v_faculty,
    v_program,
    v_year_of_study,
    v_expected_graduation,
    v_university,
    v_emergency_name,
    v_emergency_phone,
    v_emergency_relation
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
