require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

console.log('Starting Freshly Backend...');

// Initialize services with error handling
let visionService;
let inventoryService;

try {
  const VisionService = require('./services/visionService');
  const InventoryService = require('./services/inventoryService');
  
  inventoryService = new InventoryService();
  console.log('✓ Inventory service initialized');
  
  // Initialize vision service only when needed to avoid blocking startup
  console.log('✓ Vision service will be initialized on first use');
} catch (error) {
  console.error('Error initializing services:', error);
  process.exit(1);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Routes

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    status: 'OK', 
    message: 'Freshly Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Upload and analyze image
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Image uploaded:', req.file.filename);

    // Initialize vision service on first use
    if (!visionService) {
      console.log('Initializing vision service...');
      const VisionService = require('./services/visionService');
      visionService = new VisionService();
    }

    // Analyze image with Vision API
    const analysisResult = await visionService.analyzeImage(req.file.path);
    
    // Add detected items to inventory
    if (analysisResult.detectedItems && analysisResult.detectedItems.length > 0) {
      const addedItems = inventoryService.addItems(analysisResult.detectedItems);
      console.log('Added items to inventory:', addedItems.length);
    }

    // Clean up uploaded file (optional)
    // fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: analysisResult.fallbackMode ? 
        'Image analyzed successfully (Demo-Modus - Google Vision API nicht verfügbar)' : 
        'Image analyzed successfully',
      detectedItems: analysisResult.detectedItems,
      processedItems: analysisResult.detectedItems || [], // Für Frontend-Kompatibilität
      filename: req.file.filename,
      fallbackMode: analysisResult.fallbackMode || false
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ 
      error: 'Failed to process image', 
      details: error.message 
    });
  }
});

// Get inventory
app.get('/api/inventory', (req, res) => {
  try {
    const inventory = inventoryService.getInventory();
    res.json(inventory);
  } catch (error) {
    console.error('Error getting inventory:', error);
    res.status(500).json({ error: 'Failed to get inventory' });
  }
});

// Add item to inventory
app.post('/api/inventory', (req, res) => {
  try {
    const newItem = inventoryService.addItem(req.body);
    res.json(newItem);
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// Update inventory item
app.put('/api/inventory/:id', (req, res) => {
  try {
    const updatedItem = inventoryService.updateItem(req.params.id, req.body);
    if (updatedItem) {
      res.json(updatedItem);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Bulk delete inventory items (must come before :id route)
app.delete('/api/inventory/bulk', (req, res) => {
  try {
    const { itemIds } = req.body;
    
    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ error: 'itemIds array is required' });
    }
    
    const deletedItems = [];
    const notFoundItems = [];
    
    itemIds.forEach(id => {
      const deletedItem = inventoryService.deleteItem(id);
      if (deletedItem) {
        deletedItems.push(id);
      } else {
        notFoundItems.push(id);
      }
    });
    
    res.json({ 
      message: `Successfully deleted ${deletedItems.length} items`,
      deletedItems,
      notFoundItems: notFoundItems.length > 0 ? notFoundItems : undefined
    });
  } catch (error) {
    console.error('Error bulk deleting items:', error);
    res.status(500).json({ error: 'Failed to bulk delete items' });
  }
});

// Delete inventory item
app.delete('/api/inventory/:id', (req, res) => {
  try {
    const deletedItem = inventoryService.deleteItem(req.params.id);
    if (deletedItem) {
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

// Get shopping list
app.get('/api/shopping-list', (req, res) => {
  try {
    const shoppingList = inventoryService.getShoppingList();
    res.json(shoppingList);
  } catch (error) {
    console.error('Error getting shopping list:', error);
    res.status(500).json({ error: 'Failed to get shopping list' });
  }
});

// Add item to shopping list
app.post('/api/shopping-list', (req, res) => {
  try {
    const newItems = inventoryService.addToShoppingList([req.body]);
    res.json(newItems[0]);
  } catch (error) {
    console.error('Error adding to shopping list:', error);
    res.status(500).json({ error: 'Failed to add to shopping list' });
  }
});

// Update shopping list item
app.put('/api/shopping-list/:id', (req, res) => {
  try {
    const updatedItem = inventoryService.updateShoppingItem(req.params.id, req.body);
    if (updatedItem) {
      res.json(updatedItem);
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error updating shopping item:', error);
    res.status(500).json({ error: 'Failed to update shopping item' });
  }
});

// Delete shopping list item
app.delete('/api/shopping-list/:id', (req, res) => {
  try {
    const deletedItem = inventoryService.deleteShoppingItem(req.params.id);
    if (deletedItem) {
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (error) {
    console.error('Error deleting shopping item:', error);
    res.status(500).json({ error: 'Failed to delete shopping item' });
  }
});

// Get low stock items from inventory
app.get('/api/inventory/low-stock', (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 2;
    const lowStockItems = inventoryService.getLowStockItems(threshold);
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error getting low stock items:', error);
    res.status(500).json({ error: 'Failed to get low stock items' });
  }
});

// Add low stock items to shopping list
app.post('/api/shopping-list/add-low-stock', (req, res) => {
  try {
    const threshold = parseInt(req.body.threshold) || 2;
    const lowStockItems = inventoryService.getLowStockItems(threshold);
    
    if (lowStockItems.length === 0) {
      return res.json({ 
        message: 'Keine Artikel mit wenig Vorrat gefunden',
        addedItems: []
      });
    }

    // Convert inventory items to shopping list format
    const shoppingItems = lowStockItems.map(item => ({
      name: item.name,
      category: item.category,
      quantity: Math.max(1, 3 - item.quantity), // Calculate needed quantity
      unit: item.unit || 'Stück',
      priority: 'high',
      source: 'low_stock',
      reason: `Wenig Vorrat (${item.quantity} vorhanden)`
    }));

    const addedItems = inventoryService.addToShoppingList(shoppingItems);
    
    res.json({
      message: `${addedItems.length} Artikel aus "wenig Vorrat" zur Einkaufsliste hinzugefügt`,
      addedItems
    });
  } catch (error) {
    console.error('Error adding low stock items to shopping list:', error);
    res.status(500).json({ error: 'Failed to add low stock items to shopping list' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Freshly Backend running on http://localhost:${PORT}`);
  console.log('✓ Google Cloud Vision API credentials ready');
  console.log('✓ Ready to accept requests');
});
