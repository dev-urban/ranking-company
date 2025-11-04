import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CorretoresDashboard from './pages/CorretoresDashboard';
import { Ranking } from './pages/Ranking';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/corretores" element={<CorretoresDashboard />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/" element={<Navigate to="/ranking" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
