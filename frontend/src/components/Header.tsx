import type { HeaderProps } from '../types.ts'
import { Refrigerator, ShoppingCart, Camera, BarChart3 } from 'lucide-react'

export const Header: React.FC<HeaderProps> = ({ 
  activeView, 
  onViewChange, 
  inventoryCount, 
  shoppingListCount 
}) => {
  return (
    <header className="header">
      <div className="header-brand">
        <Refrigerator className="brand-icon" />
        <h1>Freshly</h1>
      </div>
      
      <nav className="header-nav">
        <button 
          className={`nav-button ${activeView === 'inventory' ? 'active' : ''}`}
          onClick={() => onViewChange('inventory')}
          title="Inventar"
        >
          <BarChart3 className="nav-icon" />
          <span className="nav-text">Inventar</span>
          {inventoryCount > 0 && (
            <span className="nav-badge">{inventoryCount}</span>
          )}
        </button>
        
        <button 
          className={`nav-button ${activeView === 'shopping' ? 'active' : ''}`}
          onClick={() => onViewChange('shopping')}
          title="Einkaufsliste"
        >
          <ShoppingCart className="nav-icon" />
          <span className="nav-text">Einkaufsliste</span>
          {shoppingListCount > 0 && (
            <span className="nav-badge">{shoppingListCount}</span>
          )}
        </button>
        
        <button 
          className={`nav-button ${activeView === 'upload' ? 'active' : ''}`}
          onClick={() => onViewChange('upload')}
          title="Bild hochladen"
        >
          <Camera className="nav-icon" />
          <span className="nav-text">Bild hochladen</span>
        </button>
      </nav>
    </header>
  )
}
