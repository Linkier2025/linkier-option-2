-- Create favorites table for students to save properties
CREATE TABLE IF NOT EXISTS favorites (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique favorite per student per property
    UNIQUE(student_id, property_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_favorites_student ON favorites(student_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property ON favorites(property_id);
