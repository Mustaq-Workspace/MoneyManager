import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home, Plus, BarChart3, Settings, List } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddExpense from './components/AddExpense';
import ExpenseList from './components/ExpenseList';
import Charts from './components/Charts';
import SettingsPage from './components/SettingsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="container">
            <h1>💰 Money Manager</h1>
          </div>
        </header>
        
        <main className="app-main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddExpense />} />
              <Route path="/expenses" element={<ExpenseList />} />
              <Route path="/charts" element={<Charts />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
        
        <nav className="app-nav">
          <div className="nav-container">
            <NavLink to="/" icon={<Home size={20} />} label="Dashboard" />
            <NavLink to="/add" icon={<Plus size={20} />} label="Add" />
            <NavLink to="/expenses" icon={<List size={20} />} label="List" />
            <NavLink to="/charts" icon={<BarChart3 size={20} />} label="Charts" />
            <NavLink to="/settings" icon={<Settings size={20} />} label="Settings" />
          </div>
        </nav>
      </div>
    </Router>
  );
}

function NavLink({ to, icon, label }) {
  return (
    <a href={to} className="nav-link">
      <div className="nav-icon">{icon}</div>
      <span className="nav-label">{label}</span>
    </a>
  );
}

export default App;
