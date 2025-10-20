USE khandesh_vivah;

-- Insert dummy users with various profiles
INSERT INTO users (register_id, full_name, gender, date_of_birth, caste_religion, education, occupation, height, weight, district, taluka, village, contact_number, email, about_yourself, approval_status, payment_status) VALUES

-- Male Profiles
('KV202510140001', 'राज कुमार पाटील', 'Male', '1995-06-15', 'मराठा', 'B.Tech Computer Science', 'Software Engineer', '5\'10"', '75 kg', 'जळगाव', 'जळगाव', 'जळगाव शहर', '9876543210', 'raj.patil@email.com', 'मी एक सॉफ्टवेअर इंजिनियर आहे. माझ्या आई-वडिलांना शोध आहे.', 'approved', 'paid'),

('KV202510140002', 'विकास राजेंद्र देशमुख', 'Male', '1993-03-20', 'मराठा', 'MBA', 'Business Owner', '5\'8"', '70 kg', 'धुळे', 'धुळे', 'धुळे शहर', '9876543211', 'vikas.d@email.com', 'मी माझा स्वतःचा व्यवसाय करतो. शांत आणि घरगुती मुलगी शोधत आहे.', 'approved', 'paid'),

('KV202510140003', 'संदीप महादेव जाधव', 'Male', '1996-08-10', 'मराठा', 'B.Com', 'Bank Manager', '5\'9"', '72 kg', 'नंदुरबार', 'नंदुरबार', 'नंदुरबार शहर', '9876543212', 'sandip.j@email.com', 'मी बँक मॅनेजर आहे. सुशील आणि शिक्षित मुलगी शोधत आहे.', 'pending', 'unpaid'),

('KV202510140004', 'प्रशांत सुरेश मोरे', 'Male', '1994-11-25', 'मराठा', 'B.Sc Agriculture', 'Farmer', '5\'11"', '78 kg', 'जळगाव', 'जामनेर', 'जामनेर', '9876543213', 'prashant.m@email.com', 'मी शेती करतो आणि स्वतःचे व्यवसाय आहे.', 'approved', 'paid'),

-- Female Profiles
('KV202510140005', 'प्रिया राजेश पवार', 'Female', '1997-04-12', 'मराठा', 'B.E. Electronics', 'Software Developer', '5\'4"', '55 kg', 'जळगाव', 'जळगाव', 'जळगाव शहर', '9876543214', 'priya.p@email.com', 'मी सॉफ्टवेअर डेव्हलपर आहे. शिक्षित आणि कामकाजी परिवार शोधत आहे.', 'approved', 'paid'),

('KV202510140006', 'स्नेहा विनोद कुलकर्णी', 'Female', '1998-09-05', 'मराठा', 'M.A. Marathi', 'Teacher', '5\'3"', '52 kg', 'धुळे', 'धुळे', 'धुळे शहर', '9876543215', 'sneha.k@email.com', 'मी शिक्षिका आहे. सुशील आणि घरगुती पसंद करते.', 'approved', 'paid'),

('KV202510140007', 'मेघा अनिल शिंदे', 'Female', '1996-07-18', 'मराठा', 'B.Sc Nursing', 'Nurse', '5\'5"', '58 kg', 'नंदुरबार', 'नंदुरबार', 'नंदुरबार शहर', '9876543216', 'megha.s@email.com', 'मी नर्स आहे. शिक्षित आणि सुसंस्कृत परिवाराची अपेक्षा आहे.', 'pending', 'unpaid'),

('KV202510140008', 'आरती सुनिल गायकवाड', 'Female', '1995-12-30', 'मराठा', 'M.Com', 'Accountant', '5\'2"', '50 kg', 'जळगाव', 'भडगाव', 'भडगाव', '9876543217', 'arati.g@email.com', 'मी अकाउंटंट आहे. कामकाजी आणि शिक्षित मुलगा शोधत आहे.', 'approved', 'paid'),

-- Divorcee Profiles
('KV202510140009', 'रोहित दत्तात्रय सोनवणे', 'Divorcee', '1990-05-22', 'मराठा', 'M.Tech', 'Senior Engineer', '5\'10"', '76 kg', 'जळगाव', 'जळगाव', 'जळगाव शहर', '9876543218', 'rohit.s@email.com', 'मी घटस्फोटित आहे. समजून घेणारी आणि शिक्षित मुलगी शोधत आहे.', 'approved', 'paid'),

('KV202510140010', 'कविता प्रकाश भोसले', 'Divorcee', '1992-02-14', 'मराठा', 'B.A.', 'Teacher', '5\'4"', '54 kg', 'धुळे', 'धुळे', 'धुळे शहर', '9876543219', 'kavita.b@email.com', 'मी घटस्फोटित आहे. समजून घेणारा आणि सुशील मुलगा शोधत आहे.', 'pending', 'unpaid'),

-- Widow Profiles
('KV202510140011', 'सविता रमेश खंडारे', 'Widow', '1988-08-08', 'मराठा', 'B.Ed', 'School Teacher', '5\'3"', '56 kg', 'जळगाव', 'जामनेर', 'जामनेर', '9876543220', 'savita.k@email.com', 'मी विधवा आहे. समजून घेणारा आणि सहकारी मुलगा शोधत आहे.', 'approved', 'paid'),

-- More pending profiles
('KV202510140012', 'अमित गणेश काळे', 'Male', '1997-01-10', 'मराठा', 'B.Sc', 'Government Employee', '5\'7"', '68 kg', 'नंदुरबार', 'शहादा', 'शहादा', '9876543221', 'amit.k@email.com', 'मी सरकारी नोकरीत आहे. शिक्षित मुलगी शोधत आहे.', 'pending', 'unpaid'),

('KV202510140013', 'पूजा संजय चव्हाण', 'Female', '1999-03-15', 'मराठा', 'B.Pharmacy', 'Pharmacist', '5\'4"', '53 kg', 'जळगाव', 'जळगाव', 'जळगाव शहर', '9876543222', 'pooja.c@email.com', 'मी फार्मासिस्ट आहे. शिक्षित आणि स्थिर नोकरी असलेला मुलगा शोधत आहे.', 'pending', 'unpaid'),

('KV202510140014', 'राहुल मोहन सोनार', 'Male', '1994-06-20', 'मराठा', 'CA', 'Chartered Accountant', '5\'9"', '73 kg', 'धुळे', 'धुळे', 'धुळे शहर', '9876543223', 'rahul.s@email.com', 'मी CA आहे. शिक्षित आणि घरगुती मुलगी शोधत आहे.', 'approved', 'paid'),

('KV202510140015', 'अनुष्का प्रवीण पाटील', 'Female', '1998-11-11', 'मराठा', 'B.Tech IT', 'IT Professional', '5\'5"', '57 kg', 'जळगाव', 'पाचोरा', 'पाचोरा', '9876543224', 'anushka.p@email.com', 'मी IT प्रोफेशनल आहे. शिक्षित आणि कामकाजी पसंद करते.', 'approved', 'paid');

-- Add sample photos (optional - you would need actual photo files)
-- For now, we'll skip adding photos as they need actual files

SELECT 'Dummy data inserted successfully!' as message;
SELECT COUNT(*) as total_users FROM users;
SELECT approval_status, COUNT(*) as count FROM users GROUP BY approval_status;

