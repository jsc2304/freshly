import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Check, RefreshCw, Trash2, Package } from 'lucide-react'
import type { ShoppingListViewProps, ShoppingListItem } from '../types.ts'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({
  shoppingList,
  onShoppingListUpdate
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  useEffect(() => {
    const loadShoppingList = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('http://localhost:3001/api/shopping-list')
        if (!response.ok) {
          throw new Error('Fehler beim Laden der Einkaufsliste')
        }
        
        const data = await response.json()
        onShoppingListUpdate(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadShoppingList()
  }, [onShoppingListUpdate])

  const handleToggleItem = async (item: ShoppingListItem) => {
    try {
      const response = await fetch(`http://localhost:3001/api/shopping-list/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          completed: !item.completed
        })
      })

      if (!response.ok) {
        throw new Error('Fehler beim Aktualisieren des Artikels')
      }

      const updatedItem = await response.json()
      onShoppingListUpdate(
        shoppingList.map(i => i.id === item.id ? updatedItem : i)
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Aktualisieren')
    }
  }

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/shopping-list/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Artikels')
      }

      onShoppingListUpdate(shoppingList.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  const handleGenerateList = async () => {
    setIsGenerating(true)
    setError(null)
    
    try {
      const response = await fetch('http://localhost:3001/api/shopping-list/generate', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Fehler beim Generieren der Einkaufsliste')
      }

      const result = await response.json()
      
      // Reload shopping list to show new items
      const listResponse = await fetch('http://localhost:3001/api/shopping-list')
      const updatedList = await listResponse.json()
      onShoppingListUpdate(updatedList)
      
      alert(`${result.summary.total} Artikel zur Einkaufsliste hinzugefügt`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Generieren')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddLowStockItems = async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('http://localhost:3001/api/shopping-list/add-low-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ threshold: 2 })
      })

      if (!response.ok) {
        throw new Error('Fehler beim Hinzufügen der Artikel mit wenig Vorrat')
      }

      const result = await response.json()
      
      // Reload shopping list to show new items
      const listResponse = await fetch('http://localhost:3001/api/shopping-list')
      const updatedList = await listResponse.json()
      onShoppingListUpdate(updatedList)
      
      if (result.addedItems.length > 0) {
        alert(`${result.addedItems.length} Artikel mit wenig Vorrat zur Einkaufsliste hinzugefügt`)
      } else {
        alert('Keine Artikel mit wenig Vorrat gefunden')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleAddItem = async (item: Partial<ShoppingListItem>) => {
    try {
      const response = await fetch('http://localhost:3001/api/shopping-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        throw new Error('Fehler beim Hinzufügen des Artikels')
      }

      const newItem = await response.json()
      onShoppingListUpdate([...shoppingList, newItem])
      setShowAddForm(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen')
    }
  }

  const getPendingItems = () => {
    return shoppingList.filter(item => !item.completed)
  }

  const getCompletedItems = () => {
    return shoppingList.filter(item => item.completed)
  }

  const getItemsByPriority = (items: ShoppingListItem[]) => {
    return items.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  const pendingItems = getPendingItems()
  const completedItems = getCompletedItems()

  if (isLoading) {
    return (
      <div className="shopping-list-view">
        <LoadingSpinner size="large" message="Einkaufsliste wird geladen..." />
      </div>
    )
  }

  return (
    <div className="shopping-list-view">
      <div className="shopping-list-header">
        <div className="header-content">
          <h2>Einkaufsliste</h2>
          <p>{pendingItems.length} Artikel zu kaufen</p>
        </div>
        <div className="header-actions">
          <button 
            onClick={handleAddLowStockItems}
            disabled={isGenerating}
            className="low-stock-button"
            title="Artikel mit wenig Vorrat zur Einkaufsliste hinzufügen"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="small" />
                Laden...
              </>
            ) : (
              <>
                <Package className="icon" />
                Wenig Vorrat
              </>
            )}
          </button>
          <button 
            onClick={handleGenerateList}
            disabled={isGenerating}
            className="generate-button"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="small" />
                Generiere...
              </>
            ) : (
              <>
                <RefreshCw className="icon" />
                Liste generieren
              </>
            )}
          </button>
          <button 
            onClick={() => setShowAddForm(true)}
            className="add-button"
          >
            <Plus className="icon" />
            Artikel hinzufügen
          </button>
        </div>
      </div>

      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={() => setError(null)}
        />
      )}

      {/* Pending Items */}
      {pendingItems.length > 0 && (
        <div className="shopping-section">
          <h3>Zu kaufen ({pendingItems.length})</h3>
          <div className="shopping-items">
            {getItemsByPriority(pendingItems).map(item => (
              <ShoppingListItemCard
                key={item.id}
                item={item}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div className="shopping-section">
          <h3>Erledigt ({completedItems.length})</h3>
          <div className="shopping-items">
            {completedItems.map(item => (
              <ShoppingListItemCard
                key={item.id}
                item={item}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </div>
        </div>
      )}

      {shoppingList.length === 0 && (
        <div className="empty-state">
          <ShoppingCart className="empty-icon" />
          <h3>Keine Artikel in der Einkaufsliste</h3>
          <p>Fügen Sie Artikel hinzu oder generieren Sie eine Liste basierend auf Ihrem Inventar.</p>
          <button 
            onClick={handleGenerateList}
            disabled={isGenerating}
            className="generate-button-primary"
          >
            <RefreshCw className="icon" />
            Einkaufsliste generieren
          </button>
        </div>
      )}

      {/* Add Item Form Modal */}
      {showAddForm && (
        <AddItemModal
          onSave={handleAddItem}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  )
}

// Shopping List Item Card Component
interface ShoppingListItemCardProps {
  item: ShoppingListItem
  onToggle: (item: ShoppingListItem) => void
  onDelete: (id: string) => void
}

const ShoppingListItemCard: React.FC<ShoppingListItemCardProps> = ({
  item,
  onToggle,
  onDelete
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high'
      case 'medium': return 'priority-medium'
      case 'low': return 'priority-low'
      default: return 'priority-medium'
    }
  }

  return (
    <div className={`shopping-item ${item.completed ? 'completed' : ''}`}>
      <div className="item-content">
        <button 
          onClick={() => onToggle(item)}
          className="toggle-button"
        >
          {item.completed ? (
            <Check className="icon checked" />
          ) : (
            <div className="checkbox" />
          )}
        </button>
        
        <div className="item-info">
          <h4>{item.name}</h4>
          <div className="item-meta">
            <span className="item-category">{item.category}</span>
            <span className="item-quantity">{item.quantity} {item.unit}</span>
            <span className={`item-priority ${getPriorityColor(item.priority)}`}>
              {item.priority}
            </span>
          </div>
          {item.reason && (
            <div className="item-reason">{item.reason}</div>
          )}
        </div>
      </div>
      
      <button 
        onClick={() => onDelete(item.id)}
        className="delete-button"
      >
        <Trash2 className="icon" />
      </button>
    </div>
  )
}

// Add Item Modal Component
interface AddItemModalProps {
  onSave: (item: Partial<ShoppingListItem>) => void
  onClose: () => void
}

const AddItemModal: React.FC<AddItemModalProps> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Other',
    quantity: 1,
    unit: 'piece',
    priority: 'medium' as 'high' | 'medium' | 'low'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const categories = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Beverages', 'Other']
  const units = ['piece', 'kg', 'g', 'l', 'ml']
  const priorities = ['high', 'medium', 'low']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Artikel zur Einkaufsliste hinzufügen</h3>
          <button onClick={onClose} className="close-button">×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="item-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Kategorie</label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Menge</label>
              <input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="unit">Einheit</label>
              <select
                id="unit"
                value={formData.unit}
                onChange={(e) => setFormData({...formData, unit: e.target.value})}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Priorität</label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value as 'high' | 'medium' | 'low'})}
            >
              {priorities.map(priority => (
                <option key={priority} value={priority}>
                  {priority === 'high' ? 'Hoch' : priority === 'medium' ? 'Mittel' : 'Niedrig'}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Abbrechen
            </button>
            <button type="submit" className="save-button">
              Hinzufügen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
