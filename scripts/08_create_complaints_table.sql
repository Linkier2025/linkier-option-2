-- Create complaints table
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    complainant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    complaint_type VARCHAR(50) NOT NULL,
    subject_type VARCHAR(20) CHECK (subject_type IN ('property', 'user', 'platform')),
    subject_id INTEGER, -- Can reference property_id or user_id
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_complaints_complainant ON complaints(complainant_id);
CREATE INDEX IF NOT EXISTS idx_complaints_type ON complaints(complaint_type);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
