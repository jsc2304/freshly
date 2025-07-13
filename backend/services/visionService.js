const vision = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const EncryptionManager = require('../utils/encryption');

class VisionService {
  constructor() {
    try {
      // Initialize encryption manager for secure API key handling
      this.encryption = new EncryptionManager();
      
      // Initialize the Vision API client (fallback)
      this.client = new vision.ImageAnnotatorClient({
        keyFilename: path.join(__dirname, '..', 'google-credentials.json')
      });
      
      // Initialize Gemini AI client (primary) - with encryption support
      const apiKey = this.getSecureApiKey();
      if (apiKey) {
        this.gemini = new GoogleGenerativeAI(apiKey);
        this.geminiModel = this.gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('✓ Gemini Vision API client initialized (secure)');
      } else {
        console.log('⚠️  No valid API key found, using fallback Vision API');
        this.gemini = null;
      }
      
      console.log('✓ Google Cloud Vision API client initialized (fallback)');
    } catch (error) {
      console.error('Error initializing APIs:', error);
      this.client = null;
      this.gemini = null;
    }
  }

  async analyzeImage(imagePath) {
    // Try Gemini Vision first (with custom prompts)
    if (this.gemini) {
      try {
        return await this.analyzeImageWithGemini(imagePath);
      } catch (error) {
        console.error('Gemini analysis failed, falling back to Vision API:', error.message);
      }
    }
    
    // Fallback to traditional Vision API
    if (!this.client) {
      console.log('No API clients available, using fallback mode');
      return this.getFallbackAnalysis();
    }

    try {
      console.log('Analyzing image with Vision API:', imagePath);
      // ...existing Vision API code...
      return await this.analyzeImageWithVisionAPI(imagePath);
      
    } catch (error) {
      console.error('Error analyzing image:', error);
      if (error.message.includes('PERMISSION_DENIED') || error.message.includes('billing')) {
        console.log('Billing issue detected, falling back to demo mode');
        return this.getFallbackAnalysis();
      }
      throw new Error(`Vision API error: ${error.message}`);
    }
  }

  // Gemini Vision API with custom prompts
  async analyzeImageWithGemini(imagePath) {
    console.log('🔮 Analyzing image with Gemini Vision:', imagePath);
    
    const customPrompt = `
Analysiere dieses Bild eines Einkaufswagens, Kühlschranks oder einer Speisekammer.

AUFGABE: Erkenne alle sichtbaren Lebensmittel und Getränke mit höchster Genauigkeit.

FÜR JEDES ERKANNTE PRODUKT:
- Produktname (auf Deutsch, spezifisch wie möglich)
- Kategorie (Obst, Gemüse, Fleisch, Milchprodukte, Getreideprodukte, Getränke, Sonstiges)
- Geschätzte Menge/Anzahl (wenn erkennbar)
  - Für Produkte, die typischerweise in Bündeln verkauft werden (z. B. Champignons, Radieschen, Karotten): Gib die Anzahl der Bündel an (z. B. "1x" für ein Bündel).
  - Für Produkte, die einfach einzeln gezählt werden können (z. B. Milchtüten, Bananen, Äpfel, Packungen von Nüssen): Gib die genaue Anzahl an.
- Einheit (Stück, kg, Liter, Packung, Becher, etc.)
- Vertrauenswert (1-100)

IGNORIERE:
- Verpackungen ohne erkennbaren Inhalt
- Nicht-Lebensmittel (Reinigungsmittel, Kosmetik, etc.)
- Unklare oder unsichere Objekte (unter 60% Sicherheit)
- Duplikate

ANTWORT NUR ALS GÜLTIGES JSON:
{
  "detectedItems": [
    {
      "name": "Produktname auf Deutsch",
      "category": "Kategorie",
      "quantity": Anzahl,
      "unit": "Einheit",
      "confidence": Vertrauenswert_1_bis_100
    }
  ]
}

Falls keine Lebensmittel erkennbar sind, gib eine leere Liste zurück.
    `;

    try {
      // Read and prepare image
      const imageData = fs.readFileSync(imagePath);
      const base64Image = imageData.toString('base64');
      
      // Create image part for Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: this.getMimeType(imagePath)
        }
      };

