-- Add new columns to users table for biodata upload functionality

-- Add biodata_file and registration_type columns if they don't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS biodata_file VARCHAR(255) DEFAULT NULL COMMENT 'Path to uploaded biodata file',
ADD COLUMN IF NOT EXISTS registration_type ENUM('form', 'biodata') DEFAULT 'form' COMMENT 'Type of registration';

-- Make certain fields nullable for biodata registration
ALTER TABLE users 
MODIFY COLUMN gender ENUM('Male','Female','Divorcee','Widow','Widower') NULL DEFAULT NULL,
MODIFY COLUMN date_of_birth DATE NULL DEFAULT NULL,
MODIFY COLUMN contact_number VARCHAR(20) NULL DEFAULT NULL;

-- Update existing records to have registration_type as 'form'
UPDATE users SET registration_type = 'form' WHERE registration_type IS NULL;

-- Add index on registration_type for faster queries
ALTER TABLE users ADD INDEX idx_registration_type (registration_type);
