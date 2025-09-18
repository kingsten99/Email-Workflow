import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import EmailStudio from './components/EmailStudio';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Public login route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/editor" element={
            <ProtectedRoute>
              <EmailStudio />
            </ProtectedRoute>
          } />
          
          <Route path="/editor/:templateId" element={
            <ProtectedRoute>
              <EmailStudio />
            </ProtectedRoute>
          } />
          
          <Route path="/studio" element={
            <ProtectedRoute>
              <EmailStudio />
            </ProtectedRoute>
          } />
          
          <Route path="/studio/:templateId" element={
            <ProtectedRoute>
              <EmailStudio />
            </ProtectedRoute>
          } />

          {/* Catch-all route redirects to login */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
