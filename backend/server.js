const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  // Expenses table
  db.run(`CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Settings table
  db.run(`CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Insert default settings
  db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES 
    ('monthly_budget', '1000'),
    ('currency', 'USD'),
    ('default_category', 'Others')`);
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Money Manager API is running' });
});

// Get all expenses
app.get('/api/expenses', (req, res) => {
  const { category, start_date, end_date, limit = 50 } = req.query;
  
  let query = 'SELECT * FROM expenses';
  let params = [];
  let conditions = [];

  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }

  if (start_date) {
    conditions.push('date >= ?');
    params.push(start_date);
  }

  if (end_date) {
    conditions.push('date <= ?');
    params.push(end_date);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date DESC, created_at DESC LIMIT ?';
  params.push(parseInt(limit));

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching expenses:', err);
      return res.status(500).json({ error: 'Failed to fetch expenses' });
    }
    res.json(rows);
  });
});

// Get single expense
app.get('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error('Error fetching expense:', err);
      return res.status(500).json({ error: 'Failed to fetch expense' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json(row);
  });
});

// Create new expense
app.post('/api/expenses', (req, res) => {
  const { amount, category, description, date } = req.body;
  const { v4: uuidv4 } = require('uuid');
  const id = uuidv4();

  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'Amount, category, and date are required' });
  }

  const query = `
    INSERT INTO expenses (id, amount, category, description, date)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(query, [id, amount, category, description || '', date], function(err) {
    if (err) {
      console.error('Error creating expense:', err);
      return res.status(500).json({ error: 'Failed to create expense' });
    }
    
    // Return the created expense
    db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching created expense:', err);
        return res.status(500).json({ error: 'Failed to fetch created expense' });
      }
      res.status(201).json(row);
    });
  });
});

// Update expense
app.put('/api/expenses/:id', (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;

  if (!amount || !category || !date) {
    return res.status(400).json({ error: 'Amount, category, and date are required' });
  }

  const query = `
    UPDATE expenses 
    SET amount = ?, category = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [amount, category, description || '', date, id], function(err) {
    if (err) {
      console.error('Error updating expense:', err);
      return res.status(500).json({ error: 'Failed to update expense' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Return the updated expense
    db.get('SELECT * FROM expenses WHERE id = ?', [id], (err, row) => {
      if (err) {
        console.error('Error fetching updated expense:', err);
        return res.status(500).json({ error: 'Failed to fetch updated expense' });
      }
      res.json(row);
    });
  });
});

// Delete expense
app.delete('/api/expenses/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM expenses WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error deleting expense:', err);
      return res.status(500).json({ error: 'Failed to delete expense' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    
    res.json({ message: 'Expense deleted successfully' });
  });
});

// Get expense statistics
app.get('/api/statistics', (req, res) => {
  const { start_date, end_date } = req.query;
  
  let dateCondition = '';
  let params = [];

  if (start_date && end_date) {
    dateCondition = 'WHERE date BETWEEN ? AND ?';
    params = [start_date, end_date];
  }

  // Total expenses
  const totalQuery = `SELECT SUM(amount) as total FROM expenses ${dateCondition}`;
  
  // Category breakdown
  const categoryQuery = `
    SELECT category, SUM(amount) as total, COUNT(*) as count 
    FROM expenses ${dateCondition}
    GROUP BY category 
    ORDER BY total DESC
  `;

  // Daily averages
  const dailyQuery = `
    SELECT AVG(daily_total) as average_daily
    FROM (
      SELECT date, SUM(amount) as daily_total
      FROM expenses ${dateCondition}
      GROUP BY date
    )
  `;

  db.get(totalQuery, params, (err, totalRow) => {
    if (err) {
      console.error('Error fetching total:', err);
      return res.status(500).json({ error: 'Failed to fetch statistics' });
    }

    db.all(categoryQuery, params, (err, categoryRows) => {
      if (err) {
        console.error('Error fetching categories:', err);
        return res.status(500).json({ error: 'Failed to fetch statistics' });
      }

      db.get(dailyQuery, params, (err, dailyRow) => {
        if (err) {
          console.error('Error fetching daily average:', err);
          return res.status(500).json({ error: 'Failed to fetch statistics' });
        }

        res.json({
          total: totalRow.total || 0,
          categories: categoryRows,
          average_daily: dailyRow.average_daily || 0
        });
      });
    });
  });
});

// Get settings
app.get('/api/settings', (req, res) => {
  db.all('SELECT key, value FROM settings', (err, rows) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
    
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    res.json(settings);
  });
});

// Update settings
app.put('/api/settings', (req, res) => {
  const settings = req.body;
  
  const promises = Object.entries(settings).map(([key, value]) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
        [key, value],
        function(err) {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  });

  Promise.all(promises)
    .then(() => {
      res.json({ message: 'Settings updated successfully' });
    })
    .catch(err => {
      console.error('Error updating settings:', err);
      res.status(500).json({ error: 'Failed to update settings' });
    });
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
