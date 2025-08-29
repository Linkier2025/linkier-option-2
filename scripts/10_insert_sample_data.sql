-- Insert sample users (students and landlords)
INSERT INTO users (user_type, first_name, surname, email, phone, password_hash, university, year_of_study, gender) VALUES
('student', 'Alex', 'Johnson', 'alex.johnson@uct.ac.za', '+27 12 345 6789', 'hashed_password_1', 'University of Cape Town', '3rd Year', 'male'),
('student', 'Sarah', 'Williams', 'sarah.williams@uct.ac.za', '+27 12 987 6543', 'hashed_password_2', 'University of Cape Town', '2nd Year', 'female'),
('student', 'Emma', 'Wilson', 'emma.wilson@uct.ac.za', '+27 12 555 0123', 'hashed_password_3', 'University of Cape Town', '1st Year', 'female'),
('student', 'Michael', 'Chen', 'michael.chen@uct.ac.za', '+27 12 555 0456', 'hashed_password_4', 'University of Cape Town', '4th Year', 'male');

INSERT INTO users (user_type, first_name, surname, email, phone, password_hash, verified) VALUES
('landlord', 'John', 'Smith', 'john.smith@example.com', '+27 21 123 4567', 'hashed_password_5', true),
('landlord', 'Sarah', 'Johnson', 'sarah.johnson@example.com', '+27 21 987 6543', 'hashed_password_6', true),
('landlord', 'David', 'Brown', 'david.brown@example.com', '+27 21 555 0789', 'hashed_password_7', true);

-- Insert sample properties
INSERT INTO properties (landlord_id, title, description, location, university, monthly_rent, rooms, gender_preference, amenities, images, status) VALUES
(5, 'Modern Student Apartment', 'Beautiful modern apartment perfect for students. Located just 5 minutes walk from UCT campus with easy access to public transport.', 'Rondebosch, Cape Town', 'University of Cape Town', 4500.00, 2, 'mixed', ARRAY['wifi', 'parking', 'gym', 'kitchen', 'security'], ARRAY['/modern-apartment-living.png'], 'occupied'),
(6, 'Cozy Studio Near Campus', 'Comfortable studio apartment ideal for a single student. Fully furnished with modern amenities and excellent security.', 'Observatory, Cape Town', 'University of Cape Town', 3200.00, 1, 'female', ARRAY['wifi', 'kitchen', 'security'], ARRAY['/cozy-studio.png'], 'occupied'),
(7, 'Spacious 3-Bedroom House', 'Large house perfect for sharing. Great for 3 students with individual bedrooms and common areas.', 'Claremont, Cape Town', 'University of Cape Town', 6500.00, 3, 'mixed', ARRAY['wifi', 'parking', 'garden', 'kitchen', 'laundry'], ARRAY['/placeholder.svg'], 'available');

-- Insert sample tenancies
INSERT INTO tenancies (student_id, property_id, landlord_id, monthly_rent, deposit_amount, lease_start_date, lease_end_date, status) VALUES
(1, 1, 5, 4500.00, 4500.00, '2024-09-01', '2025-08-31', 'active'),
(2, 2, 6, 3200.00, 3200.00, '2024-10-15', '2025-10-14', 'active');

-- Insert sample rent payments
INSERT INTO rent_payments (tenancy_id, student_id, landlord_id, amount, payment_month, due_date, paid_date, status) VALUES
(1, 1, 5, 4500.00, '2024-12-01', '2024-12-01', '2024-11-28', 'paid'),
(1, 1, 5, 4500.00, '2024-11-01', '2024-11-01', '2024-10-30', 'paid'),
(1, 1, 5, 4500.00, '2024-10-01', '2024-10-01', '2024-09-29', 'paid'),
(2, 2, 6, 3200.00, '2024-12-01', '2024-12-01', '2024-11-29', 'paid'),
(2, 2, 6, 3200.00, '2024-11-01', '2024-11-01', '2024-10-31', 'paid');

-- Insert sample reviews
INSERT INTO reviews (reviewer_id, property_id, review_type, rating, comment, is_verified) VALUES
(3, 1, 'property', 5, 'Amazing apartment! Very clean, modern, and the landlord is super responsive. Perfect location near campus.', true),
(4, 1, 'property', 4, 'Great place overall. The amenities are as advertised and it''s very convenient for university. Only minor issue was the WiFi speed could be better.', true),
(1, 2, 'property', 5, 'Lived here for a full year and loved every minute. The location is unbeatable - 5 minute walk to campus.', true);

INSERT INTO reviews (reviewer_id, reviewee_id, review_type, rating, comment, is_verified) VALUES
(1, 5, 'landlord', 5, 'John is an excellent landlord. Very professional, quick to respond to any issues, and fair with deposits.', true),
(5, 1, 'tenant', 5, 'Alex is an excellent tenant. Always pays rent on time, keeps the property clean, and communicates well.', true);

-- Insert sample favorites
INSERT INTO favorites (student_id, property_id) VALUES
(1, 1),
(3, 1),
(3, 3);

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, data, is_read) VALUES
(1, 'request_response', 'Rental Request Accepted', 'Your request for Modern Student Apartment has been accepted!', '{"status": "accepted", "propertyTitle": "Modern Student Apartment", "landlordName": "John Smith"}', false),
(5, 'rental_request', 'New Rental Request', 'Alex Johnson wants to rent Modern Student Apartment', '{"requestId": "1", "studentName": "Alex Johnson", "propertyTitle": "Modern Student Apartment"}', false),
(6, 'payment', 'Rent Payment Received', 'Sarah Williams has paid rent for December 2024', '{"tenantName": "Sarah Williams", "amount": 3200, "month": "December 2024"}', true);
