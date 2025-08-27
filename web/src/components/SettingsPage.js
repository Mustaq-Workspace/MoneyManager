import React, { useState, useEffect } from 'react';
import { Save, Download, Upload, Trash2, LogOut, Plus, X } from 'lucide-react';
import { settingsAPI, expenseAPI } from '../services/api';
import { formatCurrency, storage, AVAILABLE_CURRENCIES } from '../utils/helpers';
import { authService } from '../services/auth';

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    monthly_budget: '1000',
    currency: 'USD',
    default_category: 'Others',
    custom_categories: []
  });
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.getAll();
      setSettings({
        monthly_budget: response.data.monthly_budget || '1000',
        currency: response.data.currency || 'USD',
        default_category: response.data.default_category || 'Others',
        custom_categories: Array.isArray(response.data.custom_categories) ? response.data.custom_categories : []
      });
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      await settingsAPI.update(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    if (settings.custom_categories.includes(trimmed)) return;
    setSettings(prev => ({
      ...prev,
      custom_categories: [...prev.custom_categories, trimmed]
    }));
    setNewCategory('');
  };

  const handleRemoveCategory = (category) => {
    setSettings(prev => ({
      ...prev,
      custom_categories: prev.custom_categories.filter(c => c !== category),
      default_category: prev.default_category === category ? 'Others' : prev.default_category
    }));
  };

  const handleExportData = async () => {
    try {
      const response = await expenseAPI.getAll({ limit: 1000 });
      const data = {
        expenses: response.data,
        settings: settings,
        exportDate: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data. Please try again.');
    }
  };

  const handleImportData = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.expenses && Array.isArray(data.expenses)) {
          for (const expense of data.expenses) {
            try { await expenseAPI.create(expense); } catch (err) { console.warn('Failed to import expense:', expense, err); }
          }
        }
        if (data.settings) {
          setSettings(prev => ({ ...prev, ...data.settings }));
          await settingsAPI.update({ ...settings, ...data.settings });
        }
        alert('Data imported successfully!');
        window.location.reload();
      } catch (err) {
        console.error('Error importing data:', err);
        alert('Failed to import data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) return;
    if (!window.confirm('This will delete ALL your expenses and settings. Are you absolutely sure?')) return;
    storage.remove('expenses');
    storage.remove('settings');
    alert('Data cleared. Please refresh the page.');
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="settings">
      <div className="card">
        <h2>Settings</h2>

        {error && (
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#059669', marginBottom: '1rem' }}>
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Budget Settings */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Budget Settings</h3>

            <div className="form-group">
              <label className="form-label">Monthly Budget</label>
              <input
                type="number"
                name="monthly_budget"
                value={settings.monthly_budget}
                onChange={handleInputChange}
                className="form-input"
                placeholder="1000"
                min="0"
                step="0.01"
              />
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Set your monthly spending limit to track your budget progress
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Currency</label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleInputChange}
                className="form-select"
              >
                {AVAILABLE_CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} ({currency.symbol}) - {currency.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Categories</h3>

            <div className="form-group">
              <label className="form-label">Default Category</label>
              <select
                name="default_category"
                value={settings.default_category}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="Food">🍕 Food</option>
                <option value="Transport">🚗 Transport</option>
                <option value="Shopping">🛍️ Shopping</option>
                <option value="Bills">📄 Bills</option>
                <option value="Entertainment">🎬 Entertainment</option>
                <option value="Others">📦 Others</option>
                {settings.custom_categories.map(cat => (
                  <option key={cat} value={cat}>🏷️ {cat}</option>
                ))}
              </select>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Custom categories appear in Add Expense and here
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Add Custom Category</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Health, Education, Travel"
                />
                <button type="button" className="btn btn-success" onClick={handleAddCategory}>
                  <Plus size={16} /> Add
                </button>
              </div>
              {settings.custom_categories.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                  {settings.custom_categories.map(cat => (
                    <span key={cat} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                      {cat}
                      <button type="button" onClick={() => handleRemoveCategory(cat)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#6b7280' }}>
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? (<><div className="spinner"></div>Saving...</>) : (<><Save size={16} />Save Settings</>)}
            </button>
          </div>
        </form>
      </div>

      {/* Account */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Account</h3>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          Manage your account and sign out when you’re done.
        </p>
        <button className="btn btn-danger" onClick={() => authService.logout()}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Data Management</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Export Data</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Download all your expenses and settings as a JSON file
            </p>
            <button className="btn btn-secondary" onClick={handleExportData}>
              <Download size={16} /> Export Data
            </button>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Import Data</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Import expenses and settings from a previously exported file
            </p>
            <input type="file" accept=".json" onChange={handleImportData} style={{ display: 'none' }} id="import-file" />
            <label htmlFor="import-file" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              <Upload size={16} /> Import Data
            </label>
          </div>
          <div>
            <h4 style={{ marginBottom: '0.5rem' }}>Clear All Data</h4>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
              Permanently delete all expenses and reset settings
            </p>
            <button className="btn btn-danger" onClick={handleClearData}>
              <Trash2 size={16} /> Clear Data
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>About</h3>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          <p><strong>Money Manager Simple</strong> - A simple expense tracker to help you manage your daily spending.</p>
          <p style={{ marginTop: '0.5rem' }}>Version: 1.0.0<br />Built with React, Node.js, and SQLite</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
