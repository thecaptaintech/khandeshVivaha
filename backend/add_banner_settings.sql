-- Add banner text settings to the settings table
USE khandesh_vivah;

INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
('banner_text_english', 'Khandesh Matrimony is a matchmaking service only. Please verify all details independently before marriage.', 'text', 'Banner text in English'),
('banner_text_marathi', 'खान्देश मॅट्रिमनी ही केवळ ओळख करून देणारी सेवा आहे. विवाह ठरवण्याआधी सर्व माहिती स्वतः पडताळून घ्या.', 'text', 'Banner text in Marathi')
ON DUPLICATE KEY UPDATE 
    setting_value = VALUES(setting_value),
    updated_at = CURRENT_TIMESTAMP;

