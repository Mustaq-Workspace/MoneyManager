import { format, parseISO, startOfMonth, endOfMonth, subMonths } from 'date-fns';

// Expense categories with colors and icons
export const EXPENSE_CATEGORIES = [
  { value: 'Food', label: 'Food', color: '#ef4444', icon: '🍕' },
  { value: 'Transport', label: 'Transport', color: '#3b82f6', icon: '🚗' },
  { value: 'Shopping', label: 'Shopping', color: '#8b5cf6', icon: '🛍️' },
  { value: 'Bills', label: 'Bills', color: '#f59e0b', icon: '📄' },
  { value: 'Entertainment', label: 'Entertainment', color: '#10b981', icon: '🎬' },
  { value: 'Others', label: 'Others', color: '#6b7280', icon: '📦' },
];

// Available currencies
export const AVAILABLE_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'ر.س' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
];

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  const currencyInfo = AVAILABLE_CURRENCIES.find(c => c.code === currency);
  const locale = currency === 'INR' ? 'en-IN' : 
                 currency === 'SAR' ? 'ar-SA' : 
                 currency === 'AED' ? 'ar-AE' : 'en-US';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Format date
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date;
  }
};

// Format date for input fields
export const formatDateForInput = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return date;
  }
};

// Get current month range
export const getCurrentMonthRange = () => {
  const now = new Date();
  return {
    start: startOfMonth(now),
    end: endOfMonth(now),
  };
};

// Get last month range
export const getLastMonthRange = () => {
  const lastMonth = subMonths(new Date(), 1);
  return {
    start: startOfMonth(lastMonth),
    end: endOfMonth(lastMonth),
  };
};

// Calculate percentage change
export const calculatePercentageChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

// Get category color
export const getCategoryColor = (category) => {
  const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
  return cat ? cat.color : '#6b7280';
};

// Get category icon
export const getCategoryIcon = (category) => {
  const cat = EXPENSE_CATEGORIES.find(c => c.value === category);
  return cat ? cat.icon : '📦';
};

// Calculate total expenses
export const calculateTotal = (expenses) => {
  return expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
};

// Group expenses by category
export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((groups, expense) => {
    const category = expense.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
};

// Calculate category totals
export const calculateCategoryTotals = (expenses) => {
  const grouped = groupExpensesByCategory(expenses);
  return Object.entries(grouped).map(([category, categoryExpenses]) => ({
    category,
    total: calculateTotal(categoryExpenses),
    count: categoryExpenses.length,
    color: getCategoryColor(category),
    icon: getCategoryIcon(category),
  }));
};

// Sort expenses by date (newest first)
export const sortExpensesByDate = (expenses) => {
  return [...expenses].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB - dateA;
  });
};

// Filter expenses by date range
export const filterExpensesByDateRange = (expenses, startDate, endDate) => {
  if (!startDate || !endDate) return expenses;
  
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return expenseDate >= start && expenseDate <= end;
  });
};

// Filter expenses by category
export const filterExpensesByCategory = (expenses, category) => {
  if (!category) return expenses;
  return expenses.filter(expense => expense.category === category);
};

// Search expenses by description
export const searchExpenses = (expenses, searchTerm) => {
  if (!searchTerm) return expenses;
  
  const term = searchTerm.toLowerCase();
  return expenses.filter(expense => 
    expense.description?.toLowerCase().includes(term) ||
    expense.category.toLowerCase().includes(term) ||
    expense.amount.toString().includes(term)
  );
};

// Validate expense data
export const validateExpense = (expense) => {
  const errors = {};
  
  if (!expense.amount || parseFloat(expense.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }
  
  if (!expense.category) {
    errors.category = 'Category is required';
  }
  
  if (!expense.date) {
    errors.date = 'Date is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Generate chart data for pie chart
export const generatePieChartData = (expenses) => {
  const categoryTotals = calculateCategoryTotals(expenses);
  return categoryTotals.map(item => ({
    name: item.category,
    value: item.total,
    color: item.color,
  }));
};

// Generate chart data for bar chart
export const generateBarChartData = (expenses) => {
  const categoryTotals = calculateCategoryTotals(expenses);
  return categoryTotals.map(item => ({
    category: item.category,
    amount: item.total,
    color: item.color,
  }));
};

// Generate chart data for line chart (daily spending)
export const generateLineChartData = (expenses) => {
  const dailyTotals = expenses.reduce((acc, expense) => {
    const date = formatDate(expense.date, 'MMM dd');
    acc[date] = (acc[date] || 0) + parseFloat(expense.amount);
    return acc;
  }, {});
  
  return Object.entries(dailyTotals).map(([date, amount]) => ({
    date,
    amount,
  }));
};

// Local storage helpers
export const storage = {
  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  },
};
