import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { Home, Plus, BarChart3, Settings, List } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import ExpenseList from './components/ExpenseList';
import Charts from './components/Charts';
import SettingsPage from './components/SettingsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { authService } from './services/auth';
import './App.css';

function App() {
  const [authVersion, setAuthVersion] = React.useState(0);
  const isAuthenticated = authService.isAuthenticated();

  React.useEffect(() => {
    const onAuthChanged = () => setAuthVersion((v) => v + 1);
    window.addEventListener('auth-changed', onAuthChanged);
    return () => window.removeEventListener('auth-changed', onAuthChanged);
  }, []);

  return (
    <Router>
      <div className="app">
        {isAuthenticated ? (
          // Authenticated App Layout
          <>
            <header className="app-header">
              <div className="container">
                <h1>💰 Money Manager</h1>
              </div>
            </header>
            
            <main className="app-main">
              <div className="container">
                <Routes>
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/add" element={
                    <ProtectedRoute>
                      <AddExpense />
                    </ProtectedRoute>
                  } />
                  <Route path="/expenses" element={
                    <ProtectedRoute>
                      <ExpenseList />
                    </ProtectedRoute>
                  } />
                  <Route path="/charts" element={
                    <ProtectedRoute>
                      <Charts />
                    </ProtectedRoute>
                  } />
                  <Route path="/settings" element={
                    <ProtectedRoute>
                      <SettingsPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </div>
            </main>
            
            <nav className="app-nav">
              <div className="nav-container">
                <NavLink to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
                <NavLink to="/add" icon={<Plus size={20} />} label="Add" />
                <NavLink to="/expenses" icon={<List size={20} />} label="List" />
                <NavLink to="/charts" icon={<BarChart3 size={20} />} label="Charts" />
                <NavLink to="/settings" icon={<Settings size={20} />} label="Settings" />
              </div>
            </nav>
          </>
        ) : (
          // Public Routes (Landing, Login, Register)
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} className="nav-link">
      <div className="nav-icon">{icon}</div>
      <span className="nav-label">{label}</span>
    </Link>
  );
}

export default App;
