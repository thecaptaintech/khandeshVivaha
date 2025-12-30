-- ============================================
-- Complete Database Setup for Khandesh Vivah
-- ============================================
-- This script creates all required tables
-- Run: mysql -u root -p < setup_database.sql
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS khandesh_vivah CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE khandesh_vivah;

-- ============================================
-- Admin Table
-- ============================================
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) DEFAULT NULL,
    role ENUM('admin', 'agent') DEFAULT 'agent',
    status ENUM('active', 'blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Userdetails Table (Main user profiles)
-- ============================================
CREATE TABLE IF NOT EXISTS userdetails (
    id INT AUTO_INCREMENT PRIMARY KEY,
    register_id VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(200) NOT NULL,
    first_name VARCHAR(100) DEFAULT NULL,
    surname VARCHAR(100) DEFAULT NULL,
    kul VARCHAR(100) DEFAULT NULL,
    gender VARCHAR(50) DEFAULT NULL,
    email VARCHAR(255) DEFAULT NULL,
    mobile_no_1 VARCHAR(20) DEFAULT NULL,
    mobile_no_2 VARCHAR(20) DEFAULT NULL,
    contact_number VARCHAR(20) DEFAULT NULL,
    date_of_birth DATE DEFAULT NULL,
    birth_time TIME DEFAULT NULL,
    birth_village VARCHAR(100) DEFAULT NULL,
    birth_district VARCHAR(100) DEFAULT NULL,
    marital_status ENUM('Unmarried', 'Divorced', 'Widow', 'Widower') DEFAULT 'Unmarried',
    permanent_address TEXT DEFAULT NULL,
    current_residence VARCHAR(200) DEFAULT NULL,
    company_address TEXT DEFAULT NULL,
    native_district VARCHAR(100) DEFAULT NULL,
    native_village_taluka VARCHAR(200) DEFAULT NULL,
    district VARCHAR(100) DEFAULT NULL,
    taluka VARCHAR(100) DEFAULT NULL,
    village VARCHAR(100) DEFAULT NULL,
    occupation VARCHAR(200) DEFAULT NULL,
    education VARCHAR(200) DEFAULT NULL,
    income VARCHAR(100) DEFAULT NULL,
    height VARCHAR(50) DEFAULT NULL,
    weight VARCHAR(50) DEFAULT NULL,
    blood_group VARCHAR(10) DEFAULT NULL,
    color VARCHAR(50) DEFAULT NULL,
    personality VARCHAR(200) DEFAULT NULL,
    hobbies VARCHAR(200) DEFAULT NULL,
    caste_religion VARCHAR(100) DEFAULT NULL,
    about_yourself TEXT DEFAULT NULL,
    father_name VARCHAR(100) DEFAULT NULL,
    father_occupation VARCHAR(100) DEFAULT NULL,
    mother_name VARCHAR(100) DEFAULT NULL,
    mother_occupation VARCHAR(100) DEFAULT NULL,
    brothers VARCHAR(100) DEFAULT NULL,
    sisters VARCHAR(100) DEFAULT NULL,
    family_type ENUM('Joint', 'Nuclear') DEFAULT NULL,
    family_status VARCHAR(50) DEFAULT NULL,
    family_values VARCHAR(50) DEFAULT NULL,
    rashi VARCHAR(50) DEFAULT NULL,
    nakshatra VARCHAR(50) DEFAULT NULL,
    gotra VARCHAR(50) DEFAULT NULL,
    manglik VARCHAR(20) DEFAULT NULL,
    nadi VARCHAR(20) DEFAULT NULL,
    gana VARCHAR(20) DEFAULT NULL,
    expected_education VARCHAR(200) DEFAULT NULL,
    expected_occupation VARCHAR(200) DEFAULT NULL,
    expected_income VARCHAR(100) DEFAULT NULL,
    expected_location VARCHAR(200) DEFAULT NULL,
    other_expectations TEXT DEFAULT NULL,
    biodata_file VARCHAR(255) DEFAULT NULL,
    registration_type ENUM('form', 'biodata') NOT NULL DEFAULT 'form',
    approval_status ENUM('pending', 'approved', 'rejected', 'deleted') NOT NULL DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
    created_by VARCHAR(100) DEFAULT 'USER',
    status ENUM('active', 'inactive') DEFAULT 'active',
    expiry_date DATE DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_register_id (register_id),
    INDEX idx_gender (gender),
    INDEX idx_approval_status (approval_status),
    INDEX idx_payment_status (payment_status),
    INDEX idx_status (status),
    INDEX idx_created_by (created_by),
    INDEX idx_expiry_date (expiry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Photos Table
-- ============================================
CREATE TABLE IF NOT EXISTS photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES userdetails(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Settings Table
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Insert Default Admin User
-- ============================================
-- Username: admin
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admin (username, password, email, role, status) VALUES 
('admin', '$2a$10$8JXVzWqH9NKhFZxKGqPnLumz8P2BQ7fVqQVL3vZX7FhQZVqVHqW6m', 'admin@khandeshvivah.com', 'admin', 'active')
ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- Insert Default Settings
-- ============================================
INSERT INTO settings (setting_key, setting_value) VALUES
('contact_email', 'info@khandeshmatrimony.com'),
('contact_whatsapp', '9167681454'),
('website_title', 'Khandesh Matrimony'),
('website_description', 'Khandesh Matrimony - Find your perfect match')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- ============================================
-- Success Message
-- ============================================
SELECT 'Database setup completed successfully!' AS message;
SELECT 'Tables created: admin, userdetails, photos, settings' AS tables;
SELECT 'Default admin: username=admin, password=admin123' AS admin_info;

