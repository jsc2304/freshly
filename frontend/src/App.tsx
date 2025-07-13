import { useState, useCallback } from 'react'
import './App.css'
import { Header } from './components/Header.tsx'
import { ImageUpload } from './components/ImageUpload.tsx'
import { InventoryView } from './components/InventoryView.tsx'
import { ShoppingListView } from './components/ShoppingListView.tsx'
import type { InventoryItem, ShoppingListItem } from './types.ts'

type ActiveView = 'inventory' | 'shopping' | 'upload'

function App() {
  const [activeView, setActiveView] = useState<ActiveView>('inventory')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([])

  const handleImageAnalysis = useCallback((detectedItems: InventoryItem[]) => {
    setInventory(prev => [...prev, ...detectedItems])
  }, [])

  const handleInventoryUpdate = useCallback((updatedInventory: InventoryItem[]) => {
    setInventory(updatedInventory)
  }, [])

  const handleShoppingListUpdate = useCallback((updatedList: ShoppingListItem[]) => {
    setShoppingList(updatedList)
  }, [])

  return (
    <div className="app">
      <Header 
        activeView={activeView} 
        onViewChange={setActiveView}
        inventoryCount={inventory.length}
        shoppingListCount={shoppingList.filter(item => !item.completed).length}
      />
      
      <main className="main-content">
        {activeView === 'inventory' && (
          <InventoryView 
            inventory={inventory}
            onInventoryUpdate={handleInventoryUpdate}
          />
        )}
        
        {activeView === 'shopping' && (
          <ShoppingListView 
            shoppingList={shoppingList}
            onShoppingListUpdate={handleShoppingListUpdate}
          />
        )}
        
        {activeView === 'upload' && (
          <ImageUpload 
            onImageAnalysis={handleImageAnalysis}
          />
        )}
      </main>
    </div>
  )
}

export default App
