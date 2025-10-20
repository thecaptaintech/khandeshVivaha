# Current File & Image Storage Flow

## 📁 **Current Architecture**

### **Storage Location:**
```
/backend/uploads/
├── profile-1729123456789-123456789.jpg    (photo 1)
├── profile-1729123456790-987654321.jpg    (photo 2)
├── profile-1729123456791-456789123.pdf    (biodata)
└── ...
```

### **Database Storage:**
```sql
-- users table stores only FILE PATHS (strings)
users:
├── biodata_file: "profile-1729123456791-456789123.pdf"  (VARCHAR 255)
└── ...

-- photos table stores only FILE PATHS (strings)
photos:
├── photo_path: "profile-1729123456789-123456789.jpg"     (VARCHAR 255)
├── is_primary: 1                                          (BOOLEAN)
└── ...
```

---

## 🔄 **Complete Flow Diagram**

### **1. User Registration Flow:**

```
┌─────────────┐
│   User      │
│  Browser    │
└──────┬──────┘
       │ [Uploads Form + Files]
       ↓
┌─────────────────────────┐
│   Frontend (React)      │
│   Register.js           │
│                         │
│ - Collects form data    │
│ - Attaches files        │
│ - Creates FormData      │
└──────────┬──────────────┘
           │ [HTTP POST with multipart/form-data]
           ↓
┌──────────────────────────────────┐
│   Backend (Node.js/Express)      │
│   POST /api/register             │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│   Multer Middleware              │
│   /middleware/upload.js          │
│                                  │
│ 1. Receives files                │
│ 2. Generates unique filename:    │
│    profile-{timestamp}-{random}  │
│ 3. Saves to /backend/uploads/    │
│ 4. Returns file metadata         │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│   Route Handler                  │
│   /routes/userRoutes.js          │
│                                  │
│ 1. Generates Register ID (KM...) │
│ 2. Saves user data to DB         │
│ 3. Saves FILE PATHS to DB        │
│    (not the actual files)        │
└──────────┬───────────────────────┘
           │
           ↓
┌──────────────────────────────────┐
│   MySQL Database                 │
│                                  │
│ users table:                     │
│ - id: 1                          │
│ - register_id: KM20251015001     │
│ - biodata_file: "profile-...pdf" │ ← STRING (not file)
│ - ...other fields                │
│                                  │
│ photos table:                    │
│ - id: 1                          │
│ - user_id: 1                     │
│ - photo_path: "profile-...jpg"   │ ← STRING (not image)
│ - is_primary: 1                  │
└──────────────────────────────────┘

           ↓
┌──────────────────────────────────┐
│   File System                    │
│   /backend/uploads/              │
│                                  │
│ ✓ profile-...jpg (actual file)   │
│ ✓ profile-...pdf (actual file)   │
└──────────────────────────────────┘
```

---

## 📤 **Upload Process (Step by Step)**

### **Step 1: Frontend Preparation**
```javascript
// frontend/src/pages/Register.js

// User selects files
const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos(files); // Store in state
};

// On submit
const handleSubmit = async (e) => {
    const formDataToSend = new FormData();
    
    // Add text fields
    formDataToSend.append('full_name', 'John Doe');
    formDataToSend.append('email', 'john@example.com');
    
    // Add FILES (binary data)
    photos.forEach(photo => {
        formDataToSend.append('photos', photo); // Actual file object
    });
    
    // Send to backend
    await registerUser(formDataToSend);
};
```

### **Step 2: Backend Receives Files**
```javascript
// backend/routes/userRoutes.js

router.post('/register', uploadBiodata.fields([
    { name: 'photos', maxCount: 4 },
    { name: 'biodata_file', maxCount: 1 }
]), async (req, res) => {
    // Multer has ALREADY saved files to disk
    // req.files contains metadata
    
    console.log(req.files);
    /* Output:
    {
        photos: [
            {
                fieldname: 'photos',
                originalname: 'myPhoto.jpg',
                filename: 'profile-1729123456789-123456789.jpg',  ← Generated name
                path: '/backend/uploads/profile-1729123456789-123456789.jpg',
                size: 245678
            }
        ],
        biodata_file: [
            {
                fieldname: 'biodata_file',
                originalname: 'biodata.pdf',
                filename: 'profile-1729123456791-456789123.pdf',
                path: '/backend/uploads/profile-1729123456791-456789123.pdf',
                size: 567890
            }
        ]
    }
    */
});
```

### **Step 3: Multer Saves Files**
```javascript
// backend/middleware/upload.js

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '/backend/uploads/'); // Save here
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
        // Generates: profile-1729123456789-123456789.jpg
    }
});
```

