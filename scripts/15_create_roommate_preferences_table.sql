-- Create roommate preferences table
CREATE TABLE IF NOT EXISTS roommate_preferences (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    study_hours VARCHAR(50), -- 'Morning (6AM-10AM)', 'Evening (6PM-10PM)', etc.
    sleep_schedule VARCHAR(50), -- 'Early Bird (10PM-6AM)', 'Night Owl (12AM-8AM)', etc.
    cleanliness_level VARCHAR(50), -- 'Very Clean', 'Clean', 'Moderately Clean', 'Relaxed'
    social_level VARCHAR(50), -- 'Very Social', 'Social', 'Moderately Social', 'Quiet'
    music_preference VARCHAR(50), -- 'Loud Music OK', 'Low Volume', 'Headphones Only', 'No Music'
    guest_policy VARCHAR(50), -- 'Frequent Guests', 'Occasional Guests', 'Rare Guests', 'No Guests'
    smoking_preference VARCHAR(20) DEFAULT 'non_smoker' CHECK (smoking_preference IN ('smoker', 'non_smoker', 'no_preference')),
    pet_preference VARCHAR(20) DEFAULT 'no_pets' CHECK (pet_preference IN ('pets_ok', 'no_pets', 'no_preference')),
    budget_range_min DECIMAL(10,2),
    budget_range_max DECIMAL(10,2),
    preferred_gender VARCHAR(20) CHECK (preferred_gender IN ('male', 'female', 'no_preference')),
    additional_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id) -- One preference record per student
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_roommate_preferences_student ON roommate_preferences(student_id);
CREATE INDEX IF NOT EXISTS idx_roommate_preferences_budget ON roommate_preferences(budget_range_min, budget_range_max);
