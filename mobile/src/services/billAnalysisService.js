import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';

// Mock OCR service - in production, you'd use a real OCR API like Google Vision, AWS Textract, etc.
class BillAnalysisService {
  // Request camera permissions
  async requestCameraPermissions() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  }

  // Request media library permissions
  async requestMediaLibraryPermissions() {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  }

  // Take photo with camera
  async takePhoto() {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
      }
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw new Error('Failed to take photo');
    }
  }

  // Pick image from gallery
  async pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return {
          uri: result.assets[0].uri,
          width: result.assets[0].width,
          height: result.assets[0].height,
        };
      }
      return null;
    } catch (error) {
      console.error('Error picking image:', error);
      throw new Error('Failed to pick image');
    }
  }

  // Analyze bill image and extract information
  async analyzeBill(imageUri) {
    try {
      // In a real app, you would send this image to an OCR service
      // For now, we'll simulate the analysis with mock data
      const mockAnalysis = await this.simulateBillAnalysis(imageUri);
      return mockAnalysis;
    } catch (error) {
      console.error('Error analyzing bill:', error);
      throw new Error('Failed to analyze bill');
    }
  }

  // Simulate bill analysis (replace with real OCR API)
  async simulateBillAnalysis(imageUri) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock bill analysis results
    const mockBills = [
      {
        amount: 45.67,
        items: ['Pizza Margherita', 'Coca Cola', 'Garlic Bread'],
        category: 'Food',
        confidence: 0.95,
        extractedText: 'Pizza Restaurant\nPizza Margherita: $25.99\nCoca Cola: $3.99\nGarlic Bread: $15.69\nTotal: $45.67',
      },
      {
        amount: 89.50,
        items: ['Fuel', 'Premium Gasoline'],
        category: 'Transport',
        confidence: 0.92,
        extractedText: 'Gas Station\nPremium Gasoline: 15.2L\nPrice per liter: $5.89\nTotal: $89.50',
      },
      {
        amount: 156.78,
        items: ['Groceries', 'Milk', 'Bread', 'Vegetables', 'Meat'],
        category: 'Shopping',
        confidence: 0.88,
        extractedText: 'Supermarket\nMilk: $4.99\nBread: $3.49\nVegetables: $12.99\nMeat: $135.31\nTotal: $156.78',
      },
      {
        amount: 299.99,
        items: ['Electricity Bill', 'Monthly Service'],
        category: 'Bills',
        confidence: 0.94,
        extractedText: 'Electric Company\nMonthly Electricity Bill\nUsage: 450 kWh\nRate: $0.67/kWh\nTotal: $299.99',
      },
      {
        amount: 67.50,
        items: ['Movie Tickets', 'Popcorn', 'Soda'],
        category: 'Entertainment',
        confidence: 0.91,
        extractedText: 'Cinema\nMovie Tickets: $45.00\nPopcorn: $12.50\nSoda: $10.00\nTotal: $67.50',
      },
    ];

    // Randomly select a mock bill for demonstration
    const randomBill = mockBills[Math.floor(Math.random() * mockBills.length)];
    
    return {
      ...randomBill,
      imageUri,
      timestamp: new Date().toISOString(),
    };
  }

  // Save image to device
  async saveImageToDevice(imageUri) {
    try {
      const asset = await MediaLibrary.createAssetAsync(imageUri);
      await MediaLibrary.createAlbumAsync('MoneyManager', asset, false);
      return asset;
    } catch (error) {
      console.error('Error saving image:', error);
      throw new Error('Failed to save image');
    }
  }

  // Get base64 from image URI
  async getBase64FromUri(uri) {
    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to convert image');
    }
  }

  // Categorize expense based on bill items
  categorizeExpense(items, amount) {
    const itemText = items.join(' ').toLowerCase();
    
    // Food-related keywords
    if (itemText.includes('pizza') || itemText.includes('burger') || itemText.includes('restaurant') || 
        itemText.includes('food') || itemText.includes('meal') || itemText.includes('coffee') ||
        itemText.includes('bread') || itemText.includes('milk') || itemText.includes('vegetables') ||
        itemText.includes('meat') || itemText.includes('groceries')) {
      return 'Food';
    }
    
    // Transport-related keywords
    if (itemText.includes('fuel') || itemText.includes('gas') || itemText.includes('gasoline') ||
        itemText.includes('uber') || itemText.includes('taxi') || itemText.includes('parking') ||
        itemText.includes('bus') || itemText.includes('train') || itemText.includes('metro')) {
      return 'Transport';
    }
    
    // Shopping-related keywords
    if (itemText.includes('clothes') || itemText.includes('shoes') || itemText.includes('electronics') ||
        itemText.includes('books') || itemText.includes('cosmetics') || itemText.includes('jewelry')) {
      return 'Shopping';
    }
    
    // Bills-related keywords
    if (itemText.includes('electricity') || itemText.includes('water') || itemText.includes('internet') ||
        itemText.includes('phone') || itemText.includes('rent') || itemText.includes('insurance')) {
      return 'Bills';
    }
    
    // Entertainment-related keywords
    if (itemText.includes('movie') || itemText.includes('cinema') || itemText.includes('theater') ||
        itemText.includes('concert') || itemText.includes('game') || itemText.includes('amusement')) {
      return 'Entertainment';
    }
    
    // Default category
    return 'Others';
  }
}

export default new BillAnalysisService();
