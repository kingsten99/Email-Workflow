// Type definitions for the Workflow Platform

// Interface for User
// Note: The types are not enforced in JavaScript
export class User {
  constructor(id, name, email, role, created_at) {
    this.id = id;              // string
    this.name = name;          // string
    this.email = email;        // string
    this.role = role;          // 'admin' | 'manager' | 'employee'
    this.created_at = created_at; // string
  }
}

// Interface for EmailTemplate
export class EmailTemplate {
  constructor(id, template_name, subject, body, email_css, recipients, variables, status, created_at, updated_at) {
    this.id = id;                  // string
    this.template_name = template_name; // string
    this.subject = subject;        // string
    this.body = body;              // string
    this.email_css = email_css;    // string (optional)
    this.recipients = recipients;  // string[]
    this.variables = variables;    // Record<string, string> (optional)
    this.status = status;          // 'draft' | 'published'
    this.created_at = created_at;  // string
    this.updated_at = updated_at;  // string
  }
}

// Interface for DashboardStats
export class DashboardStats {
  constructor(totalUsers, totalTemplates, usersByRole, templatesByStatus) {
    this.totalUsers = totalUsers;                // number
    this.totalTemplates = totalTemplates;        // number
    this.usersByRole = usersByRole;              // { admin: number; manager: number; employee: number; }
    this.templatesByStatus = templatesByStatus;  // { draft: number; published: number; }

    console.log('Users by Role:', this.usersByRole);
  }
}

// Interface for CreateTemplateRequest
export class CreateTemplateRequest {
  constructor(template_name, created_by, subject, email_body, email_css, recipients, status) {
    this.template_name = template_name;          // string
    this.created_by = created_by;                // string (optional)
    this.subject = subject;                      // string
    this.email_body = email_body;                // string
    this.email_css = email_css;                  // string (optional)
    this.recipients = recipients;                // string[] (optional)
    this.status = status;                        // 'draft' | 'published' (optional)
  }
}

// Interface for UpdateTemplateRequest
export class UpdateTemplateRequest extends CreateTemplateRequest {
  // id is not needed in the request body, it's in the URL
}

// Interface for ApiResponse
export class ApiResponse {
  constructor(success, data, message, error) {
    this.success = success;          // boolean
    this.data = data;                // T (optional)
    this.message = message;          // string (optional)
    this.error = error;              // string (optional)
  }
}

// Interface for UploadResponse
export class UploadResponse {
  constructor(filename, url) {
    this.filename = filename;        // string
    this.url = url;                  // string
  }
}