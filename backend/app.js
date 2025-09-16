require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import services
const db = require('./src/config/database');
const emailService = require('./src/services/emailService');

// Helper function to convert JSON components to HTML
function convertComponentsToHTML(componentsJson) {
  try {
    console.log('Converting components to HTML:', typeof componentsJson);
    
    // If it's already a string (HTML), return as is
    if (typeof componentsJson === 'string') {
      // Check if it's JSON by trying to parse it
      try {
        const parsed = JSON.parse(componentsJson);
        if (Array.isArray(parsed)) {
          // It's JSON components, convert to HTML
          return componentsToHTML(parsed);
        } else {
          // It's not an array of components, treat as HTML
          return componentsJson;
        }
      } catch (e) {
        // It's not valid JSON, treat as HTML
        return componentsJson;
      }
    }
    
    // If it's already an array of components
    if (Array.isArray(componentsJson)) {
      return componentsToHTML(componentsJson);
    }
    
    // Fallback
    return '<p>Unable to render email content</p>';
  } catch (error) {
    console.error('Error converting components to HTML:', error);
    return '<p>Error rendering email content</p>';
  }
}

// Simple component to HTML converter
function componentsToHTML(components) {
  return components.map(component => {
    const styles = component.styles || {};
    const styleString = Object.entries(styles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    switch (component.type) {
      case 'text':
        return `<div style="${styleString}">${component.content || ''}</div>`;
      case 'image':
        const src = component.attributes?.src || '';
        const alt = component.attributes?.alt || '';
        return `<img src="${src}" alt="${alt}" style="${styleString}" />`;
      case 'button':
        const href = component.attributes?.href || '#';
        return `<a href="${href}" style="${styleString}">${component.content || 'Button'}</a>`;
      case 'container':
        const childrenHTML = component.children ? componentsToHTML(component.children) : '';
        return `<div style="${styleString}">${childrenHTML}</div>`;
      default:
        return `<div style="${styleString}">${component.content || ''}</div>`;
    }
  }).join('');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003'], // React dev server
  credentials: true
}));
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads')); // Serve uploaded images

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Only allow image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Routes - API only (remove view routes)

// API Routes

// Get all users for template variables
app.get('/api/users', (req, res) => {
  console.log('Fetching users for template variables...');
  db.query('SELECT id, name, email, role FROM users ORDER BY name ASC', (err, results) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Found users:', results.length);
    res.json(results);
  });
});

