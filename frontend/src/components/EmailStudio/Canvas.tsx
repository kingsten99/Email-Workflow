import React, { useState } from 'react';
import { EmailComponent, BlockType } from './types';
import { generateId } from './utils';

interface CanvasProps {
  components: EmailComponent[];
  selectedComponent: EmailComponent | null;
  onSelectComponent: (component: EmailComponent | null) => void;
  onUpdateComponent: (id: string, updates: Partial<EmailComponent>) => void;
  onDeleteComponent: (id: string) => void;
  onAddComponent: (component: EmailComponent) => void;
  onReorderComponents?: (newComponents: EmailComponent[]) => void;
  onImageDoubleClick?: (component: EmailComponent) => void;
}

const Canvas: React.FC<CanvasProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
  onUpdateComponent,
  onDeleteComponent,
  onAddComponent,
  onReorderComponents,
  onImageDoubleClick,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDraggingComponent, setIsDraggingComponent] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>('');
  const [originalDimensions, setOriginalDimensions] = useState<{width: number, height: number} | null>(null);
  const [resizeData, setResizeData] = useState<{
    componentId: string;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    handle: string;
  } | null>(null);
  const [copyMode, setCopyMode] = useState<{
    isActive: boolean;
    component: EmailComponent | null;
  }>({ isActive: false, component: null });

  // Helper function to convert relative URLs to absolute for display
  const getDisplayImageUrl = (url: string) => {
    console.log('Canvas getDisplayImageUrl input:', url);
    if (!url) return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik04MCA2MEM4NiA2MCA5MCA2NCA5MCA3MEM5MCA3NiA4NiA4MCA4MCA4MEM3NCA4MCA3MCA3NiA3MCA3MEM3MCA2NCA3NCA2MCA4MCA2MFoiIGZpbGw9IiM5Q0EzQUYiLz4KUGF0aCBkPSJNNjAgMTAwTDE0MCA2MEwxNjAgMTAwSDYwWiIgZmlsbD0iIzZCNzI4MCIvPgo8L3N2Zz4K';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const result = `http://localhost:3001${url}`;
    console.log('Canvas getDisplayImageUrl output:', result);
    return result;
  };

  const handleDrop = (e: React.DragEvent, insertIndex?: number) => {
    e.preventDefault();
    setIsDragOver(false);
    setDragOverIndex(null);
    try {
      // Check if it's a component being moved (drag action button)
      const componentId = e.dataTransfer.getData('text/plain');
      if (componentId && onReorderComponents) {
        // Handle component movement
        const sourceComponent = components.find(comp => comp.id === componentId);
        if (sourceComponent) {
          const sourceIndex = components.findIndex(comp => comp.id === componentId);
          let targetIndex = insertIndex !== undefined ? insertIndex : components.length;
          
          // Adjust target index if source is before target
          if (sourceIndex < targetIndex) {
            targetIndex--;
          }
          
          // Don't move if dropping in the same position
          if (sourceIndex === targetIndex) {
            return;
          }
          
          // Create new components array with component moved to new position
          const newComponents = [...components];
          newComponents.splice(sourceIndex, 1); // Remove from old position
          newComponents.splice(targetIndex, 0, sourceComponent); // Insert at new position
          
          // Update components order through parent callback
          onReorderComponents(newComponents);
          return;
        }
      }
      
      // Check if it's a new block being added (from BlocksPanel)
      const blockData = e.dataTransfer.getData('application/json');

      if (blockData) {
          const block: BlockType = JSON.parse(blockData);
          const newComponent: EmailComponent = {
              ...block.component,
              id: generateId(),
              children: block.component.children?.map((child: EmailComponent) => ({ // Specify the type here
                  ...child,
                  id: generateId(),
              })) || [], // Use an empty array if children is undefined
          };

          onAddComponent(newComponent);
      }
    } catch (error) {
      console.error('Error handling drop:', error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only set drag over to false if we're leaving the canvas entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  // Drop zone component for positioning
  const DropZone: React.FC<{ index: number; isActive: boolean }> = ({ index, isActive }) => (
    <div 
      className={`drop-zone ${isActive ? 'active' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        if (isDraggingComponent) {
          setDragOverIndex(index);
        }
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOverIndex(null);
      }}
      onDrop={(e) => handleDrop(e, index)}
      style={{
        height: isActive ? '20px' : '4px',
        backgroundColor: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
        border: isActive ? '2px dashed #3b82f6' : 'none',
        margin: '2px 0',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        opacity: isDraggingComponent ? 1 : 0,
      }}
    />
  );

  // Resize handlers
  const startResize = (e: React.MouseEvent, componentId: string, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const component = findComponentById(components, componentId);
    if (!component) return;
    
    // Get the actual element dimensions from the content div
    const resizeHandle = e.currentTarget as HTMLElement;
    const componentWrapper = resizeHandle.closest('.email-component') as HTMLElement;
    const contentDiv = componentWrapper?.querySelector('div:first-child') as HTMLElement;
    
    if (!contentDiv) return;
    
    const rect = contentDiv.getBoundingClientRect();
    const startWidth = rect.width;
    const startHeight = rect.height;
    
    setIsResizing(true);
    setResizeData({
      componentId,
      startX: e.clientX,
      startY: e.clientY,
      startWidth,
      startHeight,
      handle
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !resizeData) return;
    
    // Get canvas container boundaries
    const canvasContainer = document.querySelector('.canvas-content') as HTMLElement;
    if (!canvasContainer) return;
    
    const canvasRect = canvasContainer.getBoundingClientRect();
    const canvasWidth = canvasRect.width;
    const canvasHeight = canvasRect.height;
    
    // Get current component element to check its position
    const componentElement = document.querySelector(`[data-id="${resizeData.componentId}"]`) as HTMLElement;
    if (!componentElement) return;
    
    const componentRect = componentElement.getBoundingClientRect();
    
    // Calculate relative position within canvas
    const componentLeft = componentRect.left - canvasRect.left;
    const componentTop = componentRect.top - canvasRect.top;
    
    const deltaX = e.clientX - resizeData.startX;
    const deltaY = e.clientY - resizeData.startY;
    
    let newWidth = resizeData.startWidth;
    let newHeight = resizeData.startHeight;
    
    switch (resizeData.handle) {
      case 'top-left':
        newWidth = Math.max(50, resizeData.startWidth - deltaX);
        newHeight = Math.max(30, resizeData.startHeight - deltaY);
        // Ensure component doesn't go outside left boundary
        newWidth = Math.min(newWidth, componentLeft + resizeData.startWidth);
        // Ensure component doesn't go outside top boundary
        newHeight = Math.min(newHeight, componentTop + resizeData.startHeight);
        break;
      case 'top-right':
        newWidth = Math.max(50, resizeData.startWidth + deltaX);
        newHeight = Math.max(30, resizeData.startHeight - deltaY);
        // Ensure component doesn't exceed canvas right boundary
        newWidth = Math.min(newWidth, canvasWidth - componentLeft);
        // Ensure component doesn't go outside top boundary
        newHeight = Math.min(newHeight, componentTop + resizeData.startHeight);
        break;
      case 'bottom-left':
        newWidth = Math.max(50, resizeData.startWidth - deltaX);
        newHeight = Math.max(30, resizeData.startHeight + deltaY);
        // Ensure component doesn't go outside left boundary
        newWidth = Math.min(newWidth, componentLeft + resizeData.startWidth);
        // Ensure component doesn't exceed canvas bottom boundary
        newHeight = Math.min(newHeight, canvasHeight - componentTop);
        break;
      case 'bottom-right':
        newWidth = Math.max(50, resizeData.startWidth + deltaX);
        newHeight = Math.max(30, resizeData.startHeight + deltaY);
        // Ensure component doesn't exceed canvas right boundary
        newWidth = Math.min(newWidth, canvasWidth - componentLeft);
        // Ensure component doesn't exceed canvas bottom boundary
        newHeight = Math.min(newHeight, canvasHeight - componentTop);
        break;
      case 'top':
        newHeight = Math.max(30, resizeData.startHeight - deltaY);
        // Ensure component doesn't go outside top boundary
        newHeight = Math.min(newHeight, componentTop + resizeData.startHeight);
        break;
      case 'right':
        newWidth = Math.max(50, resizeData.startWidth + deltaX);
        // Ensure component doesn't exceed canvas right boundary
        newWidth = Math.min(newWidth, canvasWidth - componentLeft);
        break;
      case 'bottom':
        newHeight = Math.max(30, resizeData.startHeight + deltaY);
        // Ensure component doesn't exceed canvas bottom boundary
        newHeight = Math.min(newHeight, canvasHeight - componentTop);
        break;
      case 'left':
        newWidth = Math.max(50, resizeData.startWidth - deltaX);
        // Ensure component doesn't go outside left boundary
        newWidth = Math.min(newWidth, componentLeft + resizeData.startWidth);
        break;
      case 'corner':
        newWidth = Math.max(50, resizeData.startWidth + deltaX);
        newHeight = Math.max(30, resizeData.startHeight + deltaY);
        // Ensure component doesn't exceed canvas boundaries
        newWidth = Math.min(newWidth, canvasWidth - componentLeft);
        newHeight = Math.min(newHeight, canvasHeight - componentTop);
        break;
    }
    
    onUpdateComponent(resizeData.componentId, {
      styles: {
        ...findComponentById(components, resizeData.componentId)?.styles,
        width: `${newWidth}px`,
        height: `${newHeight}px`
      }
    });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    setResizeData(null);
  };

  // Add event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, resizeData]);

  // Handle escape key to cancel copy mode
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && copyMode.isActive) {
        setCopyMode({ isActive: false, component: null });
      }
    };

    if (copyMode.isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [copyMode.isActive]);

  // Helper function to find component by ID
  const findComponentById = (components: EmailComponent[], id: string): EmailComponent | null => {
    for (const component of components) {
      if (component.id === id) return component;
      if (component.children) {
        const found = findComponentById(component.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Copy component function
  const copyComponent = (component: EmailComponent) => {
      const newComponent: EmailComponent = {
          ...component,
          id: generateId(),
          children: component.children?.map((child: EmailComponent) => ({ // Specify the type here
              ...child,
              id: generateId(),
          })) || [], // Use an empty array if children is undefined
      };

      // Enter copy mode
      setCopyMode({ 
          isActive: true, 
          component: newComponent 
      });
      onSelectComponent(null); // Deselect current component
  };

  // Action buttons component - GrapesJS style toolbar
  const ActionButtons: React.FC<{ component: EmailComponent }> = ({ component }) => (
    <div className="component-actions">
      <div className="component-type-label">
        {component.type.charAt(0).toUpperCase() + component.type.slice(1)}
      </div>
      <button
        className="action-btn drag"
        draggable="true"
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', component.id);
          e.dataTransfer.effectAllowed = 'move';
          setIsDraggingComponent(true);
        }}
        onDragEnd={() => {
          setIsDraggingComponent(false);
          setDragOverIndex(null);
        }}
        title="Drag to Move"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
        </svg>
      </button>
      <button
        className="action-btn copy"
        onClick={(e) => {
          e.stopPropagation();
          copyComponent(component);
        }}
        title="Copy Component"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
        </svg>
      </button>
      <button
        className="action-btn delete"
        onClick={(e) => {
          e.stopPropagation();
          if (window.confirm('Delete this component?')) {
            onDeleteComponent(component.id);
          }
        }}
        title="Delete Component"
      >
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
        </svg>
      </button>
    </div>
  );

  // Resize handles component
  const ResizeHandles: React.FC<{ component: EmailComponent }> = ({ component }) => (
    <>
      {/* Corner handles */}
      <div
        className="resize-handle resize-top-left"
        onMouseDown={(e) => startResize(e, component.id, 'top-left')}
      />
      <div
        className="resize-handle resize-top-right"
        onMouseDown={(e) => startResize(e, component.id, 'top-right')}
      />
      <div
        className="resize-handle resize-bottom-left"
        onMouseDown={(e) => startResize(e, component.id, 'bottom-left')}
      />
      <div
        className="resize-handle resize-bottom-right"
        onMouseDown={(e) => startResize(e, component.id, 'bottom-right')}
      />
      
      {/* Side handles */}
      <div
        className="resize-handle resize-top-center"
        onMouseDown={(e) => startResize(e, component.id, 'top')}
      />
      <div
        className="resize-handle resize-right-center"
        onMouseDown={(e) => startResize(e, component.id, 'right')}
      />
      <div
        className="resize-handle resize-bottom-center"
        onMouseDown={(e) => startResize(e, component.id, 'bottom')}
      />
      <div
        className="resize-handle resize-left-center"
        onMouseDown={(e) => startResize(e, component.id, 'left')}
      />
    </>
  );
  
  const renderComponent = (component: EmailComponent): React.ReactNode => {
    const isSelected = selectedComponent?.id === component.id;
    const baseStyles = component.styles;
    
    // Check if background is white or light
    const isLightBackground = (styles: any) => {
      if (!styles) return false;
      const bg = styles.backgroundColor || styles.background || '';
      const lightColors = ['white', '#ffffff', '#fff', '#FFFFFF', '#FFF', 'rgb(255, 255, 255)', 'transparent', ''];
      return lightColors.some(color => bg.toLowerCase().includes(color.toLowerCase()));
    };
    
    const hasLightBg = isLightBackground(baseStyles);
    
    const wrapperStyles: React.CSSProperties = {
      position: 'relative',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-block',
      width: 'fit-content',
      height: 'fit-content',
    };

    const wrapperClasses = `email-component ${isSelected ? 'selected' : ''} ${hasLightBg ? 'light-bg' : ''}`.trim();
    const dataAttributes = {
      'data-type': component.type,
      'data-id': component.id
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      
      // If in copy mode and this is a container, place component inside
      if (copyMode.isActive && copyMode.component && ['container', 'row', 'column'].includes(component.type)) {
        const updatedChildren = [...(component.children || []), copyMode.component];
        onUpdateComponent(component.id, { children: updatedChildren });
        setCopyMode({ isActive: false, component: null });
        return;
      }
      
      onSelectComponent(component);
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (component.type === 'text' || component.type === 'button') {
        // Capture the original element's dimensions before switching to edit mode
        const element = e.currentTarget as HTMLElement;
        const rect = element.getBoundingClientRect();
        setOriginalDimensions({
          width: rect.width,
          height: rect.height
        });
        
        // Start inline editing
        setEditingTextId(component.id);
        setEditingContent(component.content || '');
      }
    };

    const handleTextEdit = (newContent: string) => {
      onUpdateComponent(component.id, { content: newContent });
      setEditingTextId(null);
      setEditingContent('');
    };

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleTextEdit(editingContent);
      } else if (e.key === 'Escape') {
        setEditingTextId(null);
        setEditingContent('');
      }
    };

    const handleTextBlur = () => {
      handleTextEdit(editingContent);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Delete' && isSelected) {
        onDeleteComponent(component.id);
      }
    };

    switch (component.type) {
      case 'text':
        const isEditingThis = editingTextId === component.id;
        
        return (
          <div
            key={component.id}
            className={wrapperClasses}
            style={wrapperStyles}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            {...dataAttributes}
          >
            <div style={{ position: 'relative', wordWrap: 'break-word' }}>
              {isEditingThis ? (
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  onKeyDown={handleTextKeyDown}
                  onBlur={handleTextBlur}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: originalDimensions ? `${originalDimensions.width}px` : baseStyles.width || '100%',
                    height: originalDimensions ? `${originalDimensions.height}px` : baseStyles.height || 'auto',
                    minHeight: originalDimensions ? `${originalDimensions.height}px` : baseStyles.minHeight || '40px',
                    resize: 'none',
                    border: '2px solid #007bff',
                    borderRadius: '4px',
                    padding: baseStyles.padding || '8px',
                    margin: '0',
                    fontFamily: baseStyles.fontFamily,
                    fontSize: baseStyles.fontSize,
                    fontWeight: baseStyles.fontWeight,
                    color: baseStyles.color,
                    backgroundColor: 'white',
                    boxSizing: 'border-box',
                    outline: 'none',
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    whiteSpace: 'pre-wrap',
                    lineHeight: baseStyles.lineHeight,
                    textAlign: baseStyles.textAlign as 'left' | 'right' | 'center',
                    zIndex: 1000
                  }}
                  autoFocus
                  placeholder="Enter your text..."
                />
              ) : null}
              <div
                style={{
                  ...baseStyles,
                  visibility: isEditingThis ? 'hidden' : 'visible'
                }}
                onDoubleClick={handleDoubleClick}
                dangerouslySetInnerHTML={{ __html: component.content }}
              />
            </div>
            {isSelected && <ActionButtons component={component} />}
            {isSelected && <ResizeHandles component={component} />}
          </div>
        );

      case 'image':
        return (
          <div 
            key={component.id} 
            className={wrapperClasses}
            style={wrapperStyles} 
            onClick={handleClick} 
            tabIndex={0}
            {...dataAttributes}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={getDisplayImageUrl(component.attributes.src)}
                alt={component.attributes.alt || 'Image placeholder'}
                style={baseStyles}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (onImageDoubleClick) {
                    onImageDoubleClick(component);
                  }
                }}
              />
            </div>
            {isSelected && <ActionButtons component={component} />}
            {isSelected && <ResizeHandles component={component} />}
          </div>
        );

      case 'button':
        const isEditingButton = editingTextId === component.id;
        
        return (
          <div 
            key={component.id} 
            className={wrapperClasses}
            style={wrapperStyles} 
            onClick={handleClick} 
            tabIndex={0}
            {...dataAttributes}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {isEditingButton ? (
                <input
                  type="text"
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTextEdit(editingContent);
                    } else if (e.key === 'Escape') {
                      setEditingTextId(null);
                      setEditingContent('');
                    }
                  }}
                  onBlur={handleTextBlur}
                  style={{
                    ...baseStyles,
                    border: '2px solid #007bff',
                    borderRadius: baseStyles.borderRadius,
                    padding: baseStyles.padding,
                    margin: baseStyles.margin,
                    fontFamily: baseStyles.fontFamily,
                    fontSize: baseStyles.fontSize,
                    fontWeight: baseStyles.fontWeight,
                    color: baseStyles.color,
                    backgroundColor: baseStyles.backgroundColor,
                    width: baseStyles.width || 'auto',
                    height: baseStyles.height || 'auto',
                    minWidth: baseStyles.minWidth || '100px',
                    maxWidth: baseStyles.maxWidth || 'none',
                    outline: 'none',
                    boxSizing: 'border-box',
                    textAlign: baseStyles.textAlign as 'left' | 'right' | 'center',
                    textDecoration: 'none',
                    display: baseStyles.display || 'inline-block'
                  }}
                  autoFocus
                  placeholder="Button text..."
                />
              ) : (
                <a
                  href={component.attributes.href || '#'}
                  style={baseStyles}
                  onDoubleClick={handleDoubleClick}
                  onClick={(e) => {
                    e.preventDefault();
                    // Right-click or Ctrl+click for URL editing
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    const newHref = prompt('Enter Your URL:', component.attributes.href || '');
                    if (newHref !== null) {
                      onUpdateComponent(component.id, {
                        attributes: { ...component.attributes, href: newHref }
                      });
                    }
                  }}
                >
                  {component.content}
                </a>
              )}
            </div>
            {isSelected && <ActionButtons component={component} />}
            {isSelected && <ResizeHandles component={component} />}
          </div>
        );

      case 'container':
      case 'row':
      case 'column':
        const handleContainerDrop = (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            try {
                const blockData = e.dataTransfer.getData('application/json');

                if (blockData) {
                    const block: BlockType = JSON.parse(blockData);
                    const newComponent: EmailComponent = {
                        ...block.component,
                        id: generateId(),
                        children: block.component.children?.map((child: EmailComponent) => ({ // Specify the type here
                            ...child,
                            id: generateId(),
                        })) || [], // Use an empty array if children is undefined
                    };

                    // Add as child to this container
                    const updatedChildren = [
                        ...(component.children || []),
                        newComponent,
                    ];
                    onUpdateComponent(component.id, { children: updatedChildren });
                }
            } catch (error) {
                console.error('Error handling container drop:', error);
            }
        };

        const handleContainerDragOver = (e: React.DragEvent) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'copy';
        };

        return (
          <div
              key={component.id}
              className={wrapperClasses}
              style={{
                  ...wrapperStyles,
                  ...baseStyles,
                  minHeight: component.children?.length === 0 ? '60px' : 'auto',
              }}
              onClick={handleClick}
              onKeyDown={handleKeyDown}
              onDrop={handleContainerDrop}
              onDragOver={handleContainerDragOver}
              tabIndex={0}
              {...dataAttributes}
          >
              {component.children && component.children.length > 0 ? (
                  component.children.map((child: EmailComponent) => renderComponent(child)) // Specify type here
              ) : (
                  <div style={{
                      color: isSelected ? '#667eea' : '#9ca3af',
                      fontStyle: 'italic',
                      padding: '20px',
                      textAlign: 'center',
                      background: isSelected ? 'rgba(102, 126, 234, 0.1)' : 'rgba(156, 163, 175, 0.05)',
                      borderRadius: '6px',
                      margin: '4px',
                      transition: 'all 0.2s ease',
                      fontSize: '14px',
                  }}>
                      {isSelected ? 'Drop components here or click blocks to add' : `Empty ${component.type} - click to select and add content`}
                  </div>
              )}
              {isSelected && <ActionButtons component={component} />}
              {isSelected && <ResizeHandles component={component} />}
          </div>
      );

      case 'divider':
        const dividerWrapperStyles: React.CSSProperties = {
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'block', // Block to take full width
          width: '100%', // Full width of container
          margin: baseStyles.margin || '20px 0', // Vertical margin
          height: 'auto',
        };
        
        return (
          <div
            key={component.id}
            className={wrapperClasses}
            style={dividerWrapperStyles}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            {...dataAttributes}
          >
            <hr
              style={{
                border: 'none',
                borderTop: baseStyles.borderTop || '1px dotted #e5e7eb',
                margin: '0',
                height: '0',
                width: '100%',
                backgroundColor: 'transparent',
              }}
            />
            {isSelected && <ActionButtons component={component} />}
          </div>
        );

      case 'spacer':
        const spacerWrapperStyles: React.CSSProperties = {
          position: 'relative',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'block',
          width: '100%',
          height: baseStyles.height || '40px',
          backgroundColor: 'transparent',
          border: 'none',
          margin: baseStyles.margin || '0',
        };
        
        return (
          <div
            key={component.id}
            className={wrapperClasses}
            style={spacerWrapperStyles}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            {...dataAttributes}
          >
            {/* Just empty space - no visual elements */}
            {isSelected && <ActionButtons component={component} />}
          </div>
        );

      default:
        return (
          <div
            key={component.id}
            className={wrapperClasses}
            style={wrapperStyles}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            {...dataAttributes}
          >
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div
                style={baseStyles}
                onDoubleClick={handleDoubleClick}
              >
                {component.content}
              </div>
            </div>
            {isSelected && <ActionButtons component={component} />}
            {isSelected && <ResizeHandles component={component} />}
          </div>
        );
    }
  };

  return (
    <>
      {copyMode.isActive && (
        <div className="copy-mode-indicator">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
          </svg>
          Click to place component (ESC to cancel)
        </div>
      )}
      <div 
        className={`canvas-content ${copyMode.isActive ? 'copy-mode' : ''}`}
        onClick={(e) => {
          // If in copy mode, place the component
          if (copyMode.isActive && copyMode.component) {
            e.stopPropagation();
            onAddComponent(copyMode.component);
            setCopyMode({ isActive: false, component: null });
          } else {
            onSelectComponent(null);
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        style={{
          borderColor: isDragOver ? '#667eea' : copyMode.isActive ? '#10b981' : '#e2e8f0',
          backgroundColor: isDragOver ? 'rgba(102, 126, 234, 0.05)' : copyMode.isActive ? 'rgba(16, 185, 129, 0.05)' : 'transparent',
          cursor: copyMode.isActive ? 'copy' : 'default',
        }}
      >
      {components.length === 0 ? (
        <div className="empty-canvas">
          <div className="empty-message">
            <h3>Start Building Your Email</h3>
            <p>Drag blocks from the left panel or click to add components</p>
            {copyMode.isActive && (
              <div style={{ 
                marginTop: '10px', 
                color: '#10b981', 
                fontWeight: 'bold' 
              }}>
                📋 Click anywhere to place copied component
              </div>
            )}
            {isDragOver && (
              <div style={{ 
                marginTop: '10px', 
                color: '#667eea', 
                fontWeight: 'bold' 
              }}>
                📦 Drop your component here!
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {isDraggingComponent && <DropZone index={0} isActive={dragOverIndex === 0} />}
          {components.map((component, index) => (
            <React.Fragment key={component.id}>
              {renderComponent(component)}
              {isDraggingComponent && (
                <DropZone 
                  index={index + 1} 
                  isActive={dragOverIndex === index + 1} 
                />
              )}
            </React.Fragment>
          ))}
        </>
      )}
      </div>
    </>
  );
};

export default Canvas;
