const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { uploadBiodata } = require('../middleware/upload');

const USERDETAIL_COLUMNS = [
    'register_id',
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
    'created_by',
    'status',
    'expiry_date'
];

const AUTO_FIELDS = new Set(['id', 'created_at', 'updated_at']);

function generateRegisterId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `KM${year}${month}${day}${random}`;
}

function normalizeValue(value, fieldName = '') {
    // Special handling for created_by - never return null, always return 'USER' if empty
    if (fieldName === 'created_by') {
        if (value === undefined || value === null || value === '') {
            return 'USER';
        }
        return String(value).trim();
    }
    
    if (value === undefined || value === null) {
        return null;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return null;
        }
        return normalizeValue(value[0], fieldName);
    }
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed === '' ? null : trimmed;
    }
    return value;
}

function normalizePayload(body) {
    return Object.fromEntries(
        Object.entries(body || {}).map(([key, value]) => [key, normalizeValue(value)])
    );
}

function buildInsertData(payload, registerId, registrationType, biodataFilePath, createdBy = null) {
    const data = { ...payload };

    if (!data.contact_number && data.mobile_no_1) {
        data.contact_number = data.mobile_no_1;
    }

    const first = data.first_name || '';
    const last = data.surname || '';
    const fallbackFullName = `${first} ${last}`.trim();
    data.full_name = normalizeValue(data.full_name) || (fallbackFullName || null) || registerId;

    data.register_id = registerId;
    data.registration_type = registrationType;
    data.approval_status = data.approval_status || 'pending';
    data.payment_status = data.payment_status || 'unpaid';
    data.biodata_file = biodataFilePath || data.biodata_file || null;
    
    // Add created_by - always set (either agent username or 'USER' for direct registration)
    // Ensure it's always a string, never null or undefined
    data.created_by = createdBy ? String(createdBy) : 'USER';
    console.log('📝 buildInsertData - Setting created_by:', data.created_by);
    
    // Set status to 'active' by default on registration
    data.status = data.status || 'active';
    
    // Set expiry_date to current date on registration
    if (!data.expiry_date) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        data.expiry_date = `${year}-${month}-${day}`;
    }
    console.log('📝 buildInsertData - Setting status:', data.status);
    console.log('📝 buildInsertData - Setting expiry_date:', data.expiry_date);

    return data;
}

