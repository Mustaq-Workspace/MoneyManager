import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { expenseAPI, statisticsAPI, settingsAPI } from '../services/api';
import {
  formatCurrency,
  formatDate,
  calculatePercentageChange,
  getCategoryIcon,
  sortExpensesByDate,
} from '../utils/helpers';

const DashboardScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentMonthStats, setCurrentMonthStats] = useState(null);
  const [lastMonthStats, setLastMonthStats] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [settings, setSettings] = useState({ currency: 'USD' });
  const [error, setError] = useState(null);

  useEffect(() => {
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
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

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        {/* Current Month Total */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsValue}>
              {formatCurrency(currentMonthStats?.total || 0, settings.currency)}
            </Title>
            <Paragraph style={styles.statsLabel}>This Month</Paragraph>
            {currentMonthStats && lastMonthStats && (
              <View style={styles.statsChange}>
                <Ionicons
                  name={getPercentageChange() >= 0 ? 'trending-up' : 'trending-down'}
                  size={16}
                  color={getPercentageChange() >= 0 ? '#ef4444' : '#10b981'}
                />
                <Text style={styles.statsChangeText}>
                  {Math.abs(getPercentageChange()).toFixed(1)}% vs last month
                </Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Average Daily Spending */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsValue}>
              {formatCurrency(currentMonthStats?.average_daily || 0, settings.currency)}
            </Title>
            <Paragraph style={styles.statsLabel}>Daily Average</Paragraph>
          </Card.Content>
        </Card>

        {/* Top Spending Category */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={[styles.statsValue, { color: getTopCategory()?.color || '#6b7280' }]}>
              {getTopCategory() ? getCategoryIcon(getTopCategory().category) : '📦'}
            </Title>
            <Paragraph style={styles.statsLabel}>
              {getTopCategory()?.category || 'No expenses'}
            </Paragraph>
            {getTopCategory() && (
              <Text style={styles.statsChangeText}>
                {formatCurrency(getTopCategory().total, settings.currency)}
              </Text>
            )}
          </Card.Content>
        </Card>
      </View>

      {/* Recent Expenses */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>Recent Expenses</Title>
          {recentExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expenses yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your expenses by adding your first one!
              </Text>
            </View>
          ) : (
            recentExpenses.map((expense) => (
              <View key={expense.id} style={styles.expenseItem}>
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseAmount}>
                    {formatCurrency(expense.amount, settings.currency)}
                  </Text>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseCategory}>
                      {getCategoryIcon(expense.category)} {expense.category}
                    </Text>
                    {expense.description && (
                      <Text style={styles.expenseDescription}>
                        {expense.description}
                      </Text>
                    )}
                    <Text style={styles.expenseDate}>
                      {formatDate(expense.date)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsCard: {
    marginBottom: 12,
    elevation: 2,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  statsChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statsChangeText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  expenseItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  expenseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  expenseDetails: {
    flex: 1,
    marginLeft: 12,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 2,
  },
  expenseDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

export default DashboardScreen;
