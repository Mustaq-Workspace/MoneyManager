const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple JSON storage paths
const dataDir = path.join(__dirname, 'data');
const usersPath = path.join(dataDir, 'users.json');
const expensesPath = path.join(dataDir, 'expenses.json');
const settingsPath = path.join(dataDir, 'settings.json');

function ensureDataFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(usersPath)) fs.writeFileSync(usersPath, JSON.stringify([]));
  if (!fs.existsSync(expensesPath)) fs.writeFileSync(expensesPath, JSON.stringify([]));
  if (!fs.existsSync(settingsPath)) fs.writeFileSync(settingsPath, JSON.stringify([]));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

ensureDataFiles();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Money Manager API is running' });
});

// Authentication routes
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }

  const { v4: uuidv4 } = require('uuid');
  const userId = uuidv4();

  try {
    const users = readJson(usersPath);
    
    // Check if user already exists
    if (users.find(user => user.email === email)) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    // Hash password and create user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.push(newUser);
    writeJson(usersPath, users);

    // Create default settings for the user
    const settings = readJson(settingsPath);
    const defaultSettings = [
      { user_id: userId, key: 'monthly_budget', value: '1000' },
      { user_id: userId, key: 'currency', value: 'USD' },
      { user_id: userId, key: 'default_category', value: 'Others' }
    ];

    defaultSettings.forEach(setting => {
      settings.push({
        ...setting,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });
    writeJson(settingsPath, settings);

    // Generate JWT token
    const token = jwt.sign({ userId, email, name }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const users = readJson(usersPath);
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Failed to login' });
  }
});

// Protected routes - require authentication
app.get('/api/expenses', authenticateToken, (req, res) => {
  const { category, start_date, end_date, limit = 50 } = req.query;
  
  try {
    const allExpenses = readJson(expensesPath);
    let filtered = allExpenses.filter(e => e.user_id === req.user.userId);
    
    if (category) filtered = filtered.filter(e => e.category === category);
    if (start_date) filtered = filtered.filter(e => e.date >= start_date);
    if (end_date) filtered = filtered.filter(e => e.date <= end_date);
    
    filtered.sort((a, b) => (b.date.localeCompare(a.date)) || (b.created_at?.localeCompare(a.created_at || '') || 0));
    res.json(filtered.slice(0, parseInt(limit)));
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

app.get('/api/expenses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  
  try {
    const allExpenses = readJson(expensesPath);
    const expense = allExpenses.find(e => e.id === id && e.user_id === req.user.userId);
    
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ error: 'Failed to fetch expense' });
  }
});

app.post('/api/expenses', authenticateToken, (req, res) => {
  const { amount, category, description, date } = req.body;
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();

  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'Amount, category, and date are required' });
  }

  try {
    const allExpenses = readJson(expensesPath);
    const now = new Date().toISOString();
    const newExpense = {
      id,
      user_id: req.user.userId,
      amount: Number(amount),
      category,
      description: description || '',
      date,
      created_at: now,
      updated_at: now
    };

    allExpenses.push(newExpense);
    writeJson(expensesPath, allExpenses);
    res.status(201).json(newExpense);
  } catch (error) {
    console.error('Error creating expense:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

app.put('/api/expenses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;

  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'Amount, category, and date are required' });
  }

  try {
    const allExpenses = readJson(expensesPath);
    const expenseIndex = allExpenses.findIndex(e => e.id === id && e.user_id === req.user.userId);
    
    if (expenseIndex === -1) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    const updatedExpense = {
      ...allExpenses[expenseIndex],
      amount: Number(amount),
      category,
      description: description || '',
      date,
      updated_at: new Date().toISOString()
    };

    allExpenses[expenseIndex] = updatedExpense;
    writeJson(expensesPath, allExpenses);
    res.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Failed to update expense' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
  const { id } = req.params;

  try {
    const allExpenses = readJson(expensesPath);
    const filteredExpenses = allExpenses.filter(e => !(e.id === id && e.user_id === req.user.userId));
    
    if (filteredExpenses.length === allExpenses.length) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    writeJson(expensesPath, filteredExpenses);
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

app.get('/api/statistics', authenticateToken, (req, res) => {
  const { start_date, end_date } = req.query;
  
  try {
    const allExpenses = readJson(expensesPath);
    let filtered = allExpenses.filter(e => e.user_id === req.user.userId);
    
    if (start_date) filtered = filtered.filter(e => e.date >= start_date);
    if (end_date) filtered = filtered.filter(e => e.date <= end_date);

    const total = filtered.reduce((sum, e) => sum + Number(e.amount), 0);
    
    const byCategory = Object.values(filtered.reduce((acc, e) => {
      acc[e.category] = acc[e.category] || { category: e.category, total: 0, count: 0 };
      acc[e.category].total += Number(e.amount);
      acc[e.category].count += 1;
      return acc;
    }, {}));

    const byDate = Object.values(filtered.reduce((acc, e) => {
      acc[e.date] = acc[e.date] || { date: e.date, daily_total: 0 };
      acc[e.date].daily_total += Number(e.amount);
      return acc;
    }, {}));

    const average_daily = byDate.length ? byDate.reduce((sum, d) => sum + d.daily_total, 0) / byDate.length : 0;

    res.json({
      total,
      categories: byCategory.sort((a, b) => b.total - a.total),
      average_daily
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

app.get('/api/settings', authenticateToken, (req, res) => {
  try {
    const allSettings = readJson(settingsPath);
    const userSettings = allSettings.filter(s => s.user_id === req.user.userId);
    
    const settings = {};
    userSettings.forEach(setting => {
      settings[setting.key] = setting.value;
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const settings = req.body;
  
  try {
    const allSettings = readJson(settingsPath);
    
    Object.entries(settings).forEach(([key, value]) => {
      const existingIndex = allSettings.findIndex(s => s.user_id === req.user.userId && s.key === key);
      
      if (existingIndex !== -1) {
        allSettings[existingIndex].value = value;
        allSettings[existingIndex].updated_at = new Date().toISOString();
      } else {
        allSettings.push({
          user_id: req.user.userId,
          key,
          value,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    });
    
    writeJson(settingsPath, allSettings);
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Money Manager API server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
