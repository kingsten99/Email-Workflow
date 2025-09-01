// Email Studio Types
export interface EmailComponent {
  id: string;
  type: 'text' | 'image' | 'button' | 'container' | 'column' | 'row';
  content: string;
  styles: CSSProperties;
  attributes: Record<string, any>;
  children?: EmailComponent[];
}

export interface CSSProperties {
  [key: string]: string | number;
}

export interface BlockType {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: Omit<EmailComponent, 'id'>;
}

export interface TemplateFormData {
  templateName: string;
  subject: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface EmailTemplate {
  id: string;
  template_name: string;
  subject: string;
  body: string;
  email_css?: string;
  content?: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}
