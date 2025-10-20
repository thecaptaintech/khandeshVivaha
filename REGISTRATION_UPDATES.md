# Registration Form Updates

## Changes Made

### 1. Registration ID Format
- **Changed from:** `KV` prefix (e.g., KV20251015001)
- **Changed to:** `KM` prefix (e.g., KM20251015001)
- All new registrations will use the KM prefix

### 2. Registration Type Selection
Users now have **two registration options**:

#### Option 1: Fill Form (Detailed)
- Complete 4-step registration form
- All fields manually entered
- Step 1: Primary Information
- Step 2: Family Details
- Step 3: Astrological Information
- Step 4: Partner Expectations

#### Option 2: Upload Biodata
- **Basic Details Required:**
  - Full Name *
  - Mobile Number *
  - Email Address *
- **Upload Requirements:**
  - Biodata/Parichay Patra (PDF, DOC, DOCX, JPG, PNG)
  - Photos (Max 4 images)

### 3. Removed Fields
From Step 4 (Expectations), the following fields have been removed:
- ❌ Expected Age From
- ❌ Expected Age To
- ❌ Expected Height From
- ❌ Expected Height To

### 4. Database Changes

#### New Columns Added to `users` table:
```sql
biodata_file VARCHAR(255) - Path to uploaded biodata file
registration_type ENUM('form', 'biodata') - Type of registration
```

#### To Apply Database Changes:
```bash
mysql -u root -p khandesh_vivah < backend/update_schema.sql
```

### 5. Backend Updates

#### File Upload Support:
- Photos: JPG, PNG, GIF, WEBP (Max 5MB each)
- Biodata: PDF, DOC, DOCX, JPG, PNG (Max 5MB)

#### Registration Types:
- **Form Registration:** All fields stored in database
- **Biodata Registration:** 
  - Only name, mobile, email, biodata_file, photos stored
  - Status set to 'pending'
  - Admin will fill remaining details manually

### 6. Admin Workflow

For Biodata Registrations:
1. User submits basic details + biodata file + photos
2. Registration status: 'pending'
3. Admin reviews biodata file
4. Admin manually fills complete profile details using biodata
5. Admin approves profile

### 7. Frontend Features

#### Registration Type Selector:
- Beautiful card-based UI
- Two options with icons
- OR divider
- Hover animations

#### Biodata Upload Screen:
- Basic details form (3 fields)
- Dashed border upload boxes
- File name display after selection
- Submit button

#### Form Registration:
- 4-step wizard with progress indicator
- All original fields
- Next/Previous navigation
- Finish button on last step

### 8. File Storage
All uploaded files (photos and biodata) stored in:
```
backend/uploads/
├── profile-{timestamp}-{random}.jpg  (photos)
├── profile-{timestamp}-{random}.pdf  (biodata)
└── ...
```

### 9. API Endpoints

#### POST /api/register
**FormData fields for Biodata Upload:**
- `registration_type`: 'biodata'
- `full_name`: string
- `mobile_no_1`: string
- `email`: string
- `biodata_file`: file
- `photos`: file[] (max 4)

**FormData fields for Form Registration:**
- `registration_type`: 'form' (or omitted)
- All form fields
- `photos`: file[] (max 4)

## How to Use

### User Flow:

1. **Navigate to Registration:**
   ```
   http://localhost:3001/register
   ```

2. **Choose Registration Method:**
   - Click "Fill Form" for detailed registration
   - Click "Upload Biodata" for quick registration

3. **For Biodata Upload:**
   - Enter: Name, Mobile, Email
   - Upload biodata file
   - Upload photos (max 4)
   - Submit

4. **For Form Registration:**
   - Complete Step 1 → Next
   - Complete Step 2 → Next
   - Complete Step 3 → Next
   - Complete Step 4 → Finish

5. **Success Screen:**
   - Register ID displayed (KM...)
   - Payment instructions
   - UPI ID: 9167681454@ybl
   - Fee: ₹1500 (6 months)

## Admin Notes

- Biodata registrations appear with `registration_type = 'biodata'`
- Download biodata file from uploads folder
- Fill complete profile manually
- Verify payment
- Approve profile

