import { useState, useEffect } from 'react'
import { Plus, Package, Edit, Trash2, Calendar, AlertTriangle, CheckSquare, Square, X, Grid3X3, List } from 'lucide-react'
import type { InventoryViewProps, InventoryItem } from '../types.ts'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { getProductEmoji, getCategoryEmoji } from '../utils/emojiUtils'

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  inventory, 
  onInventoryUpdate 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list') // Default to list view

  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const response = await fetch('http://localhost:3001/api/inventory')
        if (!response.ok) {
          throw new Error('Fehler beim Laden des Inventars')
        }
        
        const data = await response.json()
        onInventoryUpdate(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadInventory()
  }, [onInventoryUpdate])

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Möchten Sie diesen Artikel wirklich löschen?')) return

    try {
      const response = await fetch(`http://localhost:3001/api/inventory/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen des Artikels')
      }

      onInventoryUpdate(inventory.filter(item => item.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return
    
    if (!confirm(`Möchten Sie wirklich ${selectedItems.size} Artikel löschen?`)) return

    try {
      const response = await fetch('http://localhost:3001/api/inventory/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          itemIds: Array.from(selectedItems)
        })
      })

      if (!response.ok) {
        throw new Error('Fehler beim Löschen der Artikel')
      }

      const result = await response.json()
      
      // Update inventory by removing deleted items
      onInventoryUpdate(inventory.filter(item => !selectedItems.has(item.id)))
      
      // Reset selection
      setSelectedItems(new Set())
      setIsSelectionMode(false)
      
      console.log(result.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Löschen')
    }
  }

  const handleItemSelection = (itemId: string, selected: boolean) => {
    const newSelectedItems = new Set(selectedItems)
    if (selected) {
      newSelectedItems.add(itemId)
    } else {
      newSelectedItems.delete(itemId)
    }
    setSelectedItems(newSelectedItems)
  }

  const handleSelectAll = () => {
    const filteredItems = getFilteredInventory()
    const allSelected = filteredItems.every(item => selectedItems.has(item.id))
    
    if (allSelected) {
      // Deselect all filtered items
      const newSelectedItems = new Set(selectedItems)
      filteredItems.forEach(item => newSelectedItems.delete(item.id))
      setSelectedItems(newSelectedItems)
    } else {
      // Select all filtered items
      const newSelectedItems = new Set(selectedItems)
      filteredItems.forEach(item => newSelectedItems.add(item.id))
      setSelectedItems(newSelectedItems)
    }
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode)
    if (isSelectionMode) {
      setSelectedItems(new Set())
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setEditingItem(item)
    setShowAddForm(true)
  }

  const handleSaveItem = async (item: Partial<InventoryItem>) => {
    try {
      const url = editingItem 
        ? `http://localhost:3001/api/inventory/${editingItem.id}`
        : 'http://localhost:3001/api/inventory'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        throw new Error('Fehler beim Speichern des Artikels')
      }

      const savedItem = await response.json()

      if (editingItem) {
        onInventoryUpdate(
          inventory.map(i => i.id === editingItem.id ? savedItem : i)
        )
      } else {
        onInventoryUpdate([...inventory, savedItem])
      }

      setShowAddForm(false)
      setEditingItem(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fehler beim Speichern')
    }
  }

  const getExpiringItems = () => {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    
    return inventory.filter(item => {
      if (!item.expiryDate) return false
      const expiryDate = new Date(item.expiryDate)
      return expiryDate <= threeDaysFromNow
    })
  }

  const getLowStockItems = () => {
    return inventory.filter(item => item.quantity <= 2)
  }

  const getCategories = () => {
    const categories = new Set(inventory.map(item => item.category))
    return Array.from(categories).sort()
  }

  const getFilteredInventory = () => {
    if (selectedCategory === 'all') return inventory
    return inventory.filter(item => item.category === selectedCategory)
  }

  const expiringItems = getExpiringItems()
  const lowStockItems = getLowStockItems()

  if (isLoading) {
    return (
      <div className="inventory-view">
        <LoadingSpinner size="large" message="Inventar wird geladen..." />
      </div>
    )
  }

  return (
    <div className="inventory-view">
      <div className="inventory-header">
        <div className="header-content">
          <h2>Inventar</h2>
          <p>Übersicht über alle Artikel in Ihrem Kühlschrank</p>
        </div>
        <div className="header-actions">
          {isSelectionMode ? (
            <div className="selection-actions">
              <button 
                onClick={handleSelectAll}
                className="select-all-button"
              >
                {getFilteredInventory().every(item => selectedItems.has(item.id)) 
                  ? <CheckSquare className="icon" />
                  : <Square className="icon" />
                }
                Alle auswählen
              </button>
              <button 
                onClick={handleBulkDelete}
                className="bulk-delete-button"
                disabled={selectedItems.size === 0}
              >
                <Trash2 className="icon" />
                Löschen ({selectedItems.size})
              </button>
              <button 
                onClick={toggleSelectionMode}
                className="cancel-selection-button"
              >
                <X className="icon" />
                Abbrechen
              </button>
            </div>
          ) : (
            <div className="normal-actions">
              {/* View Mode Toggle */}
              <div className="view-toggle">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  title="Listen-Ansicht"
                >
                  <List className="icon" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  title="Kachel-Ansicht"
                >
                  <Grid3X3 className="icon" />
                </button>
              </div>
              
              <button 
                onClick={toggleSelectionMode}
                className="selection-mode-button"
                disabled={inventory.length === 0}
              >
                <CheckSquare className="icon" />
                Auswählen
              </button>
              <button 
                onClick={() => setShowAddForm(true)}
                className="add-button"
              >
                <Plus className="icon" />
                Artikel hinzufügen
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={() => setError(null)}
        />
      )}

      {/* Alerts */}
      {(expiringItems.length > 0 || lowStockItems.length > 0) && (
        <div className="alerts">
          {expiringItems.length > 0 && (
            <div className="alert warning">
              <AlertTriangle className="alert-icon" />
              <div className="alert-content">
                <h4>Läuft bald ab</h4>
                <p>{expiringItems.length} Artikel laufen in den nächsten 3 Tagen ab</p>
              </div>
            </div>
          )}
          
          {lowStockItems.length > 0 && (
            <div className="alert info">
              <Package className="alert-icon" />
              <div className="alert-content">
                <h4>Wenig Vorrat</h4>
                <p>{lowStockItems.length} Artikel haben wenig Vorrat</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div className="category-filter">
        <button 
          onClick={() => setSelectedCategory('all')}
          className={selectedCategory === 'all' ? 'active' : ''}
        >
          Alle ({inventory.length})
        </button>
        {getCategories().map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? 'active' : ''}
          >
            {category} ({inventory.filter(item => item.category === category).length})
          </button>
        ))}
      </div>

      {/* Inventory Items */}
      <div className={`inventory-container ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
        {getFilteredInventory().map(item => (
          viewMode === 'list' ? (
            <InventoryItemRow
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onSelect={handleItemSelection}
              isExpiring={expiringItems.includes(item)}
              isLowStock={lowStockItems.includes(item)}
              isSelected={selectedItems.has(item.id)}
              isSelectionMode={isSelectionMode}
            />
          ) : (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
              onSelect={handleItemSelection}
              isExpiring={expiringItems.includes(item)}
              isLowStock={lowStockItems.includes(item)}
              isSelected={selectedItems.has(item.id)}
              isSelectionMode={isSelectionMode}
            />
          )
        ))}
      </div>

      {getFilteredInventory().length === 0 && (
        <div className="empty-state">
          <Package className="empty-icon" />
          <h3>Keine Artikel gefunden</h3>
          <p>
            {selectedCategory === 'all' 
              ? 'Ihr Inventar ist leer. Fügen Sie Artikel hinzu oder laden Sie ein Bild hoch.'
              : `Keine Artikel in der Kategorie "${selectedCategory}" gefunden.`
            }
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <ItemFormModal
          item={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setShowAddForm(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

// Item Row Component (List View)
interface InventoryItemRowProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
  onSelect: (itemId: string, selected: boolean) => void
  isExpiring: boolean
  isLowStock: boolean
  isSelected: boolean
  isSelectionMode: boolean
}

// Item Card Component Interface
interface InventoryItemCardProps {
  item: InventoryItem
  onEdit: (item: InventoryItem) => void
  onDelete: (id: string) => void
  onSelect: (itemId: string, selected: boolean) => void
  isExpiring: boolean
  isLowStock: boolean
  isSelected: boolean
  isSelectionMode: boolean
}

const InventoryItemRow: React.FC<InventoryItemRowProps> = ({
  item,
  onEdit,
  onDelete,
  onSelect,
  isExpiring,
  isLowStock,
  isSelected,
  isSelectionMode
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const handleClick = () => {
    if (isSelectionMode) {
      onSelect(item.id, !isSelected)
    }
  }

  const productEmoji = getProductEmoji(item.name, item.category)
  const categoryEmoji = getCategoryEmoji(item.category)

  return (
    <div 
      className={`inventory-item-row ${isExpiring ? 'expiring' : ''} ${isLowStock ? 'low-stock' : ''} ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''}`}
      onClick={handleClick}
    >
      {isSelectionMode && (
        <div className="selection-checkbox">
          {isSelected ? <CheckSquare className="icon" /> : <Square className="icon" />}
        </div>
      )}

      <div className="item-info">
        <div className="item-name-container">
          {productEmoji && <span className="product-emoji">{productEmoji}</span>}
          <span className="item-name">{item.name}</span>
        </div>
        
        <div className="item-category-container">
          {categoryEmoji && <span className="category-emoji">{categoryEmoji}</span>}
          <span className="category-badge">{item.category}</span>
        </div>
      </div>

      <div className="item-quantity-info">
        <span className="quantity">{item.quantity}</span>
        <span className="unit">{item.unit}</span>
      </div>

      {item.expiryDate && (
        <div className="item-expiry-info">
          <Calendar className="icon" />
          <span>{formatDate(item.expiryDate)}</span>
        </div>
      )}

      <div className="item-source-info">
        <span className={`source-badge ${item.source}`}>
          {item.source === 'vision_api' ? 'KI' : 'Manual'}
        </span>
        {item.confidence && (
          <span className="confidence">{Math.round(item.confidence)}%</span>
        )}
      </div>

      <div className="item-warnings">
        {isExpiring && <span className="warning expiring">⚠️</span>}
        {isLowStock && <span className="warning low-stock">📦</span>}
      </div>

      {!isSelectionMode && (
        <div className="item-actions">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
            className="edit-button"
            title="Bearbeiten"
          >
            <Edit className="icon" />
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
            className="delete-button"
            title="Löschen"
          >
            <Trash2 className="icon" />
          </button>
        </div>
      )}
    </div>
  )
}

// Item Card Component (Grid View)
const InventoryItemCard: React.FC<InventoryItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onSelect,
  isExpiring,
  isLowStock,
  isSelected,
  isSelectionMode
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE')
  }

  const handleClick = () => {
    if (isSelectionMode) {
      onSelect(item.id, !isSelected)
    }
  }

  const productEmoji = getProductEmoji(item.name, item.category)
  const categoryEmoji = getCategoryEmoji(item.category)

  return (
    <div 
      className={`inventory-item ${isExpiring ? 'expiring' : ''} ${isLowStock ? 'low-stock' : ''} ${isSelected ? 'selected' : ''} ${isSelectionMode ? 'selection-mode' : ''}`}
      onClick={handleClick}
    >
      {isSelectionMode && (
        <div className="selection-checkbox">
          {isSelected ? <CheckSquare className="icon" /> : <Square className="icon" />}
        </div>
      )}
      
      <div className="item-header">
        <div className="item-title">
          {productEmoji && <span className="product-emoji">{productEmoji}</span>}
          <h3>{item.name}</h3>
        </div>
        {!isSelectionMode && (
          <div className="item-actions">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(item); }} 
              className="edit-button"
              title="Bearbeiten"
            >
              <Edit className="icon" />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} 
              className="delete-button"
              title="Löschen"
            >
              <Trash2 className="icon" />
            </button>
          </div>
        )}
      </div>
      
      <div className="item-details">
        <div className="item-category-container">
          {categoryEmoji && <span className="category-emoji">{categoryEmoji}</span>}
          <span className="category-badge">{item.category}</span>
        </div>
        <div className="item-quantity">
          {item.quantity} {item.unit}
        </div>
        {item.expiryDate && (
          <div className="item-expiry">
            <Calendar className="icon" />
            {formatDate(item.expiryDate)}
          </div>
        )}
        <div className="item-source">
          {item.source === 'vision_api' ? 'KI erkannt' : 'Manuell'}
          {item.confidence && ` (${Math.round(item.confidence)}%)`}
        </div>
      </div>
      
      {(isExpiring || isLowStock) && (
        <div className="item-warnings">
          {isExpiring && <span className="warning">Läuft bald ab</span>}
          {isLowStock && <span className="warning">Wenig Vorrat</span>}
        </div>
      )}
    </div>
  )
}

// Form Modal Component
interface ItemFormModalProps {
  item: InventoryItem | null
  onSave: (item: Partial<InventoryItem>) => void
  onClose: () => void
}

const ItemFormModal: React.FC<ItemFormModalProps> = ({ item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Other',
    quantity: item?.quantity || 1,
    unit: item?.unit || 'piece',
    expiryDate: item?.expiryDate || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  const categories = ['Fruits', 'Vegetables', 'Dairy', 'Meat', 'Grains', 'Beverages', 'Other']
  const units = ['piece', 'kg', 'g', 'l', 'ml']

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{item ? 'Artikel bearbeiten' : 'Neuen Artikel hinzufügen'}</h3>
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
                min="0"
                step="0.1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value)})}
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
            <label htmlFor="expiryDate">Ablaufdatum (optional)</label>
            <input
              id="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Abbrechen
            </button>
            <button type="submit" className="save-button">
              {item ? 'Aktualisieren' : 'Hinzufügen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
