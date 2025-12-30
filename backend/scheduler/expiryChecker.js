const db = require('../config/db');

/**
 * Check and update users whose expiry_date has passed
 * Sets their status to 'inactive' if expiry_date < current date
 */
async function checkAndUpdateExpiredUsers() {
    try {
        console.log('\n⏰ ============================================');
        console.log('⏰ EXPIRY CHECKER - Starting...');
        console.log('⏰ ============================================');
        console.log('⏰ Current Date:', new Date().toISOString().split('T')[0]);

        // Get current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split('T')[0];

        // Find users where expiry_date < current date AND status is 'active' or NULL
        const [expiredUsers] = await db.query(
            `SELECT id, register_id, full_name, expiry_date, status 
             FROM userdetails 
             WHERE expiry_date IS NOT NULL 
             AND expiry_date < ? 
             AND (status = 'active' OR status IS NULL)`,
            [currentDate]
        );

        console.log(`⏰ Found ${expiredUsers.length} expired user(s)`);

        if (expiredUsers.length === 0) {
            console.log('⏰ No expired users to update');
            console.log('⏰ ============================================\n');
            return { updated: 0, users: [] };
        }

        // Update expired users to inactive
        const userIds = expiredUsers.map(user => user.id);
        const placeholders = userIds.map(() => '?').join(',');

        const [updateResult] = await db.query(
            `UPDATE userdetails 
             SET status = 'inactive', updated_at = CURRENT_TIMESTAMP 
             WHERE id IN (${placeholders}) 
             AND (status = 'active' OR status IS NULL)`,
            userIds
        );

        console.log(`✅ Updated ${updateResult.affectedRows} user(s) to inactive`);
        console.log('✅ Updated users:');
        expiredUsers.forEach(user => {
            console.log(`   - ID: ${user.id}, Register ID: ${user.register_id}, Name: ${user.full_name}, Expiry: ${user.expiry_date}`);
        });

        console.log('⏰ ============================================\n');

        return {
            updated: updateResult.affectedRows,
            users: expiredUsers.map(u => ({
                id: u.id,
                register_id: u.register_id,
                full_name: u.full_name,
                expiry_date: u.expiry_date
            }))
        };
    } catch (error) {
        console.error('\n❌ ============================================');
        console.error('❌ EXPIRY CHECKER - Error');
        console.error('❌ ============================================');
        console.error('❌ Error:', error.message);
        console.error('❌ Stack:', error.stack);
        console.error('❌ ============================================\n');
        throw error;
    }
}

/**
 * Start the expiry checker scheduler
 * Runs immediately on startup, then every 4 hours (or 2 minutes for testing)
 */
function startExpiryChecker() {
    console.log('\n🔄 ============================================');
    console.log('🔄 EXPIRY CHECKER SCHEDULER');
    console.log('🔄 ============================================');
    console.log('🔄 Schedule: Every 2 minutes (TESTING MODE)');
    console.log('🔄 First run: Immediately');
    console.log('🔄 ============================================\n');

    // Run immediately on startup
    checkAndUpdateExpiredUsers().catch(err => {
        console.error('❌ Error in initial expiry check:', err);
    });

    // TESTING: Run every 2 minutes (2 * 60 * 1000 milliseconds)
    //const interval = 2 * 60 * 1000; // 2 minutes in milliseconds

    // PRODUCTION: Uncomment below for 4-hour interval
     const interval = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

    setInterval(() => {
        checkAndUpdateExpiredUsers().catch(err => {
            console.error('❌ Error in scheduled expiry check:', err);
        });
    }, interval);

    console.log(`✅ Expiry checker scheduled to run every 2 minutes (TESTING)\n`);
    // console.log(`✅ Expiry checker scheduled to run every 4 hours\n`); // Uncomment for production
}

module.exports = {
    checkAndUpdateExpiredUsers,
    startExpiryChecker
};

