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
    'payment_status'
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

function normalizeValue(value) {
    if (value === undefined || value === null) {
        return null;
    }
    if (Array.isArray(value)) {
        if (value.length === 0) {
            return null;
        }
        return normalizeValue(value[0]);
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

function buildInsertData(payload, registerId, registrationType, biodataFilePath) {
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

    return data;
}

function buildInsertQuery(data) {
    const fields = [];
    const placeholders = [];
    const values = [];

    USERDETAIL_COLUMNS.forEach(field => {
        if (AUTO_FIELDS.has(field)) {
            return;
        }
        if (data[field] !== undefined) {
            fields.push(field);
            placeholders.push('?');
            values.push(normalizeValue(data[field]));
        }
    });

    if (fields.length === 0) {
        throw new Error('No valid columns to insert into userdetails table.');
    }

    return {
        query: `INSERT INTO userdetails (${fields.join(', ')}) VALUES (${placeholders.join(', ')})`,
        values
    };
}

// Registration
router.post(
    '/register',
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

            const insertData = buildInsertData(payload, registerId, registrationType, biodataFilePath);
            const { query, values } = buildInsertQuery(insertData);

            const [result] = await connection.query(query, values);
            const userId = result.insertId;

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
        `;
        const params = [];

        if (status) {
            query += ' AND ud.approval_status = ?';
            params.push(status);
        }

        // For public browse (status=approved), only show paid profiles
        if (status === 'approved') {
            query += ' AND ud.payment_status = ?';
            params.push('paid');
        }

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

        const [rows] = await db.query(
            `
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
            WHERE ud.id = ?
            GROUP BY ud.id
            `,
            [id]
        );

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