### **Step 4: Save Path to Database**
```javascript
// backend/routes/userRoutes.js

// Extract filename (not the file itself)
const biodataFilePath = req.files.biodata_file[0].filename;
// biodataFilePath = "profile-1729123456791-456789123.pdf"

// Save to database (ONLY the filename string)
await connection.query(
    `INSERT INTO users (register_id, biodata_file) VALUES (?, ?)`,
    ['KM20251015001', biodataFilePath]  // ← Saves STRING, not file
);

// Save photos paths
const photoFiles = req.files.photos;
for (let i = 0; i < photoFiles.length; i++) {
    const photoPath = photoFiles[i].filename; // Just the filename
    await connection.query(
        'INSERT INTO photos (user_id, photo_path) VALUES (?, ?)',
        [userId, photoPath]  // ← Saves STRING, not image
    );
}
```

---

## 📥 **Retrieval Process**

### **Step 1: Fetch User Data**
```javascript
// Backend retrieves from database
const [users] = await db.query(`
    SELECT u.*, 
           GROUP_CONCAT(p.photo_path) as photos
    FROM users u
    LEFT JOIN photos p ON u.id = p.user_id
    WHERE u.id = ?
`, [userId]);

// Result:
{
    id: 1,
    register_id: 'KM20251015001',
    biodata_file: 'profile-1729123456791-456789123.pdf',  // ← Path string
    photos: 'profile-...jpg,profile-...jpg,profile-...jpg' // ← Paths string
}
```

### **Step 2: Construct URLs**
```javascript
// Frontend receives data and constructs URLs
const user = {
    id: 1,
    biodata_file: 'profile-1729123456791-456789123.pdf',
    photos: ['profile-...jpg', 'profile-...jpg']
};

// Construct full URLs
const biodataUrl = `http://localhost:5001/uploads/${user.biodata_file}`;
const photoUrls = user.photos.map(path => 
    `http://localhost:5001/uploads/${path}`
);
```

### **Step 3: Display in Browser**
```javascript
// frontend/src/pages/Browse.js

{profile.photos && profile.photos.length > 0 ? (
    <img
        src={`http://localhost:5000/uploads/${profile.photos[0]}`}
        //      ↑ Server URL      ↑ uploads folder  ↑ filename from DB
        alt={profile.full_name}
    />
) : (
    <div className="no-image">👨</div>
)}
```

### **Step 4: Server Serves File**
```javascript
// backend/server.js

// Static file serving middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// When browser requests: http://localhost:5001/uploads/profile-123.jpg
// Express serves: /backend/uploads/profile-123.jpg
```

---

## 💾 **What's Actually Stored Where**

### **Database (MySQL):**
```sql
-- ONLY stores text strings (file paths)

users table:
+----+---------------+------------------------------------------+
| id | register_id   | biodata_file                             |
+----+---------------+------------------------------------------+
|  1 | KM20251015001 | profile-1729123456791-456789123.pdf      | ← 40 bytes
+----+---------------+------------------------------------------+

photos table:
+----+---------+------------------------------------------+------------+
| id | user_id | photo_path                               | is_primary |
+----+---------+------------------------------------------+------------+
|  1 |       1 | profile-1729123456789-123456789.jpg      |          1 | ← 40 bytes
|  2 |       1 | profile-1729123456790-987654321.jpg      |          0 | ← 40 bytes
+----+---------+------------------------------------------+------------+

Total DB storage per user: ~120 bytes (just paths)
```

### **File System:**
```bash
/backend/uploads/
├── profile-1729123456789-123456789.jpg  # 250 KB (actual image)
├── profile-1729123456790-987654321.jpg  # 180 KB (actual image)
├── profile-1729123456791-456789123.pdf  # 500 KB (actual PDF)
└── ...

Total file storage per user: ~930 KB (actual files)
```

---

## 🔍 **Key Points**

### ✅ **What IS stored in Database:**
- File paths (strings): `"profile-1729123456789-123456789.jpg"`
- Metadata: file size, type, timestamps
- User data: name, email, etc.

### ❌ **What is NOT stored in Database:**
- ❌ Actual image data
- ❌ Actual PDF data
- ❌ Base64 encoded files
- ❌ Binary BLOB data

### 🎯 **Benefits:**
1. **Fast Queries:** Database stays small
2. **Easy Backup:** Separate file and DB backups
3. **Scalable:** Can move to cloud storage easily
4. **Performance:** Direct file serving (no DB overhead)
5. **Simple:** Standard industry approach

---

## 📊 **Size Comparison Example**

**For 1 user with 4 photos + 1 biodata:**

| What | Where | Size |
|------|-------|------|
| Photo paths (4) | Database | 160 bytes |
| Biodata path (1) | Database | 40 bytes |
| **Total Database** | **MySQL** | **~200 bytes** |
| | | |
| Actual photos (4) | File System | ~800 KB |
| Actual biodata (1) | File System | ~500 KB |
| **Total Files** | **/uploads/** | **~1.3 MB** |

**Database Impact: 200 bytes vs 1.3 MB = 6,500x smaller!** 🚀

---

## 🔄 **Summary**

Your current system:
1. ✅ Stores **files** on disk (fast, efficient)
2. ✅ Stores **paths** in database (small, fast queries)
3. ✅ Serves files via Express static middleware
4. ✅ Frontend constructs URLs from paths
5. ✅ Browser displays images from server

This is the **industry standard** and most efficient approach! 🎯

