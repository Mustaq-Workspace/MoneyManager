import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button, Card, Title, Switch, useTheme } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { settingsAPI } from '../services/api';
import { AVAILABLE_CURRENCIES, formatCurrency, EXPENSE_CATEGORIES } from '../utils/helpers';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    monthly_budget: '1000',
    currency: 'USD',
    default_category: 'Others',
    darkMode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getAll();
      setSettings(response.data);
    } catch (err) {
      console.error('Error loading settings:', err);
      Alert.alert('Error', 'Failed to load settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name, value) => {
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.update(settings);
      Alert.alert('Success', 'Settings saved successfully!');
    } catch (err) {
      console.error('Error saving settings:', err);
      Alert.alert('Error', 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const toggleDarkMode = () => {
    setSettings(prev => ({
      ...prev,
      darkMode: !prev.darkMode
    }));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Appearance</Title>
          
          {/* Dark Mode Toggle */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={24} color="#6366f1" />
              <View style={styles.settingText}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDescription}>
                  Switch between light and dark themes
                </Text>
              </View>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={toggleDarkMode}
              color="#6366f1"
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>Budget Settings</Title>

          {/* Monthly Budget */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Monthly Budget</Text>
            <TextInput
              mode="outlined"
              value={settings.monthly_budget}
              onChangeText={(value) => handleInputChange('monthly_budget', value)}
              placeholder="1000"
              keyboardType="numeric"
              style={styles.input}
              outlineColor="#e5e7eb"
              activeOutlineColor="#3b82f6"
            />
            <Text style={styles.helpText}>
              Set your monthly spending limit to track your budget progress
            </Text>
          </View>

          {/* Currency */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currency</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowCurrencyPicker(!showCurrencyPicker)}
            >
              <Text style={styles.pickerText}>
                {settings.currency} - {AVAILABLE_CURRENCIES.find(c => c.code === settings.currency)?.name}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
            
            {showCurrencyPicker && (
              <View style={styles.pickerDropdown}>
                <Picker
                  selectedValue={settings.currency}
                  onValueChange={(value) => {
                    handleInputChange('currency', value);
                    setShowCurrencyPicker(false);
                  }}
                  style={styles.picker}
                >
                  {AVAILABLE_CURRENCIES.map(currency => (
                    <Picker.Item
                      key={currency.code}
                      label={`${currency.code} (${currency.symbol}) - ${currency.name}`}
                      value={currency.code}
                    />
                  ))}
                </Picker>
              </View>
            )}
            <Text style={styles.helpText}>
              Example: {formatCurrency(1234.56, settings.currency)}
            </Text>
          </View>

          {/* Default Category */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Default Category</Text>
            <TouchableOpacity
              style={styles.pickerContainer}
              onPress={() => setShowCategoryPicker(!showCategoryPicker)}
            >
              <Text style={styles.pickerText}>
                {settings.default_category}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
            
            {showCategoryPicker && (
              <View style={styles.pickerDropdown}>
                <Picker
                  selectedValue={settings.default_category}
                  onValueChange={(value) => {
                    handleInputChange('default_category', value);
                    setShowCategoryPicker(false);
                  }}
                  style={styles.picker}
                >
                  {EXPENSE_CATEGORIES.map(category => (
                    <Picker.Item
                      key={category.value}
                      label={`${category.icon} ${category.label}`}
                      value={category.value}
                    />
                  ))}
                </Picker>
              </View>
            )}
            <Text style={styles.helpText}>
              This category will be pre-selected when adding new expenses
            </Text>
          </View>

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            buttonColor="#3b82f6"
            textColor="white"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>About</Title>
          <Text style={styles.aboutText}>
            <Text style={styles.bold}>Money Manager Simple</Text> - A simple expense tracker to help you manage your daily spending.
          </Text>
          <Text style={styles.versionText}>
            Version: 1.0.0{'\n'}
            Built with React Native and Expo
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1f2937',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
  },
  pickerContainer: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 16,
    color: '#374151',
    flex: 1,
  },
  pickerArrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  pickerDropdown: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 4,
    elevation: 3,
  },
  picker: {
    height: 200,
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
    fontStyle: 'italic',
  },
  saveButton: {
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  aboutText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  bold: {
    fontWeight: 'bold',
  },
  versionText: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
  },
});

export default SettingsScreen;
