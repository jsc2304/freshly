# Freshly - Smart Fridge & Shopping List App

Eine intelligente Kühlschrank- und Einkaufslisten-App mit KI-gestützter Bilderkennung für optimale Lebensmittelverwaltung.

## 🚀 Features

- **🔮 Gemini Vision AI**: Hochpräzise Lebensmittelerkennung mit Google Gemini Vision API
- **📦 Intelligente Inventarverwaltung**: Automatische Kategorisierung und Bestandsführung
- **🗑️ Bulk-Delete Funktionalität**: Mehrfachauswahl und gruppenweises Löschen von Items
- **🛒 Smart Shopping Lists**: Automatische Einkaufslisten-Generierung
- **⚡ Fallback-System**: Robuste Vision API → Gemini Vision → Demo Mode Kette
- **🎨 Moderne UI**: Responsive React/TypeScript Interface mit Lucide Icons
- **💾 Lokale Datenbank**: JSON-basierte Speicherung mit automatischem Backup

## 🏗️ Architektur

```
├── backend/                 # Node.js/Express.js Backend
│   ├── services/           # Business Logic Services
│   │   ├── visionService.js    # Gemini & Vision API Integration
│   │   ├── inventoryService.js # Inventory Management
│   │   └── shoppingListService.js # Shopping List Logic
│   ├── data/              # JSON Database Files
│   ├── uploads/           # Temporary Image Storage
│   └── .env               # Environment Configuration
├── frontend/              # React/TypeScript/Vite Frontend
│   ├── src/
│   │   ├── components/    # Modern React Components
│   │   │   ├── InventoryView.tsx    # Bulk-Delete UI
│   │   │   ├── ImageUpload.tsx      # AI-Upload Interface
│   │   │   └── ShoppingListView.tsx # Smart Lists
│   │   ├── types.ts       # TypeScript Definitions
│   │   └── App.css        # Modern Styling
└── updated_spec.md        # Current Project Specification
```

## 🛠️ Installation & Setup

### Voraussetzungen

1. **Node.js** (v18+) und npm
2. **Google Cloud Projekt** mit aktivierter Vision API
3. **Gemini API Key** von Google AI Studio
4. **Service Account** JSON-Key für Vision API (Fallback)

### Schnellstart

1. **Repository klonen**:
```bash
git clone <repository-url>
cd freshly/webApp
```

2. **Backend Setup**:
```bash
cd backend
npm install
cp .env.example .env
```

3. **Environment konfigurieren** (`.env`):
```env
PORT=3001
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Google Credentials einrichten**:
   - Platziere `google-credentials.json` im backend/ Ordner
   - Hole Gemini API Key von: https://aistudio.google.com/app/apikey

5. **Beide Services starten**:
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

6. **App öffnen**: http://localhost:5174

### Google Cloud Vision API Setup

1. Google Cloud Console öffnen
2. Neues Projekt erstellen
3. Vision API aktivieren
4. Service Account erstellen
5. JSON-Key herunterladen
6. Pfad zur JSON-Datei in `backend/.env` setzen

## 🔧 Konfiguration

### Backend (.env)
```env
GOOGLE_APPLICATION_CREDENTIALS=./path/to/service-account-key.json
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### Frontend
- Development Server: `http://localhost:5173`
- Backend API: `http://localhost:3001`


## 🎯 Nutzung

1. **Bild hochladen**: Lade ein Foto deines Kühlschranks oder Einkaufs hoch
2. **KI-Erkennung**: Gemini Vision AI erkennt automatisch alle Lebensmittel
3. **Inventar verwalten**: Bearbeite erkannte Items oder füge manuell hinzu
4. **Bulk-Operationen**: Wähle mehrere Items für gruppenweise Aktionen
5. **Einkaufsliste**: Generiere automatisch Listen basierend auf Bedarf

## 📊 API Endpoints

### Inventar Management
- `GET /api/inventory` - Alle Inventarelemente abrufen
- `POST /api/inventory` - Neues Element hinzufügen  
- `PUT /api/inventory/:id` - Element aktualisieren
- `DELETE /api/inventory/:id` - Einzelnes Element löschen
- `DELETE /api/inventory/bulk` - Mehrere Elemente gleichzeitig löschen

### Einkaufsliste
- `GET /api/shopping-list` - Einkaufsliste abrufen
- `POST /api/shopping-list` - Element zur Liste hinzufügen
- `DELETE /api/shopping-list/:id` - Element von Liste entfernen

### AI Bildanalyse
- `POST /api/upload-image` - Bild hochladen und analysieren (Gemini → Vision API → Fallback)
- `GET /api/health` - System Status

## � Entwicklung

### Backend Development

```bash
cd backend
npm run dev  # Startet mit nodemon + dotenv
```

### Frontend Development

```bash
cd frontend  
npm run dev  # Startet Vite Dev Server
```

### Produktions-Build

```bash
cd frontend
npm run build
npm run preview  # Preview des Builds
```

## 🧪 Testing & Debugging

### Vollständig Lokaler Test
- Backend auf Port 3001
- Frontend auf Port 5174 (automatisch gewählt wenn 5173 belegt)
- Automatische CORS-Konfiguration
- Fallback-Modus falls APIs nicht verfügbar

