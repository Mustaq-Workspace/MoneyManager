import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, Plus } from 'lucide-react';
import { expenseAPI, settingsAPI } from '../services/api';
import { 
  formatCurrency, 
  formatDate, 
  getCategoryIcon, 
  getCategoryColor,
  sortExpensesByDate,
  filterExpensesByCategory,
  searchExpenses,
  EXPENSE_CATEGORIES 
} from '../utils/helpers';

const ExpenseList = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [settings, setSettings] = useState({ currency: 'USD' });

  useEffect(() => {
    loadExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, searchTerm, selectedCategory]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load settings first
      const settingsResponse = await settingsAPI.getAll();
      setSettings(settingsResponse.data);
      
      const response = await expenseAPI.getAll({ limit: 100 });
      const sortedExpenses = sortExpensesByDate(response.data);
      setExpenses(sortedExpenses);
      
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let filtered = [...expenses];

    // Apply search filter
    if (searchTerm) {
      filtered = searchExpenses(filtered, searchTerm);
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filterExpensesByCategory(filtered, selectedCategory);
    }

    setFilteredExpenses(filtered);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseAPI.delete(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (err) {
      console.error('Error deleting expense:', err);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setEditForm({
      amount: expense.amount.toString(),
      category: expense.category,
      description: expense.description || '',
      date: expense.date
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await expenseAPI.update(editingExpense.id, {
        ...editForm,
        amount: parseFloat(editForm.amount)
      });
      
      // Update the expense in the list
      setExpenses(prev => prev.map(expense => 
        expense.id === editingExpense.id 
          ? { ...expense, ...editForm, amount: parseFloat(editForm.amount) }
          : expense
      ));
      
      setEditingExpense(null);
      setEditForm({});
    } catch (err) {
      console.error('Error updating expense:', err);
      alert('Failed to update expense. Please try again.');
    }
  };

  const handleEditCancel = () => {
    setEditingExpense(null);
    setEditForm({});
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading expenses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Error Loading Expenses</div>
          <div className="empty-state-text">{error}</div>
          <button className="btn btn-primary" onClick={loadExpenses}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-list">
      {/* Header */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>All Expenses</h2>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/add'}
          >
            <Plus size={16} />
            Add Expense
          </button>
        </div>

        {/* Search and Filters */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
              <input
                type="text"
                placeholder="Search expenses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '40px' }}
              />
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={16} />
              Filters
            </button>
          </div>

          {showFilters && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '8px' }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="form-select"
                style={{ minWidth: '150px' }}
              >
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
              
              {(searchTerm || selectedCategory) && (
                <button
                  className="btn btn-secondary"
                  onClick={clearFilters}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div style={{ marginBottom: '1rem', color: '#6b7280', fontSize: '0.875rem' }}>
          Showing {filteredExpenses.length} of {expenses.length} expenses
          {(searchTerm || selectedCategory) && (
            <span> (filtered)</span>
          )}
        </div>
      </div>

      {/* Expenses List */}
      <div className="card">
        {filteredExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">
              {expenses.length === 0 ? 'No Expenses Yet' : 'No Matching Expenses'}
            </div>
            <div className="empty-state-text">
              {expenses.length === 0 
                ? 'Start tracking your expenses by adding your first one!'
                : 'Try adjusting your search or filters.'
              }
            </div>
            {expenses.length === 0 && (
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/add'}
              >
                Add First Expense
              </button>
            )}
          </div>
        ) : (
          <div>
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                {editingExpense?.id === expense.id ? (
                  // Edit Form
                  <form onSubmit={handleEditSubmit} style={{ width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'center' }}>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="form-input"
                        step="0.01"
                        min="0"
                        required
                      />
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value }))}
                        className="form-select"
                        required
                      >
                        {EXPENSE_CATEGORIES.map(category => (
                          <option key={category.value} value={category.value}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="form-input"
                        placeholder="Description"
                      />
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button type="submit" className="btn btn-success" style={{ padding: '0.5rem' }}>
                          Save
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleEditCancel} style={{ padding: '0.5rem' }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  // Display Mode
                  <>
                    <div className="expense-info">
                      <div className="expense-amount">
                        {formatCurrency(expense.amount, settings.currency)}
                      </div>
                      <div className="expense-category">
                        <span style={{ marginRight: '0.5rem' }}>
                          {getCategoryIcon(expense.category)}
                        </span>
                        {expense.category}
                        {expense.description && (
                          <span style={{ marginLeft: '0.5rem', color: '#9ca3af' }}>
                            - {expense.description}
                          </span>
                        )}
                      </div>
                      <div className="expense-date">
                        {formatDate(expense.date)}
                      </div>
                    </div>
                    <div className="expense-actions">
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleEdit(expense)}
                        style={{ padding: '0.5rem' }}
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(expense.id)}
                        style={{ padding: '0.5rem' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
