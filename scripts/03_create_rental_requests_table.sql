-- Create rental requests table
CREATE TABLE IF NOT EXISTS rental_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    landlord_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique request per student per property
    UNIQUE(student_id, property_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rental_requests_student ON rental_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_property ON rental_requests(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_landlord ON rental_requests(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rental_requests_status ON rental_requests(status);
