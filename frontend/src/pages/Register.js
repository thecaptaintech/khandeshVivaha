import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { registerUser, getSettings, UPLOADS_URL } from '../services/api';
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
    gender: '',
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
  const [settings, setSettings] = useState({
    payment_qr_code: null,
    contact_whatsapp: '9167681454',
    contact_email: 'info@khandeshmatrimony.com',
    upi_id: '',
    registration_fee: ''
  });
  
  // Validation states
  const [validationErrors, setValidationErrors] = useState({});

  // Date restriction helpers
  const getMaxBirthDate = () => {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
    return maxDate.toISOString().split('T')[0];
  };

  const getMinBirthDate = () => {
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
    return minDate.toISOString().split('T')[0];
  };

  // Reset form function
  const resetForm = () => {
    setFormData({
      // Primary Information
      first_name: '',
      surname: '',
      kul: '',
      gender: '',
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
      
      // Partner Expectations
      expected_age_from: '',
      expected_age_to: '',
      expected_height_from: '',
      expected_height_to: '',
      expected_education: '',
      expected_occupation: '',
      expected_income: '',
      expected_marital_status: '',
      expected_family_type: '',
      expected_family_values: '',
      expected_personality: '',
      expected_hobbies: '',
      expected_color: '',
      expected_blood_group: '',
      expected_location: '',
      expected_other_requirements: ''
    });
    
    setPhotos([]);
    setBiodataFile(null);
    setBiodataBasicInfo({
      full_name: '',
      mobile_no: '',
      email: ''
    });
    setCurrentStep(1);
    setValidationErrors({});
    setLoading(false);
    setError('');
    setSuccess(false);
    setRegisterId('');
  };

  // Reset form on component mount to ensure fresh start
  useEffect(() => {
    resetForm();
  }, []);

  // Validation functions
  const validateBirthDate = (dateString) => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  };

  const validateForm = () => {
    const errors = {};
    
    // Mandatory fields validation
    const mandatoryFields = {
      first_name: language === 'en' ? 'First Name' : 'नाव',
      surname: language === 'en' ? 'Surname' : 'आडनाव',
      email: language === 'en' ? 'Email' : 'ईमेल',
      mobile_no_1: language === 'en' ? 'Mobile Number' : 'मोबाइल नंबर',
      date_of_birth: language === 'en' ? 'Date of Birth' : 'जन्मतारीख',
      gender: language === 'en' ? 'Gender' : 'लिंग',
      occupation: language === 'en' ? 'Occupation' : 'व्यवसाय',
      education: language === 'en' ? 'Education' : 'शिक्षण',
      weight: language === 'en' ? 'Weight' : 'वजन',
      height: language === 'en' ? 'Height' : 'उंची',
      native_district: language === 'en' ? 'Native District' : 'मूळ जिल्हा',
      current_residence: language === 'en' ? 'Place of Residence' : 'निवासस्थान',
      father_name: language === 'en' ? 'Father\'s Name' : 'वडिलांचे नाव',
      mother_name: language === 'en' ? 'Mother\'s Name' : 'आईचे नाव'
    };

    // Check mandatory fields
    Object.keys(mandatoryFields).forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors[field] = `${mandatoryFields[field]} ${language === 'en' ? 'is required' : 'आवश्यक आहे'}`;
      }
    });

    // Birth date validation
    if (formData.date_of_birth) {
      if (!validateBirthDate(formData.date_of_birth)) {
        errors.date_of_birth = language === 'en' ? 'Age must be 18 years or above' : 'वय 18 वर्ष किंवा त्यापेक्षा जास्त असावे';
      }
    }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = language === 'en' ? 'Please enter a valid email address' : 'कृपया वैध ईमेल पत्ता प्रविष्ट करा';
    }

    // Mobile number validation
    if (formData.mobile_no_1 && !/^\d{10}$/.test(formData.mobile_no_1)) {
      errors.mobile_no_1 = language === 'en' ? 'Please enter a valid 10-digit mobile number' : 'कृपया वैध 10-अंकी मोबाइल नंबर प्रविष्ट करा';
    }

    // Photo validation
    if (photos.length === 0) {
      errors.photos = language === 'en' ? 'At least 1 photo is required' : 'किमान 1 फोटो आवश्यक आहे';
    }

    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    // Clear validation error for this field when user starts typing
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: ''
      });
    }
  };

  const handleBiodataBasicChange = (e) => {
    setBiodataBasicInfo({
      ...biodataBasicInfo,
      [e.target.name]: e.target.value
    });
  };

  const handlePhotoChange = (e) => {
    const newFiles = Array.from(e.target.files);
    const totalPhotos = photos.length + newFiles.length;
    
    if (totalPhotos > 4) {
      alert(language === 'en' ? 'Maximum 4 photos allowed' : 'कमाल 4 फोटो परवानगी आहे');
      return;
    }
    
    // Append new photos to existing ones
    setPhotos([...photos, ...newFiles]);
    
    // Clear photo validation error when photos are uploaded
    if (validationErrors.photos) {
      setValidationErrors({
        ...validationErrors,
        photos: ''
      });
    }
    
    // Clear the file input so the same file can be selected again if needed
    e.target.value = '';
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
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
    // Validate current step before proceeding
    if (!validateCurrentStep()) {
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const validateCurrentStep = () => {
    const errors = {};
    
    // Step 1 validation
    if (currentStep === 1) {
      const step1Fields = {
        first_name: language === 'en' ? 'First Name' : 'नाव',
        surname: language === 'en' ? 'Surname' : 'आडनाव',
        email: language === 'en' ? 'Email' : 'ईमेल',
        mobile_no_1: language === 'en' ? 'Mobile Number' : 'मोबाइल नंबर',
        date_of_birth: language === 'en' ? 'Date of Birth' : 'जन्मतारीख',
        gender: language === 'en' ? 'Gender' : 'लिंग',
        birth_village: language === 'en' ? 'Birth Place (Village)' : 'जन्म गाव',
        birth_district: language === 'en' ? 'Birth Place (District)' : 'जन्म जिल्हा',
        permanent_address: language === 'en' ? 'Permanent Address' : 'कायमचा पत्ता',
        marital_status: language === 'en' ? 'Marital Status' : 'वैवाहिक स्थिती',
        occupation: language === 'en' ? 'Occupation' : 'व्यवसाय',
        education: language === 'en' ? 'Education' : 'शिक्षण',
        weight: language === 'en' ? 'Weight' : 'वजन',
        height: language === 'en' ? 'Height' : 'उंची',
        native_district: language === 'en' ? 'Native District' : 'मूळ जिल्हा',
        current_residence: language === 'en' ? 'Place of Residence' : 'निवासस्थान'
      };
      
      Object.keys(step1Fields).forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
          errors[field] = `${step1Fields[field]} ${language === 'en' ? 'is required' : 'आवश्यक आहे'}`;
        }
      });
      
      // Birth date validation
      if (formData.date_of_birth && !validateBirthDate(formData.date_of_birth)) {
        errors.date_of_birth = language === 'en' ? 'Age must be 18 years or above' : 'वय 18 वर्ष किंवा त्यापेक्षा जास्त असावे';
      }
      
      // Email validation
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
        errors.email = language === 'en' ? 'Please enter a valid email address' : 'कृपया वैध ईमेल पत्ता प्रविष्ट करा';
      }
      
      // Mobile validation
      if (formData.mobile_no_1 && !/^\d{10}$/.test(formData.mobile_no_1)) {
        errors.mobile_no_1 = language === 'en' ? 'Please enter a valid 10-digit mobile number' : 'कृपया वैध 10-अंकी मोबाइल नंबर प्रविष्ट करा';
      }
      
      // Photo validation for Step 1
      if (photos.length === 0) {
        errors.photos = language === 'en' ? 'At least 1 photo is required' : 'किमान 1 फोटो आवश्यक आहे';
      }
    }
    
    // Step 2 validation (Family Details only)
    if (currentStep === 2) {
      // Step 2 is for Family Details - no additional validation needed here
      // as all mandatory fields are now in Step 1
    }
    
    // Step 3 validation
    if (currentStep === 3) {
      const step3Fields = {
        father_name: language === 'en' ? 'Father\'s Name' : 'वडिलांचे नाव',
        mother_name: language === 'en' ? 'Mother\'s Name' : 'आईचे नाव'
      };
      
      Object.keys(step3Fields).forEach(field => {
        if (!formData[field] || formData[field].trim() === '') {
          errors[field] = `${step3Fields[field]} ${language === 'en' ? 'is required' : 'आवश्यक आहे'}`;
        }
      });
    }
    
    // Step 4 validation (Expectations - no mandatory fields, just optional)
    if (currentStep === 4) {
      // Step 4 is for expectations - no mandatory validation needed
      // All fields are optional
    }
    
    setValidationErrors(errors);
    
    return Object.keys(errors).length === 0;
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
        // Validate form before submission
        if (!validateForm()) {
          setLoading(false);
          return;
        }
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
        console.log('Biodata validation check:', {
          biodataFile: !!biodataFile,
          photosCount: photos.length,
          full_name: biodataBasicInfo.full_name,
          mobile_no: biodataBasicInfo.mobile_no,
          email: biodataBasicInfo.email
        });
        
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

      console.log('Submitting biodata registration...');
      const response = await registerUser(formDataToSend);
      console.log('Registration response:', response);
      
      setSuccess(true);
      setRegisterId(response.register_id);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch settings when success is true
  useEffect(() => {
    if (success) {
      const fetchSettings = async () => {
        try {
          const fetchedSettings = await getSettings();
          setSettings(fetchedSettings);
        } catch (error) {
          console.error('Error fetching settings:', error);
        }
      };
      fetchSettings();
    }
  }, [success]);

  // Copy registration number to clipboard
  const copyRegistrationNumber = async (registerId, e) => {
    if (!e || !e.currentTarget) {
      return;
    }
    
    e.stopPropagation();
    e.preventDefault();
    
    const element = e.currentTarget;
    if (!element) {
      return;
    }
    
    const originalText = element.textContent || registerId;
    
    try {
      await navigator.clipboard.writeText(registerId);
      // Show feedback
      element.textContent = language === 'en' ? '✓ Copied!' : '✓ कॉपी झाले!';
      element.style.color = '#4ade80';
      setTimeout(() => {
        if (element) {
          element.textContent = originalText;
          element.style.color = '';
        }
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = registerId;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        // Show feedback
        element.textContent = language === 'en' ? '✓ Copied!' : '✓ कॉपी झाले!';
        element.style.color = '#4ade80';
        setTimeout(() => {
          if (element) {
            element.textContent = originalText;
            element.style.color = '';
          }
        }, 1500);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
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
              <h3 
                className="register-id clickable-register-id"
                onClick={(e) => copyRegistrationNumber(registerId, e)}
                title={language === 'en' ? 'Click to copy registration number' : 'नोंदणी क्रमांक कॉपी करण्यासाठी क्लिक करा'}
                style={{cursor: 'pointer', userSelect: 'none'}}
              >
                {registerId}
              </h3>
            </div>
            
            {/* Instructions - Compact */}
            <div className="alert alert-info compact-alert">
              <strong style={{fontSize: '15px', marginBottom: '8px'}}>{language === 'en' ? '📋 Important Instructions' : '📋 महत्त्वाच्या सूचना'}</strong>
              <p style={{margin: 0, fontSize: '13px', lineHeight: '1.5'}}>
                {language === 'en' 
                  ? 'Please complete payment and get approval to make your profile visible to all users.'
                  : 'कृपया पेमेंट पूर्ण करा आणि सर्व वापरकर्त्यांना तुमचे प्रोफाइल दृश्यमान करण्यासाठी मंजुरी मिळवा.'}
              </p>
            </div>
            
            <div className="alert alert-info compact-alert">
              <strong style={{fontSize: '15px', marginBottom: '12px', display: 'block'}}>{language === 'en' ? '💳 Payment Instructions' : '💳 पेमेंट सूचना'}</strong>
              
              {/* QR Code - Smaller */}
              {settings.payment_qr_code && (
                <div style={{textAlign: 'center', margin: '12px 0'}}>
                  <img 
                    src={`${UPLOADS_URL}/${settings.payment_qr_code}`} 
                    alt="Payment QR Code" 
                    style={{maxWidth: '180px', width: '100%', height: 'auto', border: '2px solid #ddd', borderRadius: '8px'}}
                  />
                </div>
              )}
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px'}}>
                {settings.upi_id && (
                  <p style={{margin: 0, fontWeight: '600', fontSize: '14px'}}>
                    {language === 'en' ? 'UPI ID:' : 'UPI ID:'} <span style={{color: '#DC143C'}}>{settings.upi_id}</span>
                  </p>
                )}
                
                {settings.registration_fee && (
                  <p style={{margin: 0, fontWeight: '600', fontSize: '14px'}}>
                    {language === 'en' ? 'Registration Fee:' : 'नोंदणी शुल्क:'} <span style={{color: '#DC143C'}}>{settings.registration_fee}</span>
                  </p>
                )}
              </div>
              
              <p style={{marginTop: '12px', marginBottom: '8px', fontSize: '13px', color: '#555', lineHeight: '1.5'}}>
                {language === 'en' 
                  ? 'After payment, send screenshot with your Register ID via Email or WhatsApp:' 
                  : 'पेमेंट केल्यानंतर, तुमच्या Register ID सह screenshot Email किंवा WhatsApp वरून पाठवा:'}
              </p>
              <div style={{display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px'}}>
                <strong style={{color: '#DC143C'}}>
                  📧 {settings.contact_email || 'info@khandeshmatrimony.com'}
                </strong>
                <strong style={{color: '#DC143C'}}>
                  📱 {settings.contact_whatsapp || '9167681454'}
                </strong>
              </div>
            </div>

            <div className="success-buttons">
              <button 
                onClick={() => window.location.href = '/browse'}
                className="btn btn-primary"
              >
                {t('browseProfiles')}
              </button>
              
              <button 
                onClick={resetForm}
                className="btn btn-secondary"
              >
                {language === 'en' ? '🔄 Start New Registration' : '🔄 नवीन नोंदणी सुरू करा'}
              </button>
            </div>
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
                onClick={() => {
                  resetForm();
                  setRegistrationType('form');
                }}
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
                onClick={() => {
                  resetForm();
                  setRegistrationType('biodata');
                }}
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
                    <label className="form-label">{language === 'en' ? 'Full Name' : 'पूर्ण नाव'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="full_name"
                      className="form-input"
                      placeholder={language === 'en' ? 'Enter your full name' : 'तुमचे पूर्ण नाव टाका'}
                      value={biodataBasicInfo.full_name}
                      onChange={handleBiodataBasicChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Mobile Number' : 'मोबाईल नंबर'} <span className="required-star">*</span></label>
                    <input
                      type="tel"
                      name="mobile_no"
                      className="form-input"
                      placeholder={language === 'en' ? 'Enter mobile number' : 'मोबाईल नंबर टाका'}
                      value={biodataBasicInfo.mobile_no}
                      onChange={handleBiodataBasicChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Email Address' : 'ईमेल पत्ता'} <span className="required-star">*</span></label>
                    <input
                      type="email"
                      name="email"
                      className="form-input"
                      placeholder={language === 'en' ? 'Enter email address' : 'ईमेल पत्ता टाका'}
                      value={biodataBasicInfo.email}
                      onChange={handleBiodataBasicChange}
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
                  />
                  <label htmlFor="biodata-upload" className="btn btn-primary">
                    {biodataFile ? '✓ ' + biodataFile.name : (language === 'en' ? 'Choose File' : 'फाइल निवडा')}
                  </label>
                </div>

                <div className={`upload-box ${validationErrors.photos ? 'error' : ''}`}>
                  <div className="upload-icon">📸</div>
                  <h3 className="upload-title">
                    {language === 'en' ? 'Upload Photos (Max 4)' : 'फोटो अपलोड करा (कमाल 4)'} <span className="required-star">*</span>
                  </h3>
                  <p className="upload-note">
                    {language === 'en' 
                      ? 'Upload up to 4 photos (JPG, PNG) - At least 1 photo required. You can select multiple photos at once or add them one by one.' 
                      : '4 पर्यंत फोटो अपलोड करा (JPG, PNG) - किमान 1 फोटो आवश्यक. तुम्ही एकाच वेळी अनेक फोटो निवडू शकता किंवा एक एक करून जोडू शकता.'}
                  </p>
                  <input
                    type="file"
                    id="photos-upload"
                    className="file-input"
                    onChange={handlePhotoChange}
                    multiple
                    accept="image/*"
                  />
                  <label htmlFor="photos-upload" className="btn btn-primary">
                    {photos.length > 0 ? `✓ ${photos.length} ${language === 'en' ? 'photos selected' : 'फोटो निवडले'}` : (language === 'en' ? 'Choose Photos' : 'फोटो निवडा')}
                  </label>
                  
                  {photos.length > 0 && (
                    <div className="photo-preview-container">
                      <div className="photo-preview-grid">
                        {photos.map((photo, index) => (
                          <div key={index} className="photo-preview-item">
                            <img 
                              src={URL.createObjectURL(photo)} 
                              alt={`Preview ${index + 1}`}
                              className="photo-preview"
                            />
                            <button
                              type="button"
                              onClick={() => removePhoto(index)}
                              className="photo-remove-btn"
                              title={language === 'en' ? 'Remove photo' : 'फोटो काढा'}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {validationErrors.photos && (
                    <span className="error-message">{validationErrors.photos}</span>
                  )}
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
                    <label className="form-label">{language === 'en' ? 'First Name' : 'नाव'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="first_name"
                      className={`form-input ${validationErrors.first_name ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'Input your first name' : 'तुमचे नाव टाका'}
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                    {validationErrors.first_name && (
                      <span className="error-message">{validationErrors.first_name}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Surname' : 'आडनाव'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="surname"
                      className={`form-input ${validationErrors.surname ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'Input your surname' : 'तुमचे आडनाव टाका'}
                      value={formData.surname}
                      onChange={handleChange}
                    />
                    {validationErrors.surname && (
                      <span className="error-message">{validationErrors.surname}</span>
                    )}
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
                    <label className="form-label">{language === 'en' ? 'Gender' : 'लिंग'} <span className="required-star">*</span></label>
                    <select
                      name="gender"
                      className={`form-input ${validationErrors.gender ? 'error' : ''}`}
                      value={formData.gender}
                      onChange={handleChange}
                    >
                      <option value="">{language === 'en' ? 'Select Gender' : 'लिंग निवडा'}</option>
                      <option value="Male">{language === 'en' ? 'Male' : 'पुरुष'}</option>
                      <option value="Female">{language === 'en' ? 'Female' : 'स्त्री'}</option>
                    </select>
                    {validationErrors.gender && (
                      <span className="error-message">{validationErrors.gender}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Email Address' : 'ईमेल'} <span className="required-star">*</span></label>
                    <input
                      type="email"
                      name="email"
                      className={`form-input ${validationErrors.email ? 'error' : ''}`}
                      placeholder="your_email@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {validationErrors.email && (
                      <span className="error-message">{validationErrors.email}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Mobile No 1' : 'मोबाईल नं 1'} <span className="required-star">*</span></label>
                    <input
                      type="tel"
                      name="mobile_no_1"
                      className={`form-input ${validationErrors.mobile_no_1 ? 'error' : ''}`}
                      placeholder="99XXXXXX12"
                      value={formData.mobile_no_1}
                      onChange={handleChange}
                    />
                    {validationErrors.mobile_no_1 && (
                      <span className="error-message">{validationErrors.mobile_no_1}</span>
                    )}
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
                    <label className="form-label">{language === 'en' ? 'Birth Place (Village)' : 'जन्म गाव'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="birth_village"
                      className={`form-input ${validationErrors.birth_village ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'e.g. Nagaon' : 'उदा. नागांव'}
                      value={formData.birth_village}
                      onChange={handleChange}
                    />
                    {validationErrors.birth_village && (
                      <span className="error-message">{validationErrors.birth_village}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Birth Place (District)' : 'जन्म जिल्हा'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="birth_district"
                      className={`form-input ${validationErrors.birth_district ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'e.g. Jalgaon' : 'उदा. जळगाव'}
                      value={formData.birth_district}
                      onChange={handleChange}
                    />
                    {validationErrors.birth_district && (
                      <span className="error-message">{validationErrors.birth_district}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Birthdate' : 'जन्मतारीख'} <span className="required-star">*</span></label>
                    <input
                      type="date"
                      name="date_of_birth"
                      className={`form-input ${validationErrors.date_of_birth ? 'error' : ''}`}
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      max={getMaxBirthDate()}
                      min={getMinBirthDate()}
                    />
                    <small className="date-helper-text">
                      {language === 'en' ? 'Must be 18 years or above' : 'वय 18 वर्ष किंवा त्यापेक्षा जास्त असावे'}
                    </small>
                    {validationErrors.date_of_birth && (
                      <span className="error-message">{validationErrors.date_of_birth}</span>
                    )}
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
                    <label className="form-label">{language === 'en' ? 'Permanent Address (Postal address)' : 'कायमचा पत्ता'} <span className="required-star">*</span></label>
                    <textarea
                      name="permanent_address"
                      className={`form-input ${validationErrors.permanent_address ? 'error' : ''}`}
                      rows="2"
                      placeholder={language === 'en' ? 'Input your permanent residential address' : 'तुमचा कायमचा राहण्याचा पत्ता टाका'}
                      value={formData.permanent_address}
                      onChange={handleChange}
                    />
                    {validationErrors.permanent_address && (
                      <span className="error-message">{validationErrors.permanent_address}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Place of Residence' : 'सध्याचा राहण्याचा ठिकाण'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="current_residence"
                      className={`form-input ${validationErrors.current_residence ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'Town/City you currently live' : 'तुम्ही सध्या राहत असलेले शहर'}
                      value={formData.current_residence}
                      onChange={handleChange}
                    />
                    {validationErrors.current_residence && (
                      <span className="error-message">{validationErrors.current_residence}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Marital Status' : 'वैवाहिक स्थिती'} <span className="required-star">*</span></label>
                    <select
                      name="marital_status"
                      className={`form-input ${validationErrors.marital_status ? 'error' : ''}`}
                      value={formData.marital_status}
                      onChange={handleChange}
                    >
                      <option value="Unmarried">{language === 'en' ? 'Unmarried' : 'अविवाहित'}</option>
                      <option value="Divorced">{language === 'en' ? 'Divorced' : 'घटस्फोटित'}</option>
                      <option value="Widow">{language === 'en' ? 'Widow' : 'विधवा'}</option>
                      <option value="Widower">{language === 'en' ? 'Widower' : 'विदुर'}</option>
                    </select>
                    {validationErrors.marital_status && (
                      <span className="error-message">{validationErrors.marital_status}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Native Place (District)' : 'मूळ गाव (जिल्हा)'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="native_district"
                      className={`form-input ${validationErrors.native_district ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'e.g. Dhule' : 'उदा. धुळे'}
                      value={formData.native_district}
                      onChange={handleChange}
                    />
                    {validationErrors.native_district && (
                      <span className="error-message">{validationErrors.native_district}</span>
                    )}
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
                    <label className="form-label">{language === 'en' ? 'Occupation' : 'व्यवसाय'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="occupation"
                      className={`form-input ${validationErrors.occupation ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'e.g. Software Engineer' : 'उदा. सॉफ्टवेअर इंजिनियर'}
                      value={formData.occupation}
                      onChange={handleChange}
                    />
                    {validationErrors.occupation && (
                      <span className="error-message">{validationErrors.occupation}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Education' : 'शिक्षण'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="education"
                      className={`form-input ${validationErrors.education ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'e.g. BA, B Ed' : 'उदा. बीए, बी एड'}
                      value={formData.education}
                      onChange={handleChange}
                    />
                    {validationErrors.education && (
                      <span className="error-message">{validationErrors.education}</span>
                    )}
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
                    <label className="form-label">{language === 'en' ? 'Weight (in KG)' : 'वजन (किलो)'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="weight"
                      className={`form-input ${validationErrors.weight ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'e.g. 55 or 72' : 'उदा. 55 किंवा 72'}
                      value={formData.weight}
                      onChange={handleChange}
                    />
                    {validationErrors.weight && (
                      <span className="error-message">{validationErrors.weight}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">{language === 'en' ? 'Height' : 'उंची'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="height"
                      className={`form-input ${validationErrors.height ? 'error' : ''}`}
                      placeholder={language === 'en' ? 'e.g. 5.6' : 'उदा. 5.6'}
                      value={formData.height}
                      onChange={handleChange}
                    />
                    {validationErrors.height && (
                      <span className="error-message">{validationErrors.height}</span>
                    )}
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
                    <label className="form-label">{language === 'en' ? 'Upload Photos (Max 4)' : 'फोटो अपलोड करा (कमाल 4)'} <span className="required-star">*</span></label>
                    <p className="upload-instruction">
                      {language === 'en' 
                        ? 'You can select multiple photos at once or add them one by one' 
                        : 'तुम्ही एकाच वेळी अनेक फोटो निवडू शकता किंवा एक एक करून जोडू शकता'}
                    </p>
                    <input
                      type="file"
                      className="form-input"
                      onChange={handlePhotoChange}
                      multiple
                      accept="image/*"
                    />
                    {photos.length > 0 && (
                      <div className="photo-preview-container">
                        <p className="photo-count">{photos.length} {language === 'en' ? 'photos selected' : 'फोटो निवडले'}</p>
                        <div className="photo-preview-grid">
                          {photos.map((photo, index) => (
                            <div key={index} className="photo-preview-item">
                              <img 
                                src={URL.createObjectURL(photo)} 
                                alt={`Preview ${index + 1}`}
                                className="photo-preview"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(index)}
                                className="photo-remove-btn"
                                title={language === 'en' ? 'Remove photo' : 'फोटो काढा'}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {validationErrors.photos && (
                      <span className="error-message">{validationErrors.photos}</span>
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
                    <label className="form-label">{language === 'en' ? 'Father\'s Name' : 'वडिलांचे नाव'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="father_name"
                      className="form-input"
                      placeholder={language === 'en' ? 'Father\'s full name' : 'वडिलांचे पूर्ण नाव'}
                      value={formData.father_name}
                      onChange={handleChange}
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
                    <label className="form-label">{language === 'en' ? 'Mother\'s Name' : 'आईचे नाव'} <span className="required-star">*</span></label>
                    <input
                      type="text"
                      name="mother_name"
                      className="form-input"
                      placeholder={language === 'en' ? 'Mother\'s full name' : 'आईचे पूर्ण नाव'}
                      value={formData.mother_name}
                      onChange={handleChange}
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
                  onClick={(e) => {
                    e.preventDefault();
                    nextStep();
                  }}
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
