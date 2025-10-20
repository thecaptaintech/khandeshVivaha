import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-logo">
            <img src="/images/shubhvivah.png" alt="Shubh Vivah" className="logo-icon-image" />
            <span className="logo-text">
              Khandesh Matrimony
            </span>
          </Link>

          <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
            <span className="hamburger-line"></span>
          </button>

          <div className={`navbar-links ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
            {!isHomePage && (
              <Link to="/" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('home')}</Link>
            )}
            <Link to="/register" className="nav-link" onClick={() => setIsMobileMenuOpen(false)}>{t('register')}</Link>
            <Link to="/browse?gender=Female" className={`nav-link ${language === 'mr' ? 'marathi-link' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              {t('female')}
            </Link>
            <Link to="/browse?gender=Male" className={`nav-link ${language === 'mr' ? 'marathi-link' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              {t('male')}
            </Link>
            <Link to="/browse?gender=Divorcee" className={`nav-link ${language === 'mr' ? 'marathi-link' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              {t('divorcee')}
            </Link>
            <Link to="/browse?gender=Widow" className={`nav-link ${language === 'mr' ? 'marathi-link' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              {t('widow')}
            </Link>
            <Link to="/browse?gender=Widower" className={`nav-link ${language === 'mr' ? 'marathi-link' : ''}`} onClick={() => setIsMobileMenuOpen(false)}>
              {t('widower')}
            </Link>
            <button onClick={() => { toggleLanguage(); setIsMobileMenuOpen(false); }} className="language-toggle mobile-language-toggle">
              {language === 'en' ? 'मराठी' : 'English'}
            </button>
          </div>

          <button onClick={toggleLanguage} className="language-toggle desktop-language-toggle">
            {language === 'en' ? 'मराठी' : 'English'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

