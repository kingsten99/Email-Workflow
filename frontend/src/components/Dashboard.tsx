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
  const navigate = useNavigate();

  const recipientOptions = [
    { value: 'hr', label: 'HR Department' },
    { value: 'manager', label: 'Managers' },
    { value: 'employee', label: 'All Employees' },
    { value: 'admin', label: 'Administrators' }
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
    setShowRecipientsModal(true);
  };

  const handleConfirmPublish = async () => {
    if (!selectedTemplate) return;

    try {
      // Combine selected groups and individual users
      const allRecipients = [...selectedRecipients, ...selectedUsers];
      
      if (allRecipients.length === 0) {
        alert('Please select at least one recipient');
        return;
      }

      // Update template with recipients and publish
      await templateService.update(selectedTemplate, {
        recipients: allRecipients,
        status: 'published'
      });

      await loadDashboardData(); // Refresh data
      setShowRecipientsModal(false);
      alert('Template published and emails sent successfully!');
    } catch (err) {
      console.error('Error publishing template:', err);
      alert('Failed to publish template');
    }
  };

  const handleRecipientToggle = (recipient: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipient)
        ? prev.filter(r => r !== recipient)
        : [...prev, recipient]
    );
  };

  const handleUserToggle = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(u => u !== userId)
        : [...prev, userId]
    );
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
            <span className="role-name">Employee:</span>
            <span className="role-count">{stats?.usersByRole?.employee || 0}</span>
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
                  <p className="template-recipients">
                    Recipients: {Array.isArray(template.recipients) 
                      ? template.recipients.join(', ') 
                      : 'None selected'}
                  </p>
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
        <div className="modal-overlay" onClick={() => setShowRecipientsModal(false)}>
          <div className="modal-content recipients-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📧 Select Recipients</h3>
              <button className="close-btn" onClick={() => setShowRecipientsModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="recipients-section">
                <h4>👥 Recipient Groups</h4>
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
                <h4>👤 Individual Users</h4>
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
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowRecipientsModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirmPublish}
                disabled={selectedRecipients.length === 0 && selectedUsers.length === 0}
              >
                Publish & Send ({selectedRecipients.length + selectedUsers.length} recipients)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
