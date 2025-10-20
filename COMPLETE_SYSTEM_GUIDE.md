# 🎉 Khandesh Matrimony - Complete System Guide

## 📧 **Contact Information**
- **Email:** info@khandeshmatrimony.com
- **Phone:** +91 9167681454
- **UPI ID:** 9167681454@ybl
- **Website:** khandeshmatrimony.com

---

## 🆔 **Register ID System**

### **Format:** `KM{YYYYMMDD}{XXXX}`
- **KM** = Khandesh Matrimony prefix
- **YYYYMMDD** = Year, Month, Day of registration
- **XXXX** = Random 4-digit number

### **Example:**
- Registration on October 17, 2025
- ID: `KM202510170001`, `KM202510170002`, etc.

---

## 👤 **User Journey**

### **Step 1: Registration**
1. Visit website → Click "Register"
2. **Choose registration method:**
   - **Option A:** Fill detailed form (4-step process)
   - **Option B:** Upload biodata PDF + photos

3. **Submit registration**
4. **Receive KM Register ID** (e.g., `KM202510170001`)

### **Step 2: Payment**
1. Pay ₹1500 via UPI: `9167681454@ybl`
2. Add KM Register ID in payment reference
3. Take screenshot of payment
4. Email to: `info@khandeshmatrimony.com`
   - Subject: Payment for KM202510170001
   - Attachment: Payment screenshot
   - Message: Include your KM Register ID

### **Step 3: Admin Approval**
1. Admin receives email
2. Admin verifies payment
3. Admin reviews profile/biodata
4. Admin approves profile
5. **Profile goes live!** 🎉

### **Step 4: Browse & Connect**
1. Browse profiles on website
2. Find interesting profiles
3. Note their KM Register ID
4. Email `info@khandeshmatrimony.com`:
   ```
   Subject: Contact Request for KM202510170002
   
   My Register ID: KM202510170001
   Requested Profile: KM202510170002
   
   Please provide contact details.
   ```
5. Admin verifies both profiles are approved
6. Admin shares contact details via email

---

## 🛠️ **Admin Panel Features**

### **Login:** 
- URL: `http://localhost:3001/admin/login`
- Default credentials: `admin` / `admin123`

### **Dashboard Tabs:**

#### **1. 📊 Dashboard**
- Statistics overview
- Pending approvals count
- Approved/rejected counts
- Payment status summary

#### **2. ⏳ Pending Registrations**
- View all pending profiles
- See registration type (form/biodata)
- Actions:
  - ✏️ Edit - Fill/verify details
  - 📄 View Biodata (if uploaded)
  - 📸 View Photos
  - ✅ Approve
  - ❌ Reject

#### **3. ✅ Approved Profiles**
- All approved profiles
- Quick stats
- Edit/Delete options
- Payment status management

#### **4. ❌ Rejected Profiles**
- All rejected profiles
- Review and reconsider option

### **Admin Workflow for Biodata Uploads:**

**When user uploads biodata:**

1. Profile appears in "Pending" tab
2. Admin clicks **✏️ Edit**
3. Modal opens with:
   - 📄 **View Biodata File** button
   - 📸 Photos (clickable)
   - 📝 **All 43 form fields** (mostly empty)

4. Admin clicks "View Biodata File"
5. PDF opens in new tab
6. Admin reads biodata
7. Admin fills form fields from biodata:
   - **Personal Info:** Name, DOB, height, weight, etc.
   - **Family Details:** Parents, siblings info
   - **Astrological:** Rashi, nakshatra, gotra, etc.
   - **Expectations:** Partner preferences

8. Admin clicks **💾 Save Changes**
9. Profile updated in database
10. Admin clicks **✅ Approve**
11. Profile now searchable on website! 🎉

---

## 🎨 **Website Features**

### **1. Home Page**
- Hero section with Marathi/English toggle
- Marriage-themed background (rotating 4 images)
- Quick access buttons:
  - Female Profiles
  - Male Profiles
  - Divorcee
  - Widow/Widower

- **Rules Section:**
  - How to request contact details
  - Payment information
  - Process steps

### **2. Registration Page**
- Two-option selector:
  - **Fill Form:** 4-step comprehensive form
  - **Upload Biodata:** Quick upload with basic details

