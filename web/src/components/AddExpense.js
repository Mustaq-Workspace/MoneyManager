import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft } from 'lucide-react';
import { expenseAPI, settingsAPI } from '../services/api';
import { EXPENSE_CATEGORIES, formatDateForInput, validateExpense, AVAILABLE_CURRENCIES } from '../utils/helpers';

const AddExpense = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: formatDateForInput(new Date()),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({ currency: 'USD', custom_categories: [] });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings({
        currency: response.data.currency || 'USD',
        custom_categories: Array.isArray(response.data.custom_categories) ? response.data.custom_categories : [],
        default_category: response.data.default_category || ''
      });
      if (response.data.default_category) {
        setFormData(prev => ({ ...prev, category: response.data.default_category }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const getCurrencySymbol = () => {
    const currencyInfo = AVAILABLE_CURRENCIES.find(c => c.code === settings.currency);
    return currencyInfo ? currencyInfo.symbol : '$';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateExpense(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    try {
      setLoading(true);
      setErrors({});
      await expenseAPI.create({ ...formData, amount: parseFloat(formData.amount) });
      setSuccess(true);
      setTimeout(() => { navigate('/'); }, 1500);
    } catch (err) {
      console.error('Error creating expense:', err);
      setErrors({ submit: err.response?.data?.error || 'Failed to create expense. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (amount) => {
    setFormData(prev => ({ ...prev, amount: amount.toString() }));
  };

  const allCategories = [...EXPENSE_CATEGORIES.map(c => c.value), ...settings.custom_categories];

  if (success) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <div className="empty-state-title">Expense Added Successfully!</div>
          <div className="empty-state-text">Redirecting to dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-expense">
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')} style={{ marginRight: '1rem', padding: '0.5rem' }}>
            <ArrowLeft size={16} />
          </button>
          <h2>Add New Expense</h2>
        </div>

        <form onSubmit={handleSubmit} className="form-container">
          {/* Amount Input */}
          <div className="form-group">
            <label className="form-label">Amount *</label>
            <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} className={`form-input ${errors.amount ? 'error' : ''}`} placeholder="0.00" step="0.01" min="0" required />
            {errors.amount && <div className="error-message">{errors.amount}</div>}
          </div>

          {/* Quick Amount Buttons */}
          <div className="form-group">
            <label className="form-label">Quick Amount</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              {[5, 10, 20, 50, 100, 200].map(amount => (
                <button key={amount} type="button" className="btn btn-secondary" onClick={() => handleQuickAdd(amount)} style={{ padding: '0.5rem', fontSize: '0.875rem' }}>
                  {getCurrencySymbol()}{amount}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selection */}
          <div className="form-group">
            <label className="form-label">Category *</label>
            <select name="category" value={formData.category} onChange={handleInputChange} className={`form-select ${errors.category ? 'error' : ''}`} required>
              <option value="">Select a category</option>
              {allCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <div className="error-message">{errors.category}</div>}
          </div>

          {/* Description Input */}
          <div className="form-group">
            <label className="form-label">Description</label>
            <input type="text" name="description" value={formData.description} onChange={handleInputChange} className="form-input" placeholder="What was this expense for?" maxLength="100" />
          </div>

          {/* Date Input */}
          <div className="form-group">
            <label className="form-label">Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleInputChange} className={`form-input ${errors.date ? 'error' : ''}`} required />
            {errors.date && <div className="error-message">{errors.date}</div>}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="error-message" style={{ marginBottom: '1rem' }}>
              {errors.submit}
            </div>
          )}

          {/* Form Actions */}
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/')} disabled={loading}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (<><div className="spinner"></div>Saving...</>) : (<><Save size={16} />Save Expense</>)}
            </button>
          </div>
        </form>
      </div>

      {/* Category Guide */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Category Guide</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {allCategories.map(category => (
            <div key={category} style={{ display: 'flex', alignItems: 'center', padding: '0.5rem', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
              <span style={{ marginRight: '0.5rem', fontSize: '1.25rem' }}>🏷️</span>
              <span>{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AddExpense;
