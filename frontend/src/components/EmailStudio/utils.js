import { EmailComponent } from './types'; // Ensure EmailComponent is correctly imported

// Generate unique ID for components
export const generateId = () => {
  return `component_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate HTML from components
export const generateHTML = (components) => {
  return components.map((component) => {
    // Merge component styles with email-safe defaults
    const emailSafeStyles = {
      boxSizing: 'border-box',
      display: component.type === 'image' ? 'inline-block' : (component.styles.display || 'inline-block'),
      margin: component.styles.margin || '0px',
      maxWidth: component.styles.maxWidth || '100%',
      verticalAlign: component.styles.verticalAlign || 'top', // Align components to top when inline
      ...component.styles, // Override with component-specific styles
    };

    const styleString = Object.entries(emailSafeStyles)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');

    switch (component.type) {
      case 'text':
        return `<div id="${component.id}" style="${styleString}">${component.content}</div>`;
      case 'image':
        const imgStyles = {
          ...emailSafeStyles,
          display: 'inline-block',
          verticalAlign: 'top',
        };
        const imgStyleString = Object.entries(imgStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<img id="${component.id}" src="${component.attributes.src || ''}" alt="${component.attributes.alt || ''}" style="${imgStyleString}" />`;
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
        return `<a id="${component.id}" href="${component.attributes.href || '#'}" style="${buttonStyleString}">${component.content}</a>`;
      case 'container':
        const childrenHTML = component.children ? generateHTML(component.children) : component.content;
        const containerStyles = {
          ...emailSafeStyles,
          display: 'block', // Containers should be block level
        };
        const containerStyleString = Object.entries(containerStyles)
          .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
          .join('; ');
        return `<div id="${component.id}" style="${containerStyleString}">${childrenHTML}</div>`;
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
      .email-container {
        width: 100% !important;
        margin: 0 !important;
        padding: 10px !important;
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

      /* Except for small inline elements like buttons */
      a[style*="display: inline-block"] {
        display: inline-block !important;
        width: auto !important;
      }

      /* Reduce padding and margins on mobile */
      div[style*="padding"] {
        padding: 10px !important;
      }

      /* Ensure minimum touch targets */
      a, button {
        min-height: 44px !important;
        min-width: 44px !important;
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