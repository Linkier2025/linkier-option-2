-- Create room allocations table to track student-room assignments
CREATE TABLE IF NOT EXISTS room_allocations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    landlord_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    move_in_date DATE,
    move_out_date DATE,
    monthly_rent DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'moved_out', 'terminated')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, room_id, status) -- Prevent duplicate active allocations
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_room_allocations_student ON room_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_room ON room_allocations(room_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_property ON room_allocations(property_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_landlord ON room_allocations(landlord_id);
CREATE INDEX IF NOT EXISTS idx_room_allocations_status ON room_allocations(status);
