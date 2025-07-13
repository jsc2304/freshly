import { useState } from 'react'
import { Check, X, Edit3, Package, AlertCircle } from 'lucide-react'
import type { InventoryItem } from '../types'
import './ImageAnalysisModal.css'

interface DetectedItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  confidence: number
  source: string
  addedDate: string
}

interface ImageAnalysisModalProps {
  detectedItems: DetectedItem[]
  onConfirm: (selectedItems: InventoryItem[]) => void
  onCancel: () => void
  isProcessing?: boolean
}

export const ImageAnalysisModal: React.FC<ImageAnalysisModalProps> = ({
  detectedItems,
  onConfirm,
  onCancel,
  isProcessing = false
}) => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(
    new Set(detectedItems.map(item => item.id))
  )
  const [editingItems, setEditingItems] = useState<Map<string, DetectedItem>>(
    new Map()
  )

  const handleItemToggle = (itemId: string) => {
    const newSelected = new Set(selectedItems)
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId)
    } else {
      newSelected.add(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleItemEdit = (item: DetectedItem, field: string, value: string | number) => {
    const newEditingItems = new Map(editingItems)
    const currentItem = newEditingItems.get(item.id) || { ...item }
    
    if (field === 'quantity') {
      currentItem.quantity = typeof value === 'number' ? value : parseFloat(value as string) || 1
    } else if (field === 'name') {
      currentItem.name = value as string
    } else if (field === 'category') {
      currentItem.category = value as string
    } else if (field === 'unit') {
      currentItem.unit = value as string
    }
    
    newEditingItems.set(item.id, currentItem)
    setEditingItems(newEditingItems)
  }

  const handleSelectAll = () => {
    if (selectedItems.size === detectedItems.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(detectedItems.map(item => item.id)))
    }
  }

  const handleConfirm = () => {
    const finalItems: InventoryItem[] = Array.from(selectedItems).map(itemId => {
      const originalItem = detectedItems.find(item => item.id === itemId)!
      const editedItem = editingItems.get(itemId)
      const item = editedItem || originalItem

      return {
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        addedDate: item.addedDate,
        confidence: item.confidence,
        source: item.source as 'manual' | 'vision_api'
      }
    })

    onConfirm(finalItems)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'high'
    if (confidence >= 60) return 'medium'
    return 'low'
  }

  const selectedCount = selectedItems.size

  if (isProcessing) {
    return (
      <div className="modal-overlay">
        <div className="image-analysis-modal processing">
          <div className="processing-content">
            <div className="processing-spinner"></div>
            <h3>Bild wird analysiert...</h3>
            <p>Die KI erkennt Lebensmittel in Ihrem Bild</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay">
      <div className="image-analysis-modal">
        <div className="modal-header">
          <div className="header-info">
            <Package className="header-icon" />
            <div>
              <h3>Erkannte Lebensmittel</h3>
              <p>{detectedItems.length} Artikel gefunden - Auswahl bestätigen</p>
            </div>
          </div>
          <button onClick={onCancel} className="close-button">
            <X className="icon" />
          </button>
        </div>

        <div className="modal-content">
          {detectedItems.length === 0 ? (
            <div className="no-items">
              <AlertCircle className="no-items-icon" />
              <h4>Keine Lebensmittel erkannt</h4>
              <p>Die KI konnte keine Lebensmittel in diesem Bild identifizieren.</p>
            </div>
          ) : (
            <>
              <div className="selection-header">
                <button 
                  onClick={handleSelectAll}
                  className="select-all-button"
                >
                  <Check className="icon" />
                  {selectedItems.size === detectedItems.length ? 'Alle abwählen' : 'Alle auswählen'}
                </button>
                <span className="selection-count">
                  {selectedCount} von {detectedItems.length} ausgewählt
                </span>
              </div>

              <div className="detected-items">
                {detectedItems.map(item => {
                  const isSelected = selectedItems.has(item.id)
                  const editedItem = editingItems.get(item.id) || item

                  return (
                    <div 
                      key={item.id} 
                      className={`detected-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="item-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleItemToggle(item.id)}
                        />
                      </div>

                      <div className="item-content">
                        <div className="item-main">
                          <div className="item-name-edit">
                            <input
                              type="text"
                              value={editedItem.name}
                              onChange={(e) => handleItemEdit(item, 'name', e.target.value)}
                              className="name-input"
                              disabled={!isSelected}
                            />
                            <Edit3 className="edit-icon" />
                          </div>
                          
                          <div className="item-details">
                            <select
                              value={editedItem.category}
                              onChange={(e) => handleItemEdit(item, 'category', e.target.value)}
                              className="category-select"
                              disabled={!isSelected}
                            >
                              <option value="Obst">Obst</option>
                              <option value="Gemüse">Gemüse</option>
                              <option value="Fleisch">Fleisch</option>
                              <option value="Milchprodukte">Milchprodukte</option>
                              <option value="Getreideprodukte">Getreideprodukte</option>
                              <option value="Getränke">Getränke</option>
                              <option value="Sonstiges">Sonstiges</option>
                            </select>

                            <div className="quantity-edit">
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                value={editedItem.quantity}
                                onChange={(e) => handleItemEdit(item, 'quantity', e.target.value)}
                                className="quantity-input"
                                disabled={!isSelected}
                              />
                              <span className="unit">{editedItem.unit}</span>
                            </div>
                          </div>
                        </div>

                        <div className="item-confidence">
                          <span className={`confidence-badge ${getConfidenceColor(item.confidence)}`}>
                            {Math.round(item.confidence)}% sicher
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onCancel} className="cancel-button">
            <X className="icon" />
            Abbrechen
          </button>
          <button 
            onClick={handleConfirm} 
            className="confirm-button"
            disabled={selectedCount === 0}
          >
            <Check className="icon" />
            {selectedCount} Artikel hinzufügen
          </button>
        </div>
      </div>
    </div>
  )
}
