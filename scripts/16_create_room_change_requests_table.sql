-- Create room change requests table
CREATE TABLE IF NOT EXISTS room_change_requests (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    requested_room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    landlord_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_type VARCHAR(30) NOT NULL CHECK (request_type IN ('room_change', 'roommate_change', 'property_change')),
    reason VARCHAR(100), -- 'roommate-conflict', 'study-environment', 'noise-issues', etc.
    detailed_reason TEXT,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    landlord_response TEXT,
    requested_date DATE NOT NULL DEFAULT CURRENT_DATE,
    response_date DATE,
    completion_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_room_change_requests_student ON room_change_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_room_change_requests_landlord ON room_change_requests(landlord_id);
CREATE INDEX IF NOT EXISTS idx_room_change_requests_status ON room_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_room_change_requests_type ON room_change_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_room_change_requests_priority ON room_change_requests(priority);
