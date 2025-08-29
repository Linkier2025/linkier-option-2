-- Create rooms table for individual room management
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    room_number VARCHAR(50) NOT NULL,
    room_type VARCHAR(100) NOT NULL, -- 'Single Room', 'Shared Room (2 people)', etc.
    floor INTEGER,
    capacity INTEGER NOT NULL DEFAULT 1, -- Maximum number of occupants
    current_occupancy INTEGER NOT NULL DEFAULT 0, -- Current number of occupants
    monthly_rent DECIMAL(10,2) NOT NULL,
    amenities TEXT[], -- Room-specific amenities
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(property_id, room_number)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rooms_property ON rooms(property_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_capacity ON rooms(capacity);
