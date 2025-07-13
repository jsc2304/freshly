import { useState, useRef } from 'react'
import { Upload, Camera, X, CheckCircle } from 'lucide-react'
import type { ImageUploadProps, InventoryItem, ImageAnalysisResponse } from '../types.ts'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { ImageAnalysisModal } from './ImageAnalysisModal'

export const ImageUpload: React.FC<ImageUploadProps> = ({ onImageAnalysis }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<ImageAnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Bitte wählen Sie eine Bilddatei aus')
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError('Datei ist zu groß. Maximum 10MB.')
      return
    }

    setSelectedFile(file)
    setError(null)
    setUploadResult(null)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('http://localhost:3001/api/upload-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: ImageAnalysisResponse = await response.json()
      setUploadResult(result)
      
      // Show modal for confirmation instead of directly adding items
      if (result.detectedItems && result.detectedItems.length > 0) {
        setIsModalOpen(true)
      } else {
        setError('Keine Lebensmittel erkannt. Versuchen Sie es mit einem anderen Bild.')
      }

    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setIsUploading(false)
    }
  }

  const handleClear = () => {
    setSelectedFile(null)
    setPreview(null)
    setUploadResult(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleConfirmItems = async (selectedItems: InventoryItem[]) => {
    try {
      // Send selected items to backend to add to inventory
      for (const item of selectedItems) {
        const response = await fetch('http://localhost:3001/api/inventory', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: item.name,
            category: item.category,
            quantity: item.quantity,
            unit: item.unit,
            confidence: item.confidence,
            source: item.source
          })
        })

        if (!response.ok) {
          throw new Error(`Fehler beim Hinzufügen von ${item.name}`)
        }
      }

      // Call the parent callback with the selected items
      onImageAnalysis(selectedItems)
      
      // Close modal and clear state
      setIsModalOpen(false)
      handleClear()
      
      alert(`${selectedItems.length} Artikel erfolgreich zum Inventar hinzugefügt!`)
      
    } catch (err) {
      console.error('Error adding items:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Hinzufügen der Artikel')
    }
  }

  return (
    <div className="image-upload">
      <div className="upload-header">
        <h2>Bild hochladen</h2>
        <p>Laden Sie ein Bild Ihres Kühlschranks hoch, um Lebensmittel automatisch zu erkennen</p>
      </div>

      {!selectedFile ? (
        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="file-input"
          />
          <Upload className="upload-icon" />
          <h3>Bild hier ablegen oder klicken</h3>
          <p>Unterstützt: JPG, PNG, GIF (max. 10MB)</p>
        </div>
      ) : (
        <div className="file-preview">
          <div className="preview-header">
            <h3>{selectedFile.name}</h3>
            <button onClick={handleClear} className="clear-button">
              <X className="icon" />
            </button>
          </div>
          
          {preview && (
            <div className="preview-image">
              <img src={preview} alt="Vorschau" />
            </div>
          )}
          
          <div className="upload-actions">
            <button 
              onClick={handleUpload} 
              disabled={isUploading}
              className="upload-button"
            >
              {isUploading ? (
                <>
                  <LoadingSpinner size="small" />
                  Analysiere...
                </>
              ) : (
                <>
                  <Camera className="icon" />
                  Bild analysieren
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={() => setError(null)}
        />
      )}

      {uploadResult && (
        <div className="upload-result">
          <div className="result-header">
            <CheckCircle className="success-icon" />
            <h3>Analyse erfolgreich!</h3>
          </div>
          
          <div className="result-stats">
            <div className="stat">
              <span className="stat-value">{uploadResult.detectedItems?.length || 0}</span>
              <span className="stat-label">Erkannte Artikel</span>
            </div>
            <div className="stat">
              <span className="stat-value">{uploadResult.processedItems?.length || 0}</span>
              <span className="stat-label">Hinzugefügt</span>
            </div>
          </div>

          <div className="detected-items">
            <h4>Erkannte Artikel:</h4>
            <div className="items-grid">
              {uploadResult.detectedItems?.map((item, index) => (
                <div key={index} className="detected-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-category">{item.category}</span>
                  </div>
                  <div className="item-confidence">
                    <span className="confidence-value">
                      {Math.round((item.confidence || 0))}%
                    </span>
                  </div>
                </div>
              )) || []}
            </div>
          </div>

          {uploadResult.fallbackMode && (
            <div className="detected-info">
              <h4>Demo-Modus:</h4>
              <div className="info-tags">
                <span className="info-tag">Google Vision API nicht verfügbar</span>
                <span className="info-tag">Beispieldaten werden verwendet</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Analysis Modal */}
      {isModalOpen && uploadResult && (
        <ImageAnalysisModal 
          detectedItems={uploadResult.detectedItems || []}
          onConfirm={handleConfirmItems}
          onCancel={handleCloseModal}
          isProcessing={isUploading}
        />
      )}
    </div>
  )
}
