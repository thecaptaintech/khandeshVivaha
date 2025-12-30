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
    'payment_status',
    'status',
    'expiry_date'
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
        // Build WHERE clause based on user role
        // Agents only see users they created, admins see all users
        let whereClause = '';
        let filterParam = null;
        
        console.log('📊 Stats request - req.user:', req.user ? { id: req.user.id, username: req.user.username, role: req.user.role } : 'null');
        
        if (req.user && req.user.role === 'agent') {
            whereClause = ' AND created_by = ?';
            filterParam = req.user.username;
            console.log(`📊 Stats filter: Agent ${req.user.username} - showing only their users`);
            
            // Debug: Check what created_by values exist in database
            const [sampleUsers] = await db.query(
                'SELECT DISTINCT created_by, COUNT(*) as count FROM userdetails GROUP BY created_by'
            );
            console.log('📊 Available created_by values in DB:', sampleUsers);
        } else if (req.user && req.user.role === 'admin') {
            console.log('📊 Stats: Admin - showing all users');
        } else {
            console.log('📊 Stats: No user info found in request');
        }

        // Create params array for each query to avoid reuse issues
        const pendingParams = filterParam ? [filterParam] : [];
        const approvedParams = filterParam ? [filterParam] : [];
        const rejectedParams = filterParam ? [filterParam] : [];
        const paidParams = filterParam ? [filterParam] : [];
        const unpaidParams = filterParam ? [filterParam] : [];

        // Log the actual queries being executed
        console.log('📊 Executing queries with filter:', filterParam || 'none');
        console.log('📊 Pending query:', `SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "pending"${whereClause}`);
        console.log('📊 Approved query:', `SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "approved"${whereClause}`);

        // Exclude deleted users from all stats
        const deletedFilter = ' AND approval_status != "deleted"';
        
        const [pending] = await db.query(
            `SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "pending"${deletedFilter}${whereClause}`,
            pendingParams
        );
        const [approved] = await db.query(
            `SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "approved"${deletedFilter}${whereClause}`,
            approvedParams
        );
        const [rejected] = await db.query(
            `SELECT COUNT(*) AS count FROM userdetails WHERE approval_status = "rejected"${deletedFilter}${whereClause}`,
            rejectedParams
        );
        const [paid] = await db.query(
            `SELECT COUNT(*) AS count FROM userdetails WHERE payment_status = "paid" AND approval_status != "deleted"${whereClause}`,
            paidParams
        );
        const [unpaid] = await db.query(
            `SELECT COUNT(*) AS count FROM userdetails WHERE payment_status = "unpaid" AND approval_status != "deleted"${whereClause}`,
            unpaidParams
        );

        const result = {
            pending: pending[0].count,
            approved: approved[0].count,
            rejected: rejected[0].count,
            paid: paid[0].count,
            unpaid: unpaid[0].count
        };

        console.log('📊 Stats result:', result);
        console.log('📊 Filter applied:', filterParam ? `created_by = "${filterParam}"` : 'none (admin)');
        console.log('📊 Query params used:', { pendingParams, approvedParams });

        res.json(result);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Get all users for admin dashboard (no status filtering - shows all users)
