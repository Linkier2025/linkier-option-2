-- Create reviews table for property, landlord, and tenant reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    reviewer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- For landlord/tenant reviews
    property_id INTEGER REFERENCES properties(id) ON DELETE CASCADE, -- For property reviews
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('property', 'landlord', 'tenant')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure either reviewee_id or property_id is set based on review_type
    CONSTRAINT check_review_target CHECK (
        (review_type = 'property' AND property_id IS NOT NULL AND reviewee_id IS NULL) OR
        (review_type IN ('landlord', 'tenant') AND reviewee_id IS NOT NULL AND property_id IS NULL)
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_property ON reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(review_type);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
