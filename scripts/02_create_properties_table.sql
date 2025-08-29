-- Create properties table
CREATE TABLE IF NOT EXISTS properties (
    id SERIAL PRIMARY KEY,
    landlord_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    university VARCHAR(255) NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    rooms INTEGER NOT NULL,
    gender_preference VARCHAR(20) CHECK (gender_preference IN ('male', 'female', 'mixed')),
    amenities TEXT[], -- Array of amenities
    images TEXT[], -- Array of image URLs
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_properties_landlord ON properties(landlord_id);
CREATE INDEX IF NOT EXISTS idx_properties_university ON properties(university);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_rent ON properties(monthly_rent);
