# Workflow Platform - Email Template Editor

A modern, modular email template editor built with React, Node.js, Express, and MySQL. Features a custom drag-and-drop interface similar to GrapesJS but built from scratch.

## 🏗️ Project Structure

```
Workflow Platform/
├── backend/                 # Node.js/Express API server
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   └── services/       # Email service
│   ├── uploads/            # Image uploads directory
│   ├── app.js             # Main server file
│   ├── package.json       # Backend dependencies
│   └── .env               # Backend environment variables
│
├── frontend/               # React TypeScript application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── .env               # Frontend environment variables
│
├── README.md              # This file
└── .gitignore            # Git ignore rules
```

## ✨ Features

- **Custom Email Editor**: Modular, GrapesJS-like editor built from scratch
- **Drag & Drop**: Intuitive block-based email composition
- **Modern UI**: Clean, responsive interface with modern CSS
- **Template Management**: Save, edit, and publish email templates
- **Dashboard Analytics**: User and template statistics
- **Email Sending**: MJML-powered email generation and SMTP delivery
- **Image Uploads**: File upload support for email assets
- **Database Integration**: MySQL for data persistence

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MySQL (v5.7+)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Database Setup
Configure your MySQL database and update `backend/.env` with your credentials.

## 🔧 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=workflow_platform
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
PORT=3001
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

## 📱 Usage

1. Start both backend and frontend servers
2. Access the application at `http://localhost:3000`
3. Use the dashboard to manage templates
4. Create new email templates with the visual editor
5. Publish and send emails to recipients

## 🛠️ Technologies

- **Frontend**: React 18, TypeScript, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Email**: MJML, Nodemailer
- **File Upload**: Multer
- **Styling**: Modern CSS with custom components

## 📝 API Endpoints

- `GET /api/dashboard-stats` - Dashboard statistics
- `GET /api/email-templates` - List all templates
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Delete template
- `POST /api/publish-template/:id` - Publish and send template
- `POST /api/upload-image` - Upload image assets

## 🎯 Key Components

### Frontend
- `Dashboard`: Main dashboard with statistics and template management
- `EmailStudio`: Visual email editor with drag-and-drop functionality
- `BlocksPanel`: Component library for email elements
- `StylesPanel`: CSS styling controls
- `LayersPanel`: Template structure view
- `Canvas`: Email preview and editing area

### Backend
- `app.js`: Main Express server
- `database.js`: MySQL connection and configuration
- `emailService.js`: MJML compilation and email sending

## 🔒 Security Features

- Input validation and sanitization
- File upload restrictions
- Environment variable protection
- CORS configuration
- SQL injection prevention

## 📊 Performance

- Optimized React components with TypeScript
- Efficient database queries
- Image optimization for uploads
- Responsive design for all devices

## 🤝 Contributing

This is a custom-built email platform designed for workflow automation and email engagement. The codebase is clean, modular, and well-documented for easy maintenance and expansion. - Full Stack Email Template Management

A modern full-stack email template management system with React.js frontend and Node.js backend API.

## 🏗️ Architecture

### Frontend (React.js + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Components**: Modern React functional components with hooks
- **State Management**: React Context API / Redux (if needed)
- **HTTP Client**: Axios for API calls
- **Email Editor**: GrapesJS integration for drag-and-drop editing
- **Styling**: CSS Modules / Styled Components

### Backend (Node.js + Express)
- **Framework**: Express.js REST API
- **Database**: MySQL with mysql2 driver
- **Email Service**: Nodemailer with Gmail SMTP
- **File Upload**: Multer for image uploads
- **Authentication**: JWT (to be implemented)
- **CORS**: Enabled for frontend communication

## 📁 Project Structure

```
Workflow Platform/
├── frontend/                    # React.js application
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service calls
│   │   ├── types/             # TypeScript type definitions
│   │   ├── utils/             # Utility functions
│   │   └── App.tsx            # Main App component
│   ├── package.json
│   └── tsconfig.json
├── backend/                     # Node.js API server
│   ├── src/
│   │   ├── config/            # Database configuration
│   │   └── services/          # Business logic services
│   ├── uploads/               # Image uploads directory
│   ├── app.js                 # Express server
│   ├── package.json
│   └── .env                   # Environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- Gmail account with App Password

### Easy Setup (Recommended)

1. **Clone and navigate to project**
   ```bash
   git clone <repository-url>
   cd "Workflow Platform"
   ```

2. **Configure environment (one-time setup)**
   Edit `backend/.env` file with your database and email settings:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=workflow_platform
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   PORT=3001
   ```

