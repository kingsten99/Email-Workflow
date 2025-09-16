import React from 'react';
import { User, EmailComponent } from './types';

interface VariablesPanelProps {
  users: User[];
  selectedComponent: EmailComponent | null;
  onInsertVariable: (variableKey: string) => void;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({ 
  users, 
  selectedComponent, 
  onInsertVariable 
}) => {
  const defaultVariables = [
    { key: 'name', label: 'Name', description: 'Recipient\'s name' },
    { key: 'role', label: 'Role', description: 'Recipient\'s role' },
    { key: 'email', label: 'Email', description: 'Recipient\'s email address' },
  ];

  const handleVariableClick = (variableKey: string) => {
    if (!selectedComponent) {
      alert('Please select a text component first to insert the variable');
      return;
    }
    
    if (selectedComponent.type !== 'text' && selectedComponent.type !== 'button') {
      alert('Variables can only be inserted into text or button components');
      return;
    }
    
    onInsertVariable(variableKey);
  };

  return (
    <div className="variables-panel">
      <h3 className="panel-title">Dynamic Variables</h3>
      
      {!selectedComponent && (
        <div className="variable-info">
          <p>Select a text component to insert variables</p>
        </div>
      )}
      
      {selectedComponent && selectedComponent.type !== 'text' && selectedComponent.type !== 'button' && (
        <div className="variable-warning">
          <p>Warning: Variables can only be added to text or button components</p>
        </div>
      )}

      <div className="variables-list">
        <h4 className="variables-section-title">Available Variables</h4>
        {defaultVariables.map((variable) => (
          <div 
            key={variable.key}
            className="variable-item"
            onClick={() => handleVariableClick(variable.key)}
          >
            <div className="variable-header">
              <span className="variable-name">{`{${variable.key}}`}</span>
              <button className="variable-insert-btn">+</button>
            </div>
            <div className="variable-info">
              <span className="variable-label">{variable.label}</span>
              <span className="variable-description">{variable.description}</span>
            </div>
          </div>
        ))}
      </div>

      {users.length > 0 && (
        <div className="variables-list">
          <h4 className="variables-section-title">Test Data Preview</h4>
          <div className="test-data">
            <p className="test-data-info">Preview how variables will look with real data:</p>
            {users.slice(0, 3).map((user) => (
              <div key={user.id} className="test-user">
                <h5>{user.name} ({user.email})</h5>
                <div className="test-variables">
                  <div><strong>firstName:</strong> {user.name.split(' ')[0]}</div>
                  <div><strong>lastName:</strong> {user.name.split(' ')[1] || ''}</div>
                  <div><strong>email:</strong> {user.email}</div>
                  <div><strong>role:</strong> {user.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="variables-help">
        <h4 className="variables-section-title">How to Use</h4>
        <div className="help-content">
          <ol>
            <li>Select a text or button component</li>
            <li>Click on a variable to insert it</li>
            <li>Variables will be replaced with real data when emails are sent</li>
          </ol>
          <div className="help-example">
            <strong>Example:</strong><br />
            "Hello {`{firstName}`}, welcome to {`{companyName}`}!"<br />
            <em>becomes:</em><br />
            "Hello John, welcome to Acme Corp!"
          </div>
        </div>
      </div>
    </div>
  );
};

export default VariablesPanel;
