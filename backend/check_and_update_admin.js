const db = require('./config/db');

async function checkAndUpdateAdmin() {
  try {
    // Check current admin user
    const [admins] = await db.query('SELECT * FROM admin WHERE username = ?', ['admin']);
    
    if (admins.length === 0) {
      console.log('No admin user found. Please create one first.');
      process.exit(1);
    }

    const admin = admins[0];
    console.log('Current admin user:');
    console.log(`  ID: ${admin.id}`);
    console.log(`  Username: ${admin.username}`);
    console.log(`  Email: ${admin.email || 'N/A'}`);
    console.log(`  Role: ${admin.role || 'NULL (needs update)'}`);
    console.log(`  Status: ${admin.status || 'NULL (needs update)'}`);
    console.log(`  Created At: ${admin.created_at}`);

    // Update if role or status is missing
    if (!admin.role || !admin.status) {
      console.log('\nUpdating admin user with role and status...');
      await db.query(
        'UPDATE admin SET role = ?, status = ? WHERE id = ?',
        ['admin', 'active', admin.id]
      );
      console.log('✅ Admin user updated successfully!');
      console.log('   Role: admin');
      console.log('   Status: active');
    } else {
      console.log('\n✅ Admin user already has correct role and status!');
    }

    console.log('\n📝 Login Credentials:');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Password: admin123 (default)`);
    console.log(`\n   You can now login and test admin functionality!`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAndUpdateAdmin();

