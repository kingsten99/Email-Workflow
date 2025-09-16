import React from 'react';
import { availableBlocks } from './blocks';
import { BlockType, EmailComponent } from './types';
import { generateId } from './utils';

interface BlocksPanelProps {
  onAddComponent: (component: EmailComponent) => void;
  selectedComponent?: EmailComponent | null;
}

const BlocksPanel: React.FC<BlocksPanelProps> = ({ onAddComponent, selectedComponent }) => {
  const handleBlockClick = (block: BlockType) => {
    const newComponent: EmailComponent = {
      ...block.component,
      id: generateId(),
      children: block.component.children?.map((child: EmailComponent) => ({ // Specify the type here
        ...child,
        id: generateId(),
      })) || [], // Fallback to an empty array if children is undefined
    };

    onAddComponent(newComponent);
  };

  const handleDragStart = (e: React.DragEvent, block: BlockType) => {
    e.dataTransfer.setData('application/json', JSON.stringify(block));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="blocks-panel">
      <h3 className="panel-title">Building Blocks</h3>
      {selectedComponent && ['container', 'row', 'column'].includes(selectedComponent.type) && (
        <div style={{
          padding: '8px 12px',
          margin: '8px 0',
          background: 'rgba(102, 126, 234, 0.1)',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#667eea',
          border: '1px solid rgba(102, 126, 234, 0.2)'
        }}>
          Adding to selected {selectedComponent.type}
        </div>
      )}
      <div className="blocks-grid">
        {availableBlocks.map((block) => (
          <div
            key={block.id}
            className="block-item"
            draggable
            onClick={() => handleBlockClick(block)}
            onDragStart={(e) => handleDragStart(e, block)}
            title={`Add ${block.label}`}
          >
            <div className="block-icon">
              {block.icon}
            </div>
            <span className="block-label">{block.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlocksPanel;
