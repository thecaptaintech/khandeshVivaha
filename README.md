# 🎉 Khandesh Vivah Portal | खानदेश विवाह पोर्टल

A full-stack marriage registration platform for the Khandesh community, built with React, Node.js, Express, and MySQL.

## ✨ Features

### User Features
- 🌐 **Bilingual Support** - Marathi and English language toggle
- 📝 **Easy Registration** - Simple form with all required fields
- 📸 **Photo Upload** - Upload up to 4 profile photos
- 🔍 **Browse Profiles** - Filter by gender (Male/Female/Divorcee/Widow)
- 👤 **Detailed Profiles** - View complete profile information
- 💳 **Payment Instructions** - Integrated payment information with UPI

### Admin Features
- 🔐 **Secure Login** - JWT-based authentication
- 📊 **Dashboard** - Statistics and overview
- ✅ **Approval System** - Approve or reject registrations
- 💰 **Payment Tracking** - Mark profiles as paid/unpaid
- 🗑️ **User Management** - Edit and delete users
- 📋 **Multiple Views** - Pending, Approved, and Rejected tabs

## 🛠️ Tech Stack

### Frontend
- React 18
- React Router v6
- Axios
- CSS3 with custom styling
- React Icons

### Backend
- Node.js
- Express.js
- MySQL2
- JWT Authentication
- Multer (file uploads)
- Bcrypt (password hashing)

## 📋 Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
cd khandeshVivaha
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Create database and tables
source backend/database.sql
```

Or manually create the database:
```sql
CREATE DATABASE khandesh_vivah;
USE khandesh_vivah;
-- Then run the SQL from backend/database.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Start the backend server
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on: http://localhost:5000

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the frontend
npm start
```

Frontend will run on: http://localhost:3000

## 📝 Default Admin Credentials

- **Username:** admin
- **Password:** admin123

⚠️ **Important:** Change these credentials in production!

## 🔧 Configuration

### Backend Environment Variables (.env)
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=khandesh_vivah
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
```

### Frontend Configuration
The frontend uses proxy configuration in `package.json` to connect to the backend.

## 📁 Project Structure

```
khandeshVivaha/
├── backend/
│   ├── config/
│   │   └── db.js              # Database connection
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   └── upload.js          # Multer file upload
│   ├── routes/
│   │   ├── authRoutes.js      # Admin login
│   │   ├── userRoutes.js      # User registration & listing
│   │   └── adminRoutes.js     # Admin operations
│   ├── uploads/               # Uploaded photos
│   ├── database.sql           # Database schema
│   ├── server.js              # Main server file
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   ├── Navbar.css
│   │   │   ├── Footer.js
│   │   │   └── Footer.css
│   │   ├── context/
│   │   │   ├── AuthContext.js
│   │   │   └── LanguageContext.js
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── Register.js
│   │   │   ├── Browse.js
│   │   │   ├── ProfileDetail.js
│   │   │   └── admin/
│   │   │       ├── AdminLogin.js
│   │   │       └── AdminDashboard.js
│   │   ├── services/
│   │   │   └── api.js         # API calls
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
└── README.md
```

## 🎯 API Endpoints

### Public Endpoints
- `POST /api/register` - User registration
- `GET /api/users?status=approved` - Get approved users
- `GET /api/users/:id` - Get single user

### Admin Endpoints (Requires Authentication)
- `POST /api/admin/login` - Admin login
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `POST /api/admin/approve/:id` - Approve user
- `POST /api/admin/reject/:id` - Reject user
- `POST /api/admin/payment/:id` - Update payment status
- `DELETE /api/admin/users/:id` - Delete user

## 🌟 Key Features Explained

### 1. Register ID Generation
Unique register IDs are automatically generated in format: `KV{YEAR}{MONTH}{DAY}{RANDOM}`
Example: `KV202510140001`

### 2. Language Toggle
Switch between Marathi and English anywhere in the application using the language toggle in the navbar.

### 3. Photo Upload
- Maximum 4 photos per profile
- Supported formats: JPEG, JPG, PNG, GIF, WEBP
- Maximum file size: 5MB per photo
- Photos stored in `backend/uploads/`

### 4. Approval Workflow
1. User registers with profile details
2. Profile status: `pending`
3. Admin reviews and approves/rejects
4. Only `approved` profiles are visible publicly

### 5. Payment Tracking
- Toggleable payment section in registration success
- Admin can mark users as paid/unpaid
- UPI ID: 9167681454@ybl

## 🎨 UI Features

- **Modern Design** - Clean and professional UI
- **Responsive** - Works on desktop, tablet, and mobile
- **Gradient Backgrounds** - Beautiful color schemes
- **Smooth Animations** - Fade-in effects and transitions
- **Custom Fonts** - Poppins and Noto Sans Devanagari
- **Card-based Layout** - Clean separation of content

## 🔒 Security Features

- JWT-based authentication for admin
- Password hashing with bcrypt
- Protected admin routes
- File type validation for uploads
- SQL injection prevention with prepared statements

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Laptops (1024px+)
- 🖥️ Desktops (1440px+)

## 🧪 Testing

### Test User Registration Flow
1. Navigate to `/register`
2. Fill in all required fields
3. Upload photos (optional)
4. Submit form
5. Note the Register ID

### Test Admin Flow
1. Navigate to `/admin/login`
2. Login with credentials (admin/admin123)
3. View dashboard statistics
4. Approve/reject pending registrations
5. Update payment status

### Test Browse Flow
1. Navigate to `/browse`
2. Filter by gender
3. Search by name or ID
4. View profile details

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check MySQL service is running
mysql.server status

# Verify credentials in .env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
```

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Upload Directory Issues
```bash
# Create uploads directory manually
cd backend
mkdir uploads
chmod 755 uploads
```

## 🚀 Deployment

### Backend Deployment
1. Set production environment variables
2. Use PM2 or similar process manager
3. Configure reverse proxy (Nginx)
4. Set up SSL certificate

### Frontend Deployment
```bash
cd frontend
npm run build
# Serve the build folder with Nginx or similar
```

### Database
- Use managed MySQL service (AWS RDS, DigitalOcean)
- Set up regular backups
- Configure proper user permissions

## 📞 Support & Contact

For queries or support:
- **Phone:** +91 9167681454
- **Email:** admin@khandeshvivah.com
- **UPI ID:** 9167681454@ybl

## 📄 License

© 2025 Khandesh Vivah Portal. All rights reserved.

## 🙏 Acknowledgments

Built with ❤️ for the Khandesh community

---

**Note:** This is a community platform. Please use it responsibly and respect user privacy.

