const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../middleware/upload');
const { uploadBiodata } = require('../middleware/upload');
const { v4: uuidv4 } = require('uuid');

// Generate unique Register ID
function generateRegisterId() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    return `KM${year}${month}${day}${random}`;
}

// User Registration
router.post('/register', uploadBiodata.fields([
    { name: 'photos', maxCount: 4 },
    { name: 'biodata_file', maxCount: 1 }
]), async (req, res) => {
    const connection = await db.getConnection();
    
    try {
        await connection.beginTransaction();

        const registrationType = req.body.registration_type || 'form';
        
        // Generate unique register ID
        let register_id = generateRegisterId();
        let isUnique = false;
        
        while (!isUnique) {
            const [existing] = await connection.query(
                'SELECT id FROM users WHERE register_id = ?',
                [register_id]
            );
            if (existing.length === 0) {
                isUnique = true;
            } else {
                register_id = generateRegisterId();
            }
        }

        let userId;
        let biodataFilePath = null;

        if (registrationType === 'biodata') {
            // Biodata upload registration
            const { full_name, mobile_no_1, email } = req.body;
            
            console.log('Biodata Registration Data:', {
                full_name,
                mobile_no_1,
                email,
                files: req.files
            });
            
            // Get biodata file path
            if (req.files && req.files.biodata_file && req.files.biodata_file[0]) {
                biodataFilePath = req.files.biodata_file[0].filename;
            }

            console.log('Biodata file path:', biodataFilePath);

            // Insert minimal user data with biodata file path
            const [result] = await connection.query(
                `INSERT INTO users (
                    register_id, full_name, contact_number, email, biodata_file, 
                    registration_type, approval_status
                ) VALUES (?, ?, ?, ?, ?, 'biodata', 'pending')`,
                [register_id, full_name, mobile_no_1, email, biodataFilePath]
            );
            
            userId = result.insertId;
            console.log('User created with ID:', userId);
        } else {
            // Form registration - Extract all fields from request body
            const formFields = req.body;
            
            // Combine first_name and surname to full_name if they exist
            let fullName = formFields.full_name || '';
            if (formFields.first_name || formFields.surname) {
                fullName = `${formFields.first_name || ''} ${formFields.surname || ''}`.trim();
            }

            // Build dynamic insert query with all available fields
            const fieldNames = ['register_id', 'full_name', 'registration_type'];
            const fieldValues = [register_id, fullName, 'form'];
            
            // Add all other fields if they exist
            const optionalFields = [
                'first_name', 'surname', 'kul', 'gender', 'email', 'mobile_no_1', 'mobile_no_2',
                'birth_village', 'birth_district', 'date_of_birth', 'birth_time',
                'company_address', 'permanent_address', 'current_residence', 'marital_status',
                'native_district', 'native_village_taluka', 'occupation', 'education', 'income',
                'blood_group', 'weight', 'height', 'personality', 'hobbies', 'color',
                'caste_religion', 'district', 'taluka', 'village', 'contact_number', 'about_yourself',
                'father_name', 'father_occupation', 'mother_name', 'mother_occupation',
                'brothers', 'sisters', 'family_type', 'family_status', 'family_values',
                'rashi', 'nakshatra', 'gotra', 'manglik', 'nadi', 'gana',
                'expected_education', 'expected_occupation', 'expected_income', 
                'expected_location', 'other_expectations'
            ];
            
            optionalFields.forEach(field => {
                if (formFields[field] !== undefined && formFields[field] !== '') {
                    fieldNames.push(field);
                    fieldValues.push(formFields[field]);
                }
            });

            const placeholders = fieldNames.map(() => '?').join(', ');
            const query = `INSERT INTO users (${fieldNames.join(', ')}) VALUES (${placeholders})`;
            
            const [result] = await connection.query(query, fieldValues);
            userId = result.insertId;
        }

        // Insert photos (common for both types)
        const photoFiles = req.files?.photos || [];
        console.log('Photo files to insert:', photoFiles.length);
        
        if (photoFiles.length > 0) {
            for (let i = 0; i < photoFiles.length; i++) {
                const photo = photoFiles[i];
                const isPrimary = i === 0; // First photo is primary
                console.log(`Inserting photo ${i + 1}:`, photo.filename);
                await connection.query(
                    'INSERT INTO photos (user_id, photo_path, is_primary) VALUES (?, ?, ?)',
                    [userId, photo.filename, isPrimary]
                );
            }
        }
        
        console.log('Registration completed successfully:', {
            register_id,
            userId,
            registration_type: registrationType
        });

        await connection.commit();

        res.status(201).json({
            message: 'Registration successful',
            register_id,
            user_id: userId
        });

    } catch (error) {
        await connection.rollback();
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    } finally {
        connection.release();
    }
});

// Get all users with optional filters
router.get('/users', async (req, res) => {
    try {
        const { status, gender, search } = req.query;
        
        let query = `
            SELECT u.*, 
                   GROUP_CONCAT(p.photo_path ORDER BY p.is_primary DESC) as photos
            FROM users u
            LEFT JOIN photos p ON u.id = p.user_id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            query += ' AND u.approval_status = ?';
            params.push(status);
        }

        if (gender) {
            query += ' AND u.gender = ?';
            params.push(gender);
        }

        if (search) {
            query += ' AND (u.full_name LIKE ? OR u.register_id LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        query += ' GROUP BY u.id ORDER BY u.created_at DESC';

        const [users] = await db.query(query, params);

        // Process photos
        const processedUsers = users.map(user => ({
            ...user,
            photos: user.photos ? user.photos.split(',') : []
        }));

        res.json(processedUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Get single user by ID
router.get('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const [users] = await db.query(
            `SELECT u.*, 
                    GROUP_CONCAT(p.photo_path ORDER BY p.is_primary DESC) as photos
             FROM users u
             LEFT JOIN photos p ON u.id = p.user_id
             WHERE u.id = ?
             GROUP BY u.id`,
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = {
            ...users[0],
            photos: users[0].photos ? users[0].photos.split(',') : []
        };

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

module.exports = router;