      // Send to Gemini
      const result = await this.geminiModel.generateContent([customPrompt, imagePart]);
      const response = await result.response;
      const text = response.text();
      
      console.log('🔮 Gemini raw response:', text);
      
      // Parse JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Gemini response');
      }
      
      const parsedResponse = JSON.parse(jsonMatch[0]);
      const detectedItems = parsedResponse.detectedItems || [];
      
      // Convert to our format
      const currentDate = new Date().toISOString();
      const formattedItems = detectedItems.map(item => ({
        id: uuidv4(),
        name: item.name,
        category: item.category,
        quantity: item.quantity || 1,
        unit: item.unit || 'Stück',
        addedDate: currentDate,
        confidence: Math.min(100, Math.max(0, item.confidence || 75)),
        source: 'gemini_vision',
        detectionMethod: 'gemini_prompt'
      }));
      
      console.log(`🔮 Gemini detected ${formattedItems.length} items:`);
      formattedItems.forEach(item => {
        console.log(`  - ${item.name} (${item.confidence}% confidence)`);
      });
      
      return {
        success: true,
        detectedItems: formattedItems,
        rawGeminiResponse: text,
        method: 'gemini_vision'
      };
      
    } catch (error) {
      console.error('Gemini Vision error:', error);
      throw error;
    }
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp'
    };
    return mimeTypes[ext] || 'image/jpeg';
  }

  // Fallback: Traditional Vision API
  async analyzeImageWithVisionAPI(imagePath) {
    console.log('👁️  Analyzing image with Vision API:', imagePath);
    
    // Multiple detection methods for better accuracy
    const [textResult] = await this.client.textDetection(imagePath);
    const [objectResult] = await this.client.objectLocalization(imagePath);
    const [labelResult] = await this.client.labelDetection({
      image: { source: { filename: imagePath } },
      maxResults: 50,      // Mehr Ergebnisse für Details
      minScore: 0.3        // Niedrigere Schwelle für mehr Treffer
    });
    
    // Process detected text
    const detectedText = textResult.textAnnotations || [];
    const fullText = detectedText.length > 0 ? detectedText[0].description : '';
    
    // Process detected objects
    const detectedObjects = objectResult.localizedObjectAnnotations || [];
    
    // Process detected labels (this gives more specific food items)
    const detectedLabels = labelResult.labelAnnotations || [];
    
    console.log('Detected objects:', detectedObjects.length);
    console.log('Detected labels:', detectedLabels.length);
    console.log('Detected text length:', fullText.length);
    
    // Log detailed information for debugging
    console.log('Labels found:', detectedLabels.map(l => `${l.description} (${Math.round(l.score * 100)}%)`));
    console.log('Objects found:', detectedObjects.map(o => `${o.name} (${Math.round(o.score * 100)}%)`));
    
    // Convert detected items to inventory format
    const detectedItems = this.processDetectedItems(detectedObjects, fullText, detectedLabels);
    
    return {
      success: true,
      detectedItems,
      rawTextAnnotations: detectedText,
      rawObjectAnnotations: detectedObjects,
      rawLabelAnnotations: detectedLabels,
      method: 'vision_api'
    };
  }

  processDetectedItems(objects, text, labels = []) {
    const items = [];
    const currentDate = new Date().toISOString();
    const usedItems = new Set(); // Avoid duplicates
    
    // 1. Process detected labels first (most specific) - mit niedrigerer Schwelle für mehr Details
    labels.forEach(label => {
      if (this.isFoodItem(label.description) && label.score > 0.4) {
        const itemName = this.translateToGerman(label.description);
        if (!usedItems.has(itemName.toLowerCase())) {
          const item = {
            id: uuidv4(),
            name: itemName,
            category: this.getCategoryForItem(label.description),
            quantity: 1,
            unit: this.getUnitForItem(label.description),
            addedDate: currentDate,
            confidence: Math.round(label.score * 100),
            source: 'vision_api',
            detectionMethod: 'label'
          };
          items.push(item);
          usedItems.add(itemName.toLowerCase());
        }
      }
    });
    
    // 2. Process detected objects
    objects.forEach(object => {
      if (this.isFoodItem(object.name) && object.score > 0.5) {
        const itemName = this.translateToGerman(object.name);
        if (!usedItems.has(itemName.toLowerCase())) {
          const item = {
            id: uuidv4(),
            name: itemName,
            category: this.getCategoryForItem(object.name),
            quantity: 1,
            unit: this.getUnitForItem(object.name),
            addedDate: currentDate,
            confidence: Math.round(object.score * 100),
            source: 'vision_api',
            detectionMethod: 'object'
          };
          items.push(item);
          usedItems.add(itemName.toLowerCase());
        }
      }
    });

    // 3. Optional: Extract from text only if no visual items found
    if (items.length === 0 && text) {
      console.log('No visual items found, trying text extraction as fallback');
      const textItems = this.extractFoodFromText(text);
      textItems.forEach(textItem => {
        if (!usedItems.has(textItem.name.toLowerCase())) {
          items.push(textItem);
          usedItems.add(textItem.name.toLowerCase());
        }
      });
    }

    // 4. If still no items detected, return empty array (no more fallback items)
    console.log(`Final detected items: ${items.length}`);
    items.forEach(item => {
      console.log(`- ${item.name} (${item.confidence}% via ${item.detectionMethod || 'text'})`);
    });

    return items;
  }

  isFoodItem(itemName) {
    const foodKeywords = [
      // General categories
      'food', 'fruit', 'vegetable', 'meat', 'dairy', 'bread', 'cheese', 'beverage',
      'grocery', 'produce', 'snack', 'meal', 'ingredient', 'cuisine',
      
      // Fruits
      'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry',
      'raspberry', 'peach', 'pear', 'cherry', 'plum', 'pineapple', 'mango', 'kiwi',
      'watermelon', 'melon', 'avocado', 'coconut',
      
      // Vegetables
      'tomato', 'lettuce', 'carrot', 'broccoli', 'cauliflower', 'spinach', 'cabbage',
      'potato', 'onion', 'garlic', 'pepper', 'cucumber', 'zucchini', 'eggplant',
      'corn', 'peas', 'beans', 'mushroom', 'celery', 'radish',
      
      // Meat & Fish
      'chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp',
      'turkey', 'duck', 'sausage', 'ham', 'bacon',
      
      // Dairy
      'milk', 'yogurt', 'cheese', 'butter', 'cream', 'ice cream',
      
      // Grains & Bread
      'bread', 'rice', 'pasta', 'cereal', 'oats', 'flour', 'crackers',
      
      // Pantry items
      'oil', 'vinegar', 'salt', 'sugar', 'honey', 'jam', 'sauce', 'spice',
      
      // Beverages
      'juice', 'soda', 'water', 'coffee', 'tea', 'wine', 'beer',
      
      // German terms
      'lebensmittel', 'obst', 'gemüse', 'fleisch', 'milchprodukt', 'getränk',
      'apfel', 'banane', 'tomate', 'karotte', 'milch', 'käse', 'brot'
    ];
    
    const itemLower = itemName.toLowerCase();
    return foodKeywords.some(keyword => 
      itemLower.includes(keyword.toLowerCase()) || 
      keyword.toLowerCase().includes(itemLower)
    );
  }

  translateToGerman(englishName) {
    const translations = {
      // Fruits
      'apple': 'Apfel', 'banana': 'Banane', 'orange': 'Orange', 'lemon': 'Zitrone',
      'lime': 'Limette', 'grape': 'Weintraube', 'strawberry': 'Erdbeere',
      'blueberry': 'Blaubeere', 'raspberry': 'Himbeere', 'peach': 'Pfirsich',
      'pear': 'Birne', 'cherry': 'Kirsche', 'plum': 'Pflaume',
      'pineapple': 'Ananas', 'mango': 'Mango', 'kiwi': 'Kiwi',
      'watermelon': 'Wassermelone', 'melon': 'Melone', 'avocado': 'Avocado',
      
      // Vegetables
      'tomato': 'Tomate', 'lettuce': 'Salat', 'carrot': 'Karotte',
      'broccoli': 'Brokkoli', 'cauliflower': 'Blumenkohl', 'spinach': 'Spinat',
      'cabbage': 'Kohl', 'potato': 'Kartoffel', 'onion': 'Zwiebel',
      'garlic': 'Knoblauch', 'pepper': 'Paprika', 'cucumber': 'Gurke',
      'zucchini': 'Zucchini', 'eggplant': 'Aubergine', 'corn': 'Mais',
      'peas': 'Erbsen', 'beans': 'Bohnen', 'mushroom': 'Pilz',
      
      // Meat & Fish
      'chicken': 'Hähnchen', 'beef': 'Rindfleisch', 'pork': 'Schweinefleisch',
      'lamb': 'Lammfleisch', 'fish': 'Fisch', 'salmon': 'Lachs',
      'tuna': 'Thunfisch', 'shrimp': 'Garnele', 'turkey': 'Pute',
      'sausage': 'Wurst', 'ham': 'Schinken', 'bacon': 'Speck',
      
      // Dairy
      'milk': 'Milch', 'yogurt': 'Joghurt', 'cheese': 'Käse',
      'butter': 'Butter', 'cream': 'Sahne', 'ice cream': 'Eis',
      
      // Bread & Grains
      'bread': 'Brot', 'rice': 'Reis', 'pasta': 'Nudeln',
      'cereal': 'Müsli', 'oats': 'Haferflocken', 'flour': 'Mehl',
      
      // Beverages
      'juice': 'Saft', 'water': 'Wasser', 'coffee': 'Kaffee',
      'tea': 'Tee', 'wine': 'Wein', 'beer': 'Bier',
      
      // General categories
      'food': 'Lebensmittel', 'fruit': 'Obst', 'vegetable': 'Gemüse',
      'meat': 'Fleisch', 'dairy': 'Milchprodukt', 'beverage': 'Getränk',
      'egg': 'Ei', 'eggs': 'Eier'
    };
    
    const lowerName = englishName.toLowerCase();
    
    // Try exact match first
    if (translations[lowerName]) {
      return translations[lowerName];
    }
    
    // Try partial matches for compound words
    for (const [english, german] of Object.entries(translations)) {
      if (lowerName.includes(english) || english.includes(lowerName)) {
        return german;
      }
    }
    
    // If no translation found, capitalize the original
    return englishName.charAt(0).toUpperCase() + englishName.slice(1).toLowerCase();
  }

  getUnitForItem(itemName) {
    const units = {
      // Liquids
      'milk': 'Liter', 'juice': 'Liter', 'water': 'Liter', 'wine': 'Flasche',
      'beer': 'Flasche', 'soda': 'Flasche', 'oil': 'Liter',
      
      // Weight-based items
      'meat': 'kg', 'fish': 'kg', 'chicken': 'kg', 'beef': 'kg', 'pork': 'kg',
      'cheese': 'g', 'butter': 'g', 'flour': 'kg', 'sugar': 'kg', 'rice': 'kg',
      
      // Count-based items
      'apple': 'Stück', 'banana': 'Stück', 'orange': 'Stück', 'egg': 'Stück',
      'bread': 'Stück', 'yogurt': 'Becher', 'tomato': 'Stück',
      
      // Packages
      'pasta': 'Packung', 'cereal': 'Packung', 'crackers': 'Packung'
    };
    
    const lowerName = itemName.toLowerCase();
    
    // Check for exact matches
    if (units[lowerName]) {
      return units[lowerName];
    }
    
    // Check for partial matches
    for (const [item, unit] of Object.entries(units)) {
      if (lowerName.includes(item) || item.includes(lowerName)) {
        return unit;
      }
    }
    
    return 'Stück'; // Default unit
  }

  getCategoryForItem(itemName) {
    const lowerName = itemName.toLowerCase();
    
    // Fruits
    if (lowerName.includes('apple') || lowerName.includes('fruit') || 
        lowerName.includes('banana') || lowerName.includes('orange') ||
        lowerName.includes('berry') || lowerName.includes('grape')) {
      return 'Obst';
    }
    
    // Vegetables
    if (lowerName.includes('vegetable') || lowerName.includes('tomato') ||
        lowerName.includes('lettuce') || lowerName.includes('carrot') ||
        lowerName.includes('pepper') || lowerName.includes('onion')) {
      return 'Gemüse';
    }
    
    // Meat & Fish
    if (lowerName.includes('meat') || lowerName.includes('chicken') ||
        lowerName.includes('beef') || lowerName.includes('fish') ||
        lowerName.includes('sausage') || lowerName.includes('pork')) {
      return 'Fleisch';
    }
    
    // Dairy
    if (lowerName.includes('dairy') || lowerName.includes('milk') ||
        lowerName.includes('cheese') || lowerName.includes('yogurt') ||
        lowerName.includes('butter') || lowerName.includes('cream')) {
      return 'Milchprodukte';
    }
    
    // Bread & Grains
    if (lowerName.includes('bread') || lowerName.includes('grain') ||
        lowerName.includes('cereal') || lowerName.includes('pasta') ||
        lowerName.includes('rice') || lowerName.includes('flour')) {
      return 'Getreideprodukte';
    }
    
    // Beverages
    if (lowerName.includes('drink') || lowerName.includes('beverage') ||
        lowerName.includes('juice') || lowerName.includes('water') ||
        lowerName.includes('soda') || lowerName.includes('coffee')) {
      return 'Getränke';
    }
    
    return 'Sonstiges';
  }

  extractFoodFromText(text) {
    const items = [];
    const currentDate = new Date().toISOString();
    
    // Simple food detection from text
    const germanFoodWords = [
      'apfel', 'banane', 'orange', 'tomate', 'salat', 'karotte', 'brokkoli',
      'hähnchen', 'rindfleisch', 'schweinefleisch', 'fisch', 'milch', 
      'joghurt', 'ei', 'butter', 'brot', 'käse'
    ];
    
    const textLower = text.toLowerCase();
    
    germanFoodWords.forEach(word => {
      if (textLower.includes(word)) {
        items.push({
          id: uuidv4(),
          name: word.charAt(0).toUpperCase() + word.slice(1),
          category: this.getCategoryForItem(word),
          quantity: 1,
          unit: 'Stück',
          addedDate: currentDate,
          confidence: 60,
          source: 'vision_api'
        });
      }
    });
    
    return items;
  }

  getFallbackAnalysis() {
    console.log('Using fallback analysis (demo mode)');
    const currentDate = new Date().toISOString();
    
    // Return some sample items for demonstration
    const fallbackItems = [
      {
        id: uuidv4(),
        name: 'Apfel',
        category: 'Obst',
        quantity: 3,
        unit: 'Stück',
        addedDate: currentDate,
        confidence: 85,
        source: 'vision_api',
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 7 days from now
      },
      {
        id: uuidv4(),
        name: 'Milch',
        category: 'Milchprodukte',
        quantity: 1,
        unit: 'Liter',
        addedDate: currentDate,
        confidence: 90,
        source: 'vision_api',
        expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
      },
      {
        id: uuidv4(),
        name: 'Brot',
        category: 'Getreideprodukte',
        quantity: 1,
        unit: 'Stück',
        addedDate: currentDate,
        confidence: 80,
        source: 'vision_api',
        expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 days from now
      }
    ];
    
    return {
      success: true,
      detectedItems: fallbackItems,
      rawTextAnnotations: [],
      rawObjectAnnotations: [],
      fallbackMode: true
    };
  }

  // Secure API Key retrieval - supports both plain and encrypted keys
  getSecureApiKey() {
    try {
      // First, try encrypted API key
      const encryptedKey = process.env.GEMINI_API_KEY_ENCRYPTED;
      if (encryptedKey) {
        console.log('🔐 Using encrypted API key');
        return this.encryption.decryptApiKey(encryptedKey);
      }

      // Fallback to plain API key (for backward compatibility)
      const plainKey = process.env.GEMINI_API_KEY;
      if (plainKey) {
        console.log('⚠️  Using plain text API key (consider encrypting)');
        return plainKey;
      }

      console.log('❌ No API key found (neither encrypted nor plain)');
      return null;

    } catch (error) {
      console.error('🔑 Failed to decrypt API key:', error.message);
      console.log('💡 Trying fallback to plain API key...');
      
      // Final fallback
      const plainKey = process.env.GEMINI_API_KEY;
      if (plainKey) {
        console.log('✓ Using plain API key as fallback');
        return plainKey;
      }
      
      return null;
    }
  }
}

module.exports = VisionService;
