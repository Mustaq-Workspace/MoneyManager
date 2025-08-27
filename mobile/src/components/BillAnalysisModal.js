import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Card, Title, Button, Chip, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const BillAnalysisModal = ({ visible, onClose, billData, onConfirm, onEdit }) => {
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  if (!billData) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm(billData);
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    onEdit(billData);
    onClose();
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return '#10b981';
    if (confidence >= 0.8) return '#f59e0b';
    return '#ef4444';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.8) return 'Medium';
    return 'Low';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bill Analysis Result</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Bill Image */}
          <Card style={styles.imageCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>
                <Ionicons name="receipt" size={20} color="#3b82f6" /> Captured Bill
              </Title>
              <Image source={{ uri: billData.imageUri }} style={styles.billImage} />
            </Card.Content>
          </Card>

          {/* Analysis Results */}
          <Card style={styles.analysisCard}>
            <Card.Content>
              <Title style={styles.sectionTitle}>
                <Ionicons name="analytics" size={20} color="#8b5cf6" /> Analysis Results
              </Title>
              
              {/* Confidence Score */}
              <View style={styles.confidenceContainer}>
                <Text style={styles.confidenceLabel}>Confidence Score:</Text>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getConfidenceColor(billData.confidence) }}
                  style={[styles.confidenceChip, { borderColor: getConfidenceColor(billData.confidence) }]}
                >
                  {getConfidenceText(billData.confidence)} ({(billData.confidence * 100).toFixed(0)}%)
                </Chip>
              </View>

              {/* Extracted Amount */}
              <View style={styles.amountContainer}>
                <Text style={styles.amountLabel}>Extracted Amount:</Text>
                <Text style={styles.amountValue}>${billData.amount.toFixed(2)}</Text>
              </View>

              {/* Detected Category */}
              <View style={styles.categoryContainer}>
                <Text style={styles.categoryLabel}>Detected Category:</Text>
                <Chip mode="outlined" style={styles.categoryChip}>
                  {billData.category}
                </Chip>
              </View>

              {/* Bill Items */}
              <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Detected Items:</Text>
                <View style={styles.itemsList}>
                  {billData.items.map((item, index) => (
                    <Chip key={index} mode="outlined" style={styles.itemChip}>
                      {item}
                    </Chip>
                  ))}
                </View>
              </View>

              {/* Extracted Text */}
              <View style={styles.textContainer}>
                <Text style={styles.textLabel}>Extracted Text:</Text>
                <Text style={styles.extractedText}>{billData.extractedText}</Text>
              </View>
            </Card.Content>
          </Card>

          {/* Action Buttons */}
          <View style={styles.actionContainer}>
            <Button
              mode="outlined"
              onPress={handleEdit}
              style={[styles.actionButton, styles.editButton]}
              textColor="#6b7280"
            >
              <Ionicons name="create" size={16} color="#6b7280" style={{ marginRight: 8 }} />
              Edit Details
            </Button>
            
            <Button
              mode="contained"
              onPress={handleConfirm}
              loading={loading}
              disabled={loading}
              style={[styles.actionButton, styles.confirmButton]}
              buttonColor="#3b82f6"
              textColor="white"
            >
              <Ionicons name="checkmark" size={16} color="white" style={{ marginRight: 8 }} />
              {loading ? 'Adding...' : 'Add Expense'}
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  imageCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  analysisCard: {
    marginBottom: 16,
    elevation: 4,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
    flexDirection: 'row',
    alignItems: 'center',
  },
  billImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  confidenceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  confidenceChip: {
    borderWidth: 2,
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  amountValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  categoryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  categoryChip: {
    borderColor: '#8b5cf6',
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  itemChip: {
    borderColor: '#e5e7eb',
  },
  textContainer: {
    marginBottom: 16,
  },
  textLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  extractedText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButton: {
    borderColor: '#6b7280',
  },
  confirmButton: {
    elevation: 2,
  },
});

export default BillAnalysisModal;

