import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPublicSettings, UPLOADS_URL } from '../services/api';
import backgroundRed3 from '../assets/images/backgroundRed3.jpg';
import './Home.css';

const Home = () => {
  const { t, language } = useLanguage();
  const [settings, setSettings] = useState({
    payment_qr_code: null,
    contact_whatsapp: '9167681454',
    contact_email: 'info@khandeshmatrimony.com',
    upi_id: '9167681454@ybl',
    registration_fee: '₹1500 (6 months)',
    banner_text_english: 'Khandesh Matrimony is a matchmaking service only. Please verify all details independently before marriage.',
    banner_text_marathi: 'खान्देश मॅट्रिमनी ही केवळ ओळख करून देणारी सेवा आहे. विवाह ठरवण्याआधी सर्व माहिती स्वतः पडताळून घ्या.'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const fetchedSettings = await getPublicSettings();
        setSettings({
          payment_qr_code: fetchedSettings.payment_qr_code || null,
          contact_whatsapp: fetchedSettings.contact_whatsapp || '9167681454',
          contact_email: fetchedSettings.contact_email || 'info@khandeshmatrimony.com',
          upi_id: fetchedSettings.upi_id || '9167681454@ybl',
          registration_fee: fetchedSettings.registration_fee || '₹1500 (6 months)',
          banner_text_english: fetchedSettings.banner_text_english || 'Khandesh Matrimony is a matchmaking service only. Please verify all details independently before marriage.',
          banner_text_marathi: fetchedSettings.banner_text_marathi || 'खान्देश मॅट्रिमनी ही केवळ ओळख करून देणारी सेवा आहे. विवाह ठरवण्याआधी सर्व माहिती स्वतः पडताळून घ्या.'
        });
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="home">
        {/* Hero Section */}
        <section className="hero-section">
          {/* Disclaimer Banner at Top */}
          <div className="hero-disclaimer-banner">
            <div className="disclaimer-scroll-wrapper">
              <div className="disclaimer-scroll-text">
                {(() => {
                  const bannerText = language === 'mr' 
                    ? (settings.banner_text_marathi || t('topDisclaimer'))
                    : (settings.banner_text_english || t('topDisclaimer'));
                  return (
                    <>
                      <span className={`disclaimer-message ${language === 'mr' ? 'marathi-text' : ''}`}>{bannerText}</span>
                      <span className="disclaimer-sep"> • </span>
                      <span className={`disclaimer-message ${language === 'mr' ? 'marathi-text' : ''}`}>{bannerText}</span>
                      <span className="disclaimer-sep"> • </span>
                      <span className={`disclaimer-message ${language === 'mr' ? 'marathi-text' : ''}`}>{bannerText}</span>
                      <span className="disclaimer-sep"> • </span>
                      <span className={`disclaimer-message ${language === 'mr' ? 'marathi-text' : ''}`}>{bannerText}</span>
                      <span className="disclaimer-sep"> • </span>
                      <span className={`disclaimer-message ${language === 'mr' ? 'marathi-text' : ''}`}>{bannerText}</span>
                      <span className="disclaimer-sep"> • </span>
                      <span className={`disclaimer-message ${language === 'mr' ? 'marathi-text' : ''}`}>{bannerText}</span>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
          <div className="hero-background-slider">
            <div className="background-slide" style={{backgroundImage: 'url(/images/backgroundRed1.webp)'}}></div>
            <div className="background-slide" style={{backgroundImage: 'url(/images/backgroundRed2.jpg)'}}></div>
            <div className="background-slide" style={{backgroundImage: 'url(/images/backgroundRed3.jpg)'}}></div>
            <div className="background-slide" style={{backgroundImage: 'url(/images/backgroundRed4.jpg)'}}></div>
          </div>
          <div className="hero-overlay"></div>
          <div className="hero-decorations">
            {/* Removed shubh-vivah-top - now in card */}
          </div>
          <div className="container hero-content">
            <div className="hero-layout">
              <div className="hero-card">
                <div className="card-content">
                  <h2 className={`hero-title ${language === 'mr' ? 'marathi-text' : ''}`}>
                    {t('heroTitleMarathi')}
                  </h2>
                  <p className={`hero-subtitle ${language === 'mr' ? 'marathi-text' : ''}`}>
                    {t('heroSubtitleMarathi')}
                  </p>
                  <div className="shubh-vivah-card-image">
                    <img src="/images/shubhvivah.png" alt="Shubh Vivah" className="card-shubh-vivah" />
                  </div>
                  <div className="hero-buttons">
                    <Link to="/register" className="btn btn-primary btn-glow">
                      {t('registerNow')}
                    </Link>
                    <Link to="/browse" className="btn btn-outline btn-white">
                      {t('browseProfiles')}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="welcome-text">
                <h3 className="welcome-title marathi-text">🌼 खान्देश मॅट्रिमनी मध्ये आपले स्वागत</h3>
                <p className="welcome-paragraph marathi-text">
                  खान्देश मॅट्रिमनी मध्ये आपले स्वागत आहे — खान्देशातील लोकांसाठी खास बनवलेला विश्वासार्ह विवाह मंच.
                  आपल्या संस्कृतीतील परंपरा, साधेपणा आणि मूल्ये आम्हाला समजतात. आमचे ध्येय म्हणजे एक सुरक्षित आणि पडताळणी केलेल्या प्रणालीद्वारे खऱ्या अर्थाने नाती जोडणे.
                  जलगाव, धुळे, नंदुरबार आणि परिसरातील वधू-वरांसाठी हा एक विश्वासार्ह व्यासपीठ आहे, जिथे आपल्याला आपल्या संस्कृतीशी जुळणारा जोडीदार मिळेल.
                  खान्देश मॅट्रिमनी सोबत आपल्या जीवनसाथीच्या शोधाची सुरुवात करा — जिथे नाती तयार होतात विश्वास, आदर आणि प्रेमावर. 💖
                </p>
              </div>
            </div>
          </div>
        </section>

            {/* Rules Section - Separate from Hero */}
            <section className="rules-section-wrapper">
              <div className="rules-background" style={{backgroundImage: `url(${backgroundRed3})`}}></div>
              <div className="container rules-container">
                <h3 className="rules-main-title marathi-text">📋 महत्वाचे नियम आणि पेमेंट माहिती</h3>
                <div className="three-section-layout">
                  {/* Section 1 - Rules */}
                  <div className="section-card rules-card">
                    <h4 className="section-title">📜 वेबसाईटवरून माहिती घेण्याची पद्धत</h4>
                    <div className="section-content">
                      <p className="rules-paragraph">
                        तुम्ही तुमचा जो मेल वेबसाईटवर रजिस्टर केला आहे त्यावरून आमच्या मेलवर <strong>{settings.contact_email}</strong> मेल करा. 
                        मेलमध्ये तुमचा आयडी नंबर (KM) लिहा व ज्या मुला-मुलींचे आयडी नंबर (KM) हवेत त्यांचे आयडी नंबर लिहावेत. 
                      </p>
                      <p className="rules-paragraph">
                        एकावेळी <strong>5 बायोडेटा</strong> ची माहिती मागवता येते व दुसऱ्या वेळेस माहिती मागवताना <strong>5 दिवसांचा गॅप</strong> असावा 
                        म्हणजे 5 दिवसाआड 5 बायोडेटा याप्रमाणे वर्षभर माहिती मागवता येते.
                      </p>
                      <div className="alert-box">
                        <p className="alert-text">
                          ⚠️ <strong>लग्न जमले/ठरल्यावर आम्हास लगेच कळविणे बंधनकारक आहे तसेच ही पालकांची वैयक्तिक जबाबदारी देखील आहे.</strong>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Section 2 - Payment Details */}
                  <div className="section-card payment-card">
                    <h4 className="section-title">💳 पेमेंट माहिती</h4>
                    <div className="section-content">
                      {/* QR Code */}
                      {settings.payment_qr_code && (
                        <div className="payment-method qr-code-container">
                          <h5 className="payment-method-title">QR Code:</h5>
                          <div className="qr-code-wrapper">
                            <img
                              src={`${UPLOADS_URL}/${settings.payment_qr_code}`}
                              alt="Payment QR Code"
                              className="qr-code-image"
                            />
                          </div>
                        </div>
                      )}

                      {/* UPI Payment */}
                      <div className="payment-method">
                        <h5 className="payment-method-title">UPI पेमेंट:</h5>
                        <div className="upi-details">
                          <p className="upi-id"><strong>UPI ID:</strong> {settings.upi_id}</p>
                        </div>
                      </div>

                      {/* Contact Information */}
                      <div className="payment-method" style={{marginTop: '20px'}}>
                        <h5 className="payment-method-title">संपर्क माहिती:</h5>
                        <div className="upi-details">
                          <p><strong>📧 Email:</strong> {settings.contact_email}</p>
                          <p><strong>📱 WhatsApp:</strong> {settings.contact_whatsapp}</p>
                          <p className="payment-note" style={{marginTop: '10px'}}>
                            पेमेंट confirm करण्यासाठी <strong>{settings.contact_email}</strong> वर मेल करा किंवा <strong>{settings.contact_whatsapp}</strong> वर WhatsApp करा
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 3 - Amount & Process */}
                  <div className="section-card amount-process-card">
                    <h4 className="section-title">💰 रक्कम आणि प्रक्रिया</h4>
                    <div className="section-content">
                      <div className="payment-amount-box">
                        <div className="amount-display">
                          <span className="amount-label">Registration Fee:</span>
                          <span className="amount-value-small">{settings.registration_fee || '₹1500 (6 months)'}</span>
                        </div>
                        <p className="amount-note">* One Time Payment (6 महिन्यांचा access समाविष्ट)</p>
                        <div className="bonus-tip-container">
                          <div className="bonus-tip-content">
                            <span className="bonus-icon">🎁</span>
                            <span className="bonus-text">
                              <strong>Bonus:</strong> एकदा 6 महिने संपल्यानंतर, पुढच्या 6 महिन्यांसाठी फक्त <strong className="bonus-amount">₹400</strong> भरून renewal करा
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="payment-process-box">
                        <h5 className="process-title">📋 पेमेंट प्रक्रिया:</h5>
                        <ol className="process-steps">
                          <li>QR Code स्कॅन करा किंवा UPI ID वर पेमेंट करा</li>
                          <li>Payment Screenshot/Receipt घ्या</li>
                          <li><strong>{settings.contact_email}</strong> वर मेल करा किंवा <strong>{settings.contact_whatsapp}</strong> वर WhatsApp करा</li>
                          <li>मेल/WhatsApp मध्ये तुमचा <strong>KM Register ID</strong> आणि Payment Proof पाठवा</li>
                          <li>Admin verification नंतर profile approve होईल</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

    </div>
  );
};

export default Home;

