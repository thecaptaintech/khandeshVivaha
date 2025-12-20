const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPDATEABLE_FIELDS = new Set([
    'full_name',
    'first_name',
    'surname',
    'kul',
    'gender',
    'email',
    'mobile_no_1',
    'mobile_no_2',
    'contact_number',
    'date_of_birth',
    'birth_time',
    'birth_village',
    'birth_district',
    'marital_status',
    'permanent_address',
    'current_residence',
    'company_address',
    'native_district',
    'native_village_taluka',
    'district',
    'taluka',
    'village',
    'occupation',
    'education',
    'income',
    'height',
    'weight',
    'blood_group',
    'color',
    'personality',
    'hobbies',
    'caste_religion',
    'about_yourself',
    'father_name',
    'father_occupation',
    'mother_name',
    'mother_occupation',
    'brothers',
    'sisters',
    'family_type',
    'family_status',
    'family_values',
    'rashi',
    'nakshatra',
    'gotra',
    'manglik',
    'nadi',
    'gana',
    'expected_education',
    'expected_occupation',
    'expected_income',
    'expected_location',
    'other_expectations',
    'biodata_file',
    'registration_type',
    'approval_status',
    'payment_status'
]);

function normalizeValue(value, fieldName = '') {
    if (value === undefined || value === null) {
        return null;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return null;
        }
        return normalizeValue(value[0], fieldName);
    }
    
    // Handle Date objects first
    if (value instanceof Date) {
        if (fieldName === 'date_of_birth') {
            // Format as YYYY-MM-DD (use UTC to avoid timezone issues)
            const year = value.getUTCFullYear();
            const month = String(value.getUTCMonth() + 1).padStart(2, '0');
            const day = String(value.getUTCDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        return value.toISOString();
    }
    
    if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
            return null;
        }
        // Handle date_of_birth - simple conversion to YYYY-MM-DD
        if (fieldName === 'date_of_birth') {
            // If it's already in YYYY-MM-DD format, return as is
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
                return trimmed;
            }
            // If it contains 'T' (ISO format), extract just the date part
            if (trimmed.includes('T')) {
                return trimmed.split('T')[0];
            }
            // If it contains space, extract date part
            if (trimmed.includes(' ')) {
                return trimmed.split(' ')[0];
            }
            // Try to parse and format
            try {
                const date = new Date(trimmed);
                if (!isNaN(date.getTime())) {
                    // Use UTC to avoid timezone shifts
                    const year = date.getUTCFullYear();
                    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(date.getUTCDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                }
            } catch (e) {
                console.error(`Error parsing date: ${trimmed}`, e);
            }
            // If all else fails, return as is (might be invalid)
            return trimmed;
        }
        return trimmed;
    }
    return value;
}

// QR Code upload storage
const qrCodeStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'qr-code-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadQrCode = multer({
    storage: qrCodeStorage,
    limits: {
        fileSize: 2 * 1024 * 1024 // 2MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

router.use(authenticateToken);

// QR Code upload route - defined early to avoid conflicts
router.post('/upload-qr', uploadQrCode.single('qr_code'), async (req, res) => {
    try {
        console.log('QR code upload route hit');
        console.log('Request file:', req.file);
        
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ message: 'No file uploaded. Please select a QR code image.' });
        }
        
        console.log('QR code uploaded successfully:', req.file.filename);
        res.json({ qr_code_path: req.file.filename });
    } catch (error) {
        console.error('Error uploading QR code:', error);
        res.status(500).json({ message: 'Error uploading QR code', detail: error.message });
    }
});

// Test route to verify router is working
router.get('/test', (req, res) => {
    res.json({ message: 'Admin router is working', path: req.path });
});

