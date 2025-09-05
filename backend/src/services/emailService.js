const nodemailer = require('nodemailer');
const Handlebars = require('handlebars');
const juice = require('juice');
const db = require('../config/database');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  // Fetch users by roles from database
  async getUsersByRoles(roles) {
    return new Promise((resolve, reject) => {
      if (!roles || roles.length === 0) {
        return resolve([]);
      }
      
      const placeholders = roles.map(() => '?').join(',');
      const query = `SELECT id, name, email, role FROM users WHERE role IN (${placeholders}) AND email IS NOT NULL`;
      
      db.query(query, roles, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Clean and optimize HTML for email clients
  cleanHtmlForEmail(html) {
    // Remove GrapesJS specific attributes and classes
    let cleanHtml = html
      .replace(/data-gjs-[^=]*="[^"]*"/g, '') // Remove GrapesJS data attributes
      .replace(/class="[^"]*gjs[^"]*"/g, '') // Remove GrapesJS classes
      .replace(/draggable="[^"]*"/g, '') // Remove draggable attributes
      .replace(/contenteditable="[^"]*"/g, '') // Remove contenteditable
      .replace(/spellcheck="[^"]*"/g, '') // Remove spellcheck
      .replace(/\s+class=""/g, '') // Remove empty class attributes
      .replace(/\s+style=""/g, '') // Remove empty style attributes
      .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
      .trim();

    return cleanHtml;
  }

  // Replace template variables with actual data
  replaceVariables(content, userData) {
    const template = Handlebars.compile(content);
    return template(userData);
  }

  // Create proper email HTML structure with inlined CSS
  createEmailHtml(content, css) {
    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Email Template</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Email client resets */
        body, table, td, p, a, li, blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        table, td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            max-width: 100%;
        }
        table {
            border-collapse: collapse !important;
        }
        body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: 100% !important;
        }
        
        /* Default font styles */
        body, td, p, a {
            font-family: 'Inter', Arial, sans-serif;
            font-size: 14px;
            line-height: 1.4;
        }
        
        /* Custom styles */
        ${css || ''}
    </style>
</head>
<body style="margin: 0; padding: 0; width: 100%; height: 100%; background-color: #f8f9fa; font-family: 'Inter', Arial, sans-serif;">
    <div style="width: 100%; background-color: #f8f9fa; padding: 20px 0;">
        ${content}
    </div>
</body>
</html>`;

    // Use juice to inline CSS styles
    try {
      const inlinedHtml = juice(htmlTemplate, {
        removeStyleTags: false, // Keep style tags for email clients that support them
        preserveMediaQueries: true,
        preserveFontFaces: true,
        insertPreservedExtraCss: false
      });
      return inlinedHtml;
    } catch (error) {
      console.error('Error inlining CSS:', error);
      // Return original HTML if CSS inlining fails
      return htmlTemplate;
    }
  }

  // Send template emails to recipients
  async sendTemplateEmails(templateData) {
    const { template_name, subject, email_body, email_css, created_by, recipients } = templateData;
    
    console.log('📧 Sending template emails:', {
      template: template_name,
      recipients: recipients,
      created_by
    });

    // Fetch users from database based on selected roles
    const users = await this.getUsersByRoles(recipients);
    
    if (users.length === 0) {
      throw new Error('No valid users found for selected roles');
    }

    console.log(`👥 Found ${users.length} users for roles:`, recipients);

    const results = [];
    
    for (const user of users) {
      try {
        // Use actual user data from database
        const userData = {
          name: user.name,
          email: user.email,
          role: user.role
        };

        // Clean and replace variables in content
        const cleanedHtml = this.cleanHtmlForEmail(email_body);
        const personalizedContent = this.replaceVariables(cleanedHtml, userData);
        const personalizedSubject = this.replaceVariables(subject, userData);

        // Create proper email HTML with CSS embedded
        const fullHtml = this.createEmailHtml(personalizedContent, email_css);

        const mailOptions = {
          from: `"${created_by}" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: personalizedSubject,
          html: fullHtml
        };

        const result = await this.transporter.sendMail(mailOptions);
        results.push({
          email: user.email,
          name: user.name,
          role: user.role,
          status: 'sent',
          messageId: result.messageId
        });

        console.log(`✅ Email sent to ${user.name} (${user.email}) - Message ID: ${result.messageId}`);

      } catch (error) {
        console.error(`❌ Failed to send email to ${user.name} (${user.email}):`, error.message);
        results.push({
          email: user.email,
          name: user.name,
          role: user.role,
          status: 'failed',
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failureCount = results.filter(r => r.status === 'failed').length;

    console.log(`📊 Email sending completed: ${successCount} sent, ${failureCount} failed`);

    return {
      template_name,
      total_recipients: users.length,
      sent: successCount,
      failed: failureCount,
      results
    };
  }

  // Send test email
  async sendTestEmail(templateData, testEmail) {
    console.log(`📧 Sending test email to: ${testEmail}`);

    const userData = {
      name: 'Test User',
      email: testEmail,
      role: 'Test Role',
      company: 'Workflow Platform',
      date: new Date().toLocaleDateString()
    };

    const cleanedHtml = this.cleanHtmlForEmail(templateData.email_body);
    const personalizedContent = this.replaceVariables(cleanedHtml, userData);
    const personalizedSubject = `[TEST] ${this.replaceVariables(templateData.subject, userData)}`;

    // Create proper email HTML with CSS embedded
    const fullHtml = this.createEmailHtml(personalizedContent, templateData.email_css);

    const mailOptions = {
      from: `"${templateData.created_by}" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: personalizedSubject,
      html: fullHtml
    };

    const result = await this.transporter.sendMail(mailOptions);
    console.log(` Test email sent successfully`);

    return {
      messageId: result.messageId,
      recipient: testEmail,
      status: 'sent'
    };
  }
}

module.exports = new EmailService();
