// Base interfaces
export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  expiryDate?: string
  addedDate: string
  confidence?: number
  source: 'manual' | 'vision_api'
}

export interface ShoppingListItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  addedDate: string
  source: 'manual' | 'low_stock' | 'essential_template'
  reason?: string
}

// API response types
export interface ImageAnalysisResponse {
  success: boolean
  message: string
  detectedItems: Array<{
    id: string
    name: string
    category: string
    quantity: number
    unit: string
    addedDate: string
    confidence: number
    source: string
    expiryDate?: string
  }>
  processedItems: InventoryItem[]
  filename: string
  fallbackMode?: boolean
}

export interface ApiError {
  error: string
  message: string
  code: string
}

// Component prop types
export interface HeaderProps {
  activeView: 'inventory' | 'shopping' | 'upload'
  onViewChange: (view: 'inventory' | 'shopping' | 'upload') => void
  inventoryCount: number
  shoppingListCount: number
}

export interface ImageUploadProps {
  onImageAnalysis: (items: InventoryItem[]) => void
}

export interface InventoryViewProps {
  inventory: InventoryItem[]
  onInventoryUpdate: (inventory: InventoryItem[]) => void
}

export interface ShoppingListViewProps {
  shoppingList: ShoppingListItem[]
  onShoppingListUpdate: (list: ShoppingListItem[]) => void
}

export interface ItemCardProps {
  item: InventoryItem | ShoppingListItem
  onEdit: (item: InventoryItem | ShoppingListItem) => void
  onDelete: (id: string) => void
}

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  message?: string
}

export interface ErrorMessageProps {
  error: string
  onRetry?: () => void
}

// Utility types
export type Category = 'Fruits' | 'Vegetables' | 'Dairy' | 'Meat' | 'Grains' | 'Beverages' | 'Other'

export type Priority = 'low' | 'medium' | 'high'

export type ItemSource = 'manual' | 'vision_api' | 'low_stock' | 'essential_template'