- **Form Sections:**
  - Primary Information (23 fields)
  - Family Details (9 fields)
  - Astrological Info (6 fields)
  - Partner Expectations (5 fields)

### **3. Browse Profiles**
- **Quick Filters:**
  - Female / Male
  - Divorcee / Widow / Widower
  - All

- **Search:** By name or Register ID
- **Profile Cards Show:**
  - Photo
  - KM Register ID
  - Name, Age
  - Height, Education
  - Occupation, Income
  - Birth Date

### **4. Profile Detail Page**
- Full profile information in sections:
  - Personal Information
  - Education & Career
  - Family Details
  - Astrological Information
  - Partner Expectations
  - Additional Details

- **Contact Details:**
  - If **NOT PAID:** Shows locked message with email
  - If **PAID & APPROVED:** Shows full contact info
  - Instructions to email for other profile contacts

---

## 📊 **Database Schema**

### **Users Table (61 columns)**

**Registration Info:**
- `id`, `register_id`, `registration_type`, `created_at`

**Primary Details (23 fields):**
- `first_name`, `surname`, `full_name`, `kul`
- `gender`, `date_of_birth`, `birth_time`, `birth_village`, `birth_district`
- `height`, `weight`, `color`, `blood_group`
- `email`, `mobile_no_1`, `mobile_no_2`, `contact_number`
- `education`, `occupation`, `income`, `company_address`
- `caste_religion`, `marital_status`
- `permanent_address`, `current_residence`, `district`, `taluka`, `village`
- `native_district`, `native_village_taluka`
- `personality`, `hobbies`, `about_yourself`

**Family Details (9 fields):**
- `father_name`, `father_occupation`
- `mother_name`, `mother_occupation`
- `brothers`, `sisters`
- `family_type`, `family_status`, `family_values`

**Astrological (6 fields):**
- `rashi`, `nakshatra`, `gotra`
- `manglik`, `nadi`, `gana`

**Expectations (5 fields):**
- `expected_education`, `expected_occupation`
- `expected_income`, `expected_location`
- `other_expectations`

**Admin Fields:**
- `approval_status` (pending/approved/rejected)
- `payment_status` (paid/unpaid)
- `biodata_file` (for uploaded biodata)

### **Photos Table**
- `id`, `user_id`, `photo_path`, `is_primary`, `created_at`

### **Admin Table**
- `id`, `username`, `password`, `created_at`

---

## 🔄 **Complete User Flow**

```
┌─────────────────────────────────────────────────┐
│  USER VISITS WEBSITE                            │
│  ↓                                              │
│  Chooses Registration Method                    │
│  ├─ Fill Form (4 steps) OR                     │
│  └─ Upload Biodata + Photos                    │
│  ↓                                              │
│  Receives KM Register ID                        │
│  (e.g., KM202510170001)                        │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  PAYMENT                                        │
│  ↓                                              │
│  Pay ₹1500 to UPI: 9167681454@ybl             │
│  Reference: KM202510170001                      │
│  ↓                                              │
│  Email screenshot to:                           │
│  info@khandeshmatrimony.com                    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  ADMIN VERIFICATION                             │
│  ↓                                              │
│  Admin receives email                           │
│  ↓                                              │
│  Admin verifies payment                         │
│  ↓                                              │
│  Admin reviews profile/biodata                  │
│  (If biodata: Admin fills form from PDF)       │
│  ↓                                              │
│  Admin approves profile                         │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│  PROFILE LIVE ✓                                 │
│  ↓                                              │
│  Profile appears in browse section              │
│  ↓                                              │
│  Other users can view profile                   │
│  ↓                                              │
│  Users email admin to request contact details   │
│  (Email format: My ID + Requested ID)           │
│  ↓                                              │
│  Admin verifies both profiles                   │
│  ↓                                              │
│  Admin shares contact details via email         │
└─────────────────────────────────────────────────┘
```

---

## 💻 **Technical Stack**

**Frontend:**
- React 18
- React Router DOM
- Axios
- CSS3 with animations
- Context API for language

**Backend:**
- Node.js
- Express.js
- MySQL
- Multer (file uploads)
- JWT (admin auth)

**Database:**
- MySQL with utf8mb4 encoding
- 61 columns in users table
- Photo storage on server

