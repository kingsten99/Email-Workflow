import axios from 'axios';
import {
  // Note: The types are not imported in JavaScript
  // DashboardStats,
  // EmailTemplate,
  // CreateTemplateRequest,
  // UpdateTemplateRequest,
  // ApiResponse,
  // UploadResponse,
} from '../types'; // Ensure that this path points to a valid JavaScript file

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    throw new Error('Authentication failed');
  }
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Network error');
  }
  
  return response.json();
};

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dashboard API
export const dashboardService = {
  getStats: async () => {
    const response = await api.get('/dashboard-stats', { headers: getAuthHeaders() });
    return handleResponse(response);
  },
};

// Template API
export const templateService = {
  getAll: async () => {
    const response = await api.get('/email-templates', { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  getById: async (id) => {
    const response = await api.get(`/templates/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  create: async (template) => {
    const response = await api.post('/templates', template, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  update: async (id, template) => {
    const response = await api.put(`/templates/${id}`, template, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  delete: async (id) => {
    const response = await api.delete(`/templates/${id}`, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  publish: async (id) => {
    const response = await api.post(`/publish-template/${id}`, null, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
  
  saveAsDraft: async (template) => {
    const draftTemplate = { ...template, status: 'draft' };
    const response = await api.post('/templates', draftTemplate, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
};

// Upload API
export const uploadService = {
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeaders(),
      },
    });
    return handleResponse(response);
  },
};

// Email API
export const emailService = {
  sendTest: async (templateData) => {
    const response = await api.post('/send-test-email', templateData, { headers: getAuthHeaders() });
    return handleResponse(response);
  },
};

export default api;