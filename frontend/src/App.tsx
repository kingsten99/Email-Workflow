import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EmailStudio from './components/EmailStudio';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<EmailStudio />} />
          <Route path="/editor/:templateId" element={<EmailStudio />} />
          <Route path="/studio" element={<EmailStudio />} />
          <Route path="/studio/:templateId" element={<EmailStudio />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
