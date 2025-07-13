const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class InventoryService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
    this.inventoryFile = path.join(this.dataDir, 'inventory.json');
    this.shoppingListFile = path.join(this.dataDir, 'shoppingList.json');
    this.init();
  }

  init() {
    // Erstelle data Ordner falls nicht existiert
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    
    // Erstelle inventory.json falls nicht existiert
    if (!fs.existsSync(this.inventoryFile)) {
      fs.writeFileSync(this.inventoryFile, JSON.stringify([], null, 2));
    }
    
    // Erstelle shoppingList.json falls nicht existiert
    if (!fs.existsSync(this.shoppingListFile)) {
      fs.writeFileSync(this.shoppingListFile, JSON.stringify([], null, 2));
    }
  }

  getInventory() {
    try {
      const data = fs.readFileSync(this.inventoryFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading inventory:', error);
      return [];
    }
  }

  addItem(itemData) {
    try {
      const inventory = this.getInventory();
      const newItem = {
        id: uuidv4(),
        name: itemData.name,
        quantity: itemData.quantity || 1,
        category: itemData.category || 'other',
        expiryDate: itemData.expiryDate || null,
        addedAt: new Date().toISOString()
      };
      inventory.push(newItem);
      fs.writeFileSync(this.inventoryFile, JSON.stringify(inventory, null, 2));
      return newItem;
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    }
  }

  addItems(items) {
    try {
      const inventory = this.getInventory();
      const newItems = items.map(item => ({
        id: uuidv4(),
        name: item.name,
        quantity: item.quantity || 1,
        category: item.category || 'other',
        expiryDate: item.expiryDate || null,
        addedAt: new Date().toISOString()
      }));
      inventory.push(...newItems);
      fs.writeFileSync(this.inventoryFile, JSON.stringify(inventory, null, 2));
      return newItems;
    } catch (error) {
      console.error('Error adding items:', error);
      throw error;
    }
  }

  updateItem(id, updates) {
    try {
      const inventory = this.getInventory();
      const itemIndex = inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        inventory[itemIndex] = { ...inventory[itemIndex], ...updates };
        fs.writeFileSync(this.inventoryFile, JSON.stringify(inventory, null, 2));
        return inventory[itemIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  }

  deleteItem(id) {
    try {
      const inventory = this.getInventory();
      const itemIndex = inventory.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const deletedItem = inventory.splice(itemIndex, 1)[0];
        fs.writeFileSync(this.inventoryFile, JSON.stringify(inventory, null, 2));
        return deletedItem;
      }
      return null;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  // Get low stock items (quantity <= threshold)
  getLowStockItems(threshold = 2) {
    try {
      const inventory = this.getInventory();
      return inventory.filter(item => item.quantity <= threshold);
    } catch (error) {
      console.error('Error getting low stock items:', error);
      return [];
    }
  }

  // Get items expiring within specified days
  getExpiringItems(days = 3) {
    try {
      const inventory = this.getInventory();
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      
      return inventory.filter(item => {
        if (!item.expiryDate) return false;
        const expiryDate = new Date(item.expiryDate);
        return expiryDate <= futureDate;
      });
    } catch (error) {
      console.error('Error getting expiring items:', error);
      return [];
    }
  }

  getShoppingList() {
    try {
      const data = fs.readFileSync(this.shoppingListFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading shopping list:', error);
      return [];
    }
  }

  addToShoppingList(items) {
    try {
      const shoppingList = this.getShoppingList();
      const newItems = items.map(item => ({
        id: uuidv4(),
        name: item.name,
        quantity: item.quantity || 1,
        category: item.category || 'other',
        completed: false,
        addedAt: new Date().toISOString()
      }));
      shoppingList.push(...newItems);
      fs.writeFileSync(this.shoppingListFile, JSON.stringify(shoppingList, null, 2));
      return newItems;
    } catch (error) {
      console.error('Error adding to shopping list:', error);
      throw error;
    }
  }

  updateShoppingItem(id, updates) {
    try {
      const shoppingList = this.getShoppingList();
      const itemIndex = shoppingList.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        shoppingList[itemIndex] = { ...shoppingList[itemIndex], ...updates };
        fs.writeFileSync(this.shoppingListFile, JSON.stringify(shoppingList, null, 2));
        return shoppingList[itemIndex];
      }
      return null;
    } catch (error) {
      console.error('Error updating shopping item:', error);
      throw error;
    }
  }

  deleteShoppingItem(id) {
    try {
      const shoppingList = this.getShoppingList();
      const itemIndex = shoppingList.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        const deletedItem = shoppingList.splice(itemIndex, 1)[0];
        fs.writeFileSync(this.shoppingListFile, JSON.stringify(shoppingList, null, 2));
        return deletedItem;
      }
      return null;
    } catch (error) {
      console.error('Error deleting shopping item:', error);
      throw error;
    }
  }
}

module.exports = InventoryService;
