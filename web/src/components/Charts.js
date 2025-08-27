import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { expenseAPI, statisticsAPI, settingsAPI } from '../services/api';
import { 
  formatCurrency, 
  generatePieChartData, 
  generateBarChartData, 
  generateLineChartData,
  getCategoryColor 
} from '../utils/helpers';

const Charts = () => {
  const [expenses, setExpenses] = useState([]);
  const [currentMonthStats, setCurrentMonthStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [settings, setSettings] = useState({ currency: 'USD' });

  useEffect(() => {
    loadChartData();
  }, [selectedPeriod]);

  const loadChartData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load settings first
      const settingsResponse = await settingsAPI.getAll();
      setSettings(settingsResponse.data);

      // Load expenses for the selected period
      const expensesResponse = await expenseAPI.getAll({ limit: 100 });
      setExpenses(expensesResponse.data);

      // Load current month statistics
      const statsResponse = await statisticsAPI.getCurrentMonthStats();
      setCurrentMonthStats(statsResponse.data);

    } catch (err) {
      console.error('Error loading chart data:', err);
      setError('Failed to load chart data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pieChartData = generatePieChartData(expenses);
  const barChartData = generateBarChartData(expenses);
  const lineChartData = generateLineChartData(expenses);

  const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#6b7280'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ 
              margin: '4px 0', 
              color: entry.color,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: entry.color, 
                borderRadius: '2px',
                display: 'inline-block'
              }}></span>
              {entry.name}: {formatCurrency(entry.value, settings.currency)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Loading charts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">Error Loading Charts</div>
          <div className="empty-state-text">{error}</div>
          <button className="btn btn-primary" onClick={loadChartData}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <div className="empty-state-title">No Data for Charts</div>
          <div className="empty-state-text">Add some expenses to see beautiful charts and insights!</div>
          <button 
            className="btn btn-primary"
            onClick={() => window.location.href = '/add'}
          >
            Add First Expense
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="charts">
      {/* Period Selector */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Expense Analytics</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="form-select"
            style={{ width: 'auto', minWidth: '150px' }}
          >
            <option value="current">Current Month</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </div>

      {/* Category Breakdown - Pie Chart */}
      <div className="chart-container">
        <div className="chart-title">Spending by Category</div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
          gap: '0.5rem',
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px'
        }}>
          {pieChartData.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.color,
                borderRadius: '2px'
              }}></div>
              <span style={{ fontSize: '0.875rem' }}>{entry.name}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: '600', marginLeft: 'auto' }}>
                {formatCurrency(entry.value, settings.currency)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Categories - Bar Chart */}
      <div className="chart-container">
        <div className="chart-title">Top Spending Categories</div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="category" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, settings.currency)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value, settings.currency), 'Amount']}
              labelStyle={{ color: '#374151' }}
            />
            <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {barChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Spending Trend - Line Chart */}
      <div className="chart-container">
        <div className="chart-title">Daily Spending Trend</div>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={lineChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value) => formatCurrency(value, settings.currency)}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value, settings.currency), 'Daily Total']}
              labelStyle={{ color: '#374151' }}
            />
            <Area 
              type="monotone" 
              dataKey="amount" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Statistics */}
      {currentMonthStats && (
        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Monthly Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#0369a1' }}>
                {formatCurrency(currentMonthStats.total, settings.currency)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Spent</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#059669' }}>
                {formatCurrency(currentMonthStats.average_daily, settings.currency)}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Daily Average</div>
            </div>
            <div style={{ textAlign: 'center', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#d97706' }}>
                {currentMonthStats.categories?.length || 0}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Categories Used</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charts;
