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
    const response = await api.get('/dashboard-stats');
    return response.data;
  },
};

// Template API
export const templateService = {
  getAll: async () => {
    const response = await api.get('/email-templates');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/templates/${id}`);
    return response.data;
  },
  
  create: async (template) => {
    const response = await api.post('/templates', template);
    return response.data;
  },
  
  update: async (id, template) => {
    const response = await api.put(`/templates/${id}`, template);
    return response.data;
  },
  
  delete: async (id) => {
    await api.delete(`/templates/${id}`);
  },
  
  publish: async (id) => {
    const response = await api.post(`/publish-template/${id}`);
    return response.data;
  },
  
  saveAsDraft: async (template) => {
    const draftTemplate = { ...template, status: 'draft' };
    const response = await api.post('/templates', draftTemplate);
    return response.data;
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
      },
    });
    return response.data;
  },
};

// Email API
export const emailService = {
  sendTest: async (templateData) => {
    const response = await api.post('/send-test-email', templateData);
    return response.data;
  },
};

export default api;