-- Create roommate relationships table
CREATE TABLE IF NOT EXISTS roommate_relationships (
    id SERIAL PRIMARY KEY,
    student1_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student2_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    relationship_start DATE NOT NULL DEFAULT CURRENT_DATE,
    relationship_end DATE,
    compatibility_score INTEGER CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
    student1_rating INTEGER CHECK (student1_rating >= 1 AND student1_rating <= 5),
    student2_rating INTEGER CHECK (student2_rating >= 1 AND student2_rating <= 5),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'conflict', 'resolved')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student1_id, student2_id, room_id, status), -- Prevent duplicate active relationships
    CHECK (student1_id != student2_id) -- Students cannot be roommates with themselves
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_roommate_relationships_student1 ON roommate_relationships(student1_id);
CREATE INDEX IF NOT EXISTS idx_roommate_relationships_student2 ON roommate_relationships(student2_id);
CREATE INDEX IF NOT EXISTS idx_roommate_relationships_room ON roommate_relationships(room_id);
CREATE INDEX IF NOT EXISTS idx_roommate_relationships_status ON roommate_relationships(status);
