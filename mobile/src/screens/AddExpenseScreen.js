import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { TextInput, Button, Card, Title, useTheme, Divider } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { expenseAPI, settingsAPI } from '../services/api';
import { EXPENSE_CATEGORIES, AVAILABLE_CURRENCIES, formatDateForInput, validateExpense, getCategoryIcon } from '../utils/helpers';
import billAnalysisService from '../services/billAnalysisService';
import BillAnalysisModal from '../components/BillAnalysisModal';

const AddExpenseScreen = () => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: formatDateForInput(new Date()),
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({ currency: 'USD' });
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Camera functionality states
  const [cameraLoading, setCameraLoading] = useState(false);
  const [billAnalysisData, setBillAnalysisData] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [entryMode, setEntryMode] = useState('manual'); // 'manual' or 'camera'

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data);
      
      // Set default category from settings
      if (response.data.default_category) {
        setFormData(prev => ({
          ...prev,
          category: response.data.default_category
        }));
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  };

  const getCurrencySymbol = () => {
    const currencyInfo = AVAILABLE_CURRENCIES.find(c => c.code === settings.currency);
    return currencyInfo ? currencyInfo.symbol : '$';
  };

  const handleInputChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleQuickAdd = (amount) => {
    setFormData(prev => ({
      ...prev,
      amount: amount.toString()
    }));
  };

  // Camera functionality
  const handleTakePhoto = async () => {
    try {
      setCameraLoading(true);
      
      // Request camera permissions
      const hasPermission = await billAnalysisService.requestCameraPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Camera permission is required to take photos of bills.');
        return;
      }

      // Take photo
      const photo = await billAnalysisService.takePhoto();
      if (photo) {
        // Analyze the bill
        const analysis = await billAnalysisService.analyzeBill(photo.uri);
        setBillAnalysisData(analysis);
        setShowBillModal(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    } finally {
      setCameraLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      setCameraLoading(true);
      
      // Request media library permissions
      const hasPermission = await billAnalysisService.requestMediaLibraryPermissions();
      if (!hasPermission) {
        Alert.alert('Permission Required', 'Media library permission is required to select bill images.');
        return;
      }

      // Pick image
      const image = await billAnalysisService.pickImage();
      if (image) {
        // Analyze the bill
        const analysis = await billAnalysisService.analyzeBill(image.uri);
        setBillAnalysisData(analysis);
        setShowBillModal(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to pick image');
    } finally {
      setCameraLoading(false);
    }
  };

  const handleBillConfirm = async (billData) => {
    try {
      // Auto-fill form with bill data
      setFormData({
        amount: billData.amount.toString(),
        category: billData.category,
        description: billData.items.join(', '),
        date: formatDateForInput(new Date()),
      });

      // Save the expense
      await expenseAPI.create({
        amount: billData.amount,
        category: billData.category,
        description: billData.items.join(', '),
        date: new Date().toISOString().split('T')[0],
      });

      Alert.alert('Success', 'Expense added successfully from bill!');
      
      // Reset form
      setFormData({
        amount: '',
        category: settings.default_category || '',
        description: '',
        date: formatDateForInput(new Date()),
      });

      setEntryMode('manual');
    } catch (error) {
      console.error('Error adding expense from bill:', error);
      throw error;
    }
  };

  const handleBillEdit = (billData) => {
    // Auto-fill form with bill data for manual editing
    setFormData({
      amount: billData.amount.toString(),
      category: billData.category,
      description: billData.items.join(', '),
      date: formatDateForInput(new Date()),
    });
    setEntryMode('manual');
  };

  const handleSubmit = async () => {
    // Validate form
    const validation = validateExpense(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      
      await expenseAPI.create({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      Alert.alert('Success', 'Expense added successfully!');
      
      // Reset form
      setFormData({
        amount: '',
        category: settings.default_category || '',
        description: '',
        date: formatDateForInput(new Date()),
      });
      
    } catch (err) {
      console.error('Error creating expense:', err);
      Alert.alert('Error', 'Failed to create expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Entry Mode Selection */}
        <Card style={styles.modeCard}>
          <Card.Content>
            <Title style={styles.modeTitle}>Choose Entry Method</Title>
            <View style={styles.modeButtons}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  entryMode === 'manual' && styles.modeButtonActive
                ]}
                onPress={() => setEntryMode('manual')}
              >
                <Ionicons 
                  name="create" 
                  size={24} 
                  color={entryMode === 'manual' ? 'white' : '#6b7280'} 
                />
                <Text style={[
                  styles.modeButtonText,
                  entryMode === 'manual' && styles.modeButtonTextActive
                ]}>
                  Manual Entry
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  entryMode === 'camera' && styles.modeButtonActive
                ]}
                onPress={() => setEntryMode('camera')}
              >
                <Ionicons 
                  name="camera" 
                  size={24} 
                  color={entryMode === 'camera' ? 'white' : '#6b7280'} 
                />
                <Text style={[
                  styles.modeButtonText,
                  entryMode === 'camera' && styles.modeButtonTextActive
                ]}>
                  Camera Bill
                </Text>
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {entryMode === 'camera' ? (
          /* Camera Mode */
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>
                <Ionicons name="camera" size={24} color="#3b82f6" /> Capture Bill
              </Title>
              
              <Text style={styles.cameraDescription}>
                Take a photo of your bill or select from gallery to automatically extract expense details.
              </Text>

              <View style={styles.cameraButtons}>
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleTakePhoto}
                  disabled={cameraLoading}
                >
                  <Ionicons name="camera" size={32} color="white" />
                  <Text style={styles.cameraButtonText}>
                    {cameraLoading ? 'Processing...' : 'Take Photo'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.galleryButton}
                  onPress={handlePickImage}
                  disabled={cameraLoading}
                >
                  <Ionicons name="images" size={32} color="white" />
                  <Text style={styles.galleryButtonText}>
                    {cameraLoading ? 'Processing...' : 'Select Image'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cameraInfo}>
                <Ionicons name="information-circle" size={16} color="#6b7280" />
                <Text style={styles.cameraInfoText}>
                  The app will analyze your bill and automatically extract the amount, category, and items.
                </Text>
              </View>
            </Card.Content>
          </Card>
        ) : (
          /* Manual Entry Mode */
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>
                <Ionicons name="create" size={24} color="#3b82f6" /> Manual Entry
              </Title>

              {/* Amount Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Amount *</Text>
                <TextInput
                  mode="outlined"
                  value={formData.amount}
                  onChangeText={(value) => handleInputChange('amount', value)}
                  placeholder="0.00"
                  keyboardType="numeric"
                  style={[styles.input, errors.amount && styles.inputError]}
                  error={!!errors.amount}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#3b82f6"
                />
                {errors.amount && <Text style={styles.errorText}>{errors.amount}</Text>}
              </View>

              {/* Quick Amount Buttons */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Quick Amount</Text>
                <View style={styles.quickAmountContainer}>
                  {[5, 10, 20, 50, 100, 200].map(amount => (
                    <TouchableOpacity
                      key={amount}
                      style={styles.quickAmountButton}
                      onPress={() => handleQuickAdd(amount)}
                    >
                      <Text style={styles.quickAmountText}>
                        {getCurrencySymbol()}{amount}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Category Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Category *</Text>
                <TouchableOpacity
                  style={[styles.pickerContainer, errors.category && styles.inputError]}
                  onPress={() => setShowCategoryPicker(!showCategoryPicker)}
                >
                  <Text style={styles.pickerText}>
                    {formData.category ? `${getCategoryIcon(formData.category)} ${formData.category}` : 'Select a category'}
                  </Text>
                  <Text style={styles.pickerArrow}>▼</Text>
                </TouchableOpacity>
                
                {showCategoryPicker && (
                  <View style={styles.pickerDropdown}>
                    <Picker
                      selectedValue={formData.category}
                      onValueChange={(value) => {
                        handleInputChange('category', value);
                        setShowCategoryPicker(false);
                      }}
                      style={styles.picker}
                    >
                      <Picker.Item label="Select a category" value="" />
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
                {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
              </View>

              {/* Description Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  mode="outlined"
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholder="What was this expense for?"
                  multiline
                  numberOfLines={3}
                  style={styles.input}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#3b82f6"
                />
              </View>

              {/* Date Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date *</Text>
                <TextInput
                  mode="outlined"
                  value={formData.date}
                  onChangeText={(value) => handleInputChange('date', value)}
                  placeholder="YYYY-MM-DD"
                  style={[styles.input, errors.date && styles.inputError]}
                  error={!!errors.date}
                  outlineColor="#e5e7eb"
                  activeOutlineColor="#3b82f6"
                />
                {errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                buttonColor="#3b82f6"
                textColor="white"
              >
                {loading ? 'Saving...' : 'Save Expense'}
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Bill Analysis Modal */}
      <BillAnalysisModal
        visible={showBillModal}
        onClose={() => setShowBillModal(false)}
        billData={billAnalysisData}
        onConfirm={handleBillConfirm}
        onEdit={handleBillEdit}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  modeCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
    textAlign: 'center',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  modeButtonTextActive: {
    color: 'white',
  },
  card: {
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  cameraButtons: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  cameraButton: {
    flex: 1,
    backgroundColor: '#3b82f6',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  galleryButton: {
    flex: 1,
    backgroundColor: '#8b5cf6',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  galleryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  cameraInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  cameraInfoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
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
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  quickAmountContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountButton: {
    backgroundColor: '#e0e7ff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3730a3',
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
  submitButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
});

export default AddExpenseScreen;
