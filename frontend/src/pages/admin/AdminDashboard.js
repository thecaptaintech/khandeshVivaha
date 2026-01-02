import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  getUsers, 
  getAdminUsersList,
  getDashboardStats, 
  approveUser, 
  rejectUser, 
  updatePaymentStatus,
  deleteUser,
  updateUser,
  getSettings,
  updateSettings,
  getAdminUsers,
  createAdminUser,
  updateUserStatus,
  deleteAdminUser,
    updateUserPassword,
  getUserById
} from '../../services/api';
import { UPLOADS_URL } from '../../services/api';
import api from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { logout, isAuthenticated, admin } = useAuth();
  const navigate = useNavigate();
  
  // Check if current user is admin
  // Check role === 'admin' OR username === 'admin' (fallback for legacy users)
  const isAdmin = admin ? (admin.role === 'admin' || admin.username === 'admin' || admin.username?.toLowerCase() === 'admin') : false;
  
  // Debug: Log admin info (remove in production)
  useEffect(() => {
    if (admin) {
      console.log('🔍 Admin Debug:', {
        admin,
        role: admin.role,
        username: admin.username,
        isAdmin: isAdmin
      });
    }
  }, [admin, isAdmin]);
  
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    paid: 0,
    unpaid: 0
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    gender: '',
    maritalStatus: '',
    paymentStatus: '',
    registrationType: '',
    search: ''
  });

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  
  // Settings state
  const [settings, setSettings] = useState({
    payment_qr_code: null,
    contact_whatsapp: '',
    contact_email: 'info@khandeshmatrimony.com',
    upi_id: '',
    registration_fee: '',
    banner_text_english: 'Khandesh Matrimony is a matchmaking service only. Please verify all details independently before marriage.',
    banner_text_marathi: 'खान्देश मॅट्रिमनी ही केवळ ओळख करून देणारी सेवा आहे. विवाह ठरवण्याआधी सर्व माहिती स्वतः पडताळून घ्या.'
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // User/Agent Management State
  const [adminUsers, setAdminUsers] = useState([]);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    email: '',
    mobile_number: '',
    role: 'agent'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [userManagementLoading, setUserManagementLoading] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getDashboardStats(),
        getAdminUsersList({ status: activeTab }) // Use admin endpoint to see all users
      ]);
      
      setStats(statsData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        logout();
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated()) {
      if (activeTab === 'settings') {
        fetchSettings();
      } else if (activeTab === 'user-management') {
        fetchAdminUsers();
      } else if (activeTab !== 'user-management' && activeTab !== 'settings') {
        fetchUsers();
        setCurrentPage(1); // Reset to first page when tab changes
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  
  // Separate effect for filters (only for user list, not admin users)
  useEffect(() => {
    if (isAuthenticated() && activeTab !== 'settings' && activeTab !== 'user-management') {
      fetchUsers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);
  
  // Prevent modal flickering by memoizing modal state
  const handleCloseModal = React.useCallback(() => {
    setShowCreateUserModal(false);
    setNewUser({ username: '', password: '', email: '', mobile_number: '', role: 'agent' });
    setShowPassword(false);
  }, []);
  
  const fetchSettings = async () => {
    setSettingsLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };
  
  const handleSettingsChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleQrCodeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setQrCodeFile(file);
    }
  };

  // User/Agent Management Functions
  const fetchAdminUsers = async () => {
    setUserManagementLoading(true);
    try {
      const data = await getAdminUsers();
      console.log('Fetched admin users:', data);
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
      alert(`Error fetching users: ${errorMessage}`);
      setAdminUsers([]);
    } finally {
      setUserManagementLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e?.preventDefault();
    
    if (!newUser.username || !newUser.password) {
      alert('Username and password are required');
      return;
    }

    if (newUser.username.trim().length < 3) {
      alert('Username must be at least 3 characters long');
      return;
    }

    if (newUser.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setUserManagementLoading(true);
    try {
      console.log('Creating user:', newUser);
      const response = await createAdminUser(newUser);
      console.log('User created:', response);
      alert('User created successfully!');
      handleCloseModal();
      await fetchAdminUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create user';
      alert(`Error creating user: ${errorMessage}`);
    } finally {
      setUserManagementLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    if (!window.confirm(`Are you sure you want to ${newStatus === 'blocked' ? 'block' : 'activate'} this user?`)) {
      return;
    }

    try {
      await updateUserStatus(userId, newStatus);
      alert(`User ${newStatus === 'blocked' ? 'blocked' : 'activated'} successfully!`);
      fetchAdminUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Error updating user status: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteAdminUser(userId);
      alert('User deleted successfully!');
      fetchAdminUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + (error.response?.data?.message || error.message));
    }
  };
  
  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    setSettingsSaved(false);
    try {
      let qrCodePath = settings.payment_qr_code;
      
      // Upload QR code if new file selected
      if (qrCodeFile) {
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('qr_code', qrCodeFile);
          
          // Don't set Content-Type header - let axios set it automatically with boundary
          const uploadResponse = await api.post('/admin/upload-qr', uploadFormData);
          
          if (uploadResponse.data && uploadResponse.data.qr_code_path) {
            qrCodePath = uploadResponse.data.qr_code_path;
          } else {
            throw new Error('QR code upload failed - no path returned');
          }
        } catch (uploadError) {
          console.error('QR code upload error:', uploadError);
          const errorMessage = uploadError.response?.data?.message || uploadError.response?.data?.detail || uploadError.message || 'Unknown error';
          alert(`Error uploading QR code: ${errorMessage}`);
          setSettingsLoading(false);
          return;
        }
      }
      
      // Prepare settings to update (only text fields, QR code path will be included)
      const settingsToUpdate = {
        contact_whatsapp: settings.contact_whatsapp || '',
        contact_email: settings.contact_email || '',
        upi_id: settings.upi_id || '',
        registration_fee: settings.registration_fee || '',
        payment_qr_code: qrCodePath || null,
        banner_text_english: settings.banner_text_english || '',
        banner_text_marathi: settings.banner_text_marathi || ''
      };
      
      await updateSettings(settingsToUpdate);
      setSettingsSaved(true);
      setQrCodeFile(null);
      setTimeout(() => setSettingsSaved(false), 3000);
      
      // Refresh settings to get updated values
      await fetchSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(`Error saving settings: ${error.response?.data?.message || error.message || 'Please try again.'}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const queryParams = { status: activeTab };
      if (filters.gender) queryParams.gender = filters.gender;
      if (filters.search) queryParams.search = filters.search;
      
      const data = await getAdminUsersList(queryParams); // Use admin endpoint to see all users
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Filter users based on filters
  const getFilteredUsers = () => {
    let filtered = users;

    if (filters.gender) {
      filtered = filtered.filter(user => user.gender === filters.gender);
    }

    if (filters.maritalStatus) {
      filtered = filtered.filter(user => user.marital_status === filters.maritalStatus);
    }

    if (filters.paymentStatus) {
      filtered = filtered.filter(user => user.payment_status === filters.paymentStatus);
    }

    if (filters.registrationType) {
      filtered = filtered.filter(user => user.registration_type === filters.registrationType);
    }

    return filtered;
  };

  // Pagination logic
  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      fetchData();
    } catch (error) {
      console.error('Error approving user:', error);
      alert('Failed to approve user');
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectUser(id);
      fetchData();
    } catch (error) {
      console.error('Error rejecting user:', error);
      alert('Failed to reject user');
    }
  };

  const handlePaymentStatus = async (id, status) => {
    try {
      await updatePaymentStatus(id, status);
      fetchData();
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Failed to update payment status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteUser(id);
        fetchData();
        alert('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleEdit = async (user) => {
    try {
      // Fetch full user data to ensure we have expiry_date and status
      const fullUserData = await getUserById(user.id);
      console.log('📋 Full user data fetched:', { id: fullUserData.id, expiry_date: fullUserData.expiry_date, status: fullUserData.status });
      
      setEditingUser(fullUserData);
      
      // Split full_name into first_name and surname if needed
      const nameParts = fullUserData.full_name ? fullUserData.full_name.split(' ') : ['', ''];
      const firstName = nameParts[0] || '';
      const surname = nameParts.slice(1).join(' ') || '';
      
      // Format date_of_birth to YYYY-MM-DD format
      let formattedDate = '';
      if (fullUserData.date_of_birth) {
        if (fullUserData.date_of_birth instanceof Date) {
          const year = fullUserData.date_of_birth.getUTCFullYear();
          const month = String(fullUserData.date_of_birth.getUTCMonth() + 1).padStart(2, '0');
          const day = String(fullUserData.date_of_birth.getUTCDate()).padStart(2, '0');
          formattedDate = `${year}-${month}-${day}`;
        } else {
          const dateStr = String(fullUserData.date_of_birth);
          const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            formattedDate = dateMatch[0];
          } else {
            formattedDate = dateStr.split('T')[0].split(' ')[0];
          }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
            formattedDate = '';
          }
        }
      }
      
      // Format expiry_date to YYYY-MM-DD format
      let formattedExpiryDate = '';
      if (fullUserData.expiry_date) {
        if (fullUserData.expiry_date instanceof Date) {
          const year = fullUserData.expiry_date.getUTCFullYear();
          const month = String(fullUserData.expiry_date.getUTCMonth() + 1).padStart(2, '0');
          const day = String(fullUserData.expiry_date.getUTCDate()).padStart(2, '0');
          formattedExpiryDate = `${year}-${month}-${day}`;
        } else {
          const dateStr = String(fullUserData.expiry_date);
          const dateMatch = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
          if (dateMatch) {
            formattedExpiryDate = dateMatch[0];
          } else {
            formattedExpiryDate = dateStr.split('T')[0].split(' ')[0];
          }
          if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedExpiryDate)) {
            formattedExpiryDate = '';
          }
        }
      }
      console.log('✅ Formatted expiry_date:', formattedExpiryDate);
      
      setEditFormData({ 
        ...fullUserData,
        first_name: firstName,
        surname: surname,
        date_of_birth: formattedDate,
        expiry_date: formattedExpiryDate,
        status: fullUserData.status || 'active'
      });
    } catch (error) {
      console.error('Error fetching user details:', error);
      alert('Failed to load user details for editing');
    }
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Validate age (18+)
      if (editFormData.date_of_birth) {
        const birthDate = new Date(editFormData.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        
        let actualAge = age;
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          actualAge = age - 1;
        }
        
        if (actualAge < 18) {
          alert('Date of Birth: User must be 18 years or older to register.');
          return;
        }
      }
      
      // Combine first_name and surname into full_name
      const dataToUpdate = { ...editFormData };
      if (dataToUpdate.first_name || dataToUpdate.surname) {
        dataToUpdate.full_name = `${dataToUpdate.first_name || ''} ${dataToUpdate.surname || ''}`.trim();
      }
      
      // Ensure date_of_birth is in YYYY-MM-DD format (date input already provides this)
      if (dataToUpdate.date_of_birth) {
        // Extract just the date part if it's in ISO format
        const dateStr = String(dataToUpdate.date_of_birth);
        dataToUpdate.date_of_birth = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      }
      
      // Ensure expiry_date is in YYYY-MM-DD format (always include, even if null/empty)
      if (dataToUpdate.expiry_date) {
        const dateStr = String(dataToUpdate.expiry_date);
        dataToUpdate.expiry_date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
      } else {
        // Explicitly set to null if not provided
        dataToUpdate.expiry_date = null;
      }
      
      // Ensure status is always set (default to 'active' if not provided)
      if (!dataToUpdate.status) {
        dataToUpdate.status = 'active';
      }
      
      // Log expiry_date and status to ensure they're included
      console.log('📋 expiry_date in payload:', dataToUpdate.expiry_date);
      console.log('📋 status in payload:', dataToUpdate.status);
      
      // Remove first_name and surname from the update data (they don't exist in DB)
      delete dataToUpdate.first_name;
      delete dataToUpdate.surname;
      
      // Remove fields that shouldn't be updated
      delete dataToUpdate.id;
      delete dataToUpdate.register_id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.created_by;
      delete dataToUpdate.updated_at;
      delete dataToUpdate.photos;
      delete dataToUpdate.biodata_file;
      delete dataToUpdate.registration_type;
      
      // Log what we're sending
      console.log('📤 Sending update with fields:', Object.keys(dataToUpdate));
      console.log('📤 Update data sample:', JSON.stringify(dataToUpdate, null, 2).substring(0, 500));
      
      await updateUser(editingUser.id, dataToUpdate);
      setEditingUser(null);
      fetchData();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      console.error('Error response data:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.detail || error.response?.data?.sqlMessage || error.message;
      alert('Failed to update user: ' + errorMessage);
    }
  };

  const closeEditModal = () => {
    setEditingUser(null);
    setEditFormData({});
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
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
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <h1 className="dashboard-title">
              🎯 {t('dashboard')}
            </h1>
            <button onClick={handleLogout} className="btn btn-danger">
              {t('logout')}
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Statistics Cards */}
        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-icon pending">⏳</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.pending}</h3>
              <p className="stat-label">{t('pendingApprovals')}</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon approved">✅</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.approved}</h3>
              <p className="stat-label">{t('approvedProfiles')}</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon rejected">❌</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.rejected}</h3>
              <p className="stat-label">{t('rejectedProfiles')}</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon paid">💰</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.paid}</h3>
              <p className="stat-label">{t('paidUsers')}</p>
            </div>
          </div>

          <div className="stat-card card">
            <div className="stat-icon unpaid">💳</div>
            <div className="stat-info">
              <h3 className="stat-number">{stats.unpaid}</h3>
              <p className="stat-label">{t('unpaidUsers')}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <div className="tabs">
            <button
              className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              {t('pending')} ({stats.pending})
            </button>
            <button
              className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
              onClick={() => setActiveTab('approved')}
            >
              {t('approved')} ({stats.approved})
            </button>
            <button
              className={`tab ${activeTab === 'rejected' ? 'active' : ''}`}
              onClick={() => setActiveTab('rejected')}
            >
              {t('rejected')} ({stats.rejected})
            </button>
            <button
              className={`tab ${activeTab === 'user-management' ? 'active' : ''}`}
              onClick={() => setActiveTab('user-management')}
              style={{ display: isAdmin ? 'inline-block' : 'none' }}
            >
              👥 User Management
            </button>
            <button
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
              style={{ display: isAdmin ? 'inline-block' : 'none' }}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Settings Tab Content */}
        {activeTab === 'settings' ? (
          <div className="settings-section card">
            <h3 className="filters-title">⚙️ Registration Success Page Settings</h3>
            {settingsSaved && (
              <div className="alert alert-success" style={{background: '#d1fae5', color: '#065f46', padding: '12px', borderRadius: '8px', marginBottom: '20px'}}>
                ✅ Settings saved successfully!
              </div>
            )}
            
            {settingsLoading ? (
              <p>Loading settings...</p>
            ) : (
              <div className="settings-form">
                <div className="filter-group" style={{marginBottom: '20px'}}>
                  <label className="filter-label">Payment QR Code:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrCodeUpload}
                    className="filter-input"
                  />
                  {settings.payment_qr_code && !qrCodeFile && (
                    <div style={{marginTop: '10px'}}>
                      <p style={{fontSize: '14px', color: '#666', marginBottom: '5px'}}>Current QR Code:</p>
                      <img 
                        src={`${UPLOADS_URL}/${settings.payment_qr_code}`} 
                        alt="QR Code" 
                        style={{maxWidth: '200px', border: '1px solid #ddd', borderRadius: '8px'}}
                      />
                    </div>
                  )}
                  {qrCodeFile && (
                    <div style={{marginTop: '10px'}}>
                      <p style={{fontSize: '14px', color: '#666'}}>New file selected: {qrCodeFile.name}</p>
                    </div>
                  )}
                </div>
                
                <div className="filter-group" style={{marginBottom: '20px'}}>
                  <label className="filter-label">Contact/WhatsApp Number:</label>
                  <input
                    type="text"
                    className="filter-input"
                    value={settings.contact_whatsapp || ''}
                    onChange={(e) => handleSettingsChange('contact_whatsapp', e.target.value)}
                    placeholder="9167681454"
                  />
                </div>
                
                <div className="filter-group" style={{marginBottom: '20px'}}>
                  <label className="filter-label">Contact Email:</label>
                  <input
                    type="email"
                    className="filter-input"
                    value={settings.contact_email || ''}
                    onChange={(e) => handleSettingsChange('contact_email', e.target.value)}
                    placeholder="info@khandeshmatrimony.com"
                  />
                </div>
                
                <div className="filter-group" style={{marginBottom: '20px'}}>
                  <label className="filter-label">UPI ID:</label>
                  <input
                    type="text"
                    className="filter-input"
                    value={settings.upi_id || ''}
                    onChange={(e) => handleSettingsChange('upi_id', e.target.value)}
                    placeholder="9167681454@ybl"
                  />
                </div>
                
                <div className="filter-group" style={{marginBottom: '20px'}}>
                  <label className="filter-label">Registration Fee:</label>
                  <input
                    type="text"
                    className="filter-input"
                    value={settings.registration_fee || ''}
                    onChange={(e) => handleSettingsChange('registration_fee', e.target.value)}
                    placeholder="₹1500 (6 months)"
                  />
                </div>

                <div style={{borderTop: '2px solid #e5e7eb', paddingTop: '20px', marginTop: '30px', marginBottom: '20px'}}>
                  <h4 style={{fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1f2937'}}>📢 Banner Text Settings</h4>
                  
                  <div className="filter-group" style={{marginBottom: '20px'}}>
                    <label className="filter-label">Banner Text (English):</label>
                    <textarea
                      className="filter-input"
                      rows="3"
                      value={settings.banner_text_english || ''}
                      onChange={(e) => handleSettingsChange('banner_text_english', e.target.value)}
                      placeholder="Khandesh Matrimony is a matchmaking service only. Please verify all details independently before marriage."
                      style={{resize: 'vertical', minHeight: '80px'}}
                    />
                  </div>
                  
                  <div className="filter-group" style={{marginBottom: '20px'}}>
                    <label className="filter-label">Banner Text (Marathi):</label>
                    <textarea
                      className="filter-input"
                      rows="3"
                      value={settings.banner_text_marathi || ''}
                      onChange={(e) => handleSettingsChange('banner_text_marathi', e.target.value)}
                      placeholder="खान्देश मॅट्रिमनी ही केवळ ओळख करून देणारी सेवा आहे. विवाह ठरवण्याआधी सर्व माहिती स्वतः पडताळून घ्या."
                      style={{resize: 'vertical', minHeight: '80px', fontFamily: 'Noto Sans Devanagari, Mukta, Arial Unicode MS, sans-serif'}}
                    />
                  </div>
                </div>
                
                <button 
                  className="btn btn-primary" 
                  onClick={handleSaveSettings}
                  disabled={settingsLoading}
                  style={{padding: '12px 30px', fontSize: '16px', fontWeight: '600'}}
                >
                  {settingsLoading ? 'Saving...' : '💾 Save Settings'}
                </button>
              </div>
            )}
          </div>
        ) : activeTab === 'user-management' ? (
          <div className="user-management-section card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h3 className="filters-title">👥 User/Agent Management</h3>
              <button
                className="btn btn-primary"
                onClick={() => setShowCreateUserModal(true)}
                style={{padding: '10px 20px', fontSize: '14px'}}
              >
                ➕ Create New User
              </button>
            </div>

            {userManagementLoading ? (
              <p>Loading users...</p>
            ) : (
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Created By</th>
                      <th>Created At</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.email || 'N/A'}</td>
                        <td>{user.mobile_number || 'N/A'}</td>
                        <td>
                          <span className={`badge badge-${user.role === 'admin' ? 'success' : 'info'}`}>
                            {user.role || 'agent'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${user.status === 'active' ? 'success' : 'danger'}`}>
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td>{user.created_by_name || 'System'}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td>
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button
                              className={`btn-icon ${user.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                              onClick={() => handleToggleUserStatus(user.id, user.status)}
                              title={user.status === 'active' ? 'Block User' : 'Activate User'}
                            >
                              {user.status === 'active' ? '🚫' : '✅'}
                            </button>
                            <button
                              className="btn-icon btn-delete"
                              onClick={() => handleDeleteUser(user.id)}
                              title="Delete User"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {adminUsers.length === 0 && (
                  <p style={{textAlign: 'center', padding: '20px', color: '#666'}}>No users found</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <React.Fragment>
        {/* Filter Section */}
        <div className="filters-section card">
          <h3 className="filters-title">🔍 Filters</h3>
          <div className="filters-grid">
            <div className="filter-group">
              <label className="filter-label">Search:</label>
              <input
                type="text"
                className="filter-input"
                placeholder="Search by name or ID..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Gender:</label>
              <select
                className="filter-select"
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
              >
                <option value="">All</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Marital Status:</label>
              <select
                className="filter-select"
                value={filters.maritalStatus}
                onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
              >
                <option value="">All</option>
                <option value="Unmarried">Unmarried</option>
                <option value="Divorced">Divorced</option>
                <option value="Widow">Widow</option>
                <option value="Widower">Widower</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Payment Status:</label>
              <select
                className="filter-select"
                value={filters.paymentStatus}
                onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
              >
                <option value="">All</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Registration Type:</label>
              <select
                className="filter-select"
                value={filters.registrationType}
                onChange={(e) => handleFilterChange('registrationType', e.target.value)}
              >
                <option value="">All</option>
                <option value="form">Form</option>
                <option value="biodata">Biodata Upload</option>
              </select>
            </div>

            <div className="filter-group">
              <button 
                className="btn-reset-filters"
                onClick={() => setFilters({ gender: '', maritalStatus: '', paymentStatus: '', registrationType: '', search: '' })}
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          <div className="results-info">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} results
          </div>
        </div>

        {/* Users Table */}
        <div className="users-section card">
          {loading ? (
            <div className="spinner"></div>
          ) : filteredUsers.length === 0 ? (
            <p className="no-data">No users found</p>
          ) : (
            <>
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Marital Status</th>
                      <th>Age</th>
                      <th>Education</th>
                      <th>Contact</th>
                      <th>{t('paymentStatus')}</th>
                      <th>Type</th>
                      <th>{t('registeredOn')}</th>
                      <th>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map(user => (
                    <tr key={user.id}>
                      <td className="id-cell">{user.register_id}</td>
                      <td className="name-cell">{user.full_name}</td>
                      <td>{user.gender}</td>
                      <td>{user.marital_status || 'N/A'}</td>
                      <td>{calculateAge(user.date_of_birth)}</td>
                      <td>{user.education || 'N/A'}</td>
                      <td>{user.contact_number}</td>
                      <td>
                        <span className={`badge badge-${user.payment_status === 'paid' ? 'success' : 'warning'}`}>
                          {t(user.payment_status)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${user.registration_type === 'biodata' ? 'info' : 'secondary'}`}>
                          {user.registration_type === 'biodata' ? '📄 Biodata' : '📝 Form'}
                        </span>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-edit"
                            onClick={() => handleEdit(user)}
                            title="Edit Details"
                          >
                            ✏️
                          </button>

                          {(activeTab === 'pending' || activeTab === 'rejected') && (
                            <>
                              <button
                                className={`btn-icon btn-success ${user.payment_status !== 'paid' ? 'btn-disabled' : ''}`}
                                onClick={() => {
                                  if (user.payment_status === 'paid') {
                                    handleApprove(user.id);
                                  } else {
                                    alert('User must be paid before approval. Please mark as paid first.');
                                  }
                                }}
                                title={user.payment_status === 'paid' ? t('approve') : 'User must be paid before approval'}
                                disabled={user.payment_status !== 'paid'}
                              >
                                ✓
                              </button>
                              {activeTab === 'pending' && (
                                <button
                                  className="btn-icon btn-reject"
                                  onClick={() => handleReject(user.id)}
                                  title={t('reject')}
                                >
                                  ✕
                                </button>
                              )}
                            </>
                          )}
                          
                          {user.payment_status === 'unpaid' ? (
                            <button
                              className="btn-icon btn-paid"
                              onClick={() => handlePaymentStatus(user.id, 'paid')}
                              title={t('markAsPaid')}
                            >
                              💰
                            </button>
                          ) : (
                            <button
                              className="btn-icon btn-unpaid"
                              onClick={() => handlePaymentStatus(user.id, 'unpaid')}
                              title={t('markAsUnpaid')}
                            >
                              💳
                            </button>
                          )}
                          
                          <button
                            className="btn-icon btn-delete"
                            onClick={() => handleDelete(user.id)}
                            title={t('delete')}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={prevPage}
                  disabled={currentPage === 1}
                >
                  ← Previous
                </button>

                <div className="pagination-numbers">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show first page, last page, current page, and pages around current
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
                          onClick={() => goToPage(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="pagination-dots">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  className="pagination-btn"
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                >
                  Next →
                </button>
              </div>
            )}
          </>
          )}
        </div>
          </React.Fragment>
        )}

      {/* Edit Modal */}
      {editingUser && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ Edit Profile - {editingUser.register_id}</h2>
              <button className="modal-close" onClick={closeEditModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Show Biodata PDF if exists */}
              {editingUser.biodata_file && (
                <div className="biodata-section">
                  <h3 className="section-title">📄 Uploaded Biodata</h3>
                  <div className="biodata-viewer">
                    <a 
                      href={`${UPLOADS_URL}/${editingUser.biodata_file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-view-biodata"
                    >
                      📄 View Biodata File
                    </a>
                    <p className="biodata-note">Open in new tab to view and fill details below</p>
                  </div>
                </div>
              )}

              {/* Show Photos */}
              {editingUser.photos && editingUser.photos.length > 0 && (
                <div className="photos-section">
                  <h3 className="section-title">📸 Uploaded Photos ({editingUser.photos.length})</h3>
                  <p className="photos-note">Click on any photo to view full size</p>
                  <div className="photos-grid-modal">
                    {editingUser.photos.map((photo, index) => (
                      <a 
                        key={index} 
                        href={`${UPLOADS_URL}/${photo}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="photo-item-modal"
                      >
                        <img 
                          src={`${UPLOADS_URL}/${photo}`}
                          alt={`Photo ${index + 1}`}
                        />
                        {index === 0 && <span className="primary-label">Primary</span>}
                        <div className="photo-overlay">
                          <span className="view-icon">🔍</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Edit Form - All Registration Fields */}
              <div className="edit-form">
                <h3 className="section-title">📝 Complete Profile Details</h3>
                
                {/* Primary Information */}
                <h4 className="subsection-title">Primary Information</h4>
                <div className="form-grid-modal">
                  <div className="form-group-modal">
                    <label>First Name:</label>
                    <input
                      type="text"
                      name="first_name"
                      value={editFormData.first_name || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Surname:</label>
                    <input
                      type="text"
                      name="surname"
                      value={editFormData.surname || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Kul:</label>
                    <input
                      type="text"
                      name="kul"
                      value={editFormData.kul || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Gender:</label>
                    <select
                      name="gender"
                      value={editFormData.gender || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>

                  <div className="form-group-modal">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Mobile No 1:</label>
                    <input
                      type="tel"
                      name="mobile_no_1"
                      value={editFormData.mobile_no_1 || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Mobile No 2:</label>
                    <input
                      type="tel"
                      name="mobile_no_2"
                      value={editFormData.mobile_no_2 || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Birth Village:</label>
                    <input
                      type="text"
                      name="birth_village"
                      value={editFormData.birth_village || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Birth District:</label>
                    <input
                      type="text"
                      name="birth_district"
                      value={editFormData.birth_district || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Birth Date (Must be 18+ years):</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editFormData.date_of_birth || ''}
                      onChange={handleEditFormChange}
                      max={(() => {
                        const today = new Date();
                        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
                        return maxDate.toISOString().split('T')[0];
                      })()}
                      min={(() => {
                        const today = new Date();
                        const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());
                        return minDate.toISOString().split('T')[0];
                      })()}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Birth Time:</label>
                    <input
                      type="time"
                      name="birth_time"
                      value={editFormData.birth_time || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal full-width">
                    <label>Company/Office Address:</label>
                    <input
                      type="text"
                      name="company_address"
                      value={editFormData.company_address || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal full-width">
                    <label>Permanent Address:</label>
                    <textarea
                      name="permanent_address"
                      value={editFormData.permanent_address || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                      rows="2"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Current Residence:</label>
                    <input
                      type="text"
                      name="current_residence"
                      value={editFormData.current_residence || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Marital Status:</label>
                    <select
                      name="marital_status"
                      value={editFormData.marital_status || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Unmarried">Unmarried</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widow">Widow</option>
                      <option value="Widower">Widower</option>
                    </select>
                  </div>

                  <div className="form-group-modal">
                    <label>Native District:</label>
                    <input
                      type="text"
                      name="native_district"
                      value={editFormData.native_district || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Native Village & Taluka:</label>
                    <input
                      type="text"
                      name="native_village_taluka"
                      value={editFormData.native_village_taluka || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Occupation:</label>
                    <input
                      type="text"
                      name="occupation"
                      value={editFormData.occupation || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Education:</label>
                    <input
                      type="text"
                      name="education"
                      value={editFormData.education || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Income:</label>
                    <input
                      type="text"
                      name="income"
                      value={editFormData.income || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Blood Group:</label>
                    <select
                      name="blood_group"
                      value={editFormData.blood_group || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
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

                  <div className="form-group-modal">
                    <label>Weight:</label>
                    <input
                      type="text"
                      name="weight"
                      value={editFormData.weight || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Height:</label>
                    <input
                      type="text"
                      name="height"
                      value={editFormData.height || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Personality:</label>
                    <input
                      type="text"
                      name="personality"
                      value={editFormData.personality || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Hobbies:</label>
                    <input
                      type="text"
                      name="hobbies"
                      value={editFormData.hobbies || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Colour/Complexion:</label>
                    <input
                      type="text"
                      name="color"
                      value={editFormData.color || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Caste/Religion:</label>
                    <input
                      type="text"
                      name="caste_religion"
                      value={editFormData.caste_religion || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>District:</label>
                    <input
                      type="text"
                      name="district"
                      value={editFormData.district || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Taluka:</label>
                    <input
                      type="text"
                      name="taluka"
                      value={editFormData.taluka || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Village:</label>
                    <input
                      type="text"
                      name="village"
                      value={editFormData.village || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Contact Number:</label>
                    <input
                      type="tel"
                      name="contact_number"
                      value={editFormData.contact_number || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Email:</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>
                </div>

                {/* Family Details */}
                <h4 className="subsection-title">Family Details</h4>
                <div className="form-grid-modal">
                  <div className="form-group-modal">
                    <label>Father's Name:</label>
                    <input
                      type="text"
                      name="father_name"
                      value={editFormData.father_name || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Father's Occupation:</label>
                    <input
                      type="text"
                      name="father_occupation"
                      value={editFormData.father_occupation || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Mother's Name:</label>
                    <input
                      type="text"
                      name="mother_name"
                      value={editFormData.mother_name || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Mother's Occupation:</label>
                    <input
                      type="text"
                      name="mother_occupation"
                      value={editFormData.mother_occupation || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Brothers:</label>
                    <input
                      type="text"
                      name="brothers"
                      value={editFormData.brothers || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                      placeholder="e.g. 2 (1 married)"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Sisters:</label>
                    <input
                      type="text"
                      name="sisters"
                      value={editFormData.sisters || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                      placeholder="e.g. 1 (married)"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Family Type:</label>
                    <select
                      name="family_type"
                      value={editFormData.family_type || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Joint">Joint Family</option>
                      <option value="Nuclear">Nuclear Family</option>
                    </select>
                  </div>

                  <div className="form-group-modal">
                    <label>Family Status:</label>
                    <select
                      name="family_status"
                      value={editFormData.family_status || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Middle Class">Middle Class</option>
                      <option value="Upper Middle Class">Upper Middle Class</option>
                      <option value="Rich">Rich</option>
                    </select>
                  </div>

                  <div className="form-group-modal">
                    <label>Family Values:</label>
                    <select
                      name="family_values"
                      value={editFormData.family_values || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Traditional">Traditional</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Liberal">Liberal</option>
                    </select>
                  </div>
                </div>

                {/* Astrological Information */}
                <h4 className="subsection-title">Astrological Information</h4>
                <div className="form-grid-modal">
                  <div className="form-group-modal">
                    <label>Rashi:</label>
                    <input
                      type="text"
                      name="rashi"
                      value={editFormData.rashi || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Nakshatra:</label>
                    <input
                      type="text"
                      name="nakshatra"
                      value={editFormData.nakshatra || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Gotra:</label>
                    <input
                      type="text"
                      name="gotra"
                      value={editFormData.gotra || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Manglik:</label>
                    <select
                      name="manglik"
                      value={editFormData.manglik || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Anshik">Anshik</option>
                      <option value="Don't Know">Don't Know</option>
                    </select>
                  </div>

                  <div className="form-group-modal">
                    <label>Nadi:</label>
                    <select
                      name="nadi"
                      value={editFormData.nadi || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Aadi">Aadi</option>
                      <option value="Madhya">Madhya</option>
                      <option value="Antya">Antya</option>
                    </select>
                  </div>

                  <div className="form-group-modal">
                    <label>Gana:</label>
                    <select
                      name="gana"
                      value={editFormData.gana || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="">Select</option>
                      <option value="Dev">Dev</option>
                      <option value="Manushya">Manushya</option>
                      <option value="Rakshasa">Rakshasa</option>
                    </select>
                  </div>
                </div>

                {/* Partner Expectations */}
                <h4 className="subsection-title">Partner Expectations</h4>
                <div className="form-grid-modal">
                  <div className="form-group-modal">
                    <label>Expected Education:</label>
                    <input
                      type="text"
                      name="expected_education"
                      value={editFormData.expected_education || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Expected Occupation:</label>
                    <input
                      type="text"
                      name="expected_occupation"
                      value={editFormData.expected_occupation || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Expected Income:</label>
                    <input
                      type="text"
                      name="expected_income"
                      value={editFormData.expected_income || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal">
                    <label>Expected Location:</label>
                    <input
                      type="text"
                      name="expected_location"
                      value={editFormData.expected_location || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    />
                  </div>

                  <div className="form-group-modal full-width">
                    <label>Other Expectations:</label>
                    <textarea
                      name="other_expectations"
                      value={editFormData.other_expectations || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              {/* Status and Expiry Date Section */}
              <div className="form-section-modal">
                <h4 className="subsection-title">Status & Expiry Date</h4>
                <div className="form-grid-modal">
                  <div className="form-group-modal">
                    <label>Status:</label>
                    <select
                      name="status"
                      value={editFormData.status || 'active'}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group-modal">
                    <label>Expiry Date:</label>
                    <input
                      type="date"
                      name="expiry_date"
                      value={editFormData.expiry_date || ''}
                      onChange={handleEditFormChange}
                      className="form-input-modal"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-cancel" onClick={closeEditModal}>
                Cancel
              </button>
              <button className="btn btn-save" onClick={handleSaveEdit}>
                💾 Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal - Outside all sections for proper overlay */}
      {showCreateUserModal && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflow: 'auto'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '500px', 
              width: '100%',
              padding: '0',
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              zIndex: 10001,
              margin: 'auto'
            }}
          >
            <div className="modal-header" style={{ padding: '25px 30px', borderBottom: '2px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', margin: '0' }}>
                ➕ Create New User/Agent
              </h2>
              <button 
                className="modal-close" 
                onClick={handleCloseModal}
                type="button"
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FECACA';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FEE2E2';
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(e); }}>
              <div className="modal-body" style={{ padding: '30px' }}>
                <div className="form-group-modal">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Username: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-modal"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Enter username"
                    autoFocus
                    required
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Password: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input-modal"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                      required
                      minLength="6"
                      style={{ width: '100%', padding: '12px 45px 12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#6b7280',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Email:
                  </label>
                  <input
                    type="email"
                    className="form-input-modal"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email (optional)"
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Mobile Number:
                  </label>
                  <input
                    type="tel"
                    className="form-input-modal"
                    value={newUser.mobile_number}
                    onChange={(e) => setNewUser({...newUser, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="Enter mobile number (optional)"
                    maxLength="10"
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Role:
                  </label>
                  <select
                    className="form-input-modal"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="modal-footer" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #E5E7EB', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={userManagementLoading}
                    style={{ padding: '10px 20px', fontSize: '14px', cursor: userManagementLoading ? 'not-allowed' : 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={userManagementLoading || !newUser.username || !newUser.password}
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: '14px', 
                      cursor: (userManagementLoading || !newUser.username || !newUser.password) ? 'not-allowed' : 'pointer',
                      opacity: (userManagementLoading || !newUser.username || !newUser.password) ? 0.6 : 1
                    }}
                  >
                    {userManagementLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Modal - Outside all sections for proper overlay */}
      {showCreateUserModal && (
        <div 
          className="modal-overlay" 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
            overflow: 'auto'
          }}
        >
          <div 
            className="modal-content" 
            onClick={(e) => e.stopPropagation()}
            style={{ 
              maxWidth: '500px', 
              width: '100%',
              padding: '0',
              position: 'relative',
              backgroundColor: 'white',
              borderRadius: '15px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              zIndex: 10001,
              margin: 'auto'
            }}
          >
            <div className="modal-header" style={{ padding: '25px 30px', borderBottom: '2px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="modal-title" style={{ fontSize: '24px', fontWeight: '700', color: '#1F2937', margin: '0' }}>
                ➕ Create New User/Agent
              </h2>
              <button 
                className="modal-close" 
                onClick={handleCloseModal}
                type="button"
                style={{
                  background: '#FEE2E2',
                  color: '#991B1B',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#FECACA';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#FEE2E2';
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateUser(e); }}>
              <div className="modal-body" style={{ padding: '30px' }}>
                <div className="form-group-modal">
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Username: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <input
                    type="text"
                    className="form-input-modal"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    placeholder="Enter username"
                    autoFocus
                    required
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Password: <span style={{ color: 'red' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-input-modal"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      placeholder="Enter password"
                      required
                      minLength="6"
                      style={{ width: '100%', padding: '12px 45px 12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px',
                        color: '#6b7280',
                        padding: '5px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Email:
                  </label>
                  <input
                    type="email"
                    className="form-input-modal"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="Enter email (optional)"
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Mobile Number:
                  </label>
                  <input
                    type="tel"
                    className="form-input-modal"
                    value={newUser.mobile_number}
                    onChange={(e) => setNewUser({...newUser, mobile_number: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                    placeholder="Enter mobile number (optional)"
                    maxLength="10"
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>
                <div className="form-group-modal" style={{ marginTop: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    Role:
                  </label>
                  <select
                    className="form-input-modal"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    style={{ width: '100%', padding: '12px 15px', border: '2px solid #E5E7EB', borderRadius: '8px', fontSize: '14px', backgroundColor: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="agent">Agent</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="modal-footer" style={{ marginTop: '30px', paddingTop: '20px', borderTop: '2px solid #E5E7EB', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                    disabled={userManagementLoading}
                    style={{ padding: '10px 20px', fontSize: '14px', cursor: userManagementLoading ? 'not-allowed' : 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={userManagementLoading || !newUser.username || !newUser.password}
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: '14px', 
                      cursor: (userManagementLoading || !newUser.username || !newUser.password) ? 'not-allowed' : 'pointer',
                      opacity: (userManagementLoading || !newUser.username || !newUser.password) ? 0.6 : 1
                    }}
                  >
                    {userManagementLoading ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default AdminDashboard;

