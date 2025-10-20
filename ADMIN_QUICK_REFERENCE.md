# 🎯 Admin Quick Reference Card

## 📧 **Main Contact**
**Email:** info@khandeshmatrimony.com  
**Phone:** +91 9167681454  
**UPI:** 9167681454@ybl

---

## 🔑 **Login**
- **URL:** http://localhost:3001/admin/login
- **Username:** admin
- **Password:** admin123

---

## 🆔 **Register ID Format**
`KM{YYYYMMDD}{XXXX}`  
Example: **KM202510170001**

---

## 💰 **Payment Details**
- **Amount:** ₹1500
- **Validity:** 6 months
- **UPI ID:** 9167681454@ybl
- **Email for confirmation:** info@khandeshmatrimony.com

---

## ⚡ **Quick Actions**

### **✅ Approve Profile**
1. Go to "Pending" tab
2. Click ✅ on profile
3. Confirm approval

### **✏️ Edit Profile (Biodata)**
1. Click ✏️ Edit button
2. Click "📄 View Biodata File"
3. Read PDF in new tab
4. Fill form fields from biodata
5. Click photos to verify
6. Click 💾 Save Changes
7. Click ✅ Approve

### **💳 Mark as Paid**
1. Find user profile
2. Click "Mark as Paid" button
3. Status changes to "Paid"

### **🗑️ Delete Profile**
1. Find user profile
2. Click 🗑️ Delete button
3. Confirm deletion

---

## 📋 **Daily Checklist**

### **Morning (9 AM)**
- [ ] Check email inbox
- [ ] Login to admin panel
- [ ] Review pending count
- [ ] Check payment confirmations

### **Processing (Throughout Day)**
- [ ] Verify payments received via email
- [ ] Mark profiles as "Paid"
- [ ] Review biodata uploads
- [ ] Fill form fields from biodata
- [ ] Approve verified profiles
- [ ] Reply to contact requests

### **Evening (6 PM)**
- [ ] Process remaining pending profiles
- [ ] Reply to pending emails
- [ ] Update dashboard stats

---

## 📧 **Email Handling**

### **Payment Confirmation Email (from user)**
**Subject:** Payment Confirmation - KM...  
**Action:**
1. Verify screenshot shows ₹1500
2. Note KM Register ID
3. Login to admin panel
4. Find user by Register ID
5. Click "Mark as Paid"
6. Reply to user: "Payment verified. Processing profile..."

### **Contact Request Email (from user)**
**Subject:** Contact Request for KM...  
**Action:**
1. Note requester's KM ID
2. Note requested profile's KM ID
3. Check BOTH profiles:
   - ✓ Approved?
   - ✓ Paid?
4. If YES → Send contact details
5. If NO → Reply: "Please complete payment/approval first"

---

## 📝 **Email Templates**

### **Payment Verified:**
```
Subject: Profile Approved - KM202510170001

Dear [Name],

Your payment is verified and profile is approved!

Register ID: KM202510170001
Status: Approved ✓

Browse profiles: http://localhost:3001/browse

To request contact details, email us with:
- Your KM ID
- Their KM ID

Best regards,
Khandesh Matrimony
info@khandeshmatrimony.com
```

### **Contact Details Provided:**
```
Subject: Contact Details - KM202510170002

Dear [Name],

Contact Details for KM202510170002:

Name: [Full Name]
Age: [X] years
Mobile: [Number]
Email: [Email]
Address: [Address]

Please contact directly. Mention Khandesh Matrimony.

All the best!

Team Khandesh Matrimony
info@khandeshmatrimony.com
+91 9167681454
```

### **Profile Needs Payment:**
```
Subject: RE: Contact Request

Dear [Name],

To access contact details, please:

1. Complete payment: ₹1500
2. UPI: 9167681454@ybl
3. Reference: Your KM ID
4. Email screenshot to us

After verification, we'll share contact details.

Thank you,
Khandesh Matrimony
```

---

## 🔍 **Search & Filter**

### **Find User by ID:**
1. Use search box: Type "KM202510170001"
2. Press Enter
3. User appears

### **Filter by Status:**
- Pending tab → All pending
- Approved tab → All approved
- Rejected tab → All rejected

### **Filter by Gender:**
- Click dropdown
- Select: Male/Female/All
- Results update

### **Filter by Payment:**
- Click payment filter
- Select: Paid/Unpaid/All
- Results update

---

## 🎯 **Profile Completion (Biodata Upload)**

