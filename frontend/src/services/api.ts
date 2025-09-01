import axios from 'axios';
import {
  DashboardStats,
  EmailTemplate,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  ApiResponse,
  UploadResponse
} from '../types';

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
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/dashboard-stats');
    return response.data;
  },
};

// Template API
export const templateService = {
  getAll: async (): Promise<EmailTemplate[]> => {
    const response = await api.get<EmailTemplate[]>('/email-templates');
    return response.data;
  },

  getById: async (id: string): Promise<EmailTemplate> => {
    const response = await api.get<EmailTemplate>(`/templates/${id}`);
    return response.data;
  },

  create: async (template: CreateTemplateRequest): Promise<EmailTemplate> => {
    const response = await api.post<EmailTemplate>('/templates', template);
    return response.data;
  },

  update: async (id: string, template: UpdateTemplateRequest): Promise<EmailTemplate> => {
    const response = await api.put<EmailTemplate>(`/templates/${id}`, template);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/templates/${id}`);
  },

  publish: async (id: string): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>(`/publish-template/${id}`);
    return response.data;
  },

  saveAsDraft: async (template: CreateTemplateRequest): Promise<EmailTemplate> => {
    const draftTemplate = { ...template, status: 'draft' as const };
    const response = await api.post<EmailTemplate>('/templates', draftTemplate);
    return response.data;
  },
};

// Upload API
export const uploadService = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await api.post<UploadResponse>('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },
};

// Email API
export const emailService = {
  sendTest: async (templateData: any): Promise<ApiResponse<any>> => {
    const response = await api.post<ApiResponse<any>>('/send-test-email', templateData);
    return response.data;
  },
};

export default api;
