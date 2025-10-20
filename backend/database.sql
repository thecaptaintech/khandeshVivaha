-- Create Database
CREATE DATABASE IF NOT EXISTS khandesh_vivah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE khandesh_vivah;

-- Admin Table
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender ENUM('Male', 'Female', 'Divorcee', 'Widow') NOT NULL,
    date_of_birth DATE NOT NULL,
    caste_religion VARCHAR(100),
    education VARCHAR(100),
    occupation VARCHAR(100),
    height VARCHAR(20),
    weight VARCHAR(20),
    district VARCHAR(100),
    taluka VARCHAR(100),
    village VARCHAR(100),
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    about_yourself TEXT,
    approval_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_register_id (register_id),
    INDEX idx_approval_status (approval_status),
    INDEX idx_gender (gender)
);

-- Photos Table
CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin (username: admin, password: admin123)
-- Password is hashed using bcrypt
INSERT INTO admin (username, password, email) VALUES 
('admin', '$2a$10$8JXVzWqH9NKhFZxKGqPnLumz8P2BQ7fVqQVL3vZX7FhQZVqVHqW6m', 'admin@khandeshvivah.com');

-- Sample data for testing (optional)
-- You can remove this in production

