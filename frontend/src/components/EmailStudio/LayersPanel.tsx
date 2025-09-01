import React from 'react';
import { EmailComponent } from './types';
import { flattenComponents } from './utils';

interface LayersPanelProps {
  components: EmailComponent[];
  selectedComponent: EmailComponent | null;
  onSelectComponent: (component: EmailComponent | null) => void;
  onDeleteComponent: (id: string) => void;
  onMoveComponent: (id: string, direction: 'up' | 'down') => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  components,
  selectedComponent,
  onSelectComponent,
  onDeleteComponent,
  onMoveComponent,
}) => {
  const flatComponents = flattenComponents(components);

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'button':
        return '🔘';
      case 'container':
        return '📦';
      case 'row':
        return '↔️';
      case 'column':
        return '📏';
      default:
        return '📄';
    }
  };

  const renderLayer = (component: EmailComponent & { depth?: number }) => {
    const isSelected = selectedComponent?.id === component.id;
    const depth = (component as any).depth || 0;
    
    return (
      <div
        key={component.id}
        className={`layer-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 20 + 10}px` }}
      >
        <div 
          className="layer-content"
          onClick={() => onSelectComponent(component)}
        >
          <span className="layer-icon">{getComponentIcon(component.type)}</span>
          <span className="layer-label">
            {component.type === 'text' || component.type === 'button' 
              ? component.content.substring(0, 20) + (component.content.length > 20 ? '...' : '')
              : component.type.charAt(0).toUpperCase() + component.type.slice(1)
            }
          </span>
          <span className="layer-type">({component.type})</span>
        </div>
        
        <div className="layer-actions">
          <button
            className="layer-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMoveComponent(component.id, 'up');
            }}
            title="Move up"
          >
            ↑
          </button>
          <button
            className="layer-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMoveComponent(component.id, 'down');
            }}
            title="Move down"
          >
            ↓
          </button>
          <button
            className="layer-action-btn delete"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this component?')) {
                onDeleteComponent(component.id);
              }
            }}
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="layers-panel">
      <h3 className="panel-title">Layers</h3>
      <div className="layers-list">
        {flatComponents.length === 0 ? (
          <div className="no-layers">
            <p>No components yet</p>
          </div>
        ) : (
          flatComponents.map(component => renderLayer(component))
        )}
      </div>
    </div>
  );
};

export default LayersPanel;