router.get('/dashboard/stats', async (req, res) => {
    try {
        const [pending] = await db.query(
            'SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "pending"'
        );
        const [approved] = await db.query(
            'SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "approved"'
        );
        const [rejected] = await db.query(
            'SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "rejected"'
        );
        const [paid] = await db.query(
            'SELECT COUNT(*) AS count FROM userdetails WHERE payment_status = "paid"'
        );
        const [unpaid] = await db.query(
            'SELECT COUNT(*) AS count FROM userdetails WHERE payment_status = "unpaid"'
        );

        res.json({
            pending: pending[0].count,
            approved: approved[0].count,
            rejected: rejected[0].count,
            paid: paid[0].count,
            unpaid: unpaid[0].count
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

router.post('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            'UPDATE userdetails SET approval_status = "approved", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        res.json({ message: 'User approved successfully' });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: 'Error approving user' });
    }
});

router.post('/reject/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query(
            'UPDATE userdetails SET approval_status = "rejected", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        res.json({ message: 'User rejected successfully' });
    } catch (error) {
        console.error('Error rejecting user:', error);
        res.status(500).json({ message: 'Error rejecting user' });
    }
});

router.post('/payment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        await db.query(
            'UPDATE userdetails SET payment_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [payment_status, id]
        );

        res.json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Error updating payment status' });
    }
});

router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM userdetails WHERE id = ?', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Update request for user ID:', id);
        console.log('Request body keys:', Object.keys(req.body || {}));

        // Verify user exists and get current data
        const [userCheck] = await db.query('SELECT id FROM userdetails WHERE id = ?', [id]);
        if (userCheck.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get current user data to compare and skip unchanged fields
        // Use DATE_FORMAT to ensure date_of_birth is returned as string (YYYY-MM-DD)
        const [currentUser] = await db.query(
            'SELECT *, DATE_FORMAT(date_of_birth, "%Y-%m-%d") AS date_of_birth FROM userdetails WHERE id = ?',
            [id]
        );
        if (currentUser.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        const currentData = currentUser[0];
        // Ensure date_of_birth is a string (DATE_FORMAT returns it as string, but handle both cases)
        if (currentData.date_of_birth instanceof Date) {
            const year = currentData.date_of_birth.getUTCFullYear();
            const month = String(currentData.date_of_birth.getUTCMonth() + 1).padStart(2, '0');
            const day = String(currentData.date_of_birth.getUTCDate()).padStart(2, '0');
            currentData.date_of_birth = `${year}-${month}-${day}`;
        }

        // Normalize all incoming values - simple conversion
        const payload = Object.fromEntries(
            Object.entries(req.body || {}).map(([key, value]) => {
                return [key, normalizeValue(value, key)];
            })
        );

        if (payload.mobile_no_1 && !payload.contact_number) {
            payload.contact_number = payload.mobile_no_1;
        }

        const setClauses = [];
        const values = [];
        const fieldValueMap = []; // Track field names with their values

        Object.entries(payload).forEach(([field, value]) => {
            if (!UPDATEABLE_FIELDS.has(field)) {
                return;
            }
            
            // Simple value handling - date_of_birth is already normalized to YYYY-MM-DD
            let finalValue = value;
            
            // Skip if value hasn't changed (compare with current database value)
            if (field === 'date_of_birth') {
                // Normalize current database date for comparison (extract YYYY-MM-DD)
                let currentDate = null;
                if (currentData[field]) {
                    if (currentData[field] instanceof Date) {
                        // Use UTC to avoid timezone shifts
                        const year = currentData[field].getUTCFullYear();
                        const month = String(currentData[field].getUTCMonth() + 1).padStart(2, '0');
                        const day = String(currentData[field].getUTCDate()).padStart(2, '0');
                        currentDate = `${year}-${month}-${day}`;
                    } else {
                        // Extract date part from string
                        const dateStr = String(currentData[field]);
                        currentDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
                    }
                }
                
                // Ensure finalValue is in YYYY-MM-DD format
                if (finalValue && typeof finalValue === 'string') {
                    if (finalValue.includes('T')) {
                        finalValue = finalValue.split('T')[0];
                    } else if (finalValue.includes(' ')) {
                        finalValue = finalValue.split(' ')[0];
                    }
                }
                
                // Compare normalized dates
                if (currentDate === finalValue) {
                    return; // Skip unchanged date
                }
                
                // Validate format
                if (finalValue && !/^\d{4}-\d{2}-\d{2}$/.test(finalValue)) {
                    console.error(`Invalid date_of_birth format: ${finalValue}`);
                    return; // Skip invalid date
                }
            } else if (currentData[field] !== null && currentData[field] !== undefined) {
                // For other fields, compare as strings
                if (String(currentData[field]) === String(value)) {
                    return; // Skip unchanged field
                }
            } else if (value === null || value === undefined || value === '') {
                // Skip null/empty values if current is also null/empty
                return;
            }
            
            // Escape field name with backticks to prevent SQL injection and handle reserved words
            setClauses.push(`\`${field}\` = ?`);
            values.push(finalValue);
            fieldValueMap.push({ field, value: finalValue }); // Track field-value mapping
        });

        if (setClauses.length === 0) {
            console.log('No valid fields to update');
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        // Final safety check - ensure date_of_birth is in YYYY-MM-DD format
        const sanitizedValues = values.map((val, index) => {
            const fieldInfo = fieldValueMap[index];
            if (!fieldInfo) return val;
            
            const { field } = fieldInfo;
            
            if (field === 'date_of_birth' && val) {
                // Final check - extract date part if needed
                if (typeof val === 'string') {
                    if (val.includes('T')) {
                        return val.split('T')[0];
                    }
                    if (val.includes(' ')) {
                        return val.split(' ')[0];
                    }
                    // Validate it's in YYYY-MM-DD format
                    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                        console.error(`Invalid date_of_birth format in final check: ${val}`);
                        // Try to parse and fix
                        try {
                            const date = new Date(val);
                            if (!isNaN(date.getTime())) {
                                const year = date.getUTCFullYear();
                                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                                const day = String(date.getUTCDate()).padStart(2, '0');
                                return `${year}-${month}-${day}`;
                            }
                        } catch (e) {
                            console.error(`Cannot fix date: ${val}`, e);
                        }
                    }
                }
            }
            return val;
        });

        const query = `
            UPDATE userdetails
            SET ${setClauses.join(', ')}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `;

        console.log('Update query:', query);
        console.log('Update values (original):', values);
        console.log('Update values (sanitized):', sanitizedValues);
        console.log('User ID:', id);
        console.log('Total params:', [...sanitizedValues, id].length);

        const [result] = await db.query(query, [...sanitizedValues, id]);
        console.log('Update result:', result);
        console.log('Affected rows:', result.affectedRows);

        if (result.affectedRows === 0) {
            console.warn('No rows affected - user might not exist or no changes made');
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        console.error('Error stack:', error.stack);
        console.error('Error code:', error.code);
        console.error('Error sqlMessage:', error.sqlMessage);
        console.error('Error sqlState:', error.sqlState);
        res.status(500).json({ 
            message: 'Error updating user', 
            detail: error.message,
            sqlMessage: error.sqlMessage,
            code: error.code
        });
    }
});

