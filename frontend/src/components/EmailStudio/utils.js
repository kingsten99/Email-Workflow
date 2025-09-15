import { EmailComponent } from './types'; // Ensure EmailComponent is correctly imported

// Generate unique ID for components
export const generateId = () => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate HTML from components
export const generateHTML = (components) => {
  return components.map((component) => {
    // Preserve the exact same styles as canvas rendering
    const emailSafeStyles = {
      boxSizing: 'border-box',
      position: 'relative', // Match canvas wrapper positioning
      display: component.styles.display || 'inline-block', // Use component's actual display or default to inline-block like canvas
      margin: component.styles.margin || '0px',
      maxWidth: component.styles.maxWidth || '100%',
      verticalAlign: component.styles.verticalAlign || 'top', // Align components to top when inline
      width: component.styles.width || 'fit-content', // Preserve width
      height: component.styles.height || 'fit-content', // Preserve height
      ...component.styles, // Override with component-specific styles
    };

    // Add responsive classes based on component type and styles
    const getResponsiveClasses = (component) => {
      let classes = [];
      
      // Add responsive text class for large fonts
      if (component.styles.fontSize) {
        const fontSize = parseInt(component.styles.fontSize);
        if (fontSize >= 24) classes.push('responsive-large-text');
        if (fontSize >= 32) classes.push('responsive-heading');
      }
      
      // Add responsive container class
      if (component.type === 'container' || component.type === 'row') {
        classes.push('responsive-container');
      }
      
      // Add responsive column class
      if (component.type === 'column') {
        classes.push('responsive-column');
      }
      
      // Add responsive button class
      if (component.type === 'button') {
        classes.push('responsive-button');
      }
      
      // Add responsive divider class
      if (component.type === 'divider') {
        classes.push('responsive-divider');
      }
      
      return classes.length > 0 ? ` class="${classes.join(' ')}"` : '';
    };

    const styleString = Object.entries(emailSafeStyles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    switch (component.type) {
      case 'text':
        return `<div id="${component.id}"${getResponsiveClasses(component)} style="${styleString}">${component.content}</div>`;
      case 'image':
        const imgStyles = {
          ...emailSafeStyles,
          display: 'inline-block',
          verticalAlign: 'top',
        };
        const imgStyleString = Object.entries(imgStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<img id="${component.id}"${getResponsiveClasses(component)} src="${component.attributes.src || ''}" alt="${component.attributes.alt || ''}" style="${imgStyleString}" />`;
      case 'button':
        const buttonStyles = {
          ...emailSafeStyles,
          display: 'inline-block',
          textDecoration: 'none',
          cursor: 'pointer',
          verticalAlign: 'top',
        };
        const buttonStyleString = Object.entries(buttonStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<a id="${component.id}"${getResponsiveClasses(component)} href="${component.attributes.href || '#'}" style="${buttonStyleString}">${component.content}</a>`;
      case 'container':
        const childrenHTML = component.children ? generateHTML(component.children) : component.content;
        const containerStyles = {
          ...emailSafeStyles,
          display: 'block', // Containers should be block level
        };
        const containerStyleString = Object.entries(containerStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<div id="${component.id}"${getResponsiveClasses(component)} style="${containerStyleString}">${childrenHTML}</div>`;
      case 'row':
        const rowChildrenHTML = component.children ? generateHTML(component.children) : '';
        const rowStyles = {
          ...emailSafeStyles,
          display: component.styles.display === 'flex' ? 'flex' : 'block', // Preserve flex layout for preview
          width: '100%',
          gap: component.styles.gap || '0',
        };
        const rowStyleString = Object.entries(rowStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<div id="${component.id}" style="${rowStyleString}">${rowChildrenHTML}</div>`;
      case 'column':
        const columnChildrenHTML = component.children ? generateHTML(component.children) : component.content;
        const isFlexChild = component.styles.flex !== undefined;
        const columnStyles = {
          ...emailSafeStyles,
          display: isFlexChild ? 'block' : 'inline-block', // Use block for flex children, inline-block for others
          verticalAlign: isFlexChild ? 'unset' : 'top',
          width: component.styles.width || (isFlexChild ? 'auto' : 'auto'), // Let flex handle width for flex children
          flex: component.styles.flex || undefined, // Preserve flex value
          minWidth: isFlexChild ? '0' : '200px', // Allow flex shrinking
        };
        const columnStyleString = Object.entries(columnStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<div id="${component.id}" style="${columnStyleString}">${columnChildrenHTML}</div>`;
      case 'divider':
        const dividerStyles = {
          display: 'block',
          border: 'none',
          borderTop: emailSafeStyles.borderTop || '1px dotted #e5e7eb',
          margin: emailSafeStyles.margin || '20px 0',
          height: '0',
          width: '100%',
          backgroundColor: 'transparent',
          boxSizing: 'border-box',
        };
        const dividerStyleString = Object.entries(dividerStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<hr id="${component.id}"${getResponsiveClasses(component)} style="${dividerStyleString}" />`;
      case 'spacer':
        const spacerStyles = {
          display: 'block',
          height: emailSafeStyles.height || '40px',
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          margin: emailSafeStyles.margin || '0',
          boxSizing: 'border-box',
        };
        const spacerStyleString = Object.entries(spacerStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<div id="${component.id}"${getResponsiveClasses(component)} style="${spacerStyleString}"></div>`;
      default:
        return `<div id="${component.id}" style="${styleString}">${component.content}</div>`;
    }
  }).join('\n');
};

// Generate CSS from components - Email client compatible
export const generateCSS = (components) => {
  return `
    /* Email client resets and compatibility */
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
      vertical-align: top;
    }

    table {
      border-collapse: collapse !important;
      width: 100%;
    }

    body {
      margin: 0 !important;
      padding: 20px !important;
      // width: 100% !important;
      height: 100% !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
      line-height: 1.6 !important;
      color: #333333 !important;
      background-color: #f8f9fa !important;
    }

    /* Default font styles */
    body, td, p, a {
      font-family: 'Inter', Arial, sans-serif;
      font-size: 14px;
      line-height: 1.4;
    }

    a {
      color: inherit;
      text-decoration: none;
    }

    /* Email container */
    .email-container {
      display: contents;
      overflow-wrap: break-word;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      padding: 0;
    }

    /* Responsive component classes */
    .responsive-container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .responsive-column {
      display: inline-block;
      vertical-align: top;
      min-width: 200px;
    }
    
    .responsive-button {
      display: inline-block;
      text-align: center;
      border-radius: 4px;
      transition: all 0.3s ease;
    }
    
    .responsive-large-text {
      line-height: 1.2;
      font-weight: 600;
    }
    
    .responsive-heading {
      line-height: 1.1;
      font-weight: 700;
      margin-bottom: 15px;
    }
    
    .responsive-divider {
      display: block;
      width: 100%;
      border: none;
      border-top: 1px dotted #e5e7eb;
      margin: 20px 0;
      height: 0;
      background-color: transparent;
      box-sizing: border-box;
    }

    /* Ensure inline-block elements align properly */
    div[style*="display: inline-block"] {
      vertical-align: top;
    }

    /* Email content wrapper for consistent inline layout */
    .email-container > * {
      white-space: normal;
    }

    /* Responsive design for mobile */
    @media only screen and (max-width: 600px) {
      body {
        padding: 10px !important;
      }
      
      .email-container {
        width: 100% !important;
        margin: 0 !important;
        padding: 10px !important;
        max-width: 100% !important;
      }

      /* Stack flex rows on mobile */
      div[style*="display: flex"] {
        display: block !important;
        width: 100% !important;
      }

      /* Stack flex children on mobile */
      div[style*="flex:"] {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px !important;
        flex: none !important;
      }

      /* Stack inline elements on mobile */
      div[style*="display: inline-block"] {
        display: block !important;
        width: 100% !important;
        margin-bottom: 10px !important;
      }

      /* Responsive component classes on mobile */
      .responsive-container {
        width: 100% !important;
        max-width: 100% !important;
        padding: 10px !important;
      }
      
      .responsive-column {
        display: block !important;
        width: 100% !important;
        margin-bottom: 15px !important;
        min-width: auto !important;
      }
      
      .responsive-button {
        display: block !important;
        width: auto !important;
        max-width: 280px !important;
        margin: 10px auto !important;
        padding: 12px 20px !important;
      }
      
      .responsive-large-text {
        text-align: center !important;
        margin-bottom: 10px !important;
      }
      
      .responsive-heading {
        text-align: center !important;
        margin-bottom: 20px !important;
      }
      
      .responsive-divider {
        margin: 15px 0 !important;
        width: 100% !important;
      }

      /* Keep buttons and small elements inline */
      a[style*="display: inline-block"] {
        display: inline-block !important;
        width: auto !important;
        margin-bottom: 5px !important;
      }

      /* Responsive font sizes */
      [style*="font-size: 32px"] {
        font-size: 28px !important;
      }
      
      [style*="font-size: 28px"] {
        font-size: 24px !important;
      }
      
      [style*="font-size: 24px"] {
        font-size: 20px !important;
      }
      
      [style*="font-size: 20px"] {
        font-size: 18px !important;
      }

      /* Responsive padding */
      [style*="padding: 40px"] {
        padding: 20px !important;
      }
      
      [style*="padding: 30px"] {
        padding: 15px !important;
      }
      
      [style*="padding: 20px"] {
        padding: 10px !important;
      }

      /* Responsive margins */
      [style*="margin: 30px"] {
        margin: 15px !important;
      }
      
      [style*="margin: 20px"] {
        margin: 10px !important;
      }

      /* Responsive widths */
      [style*="width: 600px"] {
        width: 100% !important;
      }
      
      [style*="width: 500px"] {
        width: 100% !important;
      }
      
      [style*="width: 400px"] {
        width: 100% !important;
      }

      /* Ensure minimum touch targets */
      a, button {
        min-height: 44px !important;
        padding: 12px 16px !important;
      }

      /* Responsive images */
      img {
        max-width: 100% !important;
        height: auto !important;
      }
    }

    /* Ultra-mobile (very small screens) */
    @media only screen and (max-width: 400px) {
      body {
        padding: 5px !important;
      }
      
      [style*="font-size: 18px"] {
        font-size: 16px !important;
      }
      
      [style*="font-size: 16px"] {
        font-size: 14px !important;
      }
      
      [style*="padding: 15px"] {
        padding: 8px !important;
      }
      
      [style*="padding: 10px"] {
        padding: 5px !important;
      }
    }
  `;
};

// Deep clone component (useful for duplicating)
export const cloneComponent = (component) => {
  return {
    ...component,
    id: generateId(),
    children: component.children ? component.children.map(cloneComponent) : undefined,
  };
};

// Find component by ID in nested structure
export const findComponentById = (components, id) => {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
    if (component.children) {
      const found = findComponentById(component.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Update component by ID in nested structure
export const updateComponentById = (components, id, updates) => {
  return components.map((component) => {
    if (component.id === id) {
      return { ...component, ...updates };
    }
    if (component.children) {
      return {
        ...component,
        children: updateComponentById(component.children, id, updates),
      };
    }
    return component;
  });
};

// Delete component by ID in nested structure
export const deleteComponentById = (components, id) => {
  return components.filter((component) => {
    if (component.id === id) {
      return false;
    }
    if (component.children) {
      component.children = deleteComponentById(component.children, id);
    }
    return true;
  });
};

// Add component to container
export const addComponentToContainer = (components, containerId, newComponent) => {
  return components.map((component) => {
    if (component.id === containerId && 
        (component.type === 'container' || component.type === 'row' || component.type === 'column')) {
      return {
        ...component,
        children: [...(component.children || []), { ...newComponent, id: generateId() }],
      };
    }
    if (component.children) {
      return {
        ...component,
        children: addComponentToContainer(component.children, containerId, newComponent),
      };
    }
    return component;
  });
};

// Get all components in flat array (for layers panel)
export const flattenComponents = (components) => {
  const result = [];
  const traverse = (comps, depth = 0) => {
    comps.forEach((component) => {
      result.push({ ...component, depth });
      if (component.children) {
        traverse(component.children, depth + 1);
      }
    });
  };

  traverse(components);
  return result;
};