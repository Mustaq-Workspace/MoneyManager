import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Card, Title, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { expenseAPI, statisticsAPI, settingsAPI } from '../services/api';
import { 
  formatCurrency, 
  generatePieChartData, 
  generateBarChartData,
  generateLineChartData,
  calculateCategoryTotals,
  getCategoryColor,
  getCategoryIcon
} from '../utils/helpers';

const { width } = Dimensions.get('window');

const ChartsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [currentMonthStats, setCurrentMonthStats] = useState(null);
  const [settings, setSettings] = useState({ currency: 'USD' });

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Load settings first
      const settingsResponse = await settingsAPI.getAll();
      setSettings(settingsResponse.data);

      // Load expenses for charts
      const expensesResponse = await expenseAPI.getAll({ limit: 1000 });
      setExpenses(expensesResponse.data);

      // Load current month statistics
      const statsResponse = await statisticsAPI.getCurrentMonthStats();
      setCurrentMonthStats(statsResponse.data);
    } catch (err) {
      console.error('Error loading chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadChartData();
    setRefreshing(false);
  };

  const getCategoryBreakdown = () => {
    const categoryTotals = calculateCategoryTotals(expenses);
    return categoryTotals.slice(0, 5); // Top 5 categories
  };

  const getTopSpendingDay = () => {
    if (expenses.length === 0) return null;
    
    const dailyTotals = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date).toDateString();
      acc[date] = (acc[date] || 0) + parseFloat(expense.amount);
      return acc;
    }, {});
    
    const topDay = Object.entries(dailyTotals).reduce((max, [date, amount]) => 
      amount > max.amount ? { date, amount } : max, { date: '', amount: 0 }
    );
    
    return topDay;
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading charts...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Monthly Overview */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Ionicons name="calendar" size={20} color="#3b82f6" /> Monthly Overview
          </Title>
          {currentMonthStats ? (
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatCurrency(currentMonthStats.total, settings.currency)}
                </Text>
                <Text style={styles.statLabel}>Total Spent</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatCurrency(currentMonthStats.average_daily, settings.currency)}
                </Text>
                <Text style={styles.statLabel}>Daily Average</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {currentMonthStats.categories?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No data available</Text>
              <Text style={styles.emptyStateSubtext}>
                Add some expenses to see charts and insights!
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Category Breakdown */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Ionicons name="pie-chart" size={20} color="#8b5cf6" /> Category Breakdown
          </Title>
          {expenses.length > 0 ? (
            <View style={styles.categoryList}>
              {getCategoryBreakdown().map((category, index) => (
                <View key={category.category} style={styles.categoryItem}>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryIcon}>{getCategoryIcon(category.category)}</Text>
                    <View style={styles.categoryDetails}>
                      <Text style={styles.categoryName}>{category.category}</Text>
                      <Text style={styles.categoryCount}>{category.count} expenses</Text>
                    </View>
                  </View>
                  <View style={styles.categoryAmount}>
                    <Text style={[styles.categoryTotal, { color: getCategoryColor(category.category) }]}>
                      {formatCurrency(category.total, settings.currency)}
                    </Text>
                    <View style={[styles.categoryBar, { 
                      backgroundColor: getCategoryColor(category.category),
                      width: `${(category.total / Math.max(...getCategoryBreakdown().map(c => c.total))) * 100}%`
                    }]} />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expenses yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your expenses to see category breakdowns!
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Spending Insights */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Ionicons name="trending-up" size={20} color="#10b981" /> Spending Insights
          </Title>
          {expenses.length > 0 ? (
            <View style={styles.insightsContainer}>
              <View style={styles.insightItem}>
                <Ionicons name="calendar-outline" size={24} color="#f59e0b" />
                <View style={styles.insightText}>
                  <Text style={styles.insightLabel}>Highest Spending Day</Text>
                  <Text style={styles.insightValue}>
                    {getTopSpendingDay()?.date ? new Date(getTopSpendingDay().date).toLocaleDateString() : 'N/A'}
                  </Text>
                  <Text style={styles.insightSubtext}>
                    {getTopSpendingDay()?.amount ? formatCurrency(getTopSpendingDay().amount, settings.currency) : ''}
                  </Text>
                </View>
              </View>
              
              <View style={styles.insightItem}>
                <Ionicons name="card-outline" size={24} color="#ef4444" />
                <View style={styles.insightText}>
                  <Text style={styles.insightLabel}>Total Expenses</Text>
                  <Text style={styles.insightValue}>{expenses.length}</Text>
                  <Text style={styles.insightSubtext}>transactions recorded</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No insights available</Text>
              <Text style={styles.emptyStateSubtext}>
                Add expenses to see spending patterns and insights!
              </Text>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Coming Soon Features */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.cardTitle}>
            <Ionicons name="rocket" size={20} color="#06b6d4" /> Coming Soon
          </Title>
          <Text style={styles.comingSoonText}>
            Advanced charts including pie charts, bar charts, and trend analysis will be available in the next update!
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryList: {
    marginTop: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#6b7280',
  },
  categoryAmount: {
    alignItems: 'flex-end',
  },
  categoryTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryBar: {
    height: 4,
    borderRadius: 2,
    minWidth: 20,
  },
  insightsContainer: {
    marginTop: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  insightText: {
    marginLeft: 16,
    flex: 1,
  },
  insightLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  insightValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 2,
  },
  insightSubtext: {
    fontSize: 12,
    color: '#9ca3af',
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
    lineHeight: 20,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ChartsScreen;
