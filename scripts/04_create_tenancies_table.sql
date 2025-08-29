-- Create tenancies table for active rental agreements
CREATE TABLE IF NOT EXISTS tenancies (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    property_id INTEGER NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    landlord_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    monthly_rent DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2),
    lease_start_date DATE NOT NULL,
    lease_end_date DATE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'ended', 'terminated')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tenancies_student ON tenancies(student_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_property ON tenancies(property_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_landlord ON tenancies(landlord_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_status ON tenancies(status);
