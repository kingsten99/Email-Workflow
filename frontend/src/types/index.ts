// Type definitions for the Workflow Platform

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  created_at: string;
}

export interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  body: string; // This matches the database field
  email_css?: string; // CSS content
  recipients: string[];
  variables?: Record<string, string>; // Template variables
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalTemplates: number;
  usersByRole: {
    admin: number;
    manager: number;
    employee: number;
  };
  templatesByStatus: {
    draft: number;
    published: number;
  };
}

export interface CreateTemplateRequest {
  template_name: string;
  created_by?: string;
  subject: string;
  email_body: string; // Changed from body to email_body to match backend API
  email_css?: string;
  recipients?: string[]; // Made optional for editor, required for publishing
  status?: 'draft' | 'published';
}

export interface UpdateTemplateRequest extends Partial<CreateTemplateRequest> {
  // id is not needed in the request body, it's in the URL
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface UploadResponse {
  filename: string;
  url: string;
}
