import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardStats, EmailTemplate, User } from '../types';
import { dashboardService, templateService } from '../services/api';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRecipientsModal, setShowRecipientsModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  const navigate = useNavigate();

  const recipientOptions = [
    { value: 'admin', label: 'Admin' },
    { value: 'manager', label: 'Manager' },
    { value: 'vp', label: 'Vice President' },
    { value: 'softwareEngineer', label: 'Software Engineer' },
    { value: 'hr', label: 'Hr' },
    { value: 'productManager', label: 'product Manager' },
    { value: 'tester', label: 'Tester' },
    { value: 'ba', label: 'Business Analyst' }
  ];

  useEffect(() => {
    loadDashboardData();
    fetchUsers();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboardStats, emailTemplates] = await Promise.all([
        dashboardService.getStats(),
        templateService.getAll()
      ]);
      
      setStats(dashboardStats);
      setTemplates(emailTemplates);
      setError(null);
      console.log('Users by Role:', dashboardStats.usersByRole);
      console.log('Users by dashboardStats:', dashboardStats);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleCreateTemplate = () => {
    navigate('/editor');
  };

  const handleEditTemplate = (templateId: string) => {
    navigate(`/editor/${templateId}`);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await templateService.delete(templateId);
        setTemplates(templates.filter(t => t.id !== templateId));
      } catch (err) {
        console.error('Error deleting template:', err);
        alert('Failed to delete template');
      }
    }
  };

  const handlePublishTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setSelectedRecipients([]);
    setSelectedUsers([]);
    setPublishError(null);
    setPublishLoading(false);
    setShowRecipientsModal(true);
  };

  const handleCloseModal = () => {
    setShowRecipientsModal(false);
    setPublishError(null);
    setPublishLoading(false);
  };

  const handleConfirmPublish = async () => {
    if (!selectedTemplate) return;

    try {
      setPublishLoading(true);
      setPublishError(null);
      
      // Get all unique user IDs from selected groups and individual users
      const usersFromGroups = selectedRecipients.flatMap(groupRole => 
        users.filter(user => user.role === groupRole).map(user => user.id)
      );
      const allUserIds = Array.from(new Set([...usersFromGroups, ...selectedUsers]));
      
      if (allUserIds.length === 0) {
        setPublishError('Please select at least one recipient');
        return;
      }

      // Convert user IDs to user names for storage
      const recipientNames = allUserIds.map(userId => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : null;
      }).filter(name => name !== null);

      // Update template with recipient names and publish
      await templateService.update(selectedTemplate, {
        recipients: recipientNames,
        status: 'published'
      });

      await loadDashboardData(); // Refresh data
      setShowRecipientsModal(false);
      setSelectedRecipients([]);
      setSelectedUsers([]);
      alert('Template published and emails sent successfully!');
    } catch (err: any) {
      console.error('Error publishing template:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to publish template. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setPublishLoading(false);
    }
  };

  const getUniqueRecipientCount = () => {
    // Get all users from selected groups
    const usersFromGroups = selectedRecipients.flatMap(groupRole => 
      users.filter(user => user.role === groupRole).map(user => user.id)
    );
    
    // Combine group users with individually selected users, removing duplicates
    const allUniqueUserIds = Array.from(new Set([...usersFromGroups, ...selectedUsers]));
    
    return allUniqueUserIds.length;
  };

  const handleRecipientToggle = (recipient: string) => {
    const isCurrentlySelected = selectedRecipients.includes(recipient);
    
    setSelectedRecipients(prev => 
      isCurrentlySelected
        ? prev.filter(r => r !== recipient)
        : [...prev, recipient]
    );

    // Auto-select/deselect individual users based on group selection
    const groupUsers = users.filter(user => user.role === recipient);
    const groupUserIds = groupUsers.map(user => user.id);

    setSelectedUsers(prev => {
      if (isCurrentlySelected) {
        // Deselecting group - remove all users of this role
        return prev.filter(userId => !groupUserIds.includes(userId));
      } else {
        // Selecting group - add all users of this role (avoid duplicates)
        const newUserIds = groupUserIds.filter(userId => !prev.includes(userId));
        return [...prev, ...newUserIds];
      }
    });
  };

  const handleUserToggle = (userId: string) => {
    const isCurrentlySelected = selectedUsers.includes(userId);
    
    setSelectedUsers(prev => 
      isCurrentlySelected
        ? prev.filter(u => u !== userId)
        : [...prev, userId]
    );

    // Auto-toggle group selection based on individual user selections
    const toggledUser = users.find(user => user.id === userId);
    if (toggledUser) {
      const groupUsers = users.filter(user => user.role === toggledUser.role);
      const groupUserIds = groupUsers.map(user => user.id);
      
      setSelectedRecipients(prev => {
        const isGroupSelected = prev.includes(toggledUser.role);
        
        if (isCurrentlySelected) {
          // User was deselected - remove group selection
          return prev.filter(r => r !== toggledUser.role);
        } else {
          // User was selected - check if all group users are now selected
          const updatedSelectedUsers = selectedUsers.includes(userId) 
            ? selectedUsers 
            : [...selectedUsers, userId];
          
          const allGroupUsersSelected = groupUserIds.every(id => 
            updatedSelectedUsers.includes(id)
          );
          
          if (allGroupUsersSelected && !isGroupSelected) {
            return [...prev, toggledUser.role];
          }
        }
        
        return prev;
      });
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Email Template Dashboard</h1>
        <button 
          className="btn btn-primary create-template-btn"
          onClick={handleCreateTemplate}
        >
          Create New Template
        </button>
      </div>

      {/* Stats Section */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <div className="stat-number">{stats?.totalUsers || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Total Templates</h3>
          <div className="stat-number">{stats?.totalTemplates || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Draft Templates</h3>
          <div className="stat-number">{stats?.templatesByStatus?.draft || 0}</div>
        </div>
        <div className="stat-card">
          <h3>Published Templates</h3>
          <div className="stat-number">{stats?.templatesByStatus?.published || 0}</div>
        </div>
      </div>

      {/* User Stats by Role */}
      <div className="user-stats">
        <h2>Users by Role</h2>
        <div className="role-stats">
          <div className="role-stat">
            <span className="role-name">Admin:</span>
            <span className="role-count">{stats?.usersByRole?.admin || 0}</span>
          </div>
          <div className="role-stat">
            <span className="role-name">Manager:</span>
            <span className="role-count">{stats?.usersByRole?.manager || 0}</span>
          </div>
          <div className="role-stat">
            <span className="role-name">Vice President:</span>
            <span className="role-count">{stats?.usersByRole?.vp || 0}</span>
          </div>
          <div className="role-stat">
            <span className="role-name">Software Engineer:</span>
            <span className="role-count">{stats?.usersByRole?.softwareEngineer || 0}</span>
          </div>
          <div className="role-stat">
            <span className="role-name">Hr:</span>
            <span className="role-count">{stats?.usersByRole?.hr || 0}</span>
          </div>
          <div className="role-stat">
            <span className="role-name">product Manager:</span>
            <span className="role-count">{stats?.usersByRole?.productManager || 0}</span>
          </div>
          <div className="role-stat">
            <span className="role-name">Tester:</span>
            <span className="role-count">{stats?.usersByRole?.tester || 0}</span>
          </div>
          <div className="role-stat">
            <span className="role-name">Business Analyst:</span>
            <span className="role-count">{stats?.usersByRole?.ba || 0}</span>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="templates-section">
        <h2>Email Templates</h2>
        {templates.length === 0 ? (
          <div className="no-templates">
            <p>No templates found. Create your first template!</p>
            <button 
              className="btn btn-primary"
              onClick={handleCreateTemplate}
            >
              Create Template
            </button>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((template) => (
              <div key={template.id} className={`template-card ${template.status}`}>
                <div className="template-header">
                  <h3>{template.template_name}</h3>
                  <span className={`status-badge ${template.status}`}>
                    {template.status}
                  </span>
                </div>
                <div className="template-content">
                  <p className="template-subject">{template.subject}</p>
                  <p className="template-updated">
                    Updated: {new Date(template.updated_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="template-actions">
                  <button 
                    className="btn btn-secondary"
                    onClick={() => handleEditTemplate(template.id)}
                  >
                    Edit
                  </button>
                  {template.status === 'draft' && (
                    <button 
                      className="btn btn-success"
                      onClick={() => handlePublishTemplate(template.id)}
                    >
                      Publish & Send
                    </button>
                  )}
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recipients Selection Modal */}
      {showRecipientsModal && (
        <div className="modal-overlay" onClick={publishLoading ? undefined : handleCloseModal}>
          <div className="modal-content recipients-modal" onClick={(e) => e.stopPropagation()}>
            {/* Loading Overlay */}
            {publishLoading && (
              <div className="modal-loading-overlay" style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                borderRadius: '8px'
              }}>
                <div className="loading-spinner" style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #007bff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginBottom: '15px'
                }}></div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '500',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  Sending Emails...
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  Please wait while we publish your template and send emails to selected recipients.
                </div>
              </div>
            )}
            
            <div className="modal-header">
              <h3>Select Recipients</h3>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="recipients-section">
                <h4>Recipient Groups</h4>
                <div className="recipient-groups">
                  {recipientOptions.map((option) => (
                    <label key={option.value} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedRecipients.includes(option.value)}
                        onChange={() => handleRecipientToggle(option.value)}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="recipients-section">
                <h4>Individual Users</h4>
                <div className="individual-users">
                  {recipientOptions.map((group) => {
                    const groupUsers = users.filter(user => user.role === group.value);
                    if (groupUsers.length === 0) return null;

                    return (
                      <div key={group.value} className="user-group">
                        <h5>{group.label}</h5>
                        {groupUsers.map((user) => (
                          <label key={user.id} className="checkbox-label user-checkbox">
                            <input
                              type="checkbox"
                              checked={selectedUsers.includes(user.id)}
                              onChange={() => handleUserToggle(user.id)}
                            />
                            <div className="user-info">
                              <span className="user-name">{user.name}</span>
                              <span className="user-email">{user.email}</span>
                            </div>
                          </label>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                  disabled={publishLoading}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={handleConfirmPublish}
                  disabled={publishLoading || (selectedRecipients.length === 0 && selectedUsers.length === 0)}
                >
                  Publish & Send ({getUniqueRecipientCount()} recipients)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
