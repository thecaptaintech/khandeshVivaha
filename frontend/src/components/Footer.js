import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getPublicSettings } from '../services/api';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    contact_whatsapp: '',
    contact_email: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const fetchedSettings = await getPublicSettings();
      setSettings({
        contact_whatsapp: fetchedSettings.contact_whatsapp || '',
        contact_email: fetchedSettings.contact_email || 'info@khandeshmatrimony.com'
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3 className="footer-title">{t('footerAbout')}</h3>
            <p className="footer-text">
              {t('footerAboutText')}
            </p>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">{t('footerQuickLinks')}</h3>
            <div className="footer-links">
              <Link to="/" className="footer-link">{t('home')}</Link>
              <Link to="/register" className="footer-link">{t('register')}</Link>
              <Link to="/browse" className="footer-link">{t('browse')}</Link>
              <Link to="/terms-and-conditions" className="footer-link">{t('termsAndConditions')}</Link>
              <Link to="/sitemap" className="footer-link">{t('sitemap')}</Link>
              <Link to="/admin/login" className="footer-link">{t('adminLogin')}</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">{t('footerContact')}</h3>
            <div className="footer-contact">
              <p><strong>{t('footerPhone')}:</strong> +91 {settings.contact_whatsapp}</p>
              <p><strong>{t('footerEmail')}:</strong> {settings.contact_email}</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-disclaimer">{t('footerDisclaimer')}</p>
          <p>{t('footerRights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

