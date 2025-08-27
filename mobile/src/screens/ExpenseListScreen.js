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
import { expenseAPI, settingsAPI } from '../services/api';
import { formatCurrency, formatDate, getCategoryIcon, sortExpensesByDate } from '../utils/helpers';

const ExpenseListScreen = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [settings, setSettings] = useState({ currency: 'USD' });

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      
      // Load settings first
      const settingsResponse = await settingsAPI.getAll();
      setSettings(settingsResponse.data);
      
      const response = await expenseAPI.getAll({ limit: 100 });
      const sortedExpenses = sortExpensesByDate(response.data);
      setExpenses(sortedExpenses);
    } catch (err) {
      console.error('Error loading expenses:', err);
      Alert.alert('Error', 'Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleDelete = async (expenseId) => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await expenseAPI.delete(expenseId);
              setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
              Alert.alert('Success', 'Expense deleted successfully!');
            } catch (err) {
              console.error('Error deleting expense:', err);
              Alert.alert('Error', 'Failed to delete expense. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading expenses...</Text>
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
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>All Expenses</Title>
          {expenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No expenses yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start tracking your expenses by adding your first one!
              </Text>
            </View>
          ) : (
            expenses.map((expense) => (
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
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(expense.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
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
  card: {
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingVertical: 12,
  },
  expenseInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 12,
  },
  expenseDetails: {
    flex: 1,
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
  deleteButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default ExpenseListScreen;
