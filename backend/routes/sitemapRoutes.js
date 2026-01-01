const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Generate dynamic sitemap with user profiles
router.get('/sitemap.xml', async (req, res) => {
    try {
        // Get all approved, paid, and active user profiles
        const [users] = await db.query(`
            SELECT id, updated_at 
            FROM userdetails 
            WHERE approval_status = 'approved' 
            AND payment_status = 'paid' 
            AND (status = 'active' OR status IS NULL)
            ORDER BY updated_at DESC
        `);

        // Base URL
        const baseUrl = 'https://www.khandeshmatrimony.com';
        const currentDate = new Date().toISOString().split('T')[0];

        // Start XML
        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  
  <!-- Home Page -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Registration Page -->
  <url>
    <loc>${baseUrl}/register</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  
  <!-- Browse Profiles Page -->
  <url>
    <loc>${baseUrl}/browse</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Terms and Conditions -->
  <url>
    <loc>${baseUrl}/terms-and-conditions</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>
  
  <!-- Sitemap Page -->
  <url>
    <loc>${baseUrl}/sitemap</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>
`;

        // Add user profile URLs
        users.forEach(user => {
            const lastmod = user.updated_at 
                ? new Date(user.updated_at).toISOString().split('T')[0]
                : currentDate;
            
            xml += `  
  <!-- User Profile -->
  <url>
    <loc>${baseUrl}/profile/${user.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
`;
        });

        // Close XML
        xml += `
</urlset>`;

        // Set content type
        res.set('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error('Error generating sitemap:', error);
        res.status(500).send('Error generating sitemap');
    }
});

module.exports = router;