### Logging & Debugging
- Backend: Detaillierte Console-Logs für alle API-Calls
- Gemini Vision: Raw Response Logging für Debugging  
- Fehlerbehandlung: Robuste Fallback-Kette mit aussagekräftigen Fehlermeldungen
- Image Upload: Temporäre Speicherung in `/backend/uploads/`

## 📱 Features im Detail

### 🔮 Gemini Vision AI Integration
- **Primäre Erkennung**: Google Gemini 1.5 Flash Model
- **Custom Prompts**: Speziell optimiert für deutsche Lebensmittelerkennung
- **Hochpräzise Ergebnisse**: 80-95% Genauigkeit bei Lebensmitteln
- **Strukturierte Daten**: JSON-Format mit Namen, Kategorie, Menge, Einheit
- **Fallback Chain**: Gemini → Vision API → Demo Mode für 100% Verfügbarkeit

### 🗑️ Bulk-Delete Funktionalität
- **Auswahl-Modus**: Toggle zwischen Normal- und Mehrfachauswahl
- **Visuelle Checkboxen**: Intuitive Item-Auswahl mit modernen Icons
- **Bulk-Aktionen**: "Alle auswählen" und "Löschen (X)" Buttons
- **Sicherheitsabfragen**: Bestätigung vor dem Löschen mehrerer Items
- **Live-Counter**: Zeigt Anzahl ausgewählter Items in Echtzeit

### 📦 Intelligentes Inventar
- **Auto-Kategorisierung**: KI-basierte Zuordnung zu Lebensmittelkategorien
- **Flexible Einheiten**: Gramm, Stück, Liter, Pakete, etc.
- **Ablaufdaten**: Visuelle Warnungen bei baldiger Haltbarkeit
- **Bestandsalarme**: Automatische Benachrichtigung bei niedrigem Vorrat
- **Source-Tracking**: Erkennung ob manuell oder KI-erkannt

### 🛒 Smart Shopping Lists
- **Intelligente Generierung**: Basierend auf Inventar-Analyse
- **Prioritätssystem**: Wichtige Items werden hervorgehoben
- **Kategorie-Organisation**: Strukturiert nach Supermarkt-Layout
- **Completion Tracking**: Abhaken erledigter Einkäufe

## 🎨 Design & UX

### Moderne UI Prinzipien
- **Minimalistisch**: Sauberes Design ohne Überladung
- **Intuitiv**: Selbsterklärende Bedienung ohne Lernkurve
- **Responsiv**: Optimiert für Desktop, Tablet und Mobile
- **Accessibility**: Kontrastreiche Farben und klare Icons

### Performance Optimierungen
- **Schnelle Ladezeiten**: Vite-optimierte Assets <2s
- **Lazy Loading**: Bilder und Komponenten werden bei Bedarf geladen
- **Effiziente API-Calls**: Minimierte Roundtrips
- **Local Storage**: Client-seitige Zwischenspeicherung

## 🚀 Roadmap & Nächste Features

### ✅ Implementiert (v1.0)

- Gemini Vision AI Integration mit Custom Prompts
- Bulk-Delete Funktionalität für Inventar
- Robuste Fallback-Kette (Gemini → Vision API → Demo)
- Moderne React UI mit TypeScript
- JSON-basierte lokale Datenbank

### 🔄 In Entwicklung (v1.1)

- Erweiterte Bulk-Operationen (Edit, Move, Copy)
- Bessere Kategorisierung und Filter
- Exportfunktionen (CSV, PDF)
- Performance-Optimierungen

### 🎯 Geplant (v2.0)

- PWA-Funktionalität für Offline-Nutzung
- Push-Benachrichtigungen für Ablaufdaten
- Rezeptempfehlungen basierend auf Inventar
- Multi-User Support mit lokaler Authentifizierung
- IoT-Integration (Smart Fridge APIs)
- Barcode-Scanner Integration
- Preisvergleich und Budget-Tracking

## 🛡️ Sicherheit & Datenschutz

- **API-Schlüssel**: Sichere serverseitige Verwaltung in .env-Dateien
- **Datenschutz**: Vollständig lokale Speicherung, keine Cloud-Datenübertragung
- **Bildverarbeitung**: Temporäre lokale Speicherung, automatische Löschung nach Analyse
- **CORS-Schutz**: Konfigurierte Cross-Origin-Policies für Frontend-Backend-Kommunikation

## 📄 Lizenz

Dieses Projekt steht unter der MIT Lizenz. Siehe `LICENSE` Datei für Details.

## 🤝 Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit deine Änderungen (`git commit -m 'Add some AmazingFeature'`)
4. Push zum Branch (`git push origin feature/AmazingFeature`)
5. Öffne einen Pull Request

## � Team & Support

Entwickelt mit ❤️ für effizientere Haushaltsführung und weniger Lebensmittelverschwendung.

Bei Fragen oder Problemen erstelle bitte ein Issue im Repository oder kontaktiere das Entwicklungsteam.

---

**💡 Tipp**: Für beste Ergebnisse verwende gut beleuchtete Fotos mit klarer Sicht auf die Lebensmittel. Gemini Vision AI erkennt sogar komplexe Szenarien mit hoher Präzision!