function buildInsertQuery(data) {
    const fields = [];
    const placeholders = [];
    const values = [];

    // First, ensure created_by is in the data object
    if (!data.hasOwnProperty('created_by') || data.created_by === undefined || data.created_by === null) {
        data.created_by = 'USER';
        console.log('⚠️ created_by was missing in data, setting to USER');
    }

    USERDETAIL_COLUMNS.forEach(field => {
        if (AUTO_FIELDS.has(field)) {
            return;
        }
        // Always include created_by - it should always be set
        if (data[field] !== undefined || field === 'created_by') {
            fields.push(field);
            placeholders.push('?');
            // For created_by, use the value from data or default to 'USER'
            const value = field === 'created_by' ? (data[field] || 'USER') : data[field];
            values.push(normalizeValue(value, field));
        }
    });

    // Ensure created_by is always included, even if it wasn't added above
    if (!fields.includes('created_by')) {
        fields.push('created_by');
        placeholders.push('?');
        const createdByValue = data.created_by || 'USER';
        values.push(normalizeValue(createdByValue, 'created_by'));
        console.log('⚠️ created_by was missing from fields, adding it now with value:', createdByValue);
    }

    if (fields.length === 0) {
        throw new Error('No valid columns to insert into userdetails table.');
    }

    console.log('📝 buildInsertQuery - Fields:', fields);
    console.log('📝 buildInsertQuery - created_by included?', fields.includes('created_by'));
    console.log('📝 buildInsertQuery - created_by value in data:', data.created_by);
    console.log('📝 buildInsertQuery - created_by value in values:', values[fields.indexOf('created_by')]);
    console.log('📝 buildInsertQuery - Values count:', values.length, 'Fields count:', fields.length);

    return {
        query: `INSERT INTO userdetails (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
        values
    };
}

// Optional authentication middleware for agent registration
const optionalAuthenticateToken = async (req, res, next) => {
    // Check both lowercase and capitalized header names (Express normalizes to lowercase)
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    console.log('🔍 Optional auth check - Token present?', !!token);
    console.log('🔍 Authorization header:', authHeader ? 'Present' : 'Missing');
    console.log('🔍 All headers:', Object.keys(req.headers).filter(h => h.toLowerCase().includes('auth')));
    
    if (token) {
        try {
            const jwt = require('jsonwebtoken');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('🔍 Token decoded:', { id: decoded.id, username: decoded.username, role: decoded.role });
            const [users] = await db.query('SELECT id, username, role, status FROM admin WHERE id = ?', [decoded.id]);
            if (users.length > 0 && users[0].status === 'active') {
                req.agent = { id: decoded.id, username: users[0].username, role: users[0].role };
                console.log('✅ Agent authenticated:', req.agent);
            } else {
                console.log('❌ User not found or inactive');
            }
        } catch (error) {
            // If token is invalid, continue without agent info (public registration)
            console.log('❌ Optional auth failed (public registration):', error.message);
        }
    } else {
        console.log('ℹ️ No token provided - direct registration');
    }
    next();
};

// Registration
router.post(
    '/register',
    optionalAuthenticateToken,
    uploadBiodata.fields([
        { name: 'photos', maxCount: 4 },
        { name: 'biodata_file', maxCount: 1 }
    ]),
    async (req, res) => {
        const connection = await db.getConnection();

        try {
            await connection.beginTransaction();

            const registrationType = req.body.registration_type === 'biodata' ? 'biodata' : 'form';

            let registerId = generateRegisterId();
            let isUnique = false;
            while (!isUnique) {
                const [rows] = await connection.query(
                    'SELECT id FROM userdetails WHERE register_id = ?',
                    [registerId]
                );
                if (rows.length === 0) {
                    isUnique = true;
                } else {
                    registerId = generateRegisterId();
                }
            }

            const payload = normalizePayload(req.body);

            let biodataFilePath = null;
            if (req.files?.biodata_file?.[0]) {
                biodataFilePath = req.files.biodata_file[0].filename;
            }

            // Get created_by from agent token if available
            // If agent/admin registers user, created_by will be set to agent's username
            // If user registers directly (no agent token), created_by will be set to 'USER'
            let createdBy = 'USER'; // Default value for direct registrations
            if (req.agent && (req.agent.role === 'agent' || req.agent.role === 'admin')) {
                createdBy = req.agent.username;
                console.log('✅ Agent registration detected:', { username: req.agent.username, role: req.agent.role, createdBy });
            } else {
                console.log('✅ Direct registration - using default createdBy: USER');
            }

            const insertData = buildInsertData(payload, registerId, registrationType, biodataFilePath, createdBy);
            console.log('📝 Insert data created_by:', insertData.created_by);
            console.log('📝 Insert data has created_by?', 'created_by' in insertData);
            console.log('📝 Insert data keys:', Object.keys(insertData).filter(k => k.includes('created')));
            
            const { query, values } = buildInsertQuery(insertData);
            console.log('📝 SQL Query includes created_by?', query.includes('created_by'));
            console.log('📝 Full SQL Query:', query);
            
            // Find the index of created_by in fields to verify the value
            const fieldsArray = query.match(/INSERT INTO userdetails \((.*?)\) VALUES/)?.[1]?.split(',').map(f => f.trim()) || [];
            const createdByIdx = fieldsArray.indexOf('created_by');
            console.log('📝 created_by field index:', createdByIdx);
            console.log('📝 created_by value at index:', createdByIdx >= 0 ? values[createdByIdx] : 'NOT FOUND');
            console.log('📝 All values count:', values.length, 'Fields count:', fieldsArray.length);

            // Final check: Ensure created_by is in the query before executing
            if (!query.includes('created_by')) {
                console.error('❌ CRITICAL: created_by is missing from SQL query!');
                console.error('❌ Query:', query);
                throw new Error('created_by field is missing from INSERT query');
            }
            
            if (createdByIdx >= 0) {
                console.log('✅ created_by is at index', createdByIdx, 'with value:', values[createdByIdx]);
            } else {
                console.error('❌ CRITICAL: created_by index not found in fields array!');
            }

            const [result] = await connection.query(query, values);
            const userId = result.insertId;
            console.log('✅ User inserted with ID:', userId);
            
            // Verify created_by was inserted
            const [verify] = await connection.query('SELECT created_by FROM userdetails WHERE id = ?', [userId]);
            console.log('✅ Verification - created_by stored in DB:', verify[0]?.created_by);
            
            // Fallback: If created_by is NULL, update it manually
            if (!verify[0]?.created_by) {
                console.error('❌ CRITICAL ERROR: created_by is NULL in database after insert!');
                console.error('❌ Attempting to update created_by manually...');
                const updateValue = insertData.created_by || createdBy || 'USER';
                await connection.query('UPDATE userdetails SET created_by = ? WHERE id = ?', [updateValue, userId]);
                console.log('✅ Updated created_by to', updateValue, 'for user ID:', userId);
                
                // Verify again
                const [verify2] = await connection.query('SELECT created_by FROM userdetails WHERE id = ?', [userId]);
                console.log('✅ Final verification - created_by:', verify2[0]?.created_by);
            }
            
            if (!verify[0]?.created_by) {
                console.error('❌ CRITICAL ERROR: created_by is NULL in database after insert!');
                console.error('❌ Attempting to update created_by manually...');
                await connection.query('UPDATE userdetails SET created_by = ? WHERE id = ?', ['USER', userId]);
                console.log('✅ Updated created_by to USER for user ID:', userId);
            }

            const photoFiles = req.files?.photos || [];
            if (photoFiles.length > 0) {
                for (let i = 0; i < photoFiles.length; i += 1) {
                    const photo = photoFiles[i];
                    const isPrimary = i === 0 ? 1 : 0;
                    await connection.query(
                        'INSERT INTO photos (user_id, photo_path, is_primary) VALUES (?, ?, ?)',
                        [userId, photo.filename, isPrimary]
                    );
                }
            }

            await connection.commit();

            res.status(201).json({
                message: 'Registration successful',
                register_id: registerId,
                user_id: userId
            });
        } catch (error) {
            await connection.rollback();
            console.error('Registration error:', error);
            res.status(500).json({ message: 'Registration failed', error: error.message });
        } finally {
            connection.release();
        }
    }
);

// List users
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
                   ud.created_at, ud.updated_at,
                   GROUP_CONCAT(p.photo_path ORDER BY p.is_primary DESC) AS photos
            FROM userdetails ud
            LEFT JOIN photos p ON ud.id = p.user_id
            WHERE 1 = 1
            AND (ud.status = 'active' OR ud.status IS NULL)
        `;
        const params = [];

        // Public endpoint always requires: approved, paid, and active status
        query += ' AND ud.approval_status = ?';
        params.push('approved');
        
        query += ' AND ud.payment_status = ?';
        params.push('paid');
        
        // Status filter is already applied above (active or null)

        if (gender) {
            query += ' AND ud.gender = ?';
            params.push(gender);
        }

        if (search) {
            query += ' AND (ud.full_name LIKE ? OR ud.register_id LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' GROUP BY ud.id ORDER BY ud.created_at DESC';

        const [rows] = await db.query(query, params);

        const processed = rows.map(row => {
            // Ensure date_of_birth is always a string in YYYY-MM-DD format
            if (row.date_of_birth) {
                if (row.date_of_birth instanceof Date) {
                    // Convert Date object to YYYY-MM-DD string using UTC to avoid timezone shifts
                    const year = row.date_of_birth.getUTCFullYear();
                    const month = String(row.date_of_birth.getUTCMonth() + 1).padStart(2, '0');
                    const day = String(row.date_of_birth.getUTCDate()).padStart(2, '0');
                    row.date_of_birth = `${year}-${month}-${day}`;
                } else {
                    // Ensure it's a string and extract just YYYY-MM-DD part
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
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get single user
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user is authenticated (admin/agent)
        let isAuthenticated = false;
        const authHeader = req.headers['authorization'] || req.headers['Authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const [adminUser] = await db.query('SELECT id FROM admin WHERE id = ?', [decoded.id]);
                if (adminUser.length > 0) {
                    isAuthenticated = true;
                }
            } catch (err) {
                isAuthenticated = false;
            }
        }

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
                   ud.created_at, ud.updated_at,
                   GROUP_CONCAT(p.photo_path ORDER BY p.is_primary DESC) AS photos
            FROM userdetails ud
            LEFT JOIN photos p ON ud.id = p.user_id
            WHERE ud.id = ?
        `;
        const params = [id];

        // For public access, filter by approved, paid, and active status
        if (!isAuthenticated) {
            query += ' AND ud.approval_status = ? AND ud.payment_status = ? AND (ud.status = ? OR ud.status IS NULL)';
            params.push('approved', 'paid', 'active');
        }

        query += ' GROUP BY ud.id';

        const [rows] = await db.query(query, params);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = rows[0];
        user.photos = user.photos ? user.photos.split(',') : [];
        
        // Ensure date_of_birth is always a string in YYYY-MM-DD format
        if (user.date_of_birth) {
            if (user.date_of_birth instanceof Date) {
                const year = user.date_of_birth.getUTCFullYear();
                const month = String(user.date_of_birth.getUTCMonth() + 1).padStart(2, '0');
                const day = String(user.date_of_birth.getUTCDate()).padStart(2, '0');
                user.date_of_birth = `${year}-${month}-${day}`;
            } else {
                const dateStr = String(user.date_of_birth);
                user.date_of_birth = dateStr.split('T')[0].split(' ')[0];
            }
        }
        
        // Ensure expiry_date is always a string in YYYY-MM-DD format
        if (user.expiry_date) {
            if (user.expiry_date instanceof Date) {
                const year = user.expiry_date.getUTCFullYear();
                const month = String(user.expiry_date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(user.expiry_date.getUTCDate()).padStart(2, '0');
                user.expiry_date = `${year}-${month}-${day}`;
            } else {
                const dateStr = String(user.expiry_date);
                user.expiry_date = dateStr.split('T')[0].split(' ')[0];
            }
        }
        
        // Ensure status has a default value
        if (!user.status) {
            user.status = 'active';
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

// Public settings route (for registration success page)
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

module.exports = router;

