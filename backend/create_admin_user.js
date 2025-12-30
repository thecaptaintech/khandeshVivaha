const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function createAdminUser() {
  try {
    const username = process.argv[2] || 'admin';
    const password = process.argv[3] || 'admin123';
    const email = process.argv[4] || 'admin@khandeshvivah.com';

    console.log(`Creating admin user: ${username}`);

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM admin WHERE username = ?', [username]);
    if (existing.length > 0) {
      console.log(`User '${username}' already exists!`);
      process.exit(1);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Insert admin user
    const [result] = await db.query(
      'INSERT INTO admin (username, password, email, role, status) VALUES (?, ?, ?, ?, ?)',
      [username, hashedPassword, email, 'admin', 'active']
    );

    console.log(`✅ Admin user created successfully!`);
    console.log(`   ID: ${result.insertId}`);
    console.log(`   Username: ${username}`);
    console.log(`   Email: ${email}`);
    console.log(`   Role: admin`);
    console.log(`   Status: active`);
    console.log(`\n   You can now login with:`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();

