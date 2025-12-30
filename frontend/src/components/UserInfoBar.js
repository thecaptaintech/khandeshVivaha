import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './UserInfoBar.css';

const UserInfoBar = () => {
  const { admin, logout, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show on admin dashboard (it has its own header) or admin login
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  // Only show if user is authenticated and is agent or admin
  if (!isAuthenticated() || !admin || (admin.role !== 'agent' && admin.role !== 'admin')) {
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="user-info-bar">
      <div className="container">
        <div className="user-info-content">
          <span className="user-info-text">
            👤 {language === 'en' ? 'Logged in as' : 'लॉग इन केले'}: <strong>{admin.username}</strong> ({admin.role === 'agent' ? 'Agent' : 'Admin'})
          </span>
          <button onClick={handleLogout} className="user-info-logout-btn">
            {language === 'en' ? 'Logout' : 'लॉग आउट'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoBar;

