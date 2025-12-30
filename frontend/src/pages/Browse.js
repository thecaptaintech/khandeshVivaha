import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getUsers, UPLOADS_URL } from '../services/api';
import './Browse.css';

const Browse = () => {
  const { t, language } = useLanguage();
  const location = useLocation();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [genderFilter, setGenderFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('browseSearchTerm') || '';
  });
  
  // Additional filters
  const [educationFilter, setEducationFilter] = useState(() => {
    return sessionStorage.getItem('browseEducationFilter') || '';
  });
  const [occupationFilter, setOccupationFilter] = useState(() => {
    return sessionStorage.getItem('browseOccupationFilter') || '';
  });
  const [incomeFilter, setIncomeFilter] = useState(() => {
    return sessionStorage.getItem('browseIncomeFilter') || '';
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(() => {
    return parseInt(sessionStorage.getItem('browseCurrentPage')) || 1;
  });
  const profilesPerPage = 12;

  // Always start with loading when component mounts
  useEffect(() => {
    setLoading(true);
  }, []);

  // Simple URL parameter handling
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gender = params.get('gender');
    
    if (!gender) {
      setGenderFilter('');
      setCurrentPage(1);
    } else {
      setGenderFilter(gender);
      setCurrentPage(1);
    }
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    fetchProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderFilter]);

  // Save filters to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('browseGenderFilter', genderFilter);
    sessionStorage.setItem('browseSearchTerm', searchTerm);
    sessionStorage.setItem('browseEducationFilter', educationFilter);
    sessionStorage.setItem('browseOccupationFilter', occupationFilter);
    sessionStorage.setItem('browseIncomeFilter', incomeFilter);
    sessionStorage.setItem('browseCurrentPage', currentPage.toString());
  }, [genderFilter, searchTerm, educationFilter, occupationFilter, incomeFilter, currentPage]);

  // Simple restoration when coming back from profile
  useEffect(() => {
    const savedPage = sessionStorage.getItem('browseReturnPage');
    const savedScrollPosition = sessionStorage.getItem('browseScrollPosition');
    const savedFilter = sessionStorage.getItem('browseReturnFilter');
    
    if (savedPage && savedScrollPosition && savedFilter !== null && !loading && profiles.length > 0) {
      console.log('Restoring from profile view - Page:', savedPage, 'Filter:', savedFilter, 'Scroll:', savedScrollPosition);
      
      // Restore filter and page
      setGenderFilter(savedFilter);
      setCurrentPage(parseInt(savedPage));
      
      // Update URL to match the filter
      if (savedFilter && savedFilter !== '') {
        window.history.replaceState({}, '', `/browse?gender=${savedFilter}`);
      } else {
        window.history.replaceState({}, '', '/browse');
      }
      
      // Restore scroll position
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition));
        
        // Clean up saved state
        sessionStorage.removeItem('browseReturnPage');
        sessionStorage.removeItem('browseScrollPosition');
        sessionStorage.removeItem('browseReturnFilter');
      }, 300);
    }
  }, [loading, profiles.length]);

  // Save scroll position before leaving
  useEffect(() => {
    const handleScroll = () => {
      sessionStorage.setItem('browseScrollPosition', window.pageYOffset.toString());
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const filters = {
        status: 'approved',
      };

      // Force fresh data by adding timestamp to prevent caching
      const data = await getUsers({...filters, _t: Date.now()});
      
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };


  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const filteredProfiles = profiles.filter(profile => {
    // Only show approved and paid profiles
    if (profile.approval_status !== 'approved' || profile.payment_status !== 'paid') {
      return false;
    }
    
    // Filter by marital status only - all filters are marital_status based
    let matchesFilter = true;
    if (genderFilter) {
      if (genderFilter === 'Female') {
        // Female = Unmarried + Female gender
        matchesFilter = profile.marital_status === 'Unmarried' && profile.gender === 'Female';
      } else if (genderFilter === 'Male') {
        // Male = Unmarried + Male gender
        matchesFilter = profile.marital_status === 'Unmarried' && profile.gender === 'Male';
      } else if (genderFilter === 'Divorcee') {
        // Divorcee = Divorced marital status (any gender)
        matchesFilter = profile.marital_status === 'Divorced';
      } else if (genderFilter === 'Widow') {
        // Widow = Widow marital status (any gender)
        matchesFilter = profile.marital_status === 'Widow';
      } else if (genderFilter === 'Widower') {
        // Widower = Widower marital status (any gender)
        matchesFilter = profile.marital_status === 'Widower';
      }
    }
    
    // Search filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = profile.full_name.toLowerCase().includes(searchLower) ||
      profile.register_id.toLowerCase().includes(searchLower);
    
    // Education filter
    const matchesEducation = !educationFilter || 
      (profile.education && profile.education.toLowerCase().includes(educationFilter.toLowerCase()));
    
    // Occupation filter
    const matchesOccupation = !occupationFilter || 
      (profile.occupation && profile.occupation.toLowerCase().includes(occupationFilter.toLowerCase()));
    
    // Income filter
    const matchesIncome = !incomeFilter || 
      (profile.income && profile.income.toLowerCase().includes(incomeFilter.toLowerCase()));
    
    return matchesFilter && matchesSearch && matchesEducation && matchesOccupation && matchesIncome;
  });

  const clearAllFilters = () => {
    setEducationFilter('');
    setOccupationFilter('');
    setIncomeFilter('');
    setCurrentPage(1);
  };

  // Save navigation state when going to profile
  const saveNavigationState = () => {
    sessionStorage.setItem('browseReturnPage', currentPage.toString());
    sessionStorage.setItem('browseScrollPosition', window.pageYOffset.toString());
    sessionStorage.setItem('browseReturnFilter', genderFilter);
  };

  // Copy registration number to clipboard
  const copyRegistrationNumber = async (registerId, e) => {
    if (e) {
      e.stopPropagation(); // Prevent any parent click events
      e.preventDefault(); // Prevent default behavior
    }
    
    const button = e?.currentTarget;
    const originalHTML = button?.innerHTML || '📋';
    
    try {
      await navigator.clipboard.writeText(registerId);
      // Show feedback on button
      if (button) {
        button.innerHTML = '✓';
        button.style.color = '#4ade80';
        button.style.transform = 'scale(1.2)';
        setTimeout(() => {
          button.innerHTML = originalHTML;
          button.style.color = '';
          button.style.transform = '';
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = registerId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        // Show feedback
        if (button) {
          button.innerHTML = '✓';
          button.style.color = '#4ade80';
          button.style.transform = 'scale(1.2)';
          setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.color = '';
            button.style.transform = '';
          }, 1500);
        }
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
    }
  };

  const activeFiltersCount = [educationFilter, occupationFilter, incomeFilter].filter(f => f).length;

  // Pagination logic
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = filteredProfiles.slice(indexOfFirstProfile, indexOfLastProfile);
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);

  // Reset to page 1 if current page is greater than total pages
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Reset to page 1 when gender filter changes (fresh navigation)
  useEffect(() => {
    const isReturning = sessionStorage.getItem('browseScrollPosition');
    if (!isReturning) {
      setCurrentPage(1);
    }
  }, [genderFilter]);

  // Reset to page 1 when other filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, educationFilter, occupationFilter, incomeFilter]);

  return (
    <div className="browse-page">
      {/* Beautiful Header with Quick Links, Search & Filter */}
      <div className="browse-header">
        <div className="container">
          <div className="header-main-section">
            {/* Debug Info */}
            {/* <div style={{color: 'red', fontSize: '12px', marginBottom: '10px', textAlign: 'center'}}>
              Debug: Current Filter = "{genderFilter}" | Total Profiles = {profiles.length} | Filtered Profiles = {filteredProfiles.length}
            </div> */}
            
            {/* Left Side - Quick Filter Links */}
            <div className="quick-filter-links">
              <Link
                to="/browse?gender=Female"
                className={`quick-link ${genderFilter === 'Female' ? 'active' : ''} ${language === 'mr' ? 'marathi-text' : ''}`}
              >
                <span className="link-icon">👰</span>
                <span className="link-text">{t('female')}</span>
              </Link>
              <Link
                to="/browse?gender=Male"
                className={`quick-link ${genderFilter === 'Male' ? 'active' : ''} ${language === 'mr' ? 'marathi-text' : ''}`}
              >
                <span className="link-icon">🤵</span>
                <span className="link-text">{t('male')}</span>
              </Link>
              <Link
                to="/browse?gender=Divorcee"
                className={`quick-link ${genderFilter === 'Divorcee' ? 'active' : ''} ${language === 'mr' ? 'marathi-text' : ''}`}
              >
                <span className="link-icon">💔</span>
                <span className="link-text">{t('divorcee')}</span>
              </Link>
              <Link
                to="/browse?gender=Widow"
                className={`quick-link ${genderFilter === 'Widow' ? 'active' : ''} ${language === 'mr' ? 'marathi-text' : ''}`}
              >
                <span className="link-icon">🕊️</span>
                <span className="link-text">{t('widow')}</span>
              </Link>
              <Link
                to="/browse?gender=Widower"
                className={`quick-link ${genderFilter === 'Widower' ? 'active' : ''} ${language === 'mr' ? 'marathi-text' : ''}`}
              >
                <span className="link-icon">🕊️</span>
                <span className="link-text">{t('widower')}</span>
              </Link>
            </div>

            {/* Right Side - Search, Filter & Count */}
            <div className="search-filter-group">
              {/* Search Box */}
              <div className="search-box-compact">
                <span className="search-icon">🔎</span>
                <input
                  type="text"
                  className="search-input"
                  placeholder={language === 'en' ? 'Search by name or ID...' : 'नाव किंवा ID ने शोधा...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="btn-clear-search-inline">✕</button>
                )}
              </div>

              {/* Filter Button */}
              <button
                onClick={() => setShowFilterModal(true)}
                className={`btn-filter-main ${activeFiltersCount > 0 ? 'has-filters' : ''}`}
              >
                <span className="filter-icon">🔍</span>
                <span className="filter-text">
                  {language === 'en' ? 'Filters' : 'फिल्टर'}
                  {activeFiltersCount > 0 && (
                    <span className="filter-count-badge">{activeFiltersCount}</span>
                  )}
                </span>
              </button>

              {/* Clear Filters Button (Shows when filters are active) */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="btn-clear-filters-main"
                >
                  <span className="clear-icon">✕</span>
                  <span className="clear-text">
                    {language === 'en' ? 'Clear' : 'साफ करा'}
                  </span>
                </button>
              )}

              {/* Results Count */}
              {!loading && (
                <div className="results-info">
                  <span className="results-badge">
                    {filteredProfiles.length} {language === 'en' ? 'profiles' : 'प्रोफाइल'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="filter-modal-overlay" onClick={() => setShowFilterModal(false)}>
          <div className="filter-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {language === 'en' ? '🔍 Filter Profiles' : '🔍 प्रोफाइल फिल्टर करा'}
              </h3>
              <button onClick={() => setShowFilterModal(false)} className="btn-close-modal">✕</button>
            </div>
            
            <div className="modal-body">
              {/* Education Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  {language === 'en' ? '🎓 Education' : '🎓 शिक्षण'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g., Graduate, MBA' : 'उदा. पदवीधर, MBA'}
                  value={educationFilter}
                  onChange={(e) => setEducationFilter(e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Occupation Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  {language === 'en' ? '💼 Occupation' : '💼 व्यवसाय'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g., Engineer, Doctor' : 'उदा. अभियंता, डॉक्टर'}
                  value={occupationFilter}
                  onChange={(e) => setOccupationFilter(e.target.value)}
                  className="filter-input"
                />
              </div>

              {/* Income Filter */}
              <div className="filter-group">
                <label className="filter-label">
                  {language === 'en' ? '💰 Income' : '💰 उत्पन्न'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'en' ? 'e.g., 5 LPA, 10 LPA' : 'उदा. 5 लाख, 10 लाख'}
                  value={incomeFilter}
                  onChange={(e) => setIncomeFilter(e.target.value)}
                  className="filter-input"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={clearAllFilters} className="btn-clear">
                {language === 'en' ? 'Clear All' : 'सर्व साफ करा'}
              </button>
              <button onClick={() => setShowFilterModal(false)} className="btn-apply">
                {language === 'en' ? 'Apply Filters' : 'फिल्टर लागू करा'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profiles Section with Background */}
      <div className="profiles-section-wrapper">
        <div className="container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">
                {language === 'en' ? 'Loading profiles...' : 'प्रोफाइल लोड होत आहेत...'}
              </p>
            </div>
          ) : filteredProfiles.length === 0 ? (
            <div className="no-profiles">
              <p>{t('noProfilesFound')}</p>
            </div>
          ) : (
            <>
              <div className="profiles-grid">
              {currentProfiles.map(profile => (
              <div key={profile.id} className="profile-card card">
                <div className="card-top-section">
                  <div className="register-id-container">
                    <span 
                      className="register-id-badge"
                      title={profile.register_id}
                    >
                      {profile.register_id}
                    </span>
                    <button
                      className="copy-btn-small"
                      onClick={(e) => copyRegistrationNumber(profile.register_id, e)}
                      title={language === 'en' ? 'Copy registration number' : 'नोंदणी क्रमांक कॉपी करा'}
                      data-register-id={profile.register_id}
                    >
                      📋
                    </button>
                  </div>
                  <Link 
                    to={`/profile/${profile.id}`} 
                    className="btn-view-profile"
                    onClick={saveNavigationState}
                  >
                    {language === 'en' ? 'View Profile' : 'प्रोफाइल पहा'}
                  </Link>
                </div>

                <div className="card-content">
                  <Link 
                    to={`/profile/${profile.id}`}
                    onClick={saveNavigationState}
                    className="profile-image-wrapper"
                  >
                    <div className="profile-image">
                      {profile.photos && profile.photos.length > 0 ? (
                        <>
                          <img
                            src={`${UPLOADS_URL}/${profile.photos[0]}`}
                            alt={profile.full_name}
                          />
                          {profile.photos.length > 1 && (
                            <div className="photo-count-badge">
                              📸 {profile.photos.length}
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="no-image">
                          {profile.gender === 'Male' ? '👨' : '👩'}
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="profile-info">
                    <h3 className="profile-name">{profile.full_name}</h3>
                    
                    <div className="profile-details-list">
                      {profile.date_of_birth && (
                        <div className="detail-row">
                          <span className="detail-label">{language === 'en' ? 'Birth Date' : 'जन्मतारीख'}:</span>
                          <span className="detail-value">{formatDate(profile.date_of_birth)}</span>
                        </div>
                      )}
                      
                      {profile.height && (
                        <div className="detail-row">
                          <span className="detail-label">{language === 'en' ? 'Height' : 'उंची'}:</span>
                          <span className="detail-value">{profile.height}</span>
                        </div>
                      )}
                      
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
                    </div>
                  </div>
                </div>
              </div>
            ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button 
                    onClick={prevPage} 
                    disabled={currentPage === 1}
                    className="pagination-btn pagination-prev"
                  >
                    <span className="pagination-arrow">←</span>
                    <span className="pagination-text">{language === 'en' ? 'Previous' : 'मागील'}</span>
                  </button>

                  <div className="pagination-numbers">
                    {/* First page */}
                    {currentPage > 2 && (
                      <>
                        <button onClick={() => paginate(1)} className="pagination-number">
                          1
                        </button>
                        {currentPage > 3 && <span className="pagination-dots">...</span>}
                      </>
                    )}

                    {/* Current page and neighbors */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === currentPage || 
                        page === currentPage - 1 || 
                        page === currentPage + 1
                      )
                      .map(page => (
                        <button
                          key={page}
                          onClick={() => paginate(page)}
                          className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                        >
                          {page}
                        </button>
                      ))
                    }

                    {/* Last page */}
                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <span className="pagination-dots">...</span>}
                        <button onClick={() => paginate(totalPages)} className="pagination-number">
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={nextPage} 
                    disabled={currentPage === totalPages}
                    className="pagination-btn pagination-next"
                  >
                    <span className="pagination-text">{language === 'en' ? 'Next' : 'पुढील'}</span>
                    <span className="pagination-arrow">→</span>
                  </button>
                </div>
              )}

              {/* Page Info */}
              {totalPages > 1 && (
                <div className="page-info">
                  {language === 'en' 
                    ? `Showing ${indexOfFirstProfile + 1}-${Math.min(indexOfLastProfile, filteredProfiles.length)} of ${filteredProfiles.length} profiles` 
                    : `${indexOfFirstProfile + 1}-${Math.min(indexOfLastProfile, filteredProfiles.length)} पैकी ${filteredProfiles.length} प्रोफाइल दाखवत आहे`
                  }
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Browse;

