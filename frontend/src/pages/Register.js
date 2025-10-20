import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { registerUser } from '../services/api';
import './Register.css';

const Register = () => {
  const { t, language } = useLanguage();
  const [registrationType, setRegistrationType] = useState(''); // 'form' or 'biodata'
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Primary Information
    first_name: '',
    surname: '',
    kul: '',
    gender: 'Male',
    email: '',
    mobile_no_1: '',
    mobile_no_2: '',
    birth_village: '',
    birth_district: '',
    date_of_birth: '',
    birth_time: '',
    company_address: '',
    permanent_address: '',
    current_residence: '',
    marital_status: 'Unmarried',
    native_district: '',
    native_village_taluka: '',
    occupation: '',
    education: '',
    income: '',
    blood_group: '',
    weight: '',
    height: '',
    personality: '',
    hobbies: '',
    color: '',
    
    // Family Details
    father_name: '',
    father_occupation: '',
    mother_name: '',
    mother_occupation: '',
    brothers: '',
    sisters: '',
    family_type: '',
    family_status: '',
    family_values: '',
    
    // Astrological Information
    rashi: '',
    nakshatra: '',
    gotra: '',
    manglik: '',
    nadi: '',
    gana: '',
    
    // Expectations
    expected_education: '',
    expected_occupation: '',
    expected_income: '',
    expected_location: '',
    other_expectations: ''
  });

  const [photos, setPhotos] = useState([]);
  const [biodataFile, setBiodataFile] = useState(null);
  const [biodataBasicInfo, setBiodataBasicInfo] = useState({
    full_name: '',
    mobile_no: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registerId, setRegisterId] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBiodataBasicChange = (e) => {
    setBiodataBasicInfo({
      ...biodataBasicInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 4) {
      alert('Maximum 4 photos allowed');
      return;
    }
    setPhotos(files);
  };

  const handleBiodataChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type (PDF, DOC, DOCX, JPG, PNG)
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        alert('Please upload PDF, DOC, DOCX, JPG or PNG file');
        return;
      }
      setBiodataFile(file);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      
      if (registrationType === 'form') {
        // Form submission
        formDataToSend.append('full_name', `${formData.first_name} ${formData.surname}`);
        
        Object.keys(formData).forEach(key => {
          if (key !== 'first_name' && key !== 'surname') {
            formDataToSend.append(key, formData[key]);
          }
        });

        photos.forEach(photo => {
          formDataToSend.append('photos', photo);
        });
      } else {
        // Biodata upload submission
        if (!biodataFile || photos.length === 0 || !biodataBasicInfo.full_name || !biodataBasicInfo.mobile_no || !biodataBasicInfo.email) {
          setError(language === 'en' ? 'Please fill all basic details and upload biodata and photos' : 'कृपया सर्व मूलभूत माहिती भरा आणि बायोडेटा आणि फोटो अपलोड करा');
          setLoading(false);
          return;
        }

        formDataToSend.append('biodata_file', biodataFile);
        formDataToSend.append('registration_type', 'biodata');
        formDataToSend.append('full_name', biodataBasicInfo.full_name);
        formDataToSend.append('mobile_no_1', biodataBasicInfo.mobile_no);
        formDataToSend.append('email', biodataBasicInfo.email);
        
        photos.forEach(photo => {
          formDataToSend.append('photos', photo);
        });
      }

      const response = await registerUser(formDataToSend);
      
      setSuccess(true);
      setRegisterId(response.register_id);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="register-page">
        <div className="container">
          <div className="success-card card fade-in">
            <div className="success-icon">✅</div>
            <h2 className="success-title">{t('registrationSuccess')}</h2>
            <div className="register-id-box">
              <p className="register-id-label">{t('yourRegisterId')}</p>
              <h3 className="register-id">{registerId}</h3>
            </div>
            
            <div className="alert alert-info">
              <strong>{language === 'en' ? '💳 Payment Instructions' : '💳 पेमेंट सूचना'}</strong>
              <p>{language === 'en' ? 'Please send payment to UPI ID: 9167681454@ybl with your KM Register ID as reference.' : 'कृपया UPI ID: 9167681454@ybl वर तुमच्या KM नोंदणी क्रमांकासह पेमेंट पाठवा.'}</p>
              <p style={{marginTop: '10px', fontWeight: '600'}}>
                UPI ID: 9167681454@ybl
              </p>
              <p style={{marginTop: '10px', fontWeight: '600'}}>
                {language === 'en' ? 'Registration Fee: ₹1500 (6 months)' : 'नोंदणी शुल्क: ₹1500 (6 महिने)'}
              </p>
              <p style={{marginTop: '15px', fontSize: '14px', color: '#555'}}>
                📧 {language === 'en' ? 'After payment, email screenshot with your Register ID to:' : 'पेमेंट केल्यानंतर, screenshot तुमच्या Register ID सोबत email करा:'}
                <br/>
                <strong style={{color: '#DC143C'}}>info@khandeshmatrimony.com</strong>
              </p>
            </div>

            <button 
              onClick={() => window.location.href = '/browse'}
              className="btn btn-primary"
            >
              {t('browseProfiles')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: language === 'en' ? 'Primary Info' : 'मूलभूत माहिती' },
      { number: 2, title: language === 'en' ? 'Family Details' : 'कौटुंबिक माहिती' },
      { number: 3, title: language === 'en' ? 'Astrological' : 'ज्योतिषीय माहिती' },
      { number: 4, title: language === 'en' ? 'Expectations' : 'अपेक्षा' }
    ];

    return (
      <div className="step-indicator">
        {steps.map((step, index) => (
          <React.Fragment key={step.number}>
            <div className={`step ${currentStep >= step.number ? 'active' : ''} ${currentStep === step.number ? 'current' : ''}`}>
              <div className="step-number">{step.number}</div>
              <div className="step-title">{step.title}</div>
            </div>
            {index < steps.length - 1 && <div className={`step-line ${currentStep > step.number ? 'active' : ''}`}></div>}
          </React.Fragment>
        ))}
      </div>
    );
  };

  // Registration Type Selection Screen
  if (!registrationType) {
    return (
      <div className="register-page">
        <div className="container">
          <div className="register-card card">
            <h2 className="page-title">{language === 'en' ? 'Choose Registration Method' : 'नोंदणी पद्धत निवडा'}</h2>
            
            <div className="registration-type-selector">
              <div 
                className="type-card"
                onClick={() => setRegistrationType('form')}
              >
                <div className="type-icon">📝</div>
                <h3 className="type-title">{language === 'en' ? 'Fill Form' : 'फॉर्म भरा'}</h3>
                <p className="type-description">
                  {language === 'en' 
                    ? 'Fill detailed registration form step by step' 
                    : 'तपशीलवार नोंदणी फॉर्म टप्प्याटप्प्याने भरा'}
                </p>
                <button className="btn btn-primary">
                  {language === 'en' ? 'Select' : 'निवडा'}
                </button>
              </div>

              <div className="type-divider">
                <span>{language === 'en' ? 'OR' : 'किंवा'}</span>
              </div>

              <div 
                className="type-card"
                onClick={() => setRegistrationType('biodata')}
              >
                <div className="type-icon">📄</div>
                <h3 className="type-title">{language === 'en' ? 'Upload Biodata' : 'बायोडेटा अपलोड करा'}</h3>
                <p className="type-description">
                  {language === 'en' 
                    ? 'Upload your biodata/parichay patra with photos' 
                    : 'तुमचा बायोडेटा/परिचय पत्र फोटोसह अपलोड करा'}
                </p>
                <button className="btn btn-primary">
                  {language === 'en' ? 'Select' : 'निवडा'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Biodata Upload Screen
  if (registrationType === 'biodata') {
    return (
      <div className="register-page">
        <div className="container">
          <div className="register-card card">
            <h2 className="page-title">{language === 'en' ? 'Upload Biodata & Photos' : 'बायोडेटा आणि फोटो अपलोड करा'}</h2>
            
            <button 
              onClick={() => setRegistrationType('')}
              className="btn btn-outline back-btn-top"
            >
              ← {language === 'en' ? 'Back' : 'मागे'}
            </button>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="biodata-upload-form">
              {/* Basic Details Section */}
              <div className="basic-details-section">
                <h3 className="section-title">
                  {language === 'en' ? '📋 Basic Details' : '📋 मूलभूत माहिती'}
                </h3>
                <div className="basic-details-grid">
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Full Name' : 'पूर्ण नाव'} *</label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-input"
                      placeholder={language === 'en' ? 'Enter your full name' : 'तुमचे पूर्ण नाव टाका'}
                      value={biodataBasicInfo.full_name}
                      onChange={handleBiodataBasicChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Mobile Number' : 'मोबाईल नंबर'} *</label>
                    <input
                      type="tel"
                      name="mobile_no"
                      className="form-input"
                      placeholder={language === 'en' ? 'Enter mobile number' : 'मोबाईल नंबर टाका'}
                      value={biodataBasicInfo.mobile_no}
                      onChange={handleBiodataBasicChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Email Address' : 'ईमेल पत्ता'} *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder={language === 'en' ? 'Enter email address' : 'ईमेल पत्ता टाका'}
                      value={biodataBasicInfo.email}
                      onChange={handleBiodataBasicChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="upload-section">
                <div className="upload-box">
                  <div className="upload-icon">📄</div>
                  <h3 className="upload-title">
                    {language === 'en' ? 'Upload Biodata/Parichay Patra' : 'बायोडेटा/परिचय पत्र अपलोड करा'}
                  </h3>
                  <p className="upload-note">
                    {language === 'en' 
                      ? 'Accepted formats: PDF, DOC, DOCX, JPG, PNG' 
                      : 'स्वीकृत फॉरमॅट: PDF, DOC, DOCX, JPG, PNG'}
                  </p>
                  <input
                    type="file"
                    id="biodata-upload"
                    className="file-input"
                    onChange={handleBiodataChange}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    required
                  />
                  <label htmlFor="biodata-upload" className="btn btn-primary">
                    {biodataFile ? '✓ ' + biodataFile.name : (language === 'en' ? 'Choose File' : 'फाइल निवडा')}
                  </label>
                </div>

                <div className="upload-box">
                  <div className="upload-icon">📸</div>
                  <h3 className="upload-title">
                    {language === 'en' ? 'Upload Photos (Max 4)' : 'फोटो अपलोड करा (कमाल 4)'}
                  </h3>
                  <p className="upload-note">
                    {language === 'en' 
                      ? 'Upload up to 4 photos' 
                      : '4 पर्यंत फोटो अपलोड करा'}
                  </p>
                  <input
                    type="file"
                    id="photos-upload"
                    className="file-input"
                    onChange={handlePhotoChange}
                    multiple
                    accept="image/*"
                    required
                  />
                  <label htmlFor="photos-upload" className="btn btn-primary">
                    {photos.length > 0 ? `✓ ${photos.length} ${language === 'en' ? 'photos selected' : 'फोटो निवडले'}` : (language === 'en' ? 'Choose Photos' : 'फोटो निवडा')}
                  </label>
                </div>
              </div>

              <div className="submit-section">
                <button
                  type="submit"
                  className="btn btn-primary btn-large"
                  disabled={loading}
                >
                  {loading ? (language === 'en' ? 'Submitting...' : 'सबमिट करत आहे...') : (language === 'en' ? '✓ Submit Registration' : '✓ नोंदणी सबमिट करा')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Form Registration Screen
  return (
    <div className="register-page">
      <div className="container">
        <div className="register-card card">
          <h2 className="page-title">{language === 'en' ? 'Registration Form' : 'नोंदणी फॉर्म'}</h2>
          
          <button 
            onClick={() => setRegistrationType('')}
            className="btn btn-outline back-btn-top"
          >
            ← {language === 'en' ? 'Back' : 'मागे'}
          </button>

          {renderStepIndicator()}

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Primary Information */}
            {currentStep === 1 && (
              <div className="form-step fade-in">
                <h3 className="step-heading">{language === 'en' ? '📋 Primary Information' : '📋 मूलभूत माहिती'}</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'First Name' : 'नाव'} *</label>
                    <input
                      type="text"
                      name="first_name"
                      className="form-input"
                      placeholder={language === 'en' ? 'Input your first name' : 'तुमचे नाव टाका'}
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Surname' : 'आडनाव'} *</label>
                    <input
                      type="text"
                      name="surname"
                      className="form-input"
                      placeholder={language === 'en' ? 'Input your surname' : 'तुमचे आडनाव टाका'}
                      value={formData.surname}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Kul' : 'कुळ'}</label>
                    <input
                      type="text"
                      name="kul"
                      className="form-input"
                      placeholder={language === 'en' ? 'Input your kul' : 'तुमचे कुळ टाका'}
                      value={formData.kul}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Gender' : 'लिंग'} *</label>
                    <select
                      name="gender"
                      className="form-input"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                    >
                      <option value="Male">{language === 'en' ? 'Male' : 'पुरुष'}</option>
                      <option value="Female">{language === 'en' ? 'Female' : 'स्त्री'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Email Address' : 'ईमेल'} *</label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder="your_email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Mobile No 1' : 'मोबाईल नं 1'} *</label>
                    <input
                      type="tel"
                      name="mobile_no_1"
                      className="form-input"
                      placeholder="99XXXXXX12"
                      value={formData.mobile_no_1}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Mobile No 2' : 'मोबाईल नं 2'}</label>
                    <input
                      type="tel"
                      name="mobile_no_2"
                      className="form-input"
                      placeholder="99XXXXXX12"
                      value={formData.mobile_no_2}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Birth Place (Village)' : 'जन्म गाव'} *</label>
                    <input
                      type="text"
                      name="birth_village"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Nagaon' : 'उदा. नागांव'}
                      value={formData.birth_village}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Birth Place (District)' : 'जन्म जिल्हा'} *</label>
                    <input
                      type="text"
                      name="birth_district"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Jalgaon' : 'उदा. जळगाव'}
                      value={formData.birth_district}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Birthdate' : 'जन्मतारीख'} *</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      className="form-input"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Birth Time' : 'जन्म वेळ'}</label>
                    <input
                      type="time"
                      name="birth_time"
                      className="form-input"
                      value={formData.birth_time}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">{language === 'en' ? 'Company/Office Address' : 'कंपनी/ऑफिस पत्ता'}</label>
                    <input
                      type="text"
                      name="company_address"
                      className="form-input"
                      placeholder={language === 'en' ? 'Input address where your office is located' : 'तुमच्या ऑफिसचा पत्ता टाका'}
                      value={formData.company_address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">{language === 'en' ? 'Permanent Address (Postal address)' : 'कायमचा पत्ता'} *</label>
                    <textarea
                      name="permanent_address"
                      className="form-input"
                      rows="2"
                      placeholder={language === 'en' ? 'Input your permanent residential address' : 'तुमचा कायमचा राहण्याचा पत्ता टाका'}
                      value={formData.permanent_address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Place of Residence' : 'सध्याचा राहण्याचा ठिकाण'}</label>
                    <input
                      type="text"
                      name="current_residence"
                      className="form-input"
                      placeholder={language === 'en' ? 'Town/City you currently live' : 'तुम्ही सध्या राहत असलेले शहर'}
                      value={formData.current_residence}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Marital Status' : 'वैवाहिक स्थिती'} *</label>
                    <select
                      name="marital_status"
                      className="form-input"
                      value={formData.marital_status}
                      onChange={handleChange}
                      required
                    >
                      <option value="Unmarried">{language === 'en' ? 'Unmarried' : 'अविवाहित'}</option>
                      <option value="Divorced">{language === 'en' ? 'Divorced' : 'घटस्फोटित'}</option>
                      <option value="Widow">{language === 'en' ? 'Widow' : 'विधवा'}</option>
                      <option value="Widower">{language === 'en' ? 'Widower' : 'विदुर'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Native Place (District)' : 'मूळ गाव (जिल्हा)'}</label>
                    <input
                      type="text"
                      name="native_district"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Dhule' : 'उदा. धुळे'}
                      value={formData.native_district}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Native Village & Taluka' : 'मूळ गाव आणि तालुका'}</label>
                    <input
                      type="text"
                      name="native_village_taluka"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Phapore, Jalgaon' : 'उदा. फापोरे, जळगाव'}
                      value={formData.native_village_taluka}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Occupation' : 'व्यवसाय'} *</label>
                    <input
                      type="text"
                      name="occupation"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Software Engineer' : 'उदा. सॉफ्टवेअर इंजिनियर'}
                      value={formData.occupation}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Education' : 'शिक्षण'} *</label>
                    <input
                      type="text"
                      name="education"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. BA, B Ed' : 'उदा. बीए, बी एड'}
                      value={formData.education}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Income' : 'उत्पन्न'}</label>
                    <input
                      type="text"
                      name="income"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. 10000 per month' : 'उदा. 10000 प्रति महिना'}
                      value={formData.income}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Blood Group' : 'रक्तगट'}</label>
                    <select
                      name="blood_group"
                      className="form-input"
                      value={formData.blood_group}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Not available' : 'उपलब्ध नाही'}</option>
                      <option value="A+">A+</option>
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B-">B-</option>
                      <option value="O+">O+</option>
                      <option value="O-">O-</option>
                      <option value="AB+">AB+</option>
                      <option value="AB-">AB-</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Weight (in KG)' : 'वजन (किलो)'}</label>
                    <input
                      type="text"
                      name="weight"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. 55 or 72' : 'उदा. 55 किंवा 72'}
                      value={formData.weight}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Height' : 'उंची'} *</label>
                    <input
                      type="text"
                      name="height"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. 5.6' : 'उदा. 5.6'}
                      value={formData.height}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Personality' : 'व्यक्तिमत्व'}</label>
                    <input
                      type="text"
                      name="personality"
                      className="form-input"
                      placeholder={language === 'en' ? 'Describe personality' : 'व्यक्तिमत्वाचे वर्णन करा'}
                      value={formData.personality}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Hobbies' : 'छंद'}</label>
                    <input
                      type="text"
                      name="hobbies"
                      className="form-input"
                      placeholder={language === 'en' ? 'Your hobbies' : 'तुमचे छंद'}
                      value={formData.hobbies}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Colour' : 'रंग'}</label>
                    <input
                      type="text"
                      name="color"
                      className="form-input"
                      placeholder={language === 'en' ? 'Skin color' : 'रंग'}
                      value={formData.color}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">{language === 'en' ? 'Upload Photos (Max 4)' : 'फोटो अपलोड करा (कमाल 4)'}</label>
                    <input
                      type="file"
                      className="form-input"
                      onChange={handlePhotoChange}
                      multiple
                      accept="image/*"
                    />
                    {photos.length > 0 && (
                      <p className="photo-count">{photos.length} {language === 'en' ? 'photos selected' : 'फोटो निवडले'}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Family Details */}
            {currentStep === 2 && (
              <div className="form-step fade-in">
                <h3 className="step-heading">{language === 'en' ? '👨‍👩‍👧‍👦 Family Details' : '👨‍👩‍👧‍👦 कौटुंबिक माहिती'}</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Father\'s Name' : 'वडिलांचे नाव'} *</label>
                    <input
                      type="text"
                      name="father_name"
                      className="form-input"
                      placeholder={language === 'en' ? 'Father\'s full name' : 'वडिलांचे पूर्ण नाव'}
                      value={formData.father_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Father\'s Occupation' : 'वडिलांचा व्यवसाय'}</label>
                    <input
                      type="text"
                      name="father_occupation"
                      className="form-input"
                      placeholder={language === 'en' ? 'Father\'s occupation' : 'वडिलांचा व्यवसाय'}
                      value={formData.father_occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Mother\'s Name' : 'आईचे नाव'} *</label>
                    <input
                      type="text"
                      name="mother_name"
                      className="form-input"
                      placeholder={language === 'en' ? 'Mother\'s full name' : 'आईचे पूर्ण नाव'}
                      value={formData.mother_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Mother\'s Occupation' : 'आईचा व्यवसाय'}</label>
                    <input
                      type="text"
                      name="mother_occupation"
                      className="form-input"
                      placeholder={language === 'en' ? 'Mother\'s occupation' : 'आईचा व्यवसाय'}
                      value={formData.mother_occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Brothers' : 'भाऊ'}</label>
                    <input
                      type="text"
                      name="brothers"
                      className="form-input"
                      placeholder={language === 'en' ? 'No. of brothers (married/unmarried)' : 'भावांची संख्या (विवाहित/अविवाहित)'}
                      value={formData.brothers}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Sisters' : 'बहिणी'}</label>
                    <input
                      type="text"
                      name="sisters"
                      className="form-input"
                      placeholder={language === 'en' ? 'No. of sisters (married/unmarried)' : 'बहिणींची संख्या (विवाहित/अविवाहित)'}
                      value={formData.sisters}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Family Type' : 'कुटुंब प्रकार'}</label>
                    <select
                      name="family_type"
                      className="form-input"
                      value={formData.family_type}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Select' : 'निवडा'}</option>
                      <option value="Joint">{language === 'en' ? 'Joint Family' : 'संयुक्त कुटुंब'}</option>
                      <option value="Nuclear">{language === 'en' ? 'Nuclear Family' : 'एकल कुटुंब'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Family Status' : 'कौटुंबिक स्थिती'}</label>
                    <select
                      name="family_status"
                      className="form-input"
                      value={formData.family_status}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Select' : 'निवडा'}</option>
                      <option value="Middle Class">{language === 'en' ? 'Middle Class' : 'मध्यमवर्गीय'}</option>
                      <option value="Upper Middle Class">{language === 'en' ? 'Upper Middle Class' : 'उच्च मध्यमवर्गीय'}</option>
                      <option value="Rich">{language === 'en' ? 'Rich' : 'श्रीमंत'}</option>
                    </select>
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">{language === 'en' ? 'Family Values' : 'कौटुंबिक मूल्ये'}</label>
                    <select
                      name="family_values"
                      className="form-input"
                      value={formData.family_values}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Select' : 'निवडा'}</option>
                      <option value="Traditional">{language === 'en' ? 'Traditional' : 'पारंपारिक'}</option>
                      <option value="Moderate">{language === 'en' ? 'Moderate' : 'मध्यम'}</option>
                      <option value="Liberal">{language === 'en' ? 'Liberal' : 'उदारमतवादी'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Astrological Information */}
            {currentStep === 3 && (
              <div className="form-step fade-in">
                <h3 className="step-heading">{language === 'en' ? '✨ Astrological Information' : '✨ ज्योतिषीय माहिती'}</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Rashi (Moon Sign)' : 'राशी'}</label>
                    <input
                      type="text"
                      name="rashi"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Mesh, Vrishabh' : 'उदा. मेष, वृषभ'}
                      value={formData.rashi}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Nakshatra' : 'नक्षत्र'}</label>
                    <input
                      type="text"
                      name="nakshatra"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Ashwini, Bharani' : 'उदा. अश्विनी, भरणी'}
                      value={formData.nakshatra}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Gotra' : 'गोत्र'}</label>
                    <input
                      type="text"
                      name="gotra"
                      className="form-input"
                      placeholder={language === 'en' ? 'Your gotra' : 'तुमचे गोत्र'}
                      value={formData.gotra}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Manglik' : 'मांगलिक'}</label>
                    <select
                      name="manglik"
                      className="form-input"
                      value={formData.manglik}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Select' : 'निवडा'}</option>
                      <option value="Yes">{language === 'en' ? 'Yes' : 'होय'}</option>
                      <option value="No">{language === 'en' ? 'No' : 'नाही'}</option>
                      <option value="Anshik">{language === 'en' ? 'Anshik' : 'अंशिक'}</option>
                      <option value="Don't Know">{language === 'en' ? 'Don\'t Know' : 'माहित नाही'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Nadi' : 'नाडी'}</label>
                    <select
                      name="nadi"
                      className="form-input"
                      value={formData.nadi}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Select' : 'निवडा'}</option>
                      <option value="Aadi">{language === 'en' ? 'Aadi' : 'आदि'}</option>
                      <option value="Madhya">{language === 'en' ? 'Madhya' : 'मध्य'}</option>
                      <option value="Antya">{language === 'en' ? 'Antya' : 'अंत्य'}</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Gana' : 'गण'}</label>
                    <select
                      name="gana"
                      className="form-input"
                      value={formData.gana}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Select' : 'निवडा'}</option>
                      <option value="Dev">{language === 'en' ? 'Dev' : 'देव'}</option>
                      <option value="Manushya">{language === 'en' ? 'Manushya' : 'मनुष्य'}</option>
                      <option value="Rakshasa">{language === 'en' ? 'Rakshasa' : 'राक्षस'}</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Expectations */}
            {currentStep === 4 && (
              <div className="form-step fade-in">
                <h3 className="step-heading">{language === 'en' ? '💭 Partner Expectations' : '💭 जीवनसाथीची अपेक्षा'}</h3>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Expected Education' : 'अपेक्षित शिक्षण'}</label>
                    <input
                      type="text"
                      name="expected_education"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Graduate, Post Graduate' : 'उदा. पदवीधर, पदव्युत्तर'}
                      value={formData.expected_education}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Expected Occupation' : 'अपेक्षित व्यवसाय'}</label>
                    <input
                      type="text"
                      name="expected_occupation"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Teacher, Doctor' : 'उदा. शिक्षक, डॉक्टर'}
                      value={formData.expected_occupation}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Expected Income' : 'अपेक्षित उत्पन्न'}</label>
                    <input
                      type="text"
                      name="expected_income"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. 20000 per month' : 'उदा. 20000 प्रति महिना'}
                      value={formData.expected_income}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Expected Location' : 'अपेक्षित स्थान'}</label>
                    <input
                      type="text"
                      name="expected_location"
                      className="form-input"
                      placeholder={language === 'en' ? 'e.g. Jalgaon, Dhule' : 'उदा. जळगाव, धुळे'}
                      value={formData.expected_location}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label className="form-label">{language === 'en' ? 'Other Expectations' : 'इतर अपेक्षा'}</label>
                    <textarea
                      name="other_expectations"
                      className="form-input"
                      rows="4"
                      placeholder={language === 'en' ? 'Any other expectations from life partner' : 'जीवनसाथीकडून इतर काही अपेक्षा'}
                      value={formData.other_expectations}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="form-navigation">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn btn-outline"
                >
                  ← {language === 'en' ? 'Previous' : 'मागे'}
                </button>
              )}
              
              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary"
                >
                  {language === 'en' ? 'Next' : 'पुढे'} →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (language === 'en' ? 'Submitting...' : 'सबमिट करत आहे...') : (language === 'en' ? '✓ Finish' : '✓ पूर्ण करा')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
