-- Rebuild the primary userdetails schema and related tables
-- WARNING: This script DROPS existing `users`, `userdetails`, and `photos` tables.
--          All previous data in these tables will be lost. Back up before running!

USE khandesh_vivah;

SET @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS photos;
DROP TABLE IF EXISTS userdetails;
DROP TABLE IF EXISTS users;

CREATE TABLE userdetails (
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
    approval_status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid') NOT NULL DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_register_id (register_id),
    INDEX idx_gender (gender),
    INDEX idx_approval_status (approval_status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE photos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    photo_path VARCHAR(255) NOT NULL,
    is_primary TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES userdetails(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_is_primary (is_primary)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;


