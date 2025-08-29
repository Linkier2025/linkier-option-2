-- Create rent payments table for tracking payment history
CREATE TABLE IF NOT EXISTS rent_payments (
    id SERIAL PRIMARY KEY,
    tenancy_id INTEGER NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    landlord_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_month DATE NOT NULL, -- First day of the month being paid for
    due_date DATE NOT NULL,
    paid_date DATE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'partial')),
    payment_method VARCHAR(50),
    transaction_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rent_payments_tenancy ON rent_payments(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_student ON rent_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_rent_payments_status ON rent_payments(status);
CREATE INDEX IF NOT EXISTS idx_rent_payments_month ON rent_payments(payment_month);
