import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { templateService } from '../services/api';
import './EmailStudio.css';

// Import modular components
import BlocksPanel from './EmailStudio/BlocksPanel';
import Canvas from './EmailStudio/Canvas';
import StylesPanel from './EmailStudio/StylesPanel';
import LayersPanel from './EmailStudio/LayersPanel';
import VariablesPanel from './EmailStudio/VariablesPanel';

// Import types and utilities
import { EmailComponent, TemplateFormData, User, EmailTemplate } from './EmailStudio/types';
import { generateId, generateHTML, generateCSS, updateComponentById, deleteComponentById } from './EmailStudio/utils';

const EmailStudio: React.FC = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Custom Editor State
  const [components, setComponents] = useState<EmailComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<EmailComponent | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [users, setUsers] = useState<User[]>([]);
  const [leftActiveTab, setLeftActiveTab] = useState<'blocks' | 'variables'>('blocks');
  const [rightActiveTab, setRightActiveTab] = useState<'styles' | 'layers'>('styles');
  const [formData, setFormData] = useState<TemplateFormData>({
    templateName: 'New Email Template',
    subject: 'Email Subject'
  });

  // Viewport mode for responsive preview
  const [viewportMode, setViewportMode] = useState<'desktop' | 'mobile'>('desktop');

  // History management for undo/redo
  const [history, setHistory] = useState<EmailComponent[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // History management functions
  const saveToHistory = useCallback((newComponents: EmailComponent[]) => {
    if (!Array.isArray(newComponents)) return;
    
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push([...newComponents]);
      return newHistory.slice(-50); // Keep only last 50 states
    });
    setHistoryIndex(prev => Math.min(prev + 1, 49));
  }, [historyIndex]);

  // Initialize history when components change
  useEffect(() => {
    if (components.length > 0 && history.length === 1 && history[0].length === 0) {
      // Initialize history with current state if it's empty
      setHistory([[...components]]);
      setHistoryIndex(0);
    }
  }, [components, history]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const historyState = history[newIndex];
      if (historyState && Array.isArray(historyState)) {
        setHistoryIndex(newIndex);
        setComponents([...historyState]);
        setSelectedComponent(null);
      }
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const historyState = history[newIndex];
      if (historyState && Array.isArray(historyState)) {
        setHistoryIndex(newIndex);
        setComponents([...historyState]);
        setSelectedComponent(null);
      }
    }
  }, [history, historyIndex]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Debug history state
  useEffect(() => {
    console.log('History state:', { 
      historyLength: history.length, 
      historyIndex, 
      canUndo, 
      canRedo,
      currentHistoryItem: history[historyIndex]?.length 
    });
  }, [history, historyIndex, canUndo, canRedo]);

  // Custom Editor Functions
  const addComponent = useCallback((component: EmailComponent) => {
    const newComponent: EmailComponent = {
        ...component,
        id: generateId(),
        children: component.children?.map((child: EmailComponent) => ({ // Specify the type here
            ...child,
            id: generateId(),
        })),
    };
    
    // If a container-type component is selected, add as child
    if (selectedComponent && ['container', 'row', 'column'].includes(selectedComponent.type)) {
      setComponents(prev => {
        const updated = updateComponentById(prev, selectedComponent.id, {
          children: [...(selectedComponent.children || []), newComponent]
        });
        // Save to history after state update
        setTimeout(() => saveToHistory(updated), 0);
        return updated;
      });
    } else {
      // Add to root level
      setComponents(prev => {
        const newComponents = [...prev, newComponent];
        // Save to history after state update
        setTimeout(() => saveToHistory(newComponents), 0);
        return newComponents;
      });
    }
  }, [selectedComponent, saveToHistory]);

  const reorderComponents = useCallback((newComponents: EmailComponent[]) => {
    setComponents(newComponents);
    saveToHistory(newComponents);
  }, [saveToHistory]);

  const updateComponent = useCallback((id: string, updates: Partial<EmailComponent>) => {
    setComponents(prev => {
      const updated = updateComponentById(prev, id, updates);
      setTimeout(() => saveToHistory(updated), 0);
      return updated;
    });
  }, [saveToHistory]);

  const deleteComponent = useCallback((id: string) => {
    setComponents(prev => {
      const updated = deleteComponentById(prev, id);
      setTimeout(() => saveToHistory(updated), 0);
      return updated;
    });
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
  }, [selectedComponent, saveToHistory]);

  const selectComponent = useCallback((component: EmailComponent | null) => {
    setSelectedComponent(component);
  }, []);

  const moveComponent = useCallback((id: string, direction: 'up' | 'down') => {
    setComponents(prev => {
      const index = prev.findIndex(comp => comp.id === id);
      if (index === -1) return prev;
      
      const newComponents = [...prev];
      if (direction === 'up' && index > 0) {
        [newComponents[index], newComponents[index - 1]] = [newComponents[index - 1], newComponents[index]];
      } else if (direction === 'down' && index < newComponents.length - 1) {
        [newComponents[index], newComponents[index + 1]] = [newComponents[index + 1], newComponents[index]];
      }
      
      return newComponents;
    });
  }, []);

  // Template variables for dynamic content
  const templateVariables = [
    { key: 'userName', label: 'User Name', example: 'John Doe' },
    { key: 'userEmail', label: 'User Email', example: 'john@example.com' },
    { key: 'companyName', label: 'Company Name', example: 'Acme Corp' },
    { key: 'currentDate', label: 'Current Date', example: '2025-08-26' },
    { key: 'customMessage', label: 'Custom Message', example: 'Welcome aboard!' }
  ];

  // Default email template with modern styling
  const getDefaultTemplate = () => `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700;">Welcome to Email Studio</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 16px 0 0 0; font-size: 18px;">Create beautiful emails with ease</p>
      </div>
      
      <div style="padding: 40px 20px;">
        <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hello {{userName}}!</h2>
        <p style="color: #666; line-height: 1.6; font-size: 16px; margin: 0 0 24px 0;">
          This is your new email template. You can customize this content, add images, buttons, and much more using our visual editor.
        </p>
        
        <div style="text-align: center; margin: 32px 0;">
          <a href="#" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
            Get Started
          </a>
        </div>
        
        <div style="background: #f8fafc; padding: 24px; border-radius: 12px; margin: 32px 0;">
          <h3 style="color: #333; margin: 0 0 16px 0; font-size: 18px;">Features you'll love:</h3>
          <ul style="color: #666; line-height: 1.8; margin: 0; padding-left: 20px;">
            <li>Drag & drop email builder</li>
            <li>Beautiful pre-designed templates</li>
            <li>Mobile-responsive designs</li>
            <li>Dynamic content variables</li>
          </ul>
        </div>
      </div>
      
      <div style="background: #f9fafb; padding: 24px 20px; text-align: center; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; margin: 0; font-size: 14px;">
          © 2025 {{companyName}}. All rights reserved.
        </p>
      </div>
    </div>
  `;

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users');
      const usersData = await response.json();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  // Initialize Email Editor
  const initializeEditor = useCallback(async () => {
    console.log('initializeEditor called');
    // Don't require canvasRef for template loading, only for canvas-specific operations
    
    try {
      // Load template if editing existing one  
      let template = null;
      if (templateId && templateId !== 'new') {
        console.log('Fetching template with ID:', templateId);
        try {
          template = await templateService.getById(templateId);
          console.log('Template loaded successfully:', template);
          setFormData({
            templateName: template.template_name,
            subject: template.subject
          });
        } catch (error) {
          console.error('Error loading template:', error);
        }
      }
      
      console.log('Template from loadTemplate:', template);
      
      // Initialize with template content or default
      if (template?.body) {
        console.log('Template has body, attempting to parse:', template.body);
        // Try to parse body as components JSON first
        try {
          const parsedComponents = JSON.parse(template.body);
          console.log('Parsed components:', parsedComponents);
          if (Array.isArray(parsedComponents)) {
            console.log('Setting components from parsed data');
            setComponents(parsedComponents);
            // Initialize history with loaded components
            setTimeout(() => {
              setHistory([parsedComponents]);
              setHistoryIndex(0);
            }, 0);
            return; // Successfully loaded components
          }
        } catch (parseError) {
          console.log('Failed to parse body as JSON, creating default component with HTML content:', parseError);
        }
        
        // If body is HTML, create a single HTML component
        // If body is HTML, create a single HTML component
        const htmlComponent: EmailComponent = {
          id: generateId(),
          type: 'text',
          content: template.body.replace(
              /<body[^>]*>|<\/body>/g,
              '' // Remove body tags
          ),
          styles: {
              fontSize: '16px',
              color: '#333333',
              padding: '20px',
              fontFamily: 'Arial, sans-serif',
              lineHeight: '1.6',
          },
          attributes: {},
          children: [] // Add this line to satisfy the required 'children' property
        };
        
        const htmlComponents = [htmlComponent];
        console.log('Created HTML component from template body');
        setComponents(htmlComponents);
        setTimeout(() => {
          setHistory([htmlComponents]);
          setHistoryIndex(0);
        }, 0);
      } else {
        console.log('No template body, starting with default components');
        // Start with a default text component
        const defaultComponents = [
          {
            id: generateId(),
            type: 'text',
            content: 'Welcome! Start building your email template.',
            styles: {
              fontSize: '18px',
              color: '#333333',
              padding: '20px',
              textAlign: 'center',
            },
            attributes: {},
          },
        ] as EmailComponent[];
        setComponents(defaultComponents);
        // Initialize history with default components
        setTimeout(() => {
          setHistory([defaultComponents]);
          setHistoryIndex(0);
        }, 0);
      }

    } catch (error) {
      console.error('Error initializing editor:', error);
    }
  }, [templateId]); // Remove loadTemplate dependency

  // Variable insertion helper
  const insertVariable = useCallback((variableKey: string) => {
    if (!selectedComponent) {
      alert('Please select a text component first to insert the variable');
      return;
    }
    
    if (selectedComponent.type === 'text') {
      const updatedContent = selectedComponent.content + `{{${variableKey}}}`;
      updateComponent(selectedComponent.id, { content: updatedContent });
      console.log(`✅ Inserted variable {{${variableKey}}} into selected component`);
    } else {
      alert('Variables can only be inserted into text components');
    }
  }, [selectedComponent, updateComponent]);

  // Save Template
  const handleSave = useCallback(async (status: 'draft' | 'published') => {
    try {
      setIsSaving(true);
      
      // Convert components to HTML and generate CSS
      const html = generateHTML(components);
      const css = generateCSS(components);
      
      // Wrap HTML in email container for consistent rendering
      const wrappedHtml = `<div class="email-container">${html}</div>`;
      
      const templateData = {
        template_name: formData.templateName,
        created_by: 'Email Studio User',
        subject: formData.subject,
        email_body: wrappedHtml,
        email_css: css,
        body: JSON.stringify(components), // Store components as JSON in body field
        status
      };

      if (templateId && templateId !== 'new') {
        await templateService.update(templateId, templateData);
      } else {
        const newTemplate = await templateService.create(templateData);
        navigate(`/studio/${newTemplate.id}`);
      }
      
      alert('Template saved successfully! 🎉');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Error saving template. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [components, formData, templateId, navigate]);

  // Preview Generation
  const generatePreview = useCallback(() => {
    const html = generateHTML(components);
    const css = generateCSS(components);
    
    const mobileStyles = previewViewport === 'mobile' ? `
      /* Mobile-specific overrides */
      @media screen and (max-width: 600px) {
        body {
          // width: 375px !important;
          width: 94% !important;
          max-width: 375px !important;
          padding: 10px !important;
        }
        .email-container {
          padding: 10px !important;
          margin: 0 !important;
          max-width: 355px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        
        /* Force mobile layout */
        div[style*="display: flex"] {
          display: block !important;
          width: 100% !important;
        }
        
        div[style*="flex:"] {
          display: block !important;
          width: 100% !important;
          margin-bottom: 10px !important;
          flex: none !important;
        }
        
        div[style*="display: inline-block"] {
          display: block !important;
          width: 100% !important;
          margin-bottom: 10px !important;
        }
        
        .mobile-hidden {
          display: none !important;
        }
        .mobile-center {
          text-align: center !important;
        }
      }
      
      /* Apply mobile styles immediately for mobile preview */
      body {
        width: 375px !important;
        // max-width: 375px !important;
        width: 94% !important;
        padding: 10px !important;
      }
      .email-container {
        padding: 10px !important;
        margin: 0 !important;
        max-width: 355px !important;
        width: 100% !important;
        box-sizing: border-box !important;
      }
      
      div[style*="display: flex"] {
        display: block !important;
        width: 100% !important;
      }
      
      div[style*="flex:"] {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px !important;
        flex: none !important;
      }
      
      div[style*="display: inline-block"] {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px !important;
      }
    ` : '';
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Email Preview</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background: #f8fafc;
            min-height: 100vh;
            ${previewViewport === 'mobile' ? 'width: 375px; max-width: 375px;' : ''}
          }
          .email-container {
            background: white;
            border-radius: 8px;
            border: 2px solid #e2e8f0;
            padding: 20px;
            min-height: 400px;
            ${previewViewport === 'mobile' ? 'max-width: 335px; margin: 0 auto;' : ''}
          }
          /* Ensure white backgrounds are visible */
          [style*="background-color: white"],
          [style*="background-color: #ffffff"],
          [style*="background-color: #fff"],
          [style*="background-color: rgb(255, 255, 255)"],
          [style*="background: white"],
          [style*="background: #ffffff"],
          [style*="background: #fff"] {
            background-color: white !important;
          }
          ${css}
          ${mobileStyles}
        </style>
      </head>
      <body>
        <div class="email-container">
          ${html}
        </div>
      </body>
      </html>
    `;
  }, [components, previewViewport]);

  // Initialize on mount and when templateId changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Separate effect for template loading to avoid infinite loops
  useEffect(() => {
    initializeEditor();
  }, [templateId]); // Only re-initialize when templateId changes

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="email-studio">
      {/* Header */}
      <header className="studio-header">
        <div className="header-left">
          <button
            className="back-button"
            onClick={() => navigate('/dashboard')}
          >
            ← Back to Dashboard
          </button>
          
          {/* <div className="template-info">
            <h1>Email Studio</h1>
            <span className="template-badge">Creative Mode</span>
          </div> */}
        </div>
        
        <div className="header-center">
          {/* <div className="viewport-controls">
            <button
              className={`viewport-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
              onClick={() => setViewportMode('desktop')}
              title="Desktop View"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
              </svg>
              Desktop
            </button>
            <button
              className={`viewport-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewportMode('mobile')}
              title="Mobile View"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H7V6h10v10z"/>
              </svg>
              Mobile
            </button>
          </div> */}
          <div className="template-fields">
            <div className="template-field">
              <label htmlFor="template-name" className="field-label">Template Name</label>
              <input
                id="template-name"
                type="text"
                value={formData.templateName}
                onChange={(e) => setFormData(prev => ({ ...prev, templateName: e.target.value }))}
                className="template-field-input template-name-input"
                placeholder="Enter template name"
              />
            </div>
            <div className="template-field">
              <label htmlFor="email-subject" className="field-label">
                Email Subject
                <span className={`subject-counter ${formData.subject.length > 50 ? 'warning' : ''}`}>
                  {formData.subject.length}/50
                </span>
              </label>
              <input
                id="email-subject"
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="template-field-input subject-input"
                placeholder="Enter email subject line"
                maxLength={100}
              />
            </div>
          </div>
        </div>
        
        <div className="header-right">
          <button
            className="action-button preview-btn"
            onClick={() => setShowPreview(true)}
          >
            Preview
          </button>
          <button
            className="action-button save-btn"
            onClick={() => handleSave('draft')}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      {/* Main Studio */}
      <div className="studio-workspace">
        {/* Left Sidebar - Blocks & Variables */}
        <aside className="left-sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`tab-button ${leftActiveTab === 'blocks' ? 'active' : ''}`}
              onClick={() => setLeftActiveTab('blocks')}
            >
              <svg className="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4z"/>
              </svg>
              Blocks
            </button>
            <button 
              className={`tab-button ${leftActiveTab === 'variables' ? 'active' : ''}`}
              onClick={() => setLeftActiveTab('variables')}
            >
              <svg className="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M5 5h2v2H5V5zm0 4h2v2H5V9zm0 4h2v2H5v-2zm4-8h6v2H9V5zm0 4h6v2H9V9zm0 4h6v2H9v-2z"/>
              </svg>
              Variables
            </button>
          </div>
          
          <div className="sidebar-content">
            {leftActiveTab === 'blocks' && (
              <BlocksPanel 
                onAddComponent={addComponent} 
                selectedComponent={selectedComponent}
              />
            )}
            
            {leftActiveTab === 'variables' && (
              <VariablesPanel 
                users={users}
                selectedComponent={selectedComponent}
                onInsertVariable={insertVariable}
              />
            )}
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="canvas-area">
          <div className="canvas-toolbar">
            <div id="toolbar-panel" className="toolbar-actions">
              <div className="toolbar-group">
                <button
                  className={`toolbar-btn ${!canUndo ? 'disabled' : ''}`}
                  onClick={undo}
                  disabled={!canUndo}
                  title="Undo (Ctrl+Z)"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.05 9h4.95a3 3 0 110 6H3.05M3.05 9l3-3m-3 3l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Undo
                </button>
                <button
                  className={`toolbar-btn ${!canRedo ? 'disabled' : ''}`}
                  onClick={redo}
                  disabled={!canRedo}
                  title="Redo (Ctrl+Y)"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path d="M16.95 9h-4.95a3 3 0 100 6h4.95M16.95 9l-3-3m3 3l-3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Redo
                </button>
              </div>
              <div className="toolbar-divider"></div>
              <div className="toolbar-group">
                <button
                  className="toolbar-btn"
                  onClick={() => {
                    setComponents([]);
                    saveToHistory([]);
                    setSelectedComponent(null);
                  }}
                  title="Clear Canvas"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Clear
                </button>
              </div>
              <div className="toolbar-divider"></div>
              <div className="toolbar-group">
                <div className="viewport-controls">
                  <button
                    className={`viewport-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
                    onClick={() => setViewportMode('desktop')}
                    title="Desktop View"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
                    </svg>
                    Desktop
                  </button>
                  <button
                    className={`viewport-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
                    onClick={() => setViewportMode('mobile')}
                    title="Mobile View"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H7V6h10v10z"/>
                    </svg>
                    Mobile
                  </button>
                </div>
              </div>
            </div>
            <div className="canvas-info">
              <svg className="canvas-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v7h12V5H4z"/>
                <path d="M7 8h6v1H7V8zm0 2h4v1H7v-1z"/>
              </svg>
              Email Canvas
            </div>
          </div>
          <div className={`canvas-container ${viewportMode}-view`}>
            <Canvas 
              components={components}
              selectedComponent={selectedComponent}
              onSelectComponent={selectComponent}
              onUpdateComponent={updateComponent}
              onDeleteComponent={deleteComponent}
              onAddComponent={addComponent}
              onReorderComponents={reorderComponents}
            />
          </div>
        </main>

        {/* Right Sidebar - Styles & Properties */}
        <aside className="right-sidebar">
          <div className="sidebar-tabs">
            <button 
              className={`tab-button ${rightActiveTab === 'styles' ? 'active' : ''}`}
              onClick={() => setRightActiveTab('styles')}
            >
              <svg className="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4h14v2H3V4zm0 5h10v2H3V9zm0 5h14v2H3v-2z"/>
                <path d="M15 8l2 2-2 2v-1h-2v-2h2V8z"/>
              </svg>
              Styles
            </button>
            <button 
              className={`tab-button ${rightActiveTab === 'layers' ? 'active' : ''}`}
              onClick={() => setRightActiveTab('layers')}
            >
              <svg className="tab-icon" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2L3 7l7 5 7-5-7-5zM3 11l7 5 7-5M3 15l7 5 7-5"/>
              </svg>
              Layers
            </button>
          </div>
          
          <div className="sidebar-content">
            {rightActiveTab === 'styles' && (
              <StylesPanel 
                selectedComponent={selectedComponent}
                onUpdateComponent={updateComponent}
              />
            )}
            {rightActiveTab === 'layers' && (
              <LayersPanel 
                components={components}
                selectedComponent={selectedComponent}
                onSelectComponent={selectComponent}
                onDeleteComponent={deleteComponent}
                onMoveComponent={moveComponent}
              />
            )}
          </div>
        </aside>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal-overlay" onClick={() => setShowPreview(false)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <h3>
                <svg className="preview-icon" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V3zm2 2v7h12V5H4z"/>
                  <path d="M7 8h6v1H7V8zm0 2h4v1H7v-1z"/>
                </svg>
                Email Preview
              </h3>
              <div className="preview-header-controls">
                <div className="viewport-toggle">
                  <button
                    className={`viewport-btn ${previewViewport === 'desktop' ? 'active' : ''}`}
                    onClick={() => setPreviewViewport('desktop')}
                    title="Desktop View"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>
                    </svg>
                  </button>
                  <button
                    className={`viewport-btn ${previewViewport === 'mobile' ? 'active' : ''}`}
                    onClick={() => setPreviewViewport('mobile')}
                    title="Mobile View"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z"/>
                    </svg>
                  </button>
                </div>
                <button 
                  className="close-button"
                  onClick={() => setShowPreview(false)}
                >
                  ✕
                </button>
              </div>
            </div>
            <div className={`preview-content ${previewViewport === 'mobile' ? 'mobile-preview' : 'desktop-preview'}`}>
              <iframe
                src={`data:text/html,${encodeURIComponent(generatePreview())}`}
                className="preview-iframe"
                title="Email Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailStudio;
