import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { 
  getUsers, 
  getDashboardStats, 
  approveUser, 
  rejectUser, 
  updatePaymentStatus,
  deleteUser,
  updateUser
} from '../../services/api';
import { UPLOADS_URL } from '../../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { t } = useLanguage();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
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
    paymentStatus: '',
    registrationType: '',
    search: ''
  });

  // Edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});

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
        getUsers({ status: activeTab })
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
      fetchUsers();
      setCurrentPage(1); // Reset to first page when tab changes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters]);

  const fetchUsers = async () => {
    try {
      const queryParams = { status: activeTab };
      if (filters.gender) queryParams.gender = filters.gender;
      if (filters.search) queryParams.search = filters.search;
      
      const data = await getUsers(queryParams);
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
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    // Split full_name into first_name and surname if needed
    const nameParts = user.full_name ? user.full_name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const surname = nameParts.slice(1).join(' ') || '';
    
    setEditFormData({ 
      ...user,
      first_name: firstName,
      surname: surname
    });
  };

  const handleEditFormChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleSaveEdit = async () => {
    try {
      // Combine first_name and surname into full_name
      const dataToUpdate = { ...editFormData };
      if (dataToUpdate.first_name || dataToUpdate.surname) {
        dataToUpdate.full_name = `${dataToUpdate.first_name || ''} ${dataToUpdate.surname || ''}`.trim();
      }
      
      // Remove first_name and surname from the update data (they don't exist in DB)
      delete dataToUpdate.first_name;
      delete dataToUpdate.surname;
      
      // Remove fields that shouldn't be updated
      delete dataToUpdate.id;
      delete dataToUpdate.register_id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.updated_at;
      delete dataToUpdate.photos;
      delete dataToUpdate.biodata_file;
      delete dataToUpdate.registration_type;
      
      await updateUser(editingUser.id, dataToUpdate);
      setEditingUser(null);
      fetchData();
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user: ' + (error.response?.data?.message || error.message));
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
          </div>
        </div>

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
                <option value="Divorcee">Divorcee</option>
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
                onClick={() => setFilters({ gender: '', paymentStatus: '', registrationType: '', search: '' })}
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

                          {activeTab === 'pending' && (
                            <>
                              <button
                                className="btn-icon btn-success"
                                onClick={() => handleApprove(user.id)}
                                title={t('approve')}
                              >
                                ✓
                              </button>
                              <button
                                className="btn-icon btn-reject"
                                onClick={() => handleReject(user.id)}
                                title={t('reject')}
                              >
                                ✕
                              </button>
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
      </div>

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
                    <label>Birth Date:</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editFormData.date_of_birth?.split('T')[0] || ''}
                      onChange={handleEditFormChange}
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
    </div>
  );
};

export default AdminDashboard;