router.get('/users', async (req, res) => {
    try {
        const { status, gender, search } = req.query;

        let query = `
            SELECT ud.id, ud.register_id, ud.registration_type, ud.approval_status, ud.payment_status,
                   ud.full_name, ud.first_name, ud.surname, ud.kul, ud.gender, ud.email,
                   ud.mobile_no_1, ud.mobile_no_2, ud.contact_number,
                   DATE_FORMAT(ud.date_of_birth, '%Y-%m-%d') AS date_of_birth,
                   ud.birth_time, ud.birth_village, ud.birth_district,
                   ud.marital_status, ud.permanent_address, ud.current_residence, ud.company_address,
                   ud.native_district, ud.native_village_taluka, ud.district, ud.taluka, ud.village,
                   ud.occupation, ud.education, ud.income, ud.height, ud.weight, ud.blood_group,
                   ud.color, ud.personality, ud.hobbies, ud.caste_religion, ud.about_yourself,
                   ud.father_name, ud.father_occupation, ud.mother_name, ud.mother_occupation,
                   ud.brothers, ud.sisters, ud.family_type, ud.family_status, ud.family_values,
                   ud.rashi, ud.nakshatra, ud.gotra, ud.manglik, ud.nadi, ud.gana,
                   ud.expected_education, ud.expected_occupation, ud.expected_income,
                   ud.expected_location, ud.other_expectations, ud.biodata_file,
                   ud.status, DATE_FORMAT(ud.expiry_date, '%Y-%m-%d') AS expiry_date,
                   ud.created_by, ud.created_at, ud.updated_at,
                   GROUP_CONCAT(p.photo_path ORDER BY p.is_primary DESC) AS photos
            FROM userdetails ud
            LEFT JOIN photos p ON ud.id = p.user_id
            WHERE 1 = 1
        `;
        const params = [];

        // Filter by approval_status if provided
        // Always exclude deleted users unless explicitly requesting deleted status
        if (status) {
            query += ' AND ud.approval_status = ?';
            params.push(status);
            // Note: If status is 'pending', 'approved', or 'rejected', it automatically excludes 'deleted'
            // Only if status = 'deleted' will deleted users be shown
        } else {
            // If no status filter, exclude deleted users
            query += ' AND ud.approval_status != "deleted"';
        }

        if (gender) {
            query += ' AND ud.gender = ?';
            params.push(gender);
        }

        if (search) {
            query += ' AND (ud.full_name LIKE ? OR ud.register_id LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Filter by created_by for agents (only show users they created)
        // Admins see all users, agents only see their own
        if (req.user && req.user.role === 'agent') {
            query += ' AND ud.created_by = ?';
            params.push(req.user.username);
            console.log(`🔍 Agent filter: Showing only users created by ${req.user.username}`);
        } else if (req.user && req.user.role === 'admin') {
            console.log('🔍 Admin: Showing all users');
        }

        query += ' GROUP BY ud.id ORDER BY ud.created_at DESC';

        const [rows] = await db.query(query, params);

        const processed = rows.map(row => {
            // Ensure date_of_birth is always a string in YYYY-MM-DD format
            if (row.date_of_birth) {
                if (row.date_of_birth instanceof Date) {
                    const year = row.date_of_birth.getUTCFullYear();
                    const month = String(row.date_of_birth.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(row.date_of_birth.getUTCDate()).padStart(2, '0');
                    row.date_of_birth = `${year}-${month}-${day}`;
                } else {
                    const dateStr = String(row.date_of_birth);
                    row.date_of_birth = dateStr.split('T')[0].split(' ')[0];
                }
            }
            return {
                ...row,
                photos: row.photos ? row.photos.split(',') : []
            };
        });

        res.json(processed);
    } catch (error) {
        console.error('Error fetching admin users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

router.post('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if user is paid before approving
        const [user] = await db.query(
            'SELECT payment_status FROM userdetails WHERE id = ?',
            [id]
        );
        
        if (user.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (user[0].payment_status !== 'paid') {
            return res.status(400).json({ 
                message: 'User must be paid before approval. Please mark as paid first.' 
            });
        }
        
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
        // Soft delete: Set approval_status to 'deleted' instead of actually deleting
        await db.query(
            'UPDATE userdetails SET approval_status = "deleted", updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [id]
        );
        res.json({ message: 'User deleted successfully (soft delete)' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log('\n📝 ============================================');
        console.log('📝 UPDATE REQUEST');
        console.log('📝 ============================================');
        console.log('📝 User ID:', id);
        console.log('📝 Request body keys:', Object.keys(req.body || {}));
        console.log('📝 Request body keys count:', Object.keys(req.body || {}).length);

        // Verify user exists and get current data
        const [userCheck] = await db.query('SELECT id FROM userdetails WHERE id = ?', [id]);
        if (userCheck.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get current user data to compare and skip unchanged fields
        // Use DATE_FORMAT to ensure date_of_birth and expiry_date are returned as string (YYYY-MM-DD)
        const [currentUser] = await db.query(
            'SELECT *, DATE_FORMAT(date_of_birth, "%Y-%m-%d") AS date_of_birth, DATE_FORMAT(expiry_date, "%Y-%m-%d") AS expiry_date FROM userdetails WHERE id = ?',
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
        // Ensure expiry_date is a string
        if (currentData.expiry_date instanceof Date) {
            const year = currentData.expiry_date.getUTCFullYear();
            const month = String(currentData.expiry_date.getUTCMonth() + 1).padStart(2, '0');
            const day = String(currentData.expiry_date.getUTCDate()).padStart(2, '0');
            currentData.expiry_date = `${year}-${month}-${day}`;
        } else if (currentData.expiry_date) {
            // Extract date part from string if needed
            const dateStr = String(currentData.expiry_date);
            currentData.expiry_date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.split(' ')[0];
        }

        // Normalize all incoming values - simple conversion
        // Don't normalize expiry_date and status here - handle them separately
        const payload = Object.fromEntries(
            Object.entries(req.body || {}).map(([key, value]) => {
                // Skip normalization for expiry_date and status - handle them in the processing loop
                if (key === 'expiry_date' || key === 'status') {
                    return [key, value];
                }
                return [key, normalizeValue(value, key)];
            })
        );

        if (payload.mobile_no_1 && !payload.contact_number) {
            payload.contact_number = payload.mobile_no_1;
        }

        const setClauses = [];
        const values = [];
        const fieldValueMap = []; // Track field names with their values

        console.log('📝 Processing payload fields...');
        console.log('📝 Total fields in payload:', Object.keys(payload).length);
        console.log('📝 UPDATEABLE_FIELDS count:', UPDATEABLE_FIELDS.size);
        console.log('📝 Payload has expiry_date:', 'expiry_date' in payload, payload.expiry_date);
        console.log('📝 Payload has status:', 'status' in payload, payload.status);
        console.log('📝 UPDATEABLE_FIELDS includes expiry_date:', UPDATEABLE_FIELDS.has('expiry_date'));
        console.log('📝 UPDATEABLE_FIELDS includes status:', UPDATEABLE_FIELDS.has('status'));
        
        // Process ALL fields from payload - update everything, don't skip unchanged fields
        Object.entries(payload).forEach(([field, value]) => {
            try {
                // Only process fields that are in UPDATEABLE_FIELDS
                if (!UPDATEABLE_FIELDS.has(field)) {
                    console.log(`⏭️ Skipping ${field} - not in UPDATEABLE_FIELDS`);
                    return;
                }
                
                // Normalize the value
                let finalValue = value;
                
                // Handle date fields (date_of_birth and expiry_date)
                if (field === 'date_of_birth' || field === 'expiry_date') {
                    console.log(`📅 Processing date field: ${field}, original value:`, value, typeof value);
                    // Ensure finalValue is in YYYY-MM-DD format
                    if (finalValue && typeof finalValue === 'string') {
                        if (finalValue.includes('T')) {
                            finalValue = finalValue.split('T')[0];
                        } else if (finalValue.includes(' ')) {
                            finalValue = finalValue.split(' ')[0];
                        }
                    }
                    
                    // For expiry_date, allow null/empty values
                    if (field === 'expiry_date') {
                        // Convert empty string to null
                        if (finalValue === '' || finalValue === null || finalValue === undefined) {
                            finalValue = null;
                            console.log(`📅 expiry_date is empty/null, setting to NULL`);
                        } else {
                            // Validate format if not null
                            if (!/^\d{4}-\d{2}-\d{2}$/.test(finalValue)) {
                                console.error(`❌ Invalid expiry_date format: ${finalValue}`);
                                finalValue = null; // Set to null if invalid
                            } else {
                                console.log(`✅ expiry_date format is valid: ${finalValue}`);
                            }
                        }
                    } else {
                        // For date_of_birth, validate format
                        if (finalValue && !/^\d{4}-\d{2}-\d{2}$/.test(finalValue)) {
                            console.error(`❌ Invalid date_of_birth format: ${finalValue}`);
                            // Don't skip, but log the error - will use the value as is
                        }
                    }
                } else if (field === 'status') {
                    console.log(`📊 Processing status field, original value:`, value, typeof value);
                    // Normalize status value
                    if (finalValue) {
                        finalValue = String(finalValue).toLowerCase().trim();
                        console.log(`📊 Status normalized to: ${finalValue}`);
                    } else {
                        finalValue = 'active'; // Default to active if not provided
                        console.log(`📊 Status is empty, defaulting to: active`);
                    }
                } else {
                    // For all other fields, normalize empty strings to null
                    if (finalValue === '' || finalValue === undefined) {
                        finalValue = null;
                    } else if (typeof finalValue === 'string') {
                        finalValue = finalValue.trim() || null; // Empty string after trim becomes null
                    }
                }
                
                // ALWAYS add the field to update (even if value is null or unchanged)
                // This ensures all fields are updated as requested
                setClauses.push(`\`${field}\` = ?`);
                values.push(finalValue);
                fieldValueMap.push({ field, value: finalValue });
                console.log(`✅ Adding ${field} to update:`, finalValue === null ? 'NULL' : finalValue);
            } catch (fieldError) {
                console.error(`❌ Error processing field ${field}:`, fieldError);
                console.error(`❌ Field value was:`, value);
                console.error(`❌ Field error stack:`, fieldError.stack);
                // Continue processing other fields even if one fails
            }
        });
        
        console.log('📝 Total fields to update:', setClauses.length);
        console.log('📝 Fields list:', setClauses.map(c => c.split('=')[0].replace(/`/g, '').trim()));

        // Ensure we have at least one field to update
        if (setClauses.length === 0) {
            console.log('⚠️ No updateable fields found in payload');
            console.log('📋 Payload keys:', Object.keys(payload));
            console.log('📋 UPDATEABLE_FIELDS:', Array.from(UPDATEABLE_FIELDS));
            // Still allow update to refresh timestamp
            try {
                const query = `UPDATE userdetails SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
                const [result] = await db.query(query, [id]);
                console.log('✅ Timestamp updated successfully');
                return res.json({ message: 'User updated successfully (no updateable fields in payload)' });
            } catch (error) {
                console.error('❌ Error updating timestamp:', error);
                return res.status(500).json({ message: 'Error updating user', error: error.message });
            }
        }

        // Final safety check - ensure date_of_birth is in YYYY-MM-DD format
        const sanitizedValues = values.map((val, index) => {
            const fieldInfo = fieldValueMap[index];
            if (!fieldInfo) return val;
            
            const { field } = fieldInfo;
            
            if ((field === 'date_of_birth' || field === 'expiry_date') && val) {
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
                        console.error(`Invalid ${field} format in final check: ${val}`);
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

        console.log('\n🔍 ============================================');
        console.log('🔍 EXECUTING UPDATE QUERY');
        console.log('🔍 ============================================');
        console.log('📝 Update query:', query.substring(0, 200) + '...');
        console.log('📝 Total fields to update:', setClauses.length);
        console.log('📝 Fields being updated:', setClauses.map(c => c.split('=')[0].replace(/`/g, '').trim()));
        console.log('📝 Values count:', sanitizedValues.length);
        console.log('📝 User ID:', id);
        console.log('📝 Sample values (first 5):', sanitizedValues.slice(0, 5));
        console.log('🔍 ============================================\n');

        try {
            const [result] = await db.query(query, [...sanitizedValues, id]);
            console.log('✅ Update result:', result);
            console.log('✅ Affected rows:', result.affectedRows);

            if (result.affectedRows === 0) {
                console.warn('⚠️ No rows affected - user might not exist or no changes made');
            }

            res.json({ message: 'User updated successfully' });
        } catch (queryError) {
            console.error('\n❌ ============================================');
            console.error('❌ SQL QUERY ERROR');
            console.error('❌ ============================================');
            console.error('❌ Error message:', queryError.message);
            console.error('❌ Error code:', queryError.code);
            console.error('❌ SQL State:', queryError.sqlState);
            console.error('❌ SQL Message:', queryError.sqlMessage);
            console.error('❌ Query:', query);
            console.error('❌ Values:', sanitizedValues);
            console.error('❌ ============================================\n');
            throw queryError; // Re-throw to be caught by outer catch
        }
    } catch (error) {
        console.error('\n❌ ============================================');
        console.error('❌ ERROR UPDATING USER');
        console.error('❌ ============================================');
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        console.error('❌ Error code:', error.code);
        console.error('❌ Error sqlMessage:', error.sqlMessage);
        console.error('❌ Error sqlState:', error.sqlState);
        console.error('❌ ============================================\n');
        
        // Return 400 for validation/SQL errors, 500 for server errors
        const statusCode = (error.code && error.code.startsWith('ER_')) || error.sqlState ? 400 : 500;
        const errorResponse = { 
            message: error.message || 'Error updating user',
            detail: error.message,
        };
        
        if (error.sqlMessage) {
            errorResponse.sqlMessage = error.sqlMessage;
        }
        if (error.code) {
            errorResponse.code = error.code;
        }
        if (error.sqlState) {
            errorResponse.sqlState = error.sqlState;
        }
        
        console.error('📤 Sending error response:', errorResponse);
        res.status(statusCode).json(errorResponse);
    }
});

// User/Agent Management Routes (must be before settings to avoid conflicts)
// Get all users/agents (only admin can access)
router.get('/admin-users', async (req, res) => {
    try {
        console.log('GET /admin/admin-users - User ID:', req.user?.id);
        
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        
        // Check if user is admin
        const [currentUser] = await db.query('SELECT role FROM admin WHERE id = ?', [req.user.id]);
        console.log('Current user from DB:', currentUser);
        
        if (!currentUser.length) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        if (currentUser[0].role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can access user management' });
        }

        const [users] = await db.query(
            `SELECT id, username, email, COALESCE(mobile_number, '') AS mobile_number, role, status, created_at, updated_at,
             (SELECT username FROM admin WHERE id = a.created_by) AS created_by_name
             FROM admin a
             ORDER BY created_at DESC`
        );
        
        console.log('Fetched users count:', users.length);
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// Create new user/agent (only admin can create)
router.post('/admin-users', async (req, res) => {
    try {
        // Check if user is admin
        const [currentUser] = await db.query('SELECT role FROM admin WHERE id = ?', [req.user.id]);
        if (!currentUser.length || currentUser[0].role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can create users' });
        }

        const { username, password, email, mobile_number, role = 'agent' } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Check if username already exists
        const [existing] = await db.query('SELECT id FROM admin WHERE username = ?', [username]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert new user (check if mobile_number column exists, if not, don't include it)
        const [result] = await db.query(
            'INSERT INTO admin (username, password, email, mobile_number, role, status, created_by) VALUES (?, ?, ?, ?, ?, "active", ?)',
            [username, hashedPassword, email || null, mobile_number || null, role, req.user.id]
        );

        res.status(201).json({
            message: 'User created successfully',
            user: {
                id: result.insertId,
                username,
                email,
                mobile_number,
                role,
                status: 'active'
            }
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Error creating user', detail: error.message });
    }
});

// Update user status (block/unblock) - only admin
router.put('/admin-users/:id/status', async (req, res) => {
    try {
        // Check if user is admin
        const [currentUser] = await db.query('SELECT role FROM admin WHERE id = ?', [req.user.id]);
        if (!currentUser.length || currentUser[0].role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can update user status' });
        }

        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['active', 'blocked'].includes(status)) {
            return res.status(400).json({ message: 'Valid status (active/blocked) is required' });
        }

        // Prevent blocking yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot block your own account' });
        }

        await db.query('UPDATE admin SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

        res.json({ message: `User ${status === 'blocked' ? 'blocked' : 'activated'} successfully` });
    } catch (error) {
        console.error('Error updating user status:', error);
        res.status(500).json({ message: 'Error updating user status' });
    }
});

// Delete user/agent - only admin
router.delete('/admin-users/:id', async (req, res) => {
    try {
        // Check if user is admin
        const [currentUser] = await db.query('SELECT role FROM admin WHERE id = ?', [req.user.id]);
        if (!currentUser.length || currentUser[0].role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can delete users' });
        }

        const { id } = req.params;

        // Prevent deleting yourself
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ message: 'You cannot delete your own account' });
        }

        await db.query('DELETE FROM admin WHERE id = ?', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Update user password - only admin
router.put('/admin-users/:id/password', async (req, res) => {
    try {
        // Check if user is admin
        const [currentUser] = await db.query('SELECT role FROM admin WHERE id = ?', [req.user.id]);
        if (!currentUser.length || currentUser[0].role !== 'admin') {
            return res.status(403).json({ message: 'Only admin can update user passwords' });
        }

        const { id } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);

        await db.query('UPDATE admin SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [hashedPassword, id]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Error updating password' });
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

