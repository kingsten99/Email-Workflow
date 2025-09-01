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

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🔍 Health check endpoint called');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Dashboard stats endpoint
app.get('/api/dashboard-stats', (req, res) => {
  console.log('🔍 Dashboard stats endpoint called at', new Date().toISOString());
  
  // Test database connection first
  db.query('SELECT 1 as test', (err, testResult) => {
    if (err) {
      console.error('❌ Database connection test failed:', err);
      return res.status(500).json({ error: 'Database connection failed: ' + err.message });
    }
    
    console.log('✅ Database connection test passed', testResult);
    
    const userCountQuery = `
      SELECT 
        COUNT(*) as totalUsers,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as adminCount,
        SUM(CASE WHEN role = 'manager' THEN 1 ELSE 0 END) as managerCount,
        SUM(CASE WHEN role = 'employee' THEN 1 ELSE 0 END) as employeeCount
      FROM users
    `;
    
    console.log('🔍 Executing user count query...');
    db.query(userCountQuery, (err, userResults) => {
      if (err) {
        console.error('❌ User stats error:', err);
        return res.status(500).json({ error: 'User query failed: ' + err.message });
      }
      
      console.log('✅ User query completed:', userResults);
      
      const templateCountQuery = `
        SELECT 
          COUNT(*) as totalTemplates,
          SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftCount,
          SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as publishedCount
        FROM email_template_drafts
      `;
      
      console.log('🔍 Executing template count query...');
      db.query(templateCountQuery, (err, templateResults) => {
        if (err) {
          console.error('❌ Template stats error:', err);
          return res.status(500).json({ error: 'Template query failed: ' + err.message });
        }
        
        console.log('✅ Template query completed:', templateResults);
        
        const userStats = userResults[0];
        const templateStats = templateResults[0];
        
        const stats = {
          totalUsers: userStats.totalUsers,
          totalTemplates: templateStats.totalTemplates,
          usersByRole: {
            admin: userStats.adminCount || 0,
            manager: userStats.managerCount || 0,
            employee: userStats.employeeCount || 0
          },
          templatesByStatus: {
            draft: templateStats.draftCount || 0,
            published: templateStats.publishedCount || 0
          }
        };
        
        console.log('📊 Final dashboard stats:', stats);
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
  console.log('📧 Saving template...');
  
  const { template_name, created_by, subject, email_body, email_css, recipients, status } = req.body;
  
  console.log('📧 Received template data:', {
    template_name,
    created_by,
    subject,
    email_body: email_body ? email_body.substring(0, 100) + '...' : 'empty',
    email_css: email_css ? 'CSS included' : 'No CSS',
    recipients,
    status
  });

  // Validate required fields
  if (!template_name || !created_by || !subject || !email_body) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const recipientsJson = JSON.stringify(recipients || []);
  
  try {
    // Create new template
    const insertQuery = `
      INSERT INTO email_template_drafts (template_name, created_by, subject, body, email_css, recipients, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    
    db.query(insertQuery, [template_name, created_by, subject, email_body, email_css || '', recipientsJson, status], 
      async (err, result) => {
        if (err) {
          console.error('❌ Insert error:', err);
          return res.status(500).json({ error: err.message });
        }
        
        console.log('✅ Template created successfully! ID:', result.insertId);
        
        // If publishing, send emails
        if (status === 'published') {
          console.log('📤 Publishing template - sending emails...');
          try {
            const emailResult = await emailService.sendTemplateEmails({
              template_name,
              subject,
              email_body,
              email_css: email_css || '',
              created_by,
              recipients: recipients || []
            });
            
            console.log('📧 Email sending completed:', emailResult);
            res.json({ 
              id: result.insertId, 
              message: 'Template published and emails sent successfully!',
              emailResult 
            });
          } catch (emailError) {
            console.error('❌ Email sending error:', emailError);
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
    console.error('❌ Template creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get single template
app.get('/api/templates/:id', (req, res) => {
  const templateId = req.params.id;
  
  db.query('SELECT * FROM email_template_drafts WHERE id = ?', [templateId], (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
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
  console.log('📝 Updating template ID:', templateId);
  
  const { template_name, created_by, subject, email_body, email_css, recipients, status } = req.body;
  
  console.log('📧 Received update data:', {
    template_name,
    created_by,
    subject,
    email_body: email_body ? email_body.substring(0, 100) + '...' : 'empty',
    email_css: email_css ? 'CSS included' : 'No CSS',
    recipients,
    status
  });

  try {
    // First get the existing template to check what fields are being updated
    const getQuery = 'SELECT * FROM email_template_drafts WHERE id = ?';
    db.query(getQuery, [templateId], (err, results) => {
      if (err) {
        console.error('❌ Database error getting template:', err);
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
      
      if (email_body !== undefined) {
        updateFields.push('body = ?');
        updateValues.push(email_body);
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
      
      console.log('🔧 Update query:', updateQuery);
      console.log('🔧 Update values:', updateValues);
    
      db.query(updateQuery, updateValues, async (err, result) => {
        if (err) {
          console.error('❌ Update error:', err);
          return res.status(500).json({ error: err.message });
        }
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Template not found' });
        }
        
        console.log('✅ Template updated successfully! ID:', templateId);
        
        // If publishing, send emails
        if (status === 'published') {
          console.log('📤 Publishing template - sending emails...');
          try {
            const emailResult = await emailService.sendTemplateEmails({
              template_name: template_name || existingTemplate.template_name,
              subject: subject || existingTemplate.subject,
              email_body: email_body || existingTemplate.body,
              email_css: email_css || existingTemplate.email_css || '',
              created_by: created_by || existingTemplate.created_by || 'System',
              recipients: recipients || JSON.parse(existingTemplate.recipients || '[]')
            });
            
            console.log('📧 Email sending completed:', emailResult);
            res.json({ 
              id: templateId, 
              message: 'Template updated and emails sent successfully!',
              emailResult 
            });
          } catch (emailError) {
            console.error('❌ Email sending error:', emailError);
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
    console.error('❌ Template update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Publish template and send emails
app.post('/api/publish-template/:id', async (req, res) => {
  const templateId = req.params.id;
  
  console.log('🚀 Publishing template ID:', templateId);
  
  // Get template details
  db.query('SELECT * FROM email_template_drafts WHERE id = ?', [templateId], async (err, results) => {
    if (err) {
      console.error('❌ Database error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      console.error('❌ Template not found');
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = results[0];
    console.log('📄 Found template:', template.template_name);
    
    // Update status to published
    db.query('UPDATE email_template_drafts SET status = "published", updated_at = NOW() WHERE id = ?', [templateId], async (err) => {
      if (err) {
        console.error('❌ Update error:', err);
        return res.status(500).json({ error: err.message });
      }
      
      console.log('✅ Template status updated to published');
      
      // Send emails
      try {
        const recipients = JSON.parse(template.recipients || '[]');
        console.log('👥 Sending emails to recipients:', recipients);
        
        const emailResult = await emailService.sendTemplateEmails({
          template_name: template.template_name,
          subject: template.subject,
          email_body: template.body,
          email_css: template.email_css || '',
          created_by: template.created_by,
          recipients: recipients
        });
        
        console.log('📧 Email sending completed:', emailResult);
        res.json({ message: 'Template published and emails sent successfully!', result: emailResult });
      } catch (error) {
        console.error('❌ Email sending error:', error);
        res.json({ message: 'Template published but email sending failed: ' + error.message });
      }
    });
  });
});

// Send test email endpoint
app.post('/api/send-test-email', async (req, res) => {
  console.log('📧 Sending test email...');
  
  const { template_name, subject, email_body, email_css, created_by, test_email } = req.body;
  
  if (!test_email) {
    return res.status(400).json({ error: 'Test email address is required' });
  }
  
  try {
    const result = await emailService.sendTestEmail({
      template_name: template_name || 'Test Template',
      subject: subject || 'Test Email',
      email_body: email_body || '<p>Test email content</p>',
      email_css: email_css || '',
      created_by: created_by || 'Test User'
    }, test_email);
    
    console.log('✅ Test email sent successfully');
    res.json({ message: 'Test email sent successfully!', result });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({ error: 'Failed to send test email: ' + error.message });
  }
});

// Delete template endpoint
app.delete('/api/templates/:id', (req, res) => {
  const templateId = req.params.id;
  
  console.log('🗑️ Deleting template ID:', templateId);
  
  db.query('DELETE FROM email_template_drafts WHERE id = ?', [templateId], (err, result) => {
    if (err) {
      console.error('❌ Delete error:', err);
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log('✅ Template deleted successfully');
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
    
    console.log('📸 Image uploaded:', {
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
    console.error('❌ Upload error:', error);
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
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📧 Email configuration:');
  console.log(`  - SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
  console.log(`  - SMTP User: ${process.env.SMTP_USER}`);
  console.log(`  - Database: ${process.env.DB_NAME || 'workflow_platform'}`);
  console.log('');
  console.log('📊 Available endpoints:');
  console.log('  - GET  /api/dashboard-stats');
  console.log('  - GET  /api/email-templates');
  console.log('  - POST /api/templates (Save/Publish)');
  console.log('  - GET  /api/templates/:id');
  console.log('  - POST /api/publish-template/:id');
  console.log('  - DELETE /api/templates/:id');
  console.log('  - POST /api/send-test-email (Debug)');
  console.log('  - POST /api/upload-image');
  console.log('');
  console.log('✅ Server ready for email template management!');
});
