import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import UserInfoBar from './components/UserInfoBar';
import SEOHead from './components/SEOHead';
import Home from './pages/Home';
import Register from './pages/Register';
import Browse from './pages/Browse';
import ProfileDetail from './pages/ProfileDetail';
import TermsAndConditions from './pages/TermsAndConditions';
import Sitemap from './pages/Sitemap';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Footer from './components/Footer';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="App">
            <SEOHead />
            <Navbar />
            <UserInfoBar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/profile/:id" element={<ProfileDetail />} />
                <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
                <Route path="/sitemap" element={<Sitemap />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;