### **User uploaded biodata? Follow these steps:**

**Step 1: Open Profile**
- Go to Pending tab
- Find biodata registration
- Look for "📄" icon

**Step 2: View & Edit**
- Click ✏️ Edit
- Click "📄 View Biodata File"
- PDF opens in new tab

**Step 3: Fill Form**
Fill these sections from biodata:

**📋 Primary Information**
- First name, Surname, Kul
- DOB, Birth time, Birth place
- Height, Weight, Color, Blood group
- Education, Occupation, Income
- Mobile 1, Mobile 2, Email
- Permanent address, Current residence
- Marital status, Personality, Hobbies

**👨‍👩‍👧‍👦 Family Details**
- Father's name & occupation
- Mother's name & occupation
- Brothers, Sisters
- Family type, status, values

**✨ Astrological**
- Rashi, Nakshatra, Gotra
- Manglik, Nadi, Gana

**💭 Expectations**
- Expected education
- Expected occupation
- Expected income
- Expected location
- Other expectations

**Step 4: Verify & Save**
- Check photos (click to view full)
- Verify all filled correctly
- Click 💾 Save Changes

**Step 5: Approve**
- Click ✅ Approve button
- Profile goes live!

---

## 📊 **Dashboard Stats**

Monitor these numbers:

**Pending Approvals**
- Keep < 10 (process daily)

**Approved Profiles**
- Growing number = good!

**Payment Status**
- Paid vs Unpaid
- Follow up unpaid after 2 days

**Registration Type**
- Form vs Biodata
- Track which is popular

---

## ⚠️ **Common Issues**

### **Issue: User says payment done but not reflected**
**Solution:**
1. Check email for screenshot
2. Verify payment amount (₹1500)
3. Manually mark as paid
4. Reply to user

### **Issue: Biodata PDF not opening**
**Solution:**
1. Check file exists in backend/uploads
2. Check filename matches database
3. Try different browser
4. Re-upload if necessary

### **Issue: Photos not displaying**
**Solution:**
1. Check photos table in database
2. Verify files exist in uploads folder
3. Check file permissions
4. Clear browser cache

### **Issue: User forgot Register ID**
**Solution:**
1. Search by name or email
2. Find their profile
3. Reply with their KM ID

---

## 🚨 **Emergency Contacts**

**Technical Issues:**
- Developer: [Contact Info]
- Database: MySQL on localhost:3306

**Business Queries:**
- Main email: info@khandeshmatrimony.com
- Phone: +91 9167681454

---

## 🎓 **Best Practices**

✅ **DO:**
- Process pending profiles within 24 hours
- Reply to emails within 2 hours
- Verify payment before approving
- Fill ALL fields when editing biodata
- Double-check contact details before sharing
- Keep track of matched couples (for testimonials!)

❌ **DON'T:**
- Approve without payment verification
- Share contact details without verifying both profiles
- Delete profiles without backup
- Edit approved profiles without reason
- Reply with incomplete information

---

## 📈 **Weekly Tasks**

**Monday:**
- Review weekend registrations
- Process backlog
- Send reminder emails for pending payments

**Wednesday:**
- Mid-week stats check
- Follow up on contact requests
- Update any profile information

**Friday:**
- Weekly report preparation
- Clear all pending approvals
- Plan for weekend inquiries

---

## 💡 **Pro Tips**

1. **Keep Excel sheet** of pending payments → Follow up after 2 days
2. **Use template emails** → Faster responses
3. **Screenshot payments** → Keep records
4. **Track matched couples** → Great for marketing!
5. **Respond quickly** → Better user experience
6. **Be polite always** → Dealing with sensitive matters

---

## 🎯 **Success Metrics to Track**

- **Daily registrations:** Target 5-10
- **Approval rate:** Target 90%+
- **Payment conversion:** Target 80%+
- **Response time:** Target < 2 hours
- **Contact requests:** Track per profile
- **User satisfaction:** Follow up after match

---

## 📞 **Quick Responses**

**"How long for approval?"**
→ "Usually within 24 hours after payment verification."

**"My payment is done?"**
→ "Please email screenshot to info@khandeshmatrimony.com with your KM ID."

**"How to get contact details?"**
→ "Email us with your KM ID and their KM ID. We'll share after verification."

**"Profile not showing?"**
→ "Please complete payment and wait for admin approval."

---

**🎊 Ready to manage Khandesh Matrimony! 🎊**

*Print this and keep near your workstation!*

