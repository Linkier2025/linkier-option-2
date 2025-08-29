-- Create useful views for common queries

-- View for property listings with landlord info and average ratings
CREATE OR REPLACE VIEW property_listings AS
SELECT 
    p.*,
    u.first_name || ' ' || u.surname AS landlord_name,
    u.email AS landlord_email,
    u.phone AS landlord_phone,
    u.verified AS landlord_verified,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    COUNT(r.id) AS review_count
FROM properties p
JOIN users u ON p.landlord_id = u.id
LEFT JOIN reviews r ON p.id = r.property_id AND r.review_type = 'property'
GROUP BY p.id, u.id, u.first_name, u.surname, u.email, u.phone, u.verified;

-- View for active tenancies with user details
CREATE OR REPLACE VIEW active_tenancies AS
SELECT 
    t.*,
    s.first_name || ' ' || s.surname AS student_name,
    s.email AS student_email,
    s.phone AS student_phone,
    l.first_name || ' ' || l.surname AS landlord_name,
    l.email AS landlord_email,
    p.title AS property_title,
    p.location AS property_location
FROM tenancies t
JOIN users s ON t.student_id = s.id
JOIN users l ON t.landlord_id = l.id
JOIN properties p ON t.property_id = p.id
WHERE t.status = 'active';

-- Function to calculate user rating
CREATE OR REPLACE FUNCTION get_user_rating(user_id INTEGER)
RETURNS DECIMAL(3,2) AS $$
BEGIN
    RETURN (
        SELECT COALESCE(AVG(rating), 0)
        FROM reviews
        WHERE reviewee_id = user_id
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get property availability
CREATE OR REPLACE FUNCTION is_property_available(property_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN NOT EXISTS (
        SELECT 1 FROM tenancies
        WHERE property_id = is_property_available.property_id
        AND status = 'active'
    );
END;
$$ LANGUAGE plpgsql;