3. **Start both servers**
   ```bash
   ./start.sh
   ```
   This automatically starts:
   - Backend API server on http://localhost:3001
   - React frontend on http://localhost:3000

### Manual Setup

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start backend server**
   ```bash
   npm start
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start React development server**
   ```bash
   npm start
   ```
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=workflow_platform

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password

   # Server Configuration
   PORT=3001
   ```

4. **Set up MySQL Database**
   ```sql
   CREATE DATABASE workflow_platform;
   USE workflow_platform;

   -- Users table
   CREATE TABLE users (
     id INT PRIMARY KEY AUTO_INCREMENT,
     name VARCHAR(255) NOT NULL,
     email VARCHAR(255) UNIQUE NOT NULL,
     role ENUM('software_engineer', 'tester', 'ba', 'product_manager', 'manager', 'hr', 'vp', 'admin') NOT NULL,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );

   -- Email templates table
   CREATE TABLE email_template_drafts (
     id INT PRIMARY KEY AUTO_INCREMENT,
     template_name VARCHAR(255) NOT NULL,
     created_by VARCHAR(255) NOT NULL,
     subject VARCHAR(255) NOT NULL,
     body TEXT NOT NULL,
     email_css TEXT,
     recipients JSON,
     status ENUM('draft', 'published') DEFAULT 'draft',
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

5. **Start the server**
   ```bash
   npm start
   # or for development
   node app.js
   ```

## Usage

### Dashboard
- View user statistics by role
- Manage email templates (view, edit, delete, publish)
- Quick access to create new templates

### Email Editor
- **Template Information**: Set name, creator, and subject
- **Recipients**: Select target user roles
- **Components**: Drag and drop email components
  - Text blocks with variable support
  - Images with upload functionality
  - Buttons, dividers, headers, footers
- **Variables**: Dynamic content replacement
  - `{{name}}` - User's name
  - `{{email}}` - User's email
  - `{{role}}` - User's role
  - `{{company}}` - Company name
  - `{{date}}` - Current date

### API Endpoints

- `GET /` - Dashboard page
- `GET /template-editor` - Email editor page
- `GET /dashboard-stats` - Dashboard statistics
- `GET /email-templates` - List all templates
- `POST /api/templates` - Save/publish template
- `GET /api/templates/:id` - Get single template
- `POST /publish-template/:id` - Publish template and send emails
- `POST /send-test-email` - Send test email
- `DELETE /delete-template/:id` - Delete template
- `POST /upload-image` - Upload image for templates

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Frontend**: HTML, CSS, JavaScript, jQuery
- **Email Editor**: GrapesJS
- **Template Engine**: Pug
- **Email Service**: Nodemailer
- **File Upload**: Multer

## Development

### Adding New User Roles
1. Update the role enum in the users table
2. Add role to email mapping in `src/services/emailService.js`
3. Add recipient option in `views/template-editor.pug`

### Customizing Email Components
- Modify block definitions in `public/hybrid-editor.js`
- Add new component types in the GrapesJS configuration
- Update component grid in `views/template-editor.pug`

### Environment Setup
Make sure to configure your email provider (Gmail, SendGrid, etc.) and update the SMTP settings in your `.env` file.

## Security Notes

- File uploads are restricted to images only
- File size limited to 5MB
- SQL queries use parameterized statements
- Environment variables for sensitive data

## 🧹 Project Cleanup

If you've migrated from an older version, you can clean up old files:

```bash
./cleanup.sh
```

This script will:
- Move old files to a `backup/` directory
- Keep only the essential frontend/backend structure
- Remove redundant node_modules and configuration files

You can safely delete the `backup/` directory once you've confirmed everything works.

## 📄 License

MIT License - see LICENSE file for details.
