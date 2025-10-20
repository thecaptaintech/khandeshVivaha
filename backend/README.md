# Backend - Khandesh Vivah Portal

Node.js/Express backend for the Khandesh Vivah marriage portal.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Create database
mysql -u root -p < database.sql

# Start server
npm start

# For development (with auto-reload)
npm run dev
```

## Environment Variables

Required variables in `.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=khandesh_vivah
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
```

## API Documentation

### Authentication
- `POST /api/admin/login` - Admin login (returns JWT token)

### User Routes
- `POST /api/register` - Register new user (multipart/form-data)
- `GET /api/users` - Get users with filters
- `GET /api/users/:id` - Get single user

### Admin Routes (Protected)
- `GET /api/admin/dashboard/stats` - Get statistics
- `POST /api/admin/approve/:id` - Approve user
- `POST /api/admin/reject/:id` - Reject user
- `POST /api/admin/payment/:id` - Update payment status
- `DELETE /api/admin/users/:id` - Delete user
- `PUT /api/admin/users/:id` - Update user

## Database Schema

### Tables
- `admin` - Admin credentials
- `users` - User profiles
- `photos` - Profile photos

See `database.sql` for complete schema.

## File Upload

Photos are stored in `uploads/` directory.
- Max file size: 5MB
- Allowed formats: jpeg, jpg, png, gif, webp
- Max files per user: 4