// Get all uploaded images
app.get('/api/images', (req, res) => {
  console.log('Fetching uploaded images...');
  try {
    const uploadsPath = path.join(__dirname, 'uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsPath)) {
      console.log('Uploads directory does not exist');
      return res.json([]);
    }

    // Read directory contents
    const files = fs.readdirSync(uploadsPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'].includes(ext);
    });

    // Get file details
    const images = imageFiles.map(filename => {
      const filePath = path.join(uploadsPath, filename);
      const stats = fs.statSync(filePath);
      return {
        src: `/uploads/${filename}`,
        name: filename,
        size: stats.size,
        type: path.extname(filename).toLowerCase(),
        uploadedAt: stats.birthtime
      };
    });

    // Sort by upload date (newest first)
    images.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());

    console.log('Found images:', images.length);
    res.json(images);
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    res.status(500).json({ error: 'Failed to read images directory' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard stats endpoint
app.get('/api/dashboard-stats', (req, res) => {
  console.log('Dashboard stats endpoint called at', new Date().toISOString());
  
  // Test database connection first
  db.query('SELECT 1 as test', (err, testResult) => {
    if (err) {
      console.error('Database connection test failed:', err);
      return res.status(500).json({ error: 'Database connection failed: ' + err.message });
    }
    
    console.log('Database connection test passed', testResult);
    
    const userCountQuery = `
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminCount,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as managerCount,
        SUM(CASE WHEN role = 'software_engineer' THEN 1 ELSE 0 END) as softwareEngineerCount,
        SUM(CASE WHEN role = 'vp' THEN 1 ELSE 0 END) as vpCount,
        SUM(CASE WHEN role = 'hr' THEN 1 ELSE 0 END) as hrCount,
        SUM(CASE WHEN role = 'product_manager' THEN 1 ELSE 0 END) as productManagerCount,
        SUM(CASE WHEN role = 'tester' THEN 1 ELSE 0 END) as testerCount,
        SUM(CASE WHEN role = 'ba' THEN 1 ELSE 0 END) as baCount
      FROM users
    `;
    
    console.log('Executing user count query...');
    db.query(userCountQuery, (err, userResults) => {
      if (err) {
        console.error('User stats error:', err);
        return res.status(500).json({ error: 'User query failed: ' + err.message });
      }
      
      console.log('User query completed:', userResults);
      
      const templateCountQuery = `
        SELECT 
          COUNT(*) as totalTemplates,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftCount,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as publishedCount
        FROM email_template_drafts
      `;
      
      console.log('Executing template count query...');
      db.query(templateCountQuery, (err, templateResults) => {
        if (err) {
          console.error('Template stats error:', err);
          return res.status(500).json({ error: 'Template query failed: ' + err.message });
        }
        
        console.log('Template query completed:', templateResults);
        
        const userStats = userResults[0];
        const templateStats = templateResults[0];
        
        const stats = {
          totalUsers: userStats.totalUsers,
          totalTemplates: templateStats.totalTemplates,
          usersByRole: {
            admin: userStats.adminCount || 0,
            manager: userStats.managerCount || 0,
            vp: userStats.vpCount || 0,
            softwareEngineer: userStats.softwareEngineerCount || 0,
            hr: userStats.hrCount || 0,
            productManager: userStats.productManagerCount || 0,
            tester: userStats.testerCount || 0,
            ba: userStats.baCount || 0
          },
          templatesByStatus: {
            draft: templateStats.draftCount || 0,
            published: templateStats.publishedCount || 0
          }
        };
        
        console.log('Final dashboard stats:', stats);
        res.json(stats);
      });
    });
  });
});

// Get all email templates
app.get('/api/email-templates', (req, res) => {
  console.log('Fetching email templates...');
  db.query('SELECT * FROM email_template_drafts ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    console.log('Found templates:', results.length);
    res.json(results);
  });
});

// Save/update template
app.post('/api/templates', async (req, res) => {
  console.log('Saving template...');
  
  const { template_name, created_by, subject, email_body, email_css, recipients, status, body } = req.body;
  
  console.log('Received template data:', {
    template_name,
    created_by,
    subject,
    email_body: email_body ? email_body.substring(0, 100) + '...' : 'empty',
    email_css: email_css ? 'CSS included' : 'No CSS',
    recipients,
    status,
    body: body ? 'JSON components included' : 'No JSON components'
  });

  // Validate required fields - prioritize JSON components in body field
  if (!template_name || !created_by || !subject || !body) {
    return res.status(400).json({ error: 'Missing required fields (template_name, created_by, subject, body)' });
  }

  const recipientsJson = JSON.stringify(recipients || []);
  
  try {
    // Check if template name already exists
    const checkQuery = `
      SELECT id, template_name FROM email_template_drafts 
      WHERE template_name = ? AND template_name != ''
    `;
    
    const existingTemplate = await new Promise((resolve, reject) => {
      db.query(checkQuery, [template_name], (err, results) => {
        if (err) {
          console.error('Error checking for existing template:', err);
          reject(err);
        } else {
          resolve(results[0]);
        }
      });
    });
    
    if (existingTemplate) {
      console.log('Template name already exists:', template_name);
      return res.status(409).json({ 
        error: 'Template name already exists', 
        message: `A template with the name "${template_name}" already exists. Please choose a different name.` 
      });
    }
    
    // Create new template
    const insertQuery = `
      INSERT INTO email_template_drafts (template_name, created_by, subject, body, email_css, recipients, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    // Use JSON components for body field (this is what we want to store for canvas editing)
    const bodyContent = body; // Always store JSON components
    
    db.query(insertQuery, [template_name, created_by, subject, bodyContent, email_css || '', recipientsJson, status], 
      async (err, result) => {
        if (err) {
          console.error('Insert error:', err);
          return res.status(500).json({ error: err.message });
        }
        
        console.log('Template created successfully! ID:', result.insertId);
        
        // If publishing, send emails
        if (status === 'published') {
          console.log('Publishing template - sending emails...');
          try {
            // Convert JSON components to HTML for email sending
            const htmlContent = convertComponentsToHTML(bodyContent);
            
            const emailResult = await emailService.sendTemplateEmails({
              template_name,
              subject,
              email_body: htmlContent,
              email_css: email_css || '',
              created_by,
              recipients: recipients || []
            });
            
            console.log('Email sending completed:', emailResult);
            res.json({ 
              id: result.insertId, 
              message: 'Template published and emails sent successfully!',
              emailResult 
            });
          } catch (emailError) {
            console.error('Email sending error:', emailError);
            res.json({ 
              id: result.insertId, 
              message: 'Template saved but email sending failed: ' + emailError.message 
            });
          }
        } else {
          res.json({ id: result.insertId, message: 'Template saved as draft!' });
        }
      }
    );
  } catch (error) {
    console.error('Template creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single template
app.get('/api/templates/:id', (req, res) => {
  const templateId = req.params.id;
  
  db.query('SELECT * FROM email_template_drafts WHERE id = ?', [templateId], (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = results[0];
    
    // Parse recipients JSON
    try {
      template.recipients = JSON.parse(template.recipients || '[]');
    } catch (e) {
      template.recipients = [];
    }
    
    res.json(template);
  });
});

// Update existing template
app.put('/api/templates/:id', async (req, res) => {
  const templateId = req.params.id;
  console.log('Updating template ID:', templateId);
  
  const { template_name, created_by, subject, email_body, email_css, recipients, status, body } = req.body;
  
  console.log('Received update data:', {
    template_name,
    created_by,
    subject,
    email_body: email_body ? email_body.substring(0, 100) + '...' : 'empty',
    email_css: email_css ? 'CSS included' : 'No CSS',
    recipients,
    status,
    body: body ? 'JSON components included' : 'No JSON components'
  });

  try {
    // First get the existing template to check what fields are being updated
    const getQuery = 'SELECT * FROM email_template_drafts WHERE id = ?';
    db.query(getQuery, [templateId], (err, results) => {
      if (err) {
        console.error('Database error getting template:', err);
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Template not found' });
      }

      const existingTemplate = results[0];
      
      // Build dynamic update query based on provided fields
      const updateFields = [];
      const updateValues = [];
      
      if (template_name !== undefined) {
        updateFields.push('template_name = ?');
        updateValues.push(template_name);
      }
      
      if (subject !== undefined) {
        updateFields.push('subject = ?');
        updateValues.push(subject);
      }
      
      // Always prioritize JSON components for body field
      if (body !== undefined) {
        updateFields.push('body = ?');
        updateValues.push(body);
      }
      
      if (email_css !== undefined) {
        updateFields.push('email_css = ?');
        updateValues.push(email_css);
      }
      
      if (recipients !== undefined) {
        updateFields.push('recipients = ?');
        updateValues.push(JSON.stringify(recipients || []));
      }
      
      if (status !== undefined) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }
      
      // Always update the updated_at field
      updateFields.push('updated_at = NOW()');
      updateValues.push(templateId);

      if (updateFields.length === 1) { // Only updated_at field
        return res.status(400).json({ error: 'No fields to update' });
      }

      // Update existing template
      const updateQuery = `
        UPDATE email_template_drafts 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      console.log('Update query:', updateQuery);
      console.log('Update values:', updateValues);
    
      db.query(updateQuery, updateValues, async (err, result) => {
        if (err) {
          console.error('Update error:', err);
          return res.status(500).json({ error: err.message });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Template not found' });
        }
        
        console.log('Template updated successfully! ID:', templateId);
        
        // If publishing, send emails
        if (status === 'published') {
          console.log('Publishing template - sending emails...');
          try {
            // Use updated body or existing body for email content
            const bodyContent = body || existingTemplate.body;
            const htmlContent = convertComponentsToHTML(bodyContent);
            
            const emailResult = await emailService.sendTemplateEmails({
              template_name: template_name || existingTemplate.template_name,
              subject: subject || existingTemplate.subject,
              email_body: htmlContent,
              email_css: email_css || existingTemplate.email_css || '',
              created_by: created_by || existingTemplate.created_by || 'System',
              recipients: recipients || JSON.parse(existingTemplate.recipients || '[]')
            });
            
            console.log('Email sending completed:', emailResult);
            res.json({ 
              id: templateId, 
              message: 'Template updated and emails sent successfully!',
              emailResult 
            });
          } catch (emailError) {
            console.error('Email sending error:', emailError);
            res.json({ 
              id: templateId,
              message: 'Template updated but email sending failed: ' + emailError.message 
            });
          }
        } else {
          res.json({ id: templateId, message: 'Template updated successfully!' });
        }
      });
    });
  } catch (error) {
    console.error('Template update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Publish template and send emails
app.post('/api/publish-template/:id', async (req, res) => {
  const templateId = req.params.id;
  
  console.log('Publishing template ID:', templateId);
  
  // Get template details
  db.query('SELECT * FROM email_template_drafts WHERE id = ?', [templateId], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      console.error('Template not found');
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = results[0];
    console.log('Found template:', template.template_name);
    
    // Update status to published
    db.query('UPDATE email_template_drafts SET status = "published", updated_at = NOW() WHERE id = ?', [templateId], async (err) => {
      if (err) {
        console.error('Update error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('Template status updated to published');
      
      // Send emails
      try {
        const recipients = JSON.parse(template.recipients || '[]');
        console.log('Sending emails to recipients:', recipients);
        
        // Convert JSON components to HTML for email sending
        const htmlContent = convertComponentsToHTML(template.body);
        console.log('Converted HTML content preview:', htmlContent.substring(0, 200) + '...');
        
        const emailResult = await emailService.sendTemplateEmails({
          template_name: template.template_name,
          subject: template.subject,
          email_body: htmlContent,
          email_css: template.email_css || '',
          created_by: template.created_by,
          recipients: recipients
        });
        
        console.log('Email sending completed:', emailResult);
        res.json({ message: 'Template published and emails sent successfully!', result: emailResult });
      } catch (error) {
        console.error('Email sending error:', error);
        res.json({ message: 'Template published but email sending failed: ' + error.message });
      }
    });
  });
});

// Send test email endpoint
app.post('/api/send-test-email', async (req, res) => {
  console.log('Sending test email...');
  console.log('Request body:', req.body);
  
  const { template_name, subject, email_body, body, email_css, created_by, test_email } = req.body;
  
  if (!test_email) {
    return res.status(400).json({ error: 'Test email address is required' });
  }

  // Use email_body if provided, otherwise use body (which contains JSON components)
  let htmlContent = email_body;
  if (!htmlContent && body) {
    // Convert JSON components to HTML
    console.log('Converting body content to HTML for test email');
    htmlContent = convertComponentsToHTML(body);
  }

  if (!htmlContent) {
    htmlContent = '<p>Test email content</p>';
  }
  
  try {
    const result = await emailService.sendTestEmail({
      template_name: template_name || 'Test Template',
      subject: subject || 'Test Email',
      email_body: htmlContent,
      email_css: email_css || '',
      created_by: created_by || 'Test User'
    }, test_email);
    
    console.log('Test email sent successfully');
    res.json({ message: 'Test email sent successfully!', result });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email: ' + error.message });
  }
});

// Delete template endpoint
app.delete('/api/templates/:id', (req, res) => {
  const templateId = req.params.id;
  
  console.log('Deleting template ID:', templateId);
  
  db.query('DELETE FROM email_template_drafts WHERE id = ?', [templateId], (err, result) => {
    if (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log('Template deleted successfully');
    res.json({ message: 'Template deleted successfully.' });
  });
});

// Image upload endpoint
app.post('/api/upload-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    
    console.log('Image uploaded:', {
      originalName: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      url: fileUrl
    });

    // Return in GrapesJS expected format
    res.json({
      data: [{
        src: fileUrl,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      }]
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed: ' + error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Email configuration:');
  console.log(`  - SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`  - SMTP User: ${process.env.SMTP_USER}`);
  console.log(`  - Database: ${process.env.DB_NAME || 'workflow_platform'}`);
  console.log('');
  console.log('Available endpoint:');
  console.log('  - GET  /api/dashboard-stats');
  console.log('  - GET  /api/email-templates');
  console.log('  - POST /api/templates (Save/Publish)');
  console.log('  - GET  /api/templates/:id');
  console.log('  - POST /api/publish-template/:id');
  console.log('  - DELETE /api/templates/:id');
  console.log('  - POST /api/send-test-email (Debug)');
  console.log('  - POST /api/upload-image');
  console.log('');
  console.log('Server ready for email template management!');
});
