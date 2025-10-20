import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();

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
              <Link to="/admin/login" className="footer-link">{t('adminLogin')}</Link>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-title">{t('footerContact')}</h3>
            <div className="footer-contact">
              <p><strong>{t('footerPhone')}:</strong> +91 9167681454</p>
              <p><strong>{t('footerEmail')}:</strong> info@khandeshmatrimony.com</p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>{t('footerRights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

