import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, TrendingDown, DollarSign, Calendar, BarChart3, User } from 'lucide-react';
import { expenseAPI, statisticsAPI, settingsAPI } from '../services/api';
import { 
  formatCurrency, 
  formatDate, 
  calculatePercentageChange,
  getCategoryIcon,
  getCategoryColor,
  sortExpensesByDate 
} from '../utils/helpers';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [currentMonthStats, setCurrentMonthStats] = useState(null);
  const [lastMonthStats, setLastMonthStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [settings, setSettings] = useState({ currency: 'USD' });
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(currentUser);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load settings first
      const settingsResponse = await settingsAPI.getAll();
      setSettings(settingsResponse.data);

      // Load current month statistics
      const currentMonthResponse = await statisticsAPI.getCurrentMonthStats();
      setCurrentMonthStats(currentMonthResponse.data);

      // Load last month statistics
      const lastMonthResponse = await statisticsAPI.getLastMonthStats();
      setLastMonthStats(lastMonthResponse.data);

      // Load recent expenses
      const expensesResponse = await expenseAPI.getAll({ limit: 5 });
      setRecentExpenses(sortExpensesByDate(expensesResponse.data));

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPercentageChange = () => {
    if (!currentMonthStats || !lastMonthStats) return 0;
    return calculatePercentageChange(currentMonthStats.total, lastMonthStats.total);
  };

  const getTopCategory = () => {
    if (!currentMonthStats?.categories || currentMonthStats.categories.length === 0) {
      return null;
    }
    return currentMonthStats.categories[0];
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Error Loading Dashboard</div>
          <div className="empty-state-text">{error}</div>
          <button className="btn btn-primary" onClick={loadDashboardData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header with User Info */}
      <div className="card mb-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="btn btn-secondary"
          >
            Account Settings
          </button>
        </div>
      </div>

      {/* Quick Add Button */}
      <div className="card">
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1rem' }}
          onClick={() => navigate('/add')}
        >
          <Plus size={20} />
          Add New Expense
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="dashboard-grid">
        {/* Current Month Total */}
        <div className="stats-card">
          <div className="stats-value">
            {formatCurrency(currentMonthStats?.total || 0, settings.currency)}
          </div>
          <div className="stats-label">This Month</div>
          {currentMonthStats && lastMonthStats && (
            <div className={`stats-change ${getPercentageChange() >= 0 ? 'negative' : 'positive'}`}>
              {getPercentageChange() >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {Math.abs(getPercentageChange()).toFixed(1)}% vs last month
            </div>
          )}
        </div>

        {/* Average Daily Spending */}
        <div className="stats-card">
          <div className="stats-value">
            {formatCurrency(currentMonthStats?.average_daily || 0, settings.currency)}
          </div>
          <div className="stats-label">Daily Average</div>
        </div>

        {/* Top Spending Category */}
        <div className="stats-card">
          <div className="stats-value" style={{ color: getTopCategory()?.color || '#6b7280' }}>
            {getTopCategory() ? getCategoryIcon(getTopCategory().category) : '📦'}
          </div>
          <div className="stats-label">
            {getTopCategory()?.category || 'No expenses'}
          </div>
          {getTopCategory() && (
            <div className="stats-change">
              {formatCurrency(getTopCategory().total, settings.currency)}
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Recent Expenses</h3>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/expenses')}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            View All
          </button>
        </div>

        {recentExpenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No Expenses Yet</div>
            <div className="empty-state-text">Start tracking your expenses by adding your first one!</div>
            <button className="btn btn-primary" onClick={() => navigate('/add')}>
              Add First Expense
            </button>
          </div>
        ) : (
          <div>
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
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
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/charts')}
            style={{ flexDirection: 'column', padding: '1rem' }}
          >
            <BarChart3 size={24} />
            <span>View Charts</span>
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/expenses')}
            style={{ flexDirection: 'column', padding: '1rem' }}
          >
            <Calendar size={24} />
            <span>All Expenses</span>
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/settings')}
            style={{ flexDirection: 'column', padding: '1rem' }}
          >
            <DollarSign size={24} />
            <span>Budget Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
