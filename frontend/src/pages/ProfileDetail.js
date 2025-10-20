import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getUserById, UPLOADS_URL } from '../services/api';
import './ProfileDetail.css';

const ProfileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchProfile = async () => {
    try {
      const data = await getUserById(id);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const nextPhoto = () => {
    if (profile.photos) {
      setCurrentPhotoIndex((prev) => 
        prev === profile.photos.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevPhoto = () => {
    if (profile.photos) {
      setCurrentPhotoIndex((prev) => 
        prev === 0 ? profile.photos.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="profile-detail-page">
        <div className="container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-detail-page">
        <div className="container">
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-detail-page">
      <div className="container">
        <button 
          onClick={() => navigate('/browse')}
          className="btn btn-outline back-btn"
        >
          ← {t('backToProfiles')}
        </button>

        <div className="profile-detail-card card">
          <div className="profile-detail-header">
            <div className="profile-photos">
              {profile.photos && profile.photos.length > 0 ? (
                <>
                  <div className="main-photo">
                    <img
                      src={`${UPLOADS_URL}/${profile.photos[currentPhotoIndex]}`}
                      alt={profile.full_name}
                    />
                    {profile.photos.length > 1 && (
                      <>
                        <button className="photo-nav prev" onClick={prevPhoto}>
                          ←
                        </button>
                        <button className="photo-nav next" onClick={nextPhoto}>
                          →
                        </button>
                      </>
                    )}
                  </div>
                  
                  {/* Photo Gallery Thumbnails - Always show all photos */}
                  <div className="photo-gallery">
                    {profile.photos.map((photo, index) => (
                      <div 
                        key={index}
                        className={`gallery-thumbnail ${index === currentPhotoIndex ? 'active' : ''} ${index === 0 ? 'primary' : ''}`}
                        onClick={() => setCurrentPhotoIndex(index)}
                      >
                        <img
                          src={`${UPLOADS_URL}/${photo}`}
                          alt={`${profile.full_name} ${index + 1}`}
                        />
                        {index === 0 && (
                          <span className="primary-badge">Primary</span>
                        )}
                        <div className="thumbnail-overlay">
                          <span className="photo-number">{index + 1}/{profile.photos.length}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-photo">
                  <span className="no-photo-icon">
                    {profile.gender === 'Male' ? '👨' : '👩'}
                  </span>
                </div>
              )}
            </div>

            <div className="profile-basic-info">
              <h1 className="profile-detail-name">{profile.full_name}</h1>
              <p className="profile-id">ID: {profile.register_id}</p>
              
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">{t('age')}:</span>
                  <span className="info-value">
                    {calculateAge(profile.date_of_birth)} {t('years')}
                  </span>
                </div>
                
                <div className="info-item">
                  <span className="info-label">{t('gender')}:</span>
                  <span className="info-value">{profile.gender}</span>
                </div>
                
                {profile.height && (
                  <div className="info-item">
                    <span className="info-label">{t('height')}:</span>
                    <span className="info-value">{profile.height}</span>
                  </div>
                )}
                
                {profile.weight && (
                  <div className="info-item">
                    <span className="info-label">{t('weight')}:</span>
                    <span className="info-value">{profile.weight}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-sections">
            {/* Personal Information */}
            <div className="profile-section">
              <h3 className="section-heading">👤 {language === 'en' ? 'Personal Information' : 'वैयक्तिक माहिती'}</h3>
              <div className="section-content">
                {profile.date_of_birth && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Birth Date' : 'जन्मतारीख'}:</span>
                    <span className="detail-value">{formatDate(profile.date_of_birth)} ({calculateAge(profile.date_of_birth)} {language === 'en' ? 'years' : 'वर्षे'})</span>
                  </div>
                )}
                
                {profile.birth_time && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Birth Time' : 'जन्म वेळ'}:</span>
                    <span className="detail-value">{profile.birth_time}</span>
                  </div>
                )}
                
                {profile.birth_village && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Birth Place' : 'जन्म ठिकाण'}:</span>
                    <span className="detail-value">{profile.birth_village}, {profile.birth_district}</span>
                  </div>
                )}
                
                {profile.height && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Height' : 'उंची'}:</span>
                    <span className="detail-value">{profile.height}</span>
                  </div>
                )}
                
                {profile.weight && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Weight' : 'वजन'}:</span>
                    <span className="detail-value">{profile.weight}</span>
                  </div>
                )}
                
                {profile.color && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Complexion' : 'रंग'}:</span>
                    <span className="detail-value">{profile.color}</span>
                  </div>
                )}
                
                {profile.blood_group && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Blood Group' : 'रक्तगट'}:</span>
                    <span className="detail-value">{profile.blood_group}</span>
                  </div>
                )}
                
                {profile.marital_status && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Marital Status' : 'वैवाहिक स्थिती'}:</span>
                    <span className="detail-value">{profile.marital_status}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Educational & Professional */}
            <div className="profile-section">
              <h3 className="section-heading">🎓 {language === 'en' ? 'Education & Career' : 'शिक्षण आणि करिअर'}</h3>
              <div className="section-content">
                {profile.education && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Education' : 'शिक्षण'}:</span>
                    <span className="detail-value">{profile.education}</span>
                  </div>
                )}
                
                {profile.occupation && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Occupation' : 'व्यवसाय'}:</span>
                    <span className="detail-value">{profile.occupation}</span>
                  </div>
                )}
                
                {profile.income && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Income' : 'उत्पन्न'}:</span>
                    <span className="detail-value">{profile.income}</span>
                  </div>
                )}
                
                {profile.company_address && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Office Location' : 'ऑफिस स्थान'}:</span>
                    <span className="detail-value">{profile.company_address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Family Information */}
            <div className="profile-section">
              <h3 className="section-heading">👨‍👩‍👧‍👦 {language === 'en' ? 'Family Details' : 'कौटुंबिक माहिती'}</h3>
              <div className="section-content">
                {profile.father_name && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Father\'s Name' : 'वडिलांचे नाव'}:</span>
                    <span className="detail-value">{profile.father_name}</span>
                  </div>
                )}
                
                {profile.father_occupation && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Father\'s Occupation' : 'वडिलांचा व्यवसाय'}:</span>
                    <span className="detail-value">{profile.father_occupation}</span>
                  </div>
                )}
                
                {profile.mother_name && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Mother\'s Name' : 'आईचे नाव'}:</span>
                    <span className="detail-value">{profile.mother_name}</span>
                  </div>
                )}
                
                {profile.mother_occupation && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Mother\'s Occupation' : 'आईचा व्यवसाय'}:</span>
                    <span className="detail-value">{profile.mother_occupation}</span>
                  </div>
                )}
                
                {profile.brothers && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Brothers' : 'भाऊ'}:</span>
                    <span className="detail-value">{profile.brothers}</span>
                  </div>
                )}
                
                {profile.sisters && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Sisters' : 'बहिणी'}:</span>
                    <span className="detail-value">{profile.sisters}</span>
                  </div>
                )}
                
                {profile.family_type && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Family Type' : 'कुटुंब प्रकार'}:</span>
                    <span className="detail-value">{profile.family_type}</span>
                  </div>
                )}
                
                {profile.family_status && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Family Status' : 'कौटुंबिक स्थिती'}:</span>
                    <span className="detail-value">{profile.family_status}</span>
                  </div>
                )}
                
                {profile.family_values && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Family Values' : 'कौटुंबिक मूल्ये'}:</span>
                    <span className="detail-value">{profile.family_values}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Astrological Information */}
            {(profile.rashi || profile.nakshatra || profile.gotra || profile.manglik) && (
              <div className="profile-section">
                <h3 className="section-heading">✨ {language === 'en' ? 'Astrological Information' : 'ज्योतिषीय माहिती'}</h3>
                <div className="section-content">
                  {profile.rashi && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Rashi' : 'राशी'}:</span>
                      <span className="detail-value">{profile.rashi}</span>
                    </div>
                  )}
                  
                  {profile.nakshatra && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Nakshatra' : 'नक्षत्र'}:</span>
                      <span className="detail-value">{profile.nakshatra}</span>
                    </div>
                  )}
                  
                  {profile.gotra && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Gotra' : 'गोत्र'}:</span>
                      <span className="detail-value">{profile.gotra}</span>
                    </div>
                  )}
                  
                  {profile.manglik && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Manglik' : 'मांगलिक'}:</span>
                      <span className="detail-value">{profile.manglik}</span>
                    </div>
                  )}
                  
                  {profile.nadi && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Nadi' : 'नाडी'}:</span>
                      <span className="detail-value">{profile.nadi}</span>
                    </div>
                  )}
                  
                  {profile.gana && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Gana' : 'गण'}:</span>
                      <span className="detail-value">{profile.gana}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Partner Expectations */}
            {(profile.expected_education || profile.expected_occupation || profile.other_expectations) && (
              <div className="profile-section">
                <h3 className="section-heading">💭 {language === 'en' ? 'Partner Expectations' : 'जीवनसाथीची अपेक्षा'}</h3>
                <div className="section-content">
                  {profile.expected_education && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Education' : 'शिक्षण'}:</span>
                      <span className="detail-value">{profile.expected_education}</span>
                    </div>
                  )}
                  
                  {profile.expected_occupation && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Occupation' : 'व्यवसाय'}:</span>
                      <span className="detail-value">{profile.expected_occupation}</span>
                    </div>
                  )}
                  
                  {profile.expected_income && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Income' : 'उत्पन्न'}:</span>
                      <span className="detail-value">{profile.expected_income}</span>
                    </div>
                  )}
                  
                  {profile.expected_location && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Location' : 'स्थान'}:</span>
                      <span className="detail-value">{profile.expected_location}</span>
                    </div>
                  )}
                  
                  {profile.other_expectations && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Other' : 'इतर'}:</span>
                      <span className="detail-value">{profile.other_expectations}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Details */}
            <div className="profile-section">
              <h3 className="section-heading">ℹ️ {language === 'en' ? 'Additional Details' : 'अतिरिक्त माहिती'}</h3>
              <div className="section-content">
                {profile.personality && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Personality' : 'व्यक्तिमत्व'}:</span>
                    <span className="detail-value">{profile.personality}</span>
                  </div>
                )}
                
                {profile.hobbies && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Hobbies' : 'छंद'}:</span>
                    <span className="detail-value">{profile.hobbies}</span>
                  </div>
                )}
                
                {profile.native_district && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Native Place' : 'मूळ गाव'}:</span>
                    <span className="detail-value">{profile.native_village_taluka}, {profile.native_district}</span>
                  </div>
                )}
                
                {profile.current_residence && (
                  <div className="detail-row">
                    <span className="detail-label">{language === 'en' ? 'Current Residence' : 'सध्याचा राहण्याचा ठिकाण'}:</span>
                    <span className="detail-value">{profile.current_residence}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information - Only for Paid Users */}
            {profile.payment_status === 'paid' ? (
              <div className="profile-section contact-section">
                <h3 className="section-heading">📞 {language === 'en' ? 'Contact Information' : 'संपर्क माहिती'}</h3>
                <div className="section-content">
                  {profile.contact_number && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Mobile' : 'मोबाईल'}:</span>
                      <span className="detail-value">{profile.contact_number}</span>
                    </div>
                  )}
                  
                  {profile.mobile_no_1 && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Mobile 1' : 'मोबाईल 1'}:</span>
                      <span className="detail-value">{profile.mobile_no_1}</span>
                    </div>
                  )}
                  
                  {profile.mobile_no_2 && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Mobile 2' : 'मोबाईल 2'}:</span>
                      <span className="detail-value">{profile.mobile_no_2}</span>
                    </div>
                  )}
                  
                  {profile.email && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Email' : 'ईमेल'}:</span>
                      <span className="detail-value">{profile.email}</span>
                    </div>
                  )}
                  
                  {profile.permanent_address && (
                    <div className="detail-row">
                      <span className="detail-label">{language === 'en' ? 'Address' : 'पत्ता'}:</span>
                      <span className="detail-value">{profile.permanent_address}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="profile-section locked-section">
                <h3 className="section-heading">🔒 {language === 'en' ? 'Contact Information' : 'संपर्क माहिती'}</h3>
                <div className="section-content">
                  <div className="locked-message">
                    <p className="locked-icon">🔒</p>
                    <p className="locked-text">
                      {language === 'en' 
                        ? 'Contact details are available after payment verification. Please make payment of ₹1500 and contact admin.' 
                        : 'पेमेंट पडताळणीनंतर संपर्क तपशील उपलब्ध आहेत. कृपया ₹1500 पेमेंट करा आणि प्रशासकाशी संपर्क साधा.'}
                    </p>
                    <p className="contact-admin">
                      📧 info@khandeshmatrimony.com
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDetail;