---

## 🚀 **Running the Application**

### **Start Backend:**
```bash
cd backend
npm install
node server.js
```
Backend runs on: `http://localhost:5001`

### **Start Frontend:**
```bash
cd frontend
npm install
npm start
```
Frontend runs on: `http://localhost:3001`

### **Access Points:**
- **Main Website:** http://localhost:3001
- **Admin Panel:** http://localhost:3001/admin/login
- **API Base:** http://localhost:5001/api

---

## 📝 **Admin Daily Tasks**

### **Morning Routine:**
1. Login to admin panel
2. Check pending registrations
3. Review new biodata uploads
4. Check email for payment confirmations

### **Processing Biodata:**
1. Open pending profile
2. Click Edit
3. View uploaded biodata PDF
4. Fill all form fields from biodata
5. Verify photos
6. Save changes
7. If payment confirmed → Approve
8. If payment pending → Wait for email

### **Contact Requests:**
1. Check email for contact requests
2. Verify both KM IDs exist
3. Check both profiles are approved and paid
4. Reply with contact details:
   ```
   Contact Details for KM202510170002:
   
   Name: [Full Name]
   Mobile: [Phone Number]
   Email: [Email Address]
   Address: [Full Address]
   
   All the best!
   ```

---

## 🎯 **Key Features**

✅ Bilingual (English/Marathi)  
✅ Two registration methods (Form/Biodata)  
✅ KM Register ID system  
✅ Secure payment process  
✅ Admin verification workflow  
✅ Privacy-focused (contact details hidden)  
✅ Email-based contact requests  
✅ Comprehensive user profiles (43 fields)  
✅ Photo management (up to 4 photos)  
✅ Mobile responsive design  
✅ Marriage-themed UI with animations  

---

## 📧 **Email Templates**

### **For Users - Payment Confirmation:**
```
To: info@khandeshmatrimony.com
Subject: Payment Confirmation - KM202510170001

Dear Admin,

I have completed the payment for my registration.

Register ID: KM202510170001
Payment Amount: ₹1500
Payment Date: [Date]
Transaction ID: [If available]

Please find the payment screenshot attached.

Thank you.
```

### **For Users - Contact Request:**
```
To: info@khandeshmatrimony.com
Subject: Contact Request for KM202510170002

Dear Admin,

My Register ID: KM202510170001
Requested Profile: KM202510170002

I am interested in this profile. Please provide their contact details.

Thank you.
```

### **For Admin - Payment Verified:**
```
To: [user email]
Subject: Payment Verified - KM202510170001

Dear [Name],

Your payment has been verified and your profile has been approved.

Register ID: KM202510170001
Status: Approved ✓

You can now browse other profiles and request contact details.

Visit: http://localhost:3001/browse

For any queries, contact us at info@khandeshmatrimony.com

Best regards,
Khandesh Matrimony Team
```

### **For Admin - Contact Details Provided:**
```
To: [requesting user email]
Subject: Contact Details for KM202510170002

Dear [Name],

As requested, here are the contact details:

Profile ID: KM202510170002
Name: [Full Name]
Age: [Age] years
Mobile: [Phone Number]
Email: [Email Address]
Address: [Full Address]

Please reach out directly to them and mention you found them through Khandesh Matrimony.

All the best!

Khandesh Matrimony Team
info@khandeshmatrimony.com
+91 9167681454
```

---

## 🎉 **Success Metrics**

Track these KPIs:
- Total registrations
- Pending approvals (keep low)
- Approval rate
- Payment conversion rate
- Contact requests per profile
- Successful matches (ask users!)

---

## 🔐 **Security Notes**

✅ Admin authentication with JWT  
✅ Contact details hidden until paid  
✅ Email verification for contact requests  
✅ Biodata files stored securely  
✅ MySQL prepared statements (SQL injection prevention)  
✅ File upload validation  

---

## 📞 **Support**

For technical issues or questions:
- **Email:** info@khandeshmatrimony.com
- **Phone:** +91 9167681454

---

**🎊 System Status: FULLY OPERATIONAL! 🎊**

*Last Updated: October 17, 2025*
*Version: 2.0 - Complete System with Biodata Upload & Admin Edit*

