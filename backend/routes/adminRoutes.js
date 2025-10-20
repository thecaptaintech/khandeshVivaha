const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');

// All admin routes are protected
router.use(authenticateToken);

// Get dashboard statistics
router.get('/dashboard/stats', async (req, res) => {
    try {
        const [pendingCount] = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE approval_status = "pending"'
        );
        const [approvedCount] = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE approval_status = "approved"'
        );
        const [rejectedCount] = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE approval_status = "rejected"'
        );
        const [paidCount] = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE payment_status = "paid"'
        );
        const [unpaidCount] = await db.query(
            'SELECT COUNT(*) as count FROM users WHERE payment_status = "unpaid"'
        );

        res.json({
            pending: pendingCount[0].count,
            approved: approvedCount[0].count,
            rejected: rejectedCount[0].count,
            paid: paidCount[0].count,
            unpaid: unpaidCount[0].count
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Error fetching statistics' });
    }
});

// Approve user
router.post('/approve/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'UPDATE users SET approval_status = "approved" WHERE id = ?',
            [id]
        );

        res.json({ message: 'User approved successfully' });
    } catch (error) {
        console.error('Error approving user:', error);
        res.status(500).json({ message: 'Error approving user' });
    }
});

// Reject user
router.post('/reject/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query(
            'UPDATE users SET approval_status = "rejected" WHERE id = ?',
            [id]
        );

        res.json({ message: 'User rejected successfully' });
    } catch (error) {
        console.error('Error rejecting user:', error);
        res.status(500).json({ message: 'Error rejecting user' });
    }
});

// Update payment status
router.post('/payment/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { payment_status } = req.body;

        await db.query(
            'UPDATE users SET payment_status = ? WHERE id = ?',
            [payment_status, id]
        );

        res.json({ message: 'Payment status updated successfully' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: 'Error updating payment status' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;

        await db.query('DELETE FROM users WHERE id = ?', [id]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Update user
router.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Build dynamic update query
        const fields = Object.keys(updateData);
        const values = Object.values(updateData);
        
        if (fields.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const setClause = fields.map(field => `${field} = ?`).join(', ');
        values.push(id);

        await db.query(
            `UPDATE users SET ${setClause} WHERE id = ?`,
            values
        );

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ message: 'Error updating user' });
    }
});

module.exports = router;

