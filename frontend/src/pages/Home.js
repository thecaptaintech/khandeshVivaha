import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import backgroundRed3 from '../assets/images/backgroundRed3.jpg';
import './Home.css';

const Home = () => {
  const { t, language } = useLanguage();

  return (
    <div className="home">
        {/* Hero Section */}
        <section className="hero-section">
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
                        तुम्ही तुमचा जो मेल वेबसाईटवर रजिस्टर केला आहे त्यावरून आमच्या मेलवर <strong>info@khandeshmatrimony.com</strong> मेल करा. 
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
                      <div className="payment-method">
                        <h5 className="payment-method-title">UPI पेमेंट:</h5>
                        <div className="upi-details">
                          <p className="upi-id"><strong>UPI ID:</strong> 9167681454@ybl</p>
                          <p className="payment-note">पेमेंट करताना तुमचा Register ID नंबर reference म्हणून लिहा</p>
                        </div>
                      </div>
                      
                      <div className="payment-method">
                        <h5 className="payment-method-title">बँक डिटेल्स:</h5>
                        <div className="bank-details">
                          <p><strong>Account Holder:</strong> Khandesh Matrimony</p>
                          <p><strong>Account Number:</strong> 1234567890</p>
                          <p><strong>IFSC Code:</strong> SBIN0001234</p>
                          <p><strong>Bank Name:</strong> State Bank of India</p>
                          <p><strong>Branch:</strong> Jalgaon Main</p>
                          <p className="payment-note" style={{marginTop: '10px'}}>
                            पेमेंट confirm करण्यासाठी <strong>info@khandeshmatrimony.com</strong> वर मेल करा
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
                          <span className="amount-value">₹1500</span>
                        </div>
                        <p className="amount-note">* One Time Payment (6 महिन्यांचा access समाविष्ट)</p>
                      </div>

                      <div className="payment-process-box">
                        <h5 className="process-title">📋 पेमेंट प्रक्रिया:</h5>
                        <ol className="process-steps">
                          <li>पेमेंट करा (UPI किंवा Bank Transfer)</li>
                          <li>Payment Screenshot/Receipt घ्या</li>
                          <li><strong>info@khandeshmatrimony.com</strong> वर मेल करा</li>
                          <li>मेलमध्ये तुमचा <strong>KM Register ID</strong> आणि Payment Proof पाठवा</li>
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

