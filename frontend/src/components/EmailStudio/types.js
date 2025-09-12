// Email Studio Types

// EmailComponent class
export class EmailComponent {
  constructor(id, type, content, styles, attributes, children) {
    this.id = id; // string
    this.type = type; // 'text' | 'image' | 'button' | 'container' | 'column' | 'row'
    this.content = content; // string
    this.styles = styles; // CSSProperties
    // this.attributes = attributes; // Record<string, any>
    if (type === 'image') {
      this.attributes = { src: '', alt: '', ...attributes};
    } else if (type === 'button') {
      this.attributes = { href: '', ...attributes};
    } else {
      this.attributes = attributes;
    }

    this.children = children; // EmailComponent[] (optional)
  }
}

// CSSProperties class
export class CSSProperties {
  constructor() {
    // This class can be used to define CSS properties dynamically
    // You can add properties as needed
  }
}

// BlockType class
export class BlockType {
  constructor(id, label, icon, component) {
    this.id = id; // string
    this.label = label; // string
    this.icon = icon; // React.ReactNode
    this.component = { ...component, id: undefined }; // Omit id from EmailComponent
  }
}

// TemplateFormData class
export class TemplateFormData {
  constructor(templateName, subject) {
    this.templateName = templateName; // string
    this.subject = subject; // string
  }
}

// User class
export class User {
  constructor(id, name, email, role) {
    this.id = id; // number
    this.name = name; // string
    this.email = email; // string
    this.role = role; // string
  }
}

// EmailTemplate class
export class EmailTemplate {
  constructor(id, template_name, subject, body, email_css, content, status, created_at, updated_at) {
    this.id = id; // string
    this.template_name = template_name; // string
    this.subject = subject; // string
    this.body = body; // string
    this.email_css = email_css; // string (optional)
    this.content = content; // string (optional)
    this.status = status; // 'draft' | 'published'
    this.created_at = created_at; // string
    this.updated_at = updated_at; // string
  }
}