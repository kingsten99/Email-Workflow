import React, { useState, useEffect } from 'react';
import { EmailComponent } from './types';

interface StylesPanelProps {
  selectedComponent: EmailComponent | null;
  onUpdateComponent: (id: string, updates: Partial<EmailComponent>) => void;
}

const StylesPanel: React.FC<StylesPanelProps> = ({ selectedComponent, onUpdateComponent }) => {
  const [localStyles, setLocalStyles] = useState<Record<string, string | number>>({});
  const [localContent, setLocalContent] = useState<string>('');

  useEffect(() => {
    if (selectedComponent) {
      setLocalStyles(selectedComponent.styles);
      setLocalContent(selectedComponent.content || '');
    }
  }, [selectedComponent]);

  const handleStyleChange = (property: string, value: string | number) => {
    if (!selectedComponent) return;
    
    const updatedStyles = { ...localStyles, [property]: value };
    setLocalStyles(updatedStyles);
    onUpdateComponent(selectedComponent.id, { styles: updatedStyles });
  };

  const handleAttributeChange = (attribute: string, value: string) => {
    if (!selectedComponent) return;
    
    const updatedAttributes = { ...selectedComponent.attributes, [attribute]: value };
    onUpdateComponent(selectedComponent.id, { attributes: updatedAttributes });
  };

  const handleContentChange = (value: string) => {
    if (!selectedComponent) return;

    setLocalContent(value);
    onUpdateComponent(selectedComponent.id, { content: value });
  };

  if (!selectedComponent) {
    return (
      <div className="styles-panel">
        <h3 className="panel-title">Styles</h3>
        <div className="no-selection">
          <p>Select a component to edit its styles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="styles-panel">
      <h3 className="panel-title">Styles</h3>
      <div className="style-sections">
        
        {/* Typography Section */}
        {(selectedComponent.type === 'text' || selectedComponent.type === 'button') && (
          <div className="style-section">
            <h4 className="section-title">Typography</h4>
            <div className="style-controls">
              <div className="control-group">
                <label>Font Size</label>
                <div className="input-with-slider">
                  <input
                    type="range"
                    min="8"
                    max="72"
                    value={parseInt(localStyles.fontSize?.toString().replace('px', '') || '16')}
                    onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                    className="size-slider"
                  />
                  <div className="size-input-row">
                    <input
                      type="text"
                      value={localStyles.fontSize || '16px'}
                      onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                      placeholder="16px"
                      className="size-input"
                    />
                    <div className="size-presets">
                      <button 
                        type="button"
                        className="preset-btn"
                        onClick={() => handleStyleChange('fontSize', '12px')}
                        title="Small"
                      >S</button>
                      <button 
                        type="button"
                        className="preset-btn"
                        onClick={() => handleStyleChange('fontSize', '16px')}
                        title="Medium"
                      >M</button>
                      <button 
                        type="button"
                        className="preset-btn"
                        onClick={() => handleStyleChange('fontSize', '24px')}
                        title="Large"
                      >L</button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="control-group">
                <label>Font Weight</label>
                <select
                  value={localStyles.fontWeight || 'normal'}
                  onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                >
                  <option value="normal">Normal</option>
                  <option value="bold">Bold</option>
                  <option value="lighter">Lighter</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                  <option value="500">500</option>
                  <option value="600">600</option>
                  <option value="700">700</option>
                  <option value="800">800</option>
                  <option value="900">900</option>
                </select>
              </div>
              <div className="control-group">
                <label>Text Align</label>
                <select
                  value={localStyles.textAlign || 'left'}
                  onChange={(e) => handleStyleChange('textAlign', e.target.value)}
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                  <option value="justify">Justify</option>
                </select>
              </div>
              <div className="control-group">
                  <label>Font Style</label>
                  <select
                      value={localStyles.fontStyle || 'normal'}
                      onChange={(e) => handleStyleChange('fontStyle', e.target.value)}
                  >
                      <option value="normal">Normal</option>
                      <option value="italic">Italic</option>
                      <option value="oblique">Oblique</option>
                  </select>
              </div>
              <div className="control-group">
                <label>Line Height</label>
                <input
                  type="text"
                  value={localStyles.lineHeight || '1.5'}
                  onChange={(e) => handleStyleChange('lineHeight', e.target.value)}
                  placeholder="1.5"
                />
              </div>
            </div>
          </div>
        )}

        {/* Colors Section */}
        <div className="style-section">
          <h4 className="section-title">Colors</h4>
          <div className="style-controls">
            {(selectedComponent.type === 'text' || selectedComponent.type === 'button') && (
              <div className="control-group">
                <label>Text Color</label>
                <div className="color-input">
                  <div className="color-preview" style={{ backgroundColor: (localStyles.color as string) || '#333333' }}>
                    <input
                      type="color"
                      value={localStyles.color?.toString().includes('#') ? localStyles.color.toString() : '#333333'}
                      onChange={(e) => handleStyleChange('color', e.target.value)}
                      title="Pick color"
                    />
                  </div>
                  <input
                    type="text"
                    value={localStyles.color || '#333333'}
                    onChange={(e) => handleStyleChange('color', e.target.value)}
                    placeholder="#333333"
                  />
                </div>
              </div>
            )}
            <div className="control-group">
              <label>Background Color</label>
              <div className="color-input">
                <div className="color-preview" style={{ backgroundColor: (localStyles.backgroundColor as string) || '#ffffff' }}>
                  <input
                    type="color"
                    value={localStyles.backgroundColor?.toString().includes('#') ? localStyles.backgroundColor.toString() : '#ffffff'}
                    onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                    title="Pick background color"
                  />
                </div>
                <input
                  type="text"
                  value={localStyles.backgroundColor || 'transparent'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  placeholder="transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dimensions Section */}
        <div className="style-section">
          <h4 className="section-title">Dimensions</h4>
          <div className="style-controls">
            <div className="control-group">
              <label>Width</label>
              <input
                type="text"
                value={localStyles.width || 'auto'}
                onChange={(e) => handleStyleChange('width', e.target.value)}
                placeholder="auto"
              />
            </div>
            <div className="control-group">
              <label>Height</label>
              <input
                type="text"
                value={localStyles.height || 'auto'}
                onChange={(e) => handleStyleChange('height', e.target.value)}
                placeholder="auto"
              />
            </div>
            {selectedComponent.type === 'image' && (
              <div className="control-group">
                <label>Max Width</label>
                <input
                  type="text"
                  value={localStyles.maxWidth || '100%'}
                  onChange={(e) => handleStyleChange('maxWidth', e.target.value)}
                  placeholder="100%"
                />
              </div>
            )}
          </div>
        </div>

        {/* Spacing Section */}
        <div className="style-section">
          <h4 className="section-title">Spacing</h4>
          <div className="style-controls">
            <div className="control-group">
              <label>Padding</label>
              <input
                type="text"
                value={localStyles.padding || '0'}
                onChange={(e) => handleStyleChange('padding', e.target.value)}
                placeholder="10px"
              />
            </div>
            <div className="control-group">
              <label>Margin</label>
              <input
                type="text"
                value={localStyles.margin || '0'}
                onChange={(e) => handleStyleChange('margin', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Border Section */}
        <div className="style-section">
          <h4 className="section-title">Border</h4>
          <div className="style-controls">
            <div className="control-group">
              <label>Border</label>
              <input
                type="text"
                value={localStyles.border || 'none'}
                onChange={(e) => handleStyleChange('border', e.target.value)}
                placeholder="1px solid #ccc"
              />
            </div>
            <div className="control-group">
              <label>Border Radius</label>
              <input
                type="text"
                value={localStyles.borderRadius || '0'}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="control-group">
              <label>Box Shadow</label>
              <input
                type="text"
                value={localStyles.boxShadow || '0'}
                onChange={(e) => handleStyleChange('boxShadow', e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Link Attributes for buttons */}
        {selectedComponent.type === 'button' && (
          <div className="style-section">
            <h4 className="section-title">Link</h4>
            <div className="style-controls">
              <div className="control-group">
                <label>URL</label>
                <input
                  type="text"
                  value={selectedComponent.attributes.href || '#'}
                  onChange={(e) => handleAttributeChange('href', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
              <div className="control-group">
                <label>Text</label>
                <input
                  type="text"
                  value={localContent || 'Button'}
                  onChange={(e) => handleContentChange(e.target.value)}
                  placeholder="Button text"
                />
              </div>
            </div>
          </div>
        )}

        {/* Image Attributes */}
        {selectedComponent.type === 'image' && (
          <div className="style-section">
            <h4 className="section-title">Image</h4>
            <div className="style-controls">
              <div className="control-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={selectedComponent.attributes.src || ''}
                  onChange={(e) => handleAttributeChange('src', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="control-group">
                <label>Alt Text</label>
                <input
                  type="text"
                  value={selectedComponent.attributes.alt || ''}
                  onChange={(e) => handleAttributeChange('alt', e.target.value)}
                  placeholder="Image description"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StylesPanel;
