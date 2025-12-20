-- Create settings table for admin-configurable registration success page content
USE khandesh_vivah;

CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT DEFAULT NULL,
    setting_type ENUM('text', 'image', 'number') DEFAULT 'text',
    description VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('payment_qr_code', NULL, 'image', 'QR code image path for payment'),
('contact_whatsapp', '9167681454', 'text', 'WhatsApp/Contact number'),
('contact_email', 'info@khandeshmatrimony.com', 'text', 'Contact email address'),
('upi_id', '9167681454@ybl', 'text', 'UPI ID for payments'),
('registration_fee', '₹1500 (6 months)', 'text', 'Registration fee description');

