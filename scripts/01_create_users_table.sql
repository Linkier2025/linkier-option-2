-- Create users table for both students and landlords
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('student', 'landlord')),
    first_name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Student-specific fields
    university VARCHAR(255),
    year_of_study VARCHAR(50),
    gender VARCHAR(20),
    
    -- Landlord-specific fields
    verified BOOLEAN DEFAULT FALSE,
    
    -- Common fields
    is_active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university);