// Settings routes
router.get('/settings', async (req, res) => {
    try {
        const [settings] = await db.query('SELECT * FROM settings ORDER BY setting_key');
        const settingsObj = {};
        settings.forEach(setting => {
            settingsObj[setting.setting_key] = setting.setting_value;
        });
        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Error fetching settings' });
    }
});

// Error handler for multer (must be after routes that use multer)
router.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: 'File upload error', detail: err.message });
    }
    if (err && err.message && err.message.includes('upload')) {
        console.error('Upload error:', err);
        return res.status(400).json({ message: 'File upload error', detail: err.message });
    }
    next(err);
});


router.put('/settings', async (req, res) => {
    try {
        const settings = req.body;
        console.log('Received settings update:', settings);
        
        if (!settings || Object.keys(settings).length === 0) {
            return res.status(400).json({ message: 'No settings provided' });
        }
        
        const connection = await db.getConnection();
        
        try {
            await connection.beginTransaction();
            
            for (const [key, value] of Object.entries(settings)) {
                // Convert null/undefined to NULL for database
                const dbValue = value === null || value === undefined || value === '' ? null : value;
                
                await connection.query(
                    `INSERT INTO settings (setting_key, setting_value, updated_at) 
                     VALUES (?, ?, CURRENT_TIMESTAMP)
                     ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
                    [key, dbValue, dbValue]
                );
            }
            
            await connection.commit();
            console.log('Settings updated successfully');
            res.json({ message: 'Settings updated successfully' });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Error updating settings', detail: error.message });
    }
});

module.exports = router;

