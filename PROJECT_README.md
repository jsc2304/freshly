# Freshly - Smart Kühlschrank & Einkaufslisten App

Eine intelligente Web-App zur Verwaltung von Kühlschrankinhalten und automatischen Einkaufslistenerstellung mit **Gemini Vision AI** und erweiterten Bulk-Operationen.

## 🚀 Quick Start

### Voraussetzungen

- Node.js (v18 oder höher) und npm
- Google Cloud Projekt mit aktivierter Vision API (Fallback)
- **Gemini API Key** von Google AI Studio (Primary)
- Service Account JSON-Datei für Google Cloud Vision API

### Installation & Ausführung

1. **Environment Setup:**

   ```bash
   # Backend environment konfigurieren
   cd backend
   cp .env.example .env
   # Editiere .env mit deinen API Keys
   ```

2. **Backend starten:**

   ```bash
   cd backend
   npm install
   npm run dev  # Mit nodemon + dotenv
   ```

   Backend läuft auf: <http://localhost:3001>

3. **Frontend starten:**

   ```bash
   cd frontend
   npm install
   npm run dev  # Mit Vite
   ```

   Frontend läuft auf: <http://localhost:5174>

### API Keys Setup

#### Gemini API Key (Primary)
1. Besuche: <https://aistudio.google.com/app/apikey>
2. Erstelle neuen API Key
3. Füge in `.env` hinzu: `GEMINI_API_KEY=your_key_here`

#### Google Cloud Vision API (Fallback)
1. Google Cloud Console: <https://console.cloud.google.com/>
2. Projekt erstellen/auswählen → Vision API aktivieren
3. Service Account erstellen → JSON Key herunterladen
4. Als `google-credentials.json` im `backend/` Ordner speichern

## 📁 Projektstruktur

```text
webApp/
├── backend/                 # Node.js/Express Backend
│   ├── services/           # Business Logic Services
│   │   ├── visionService.js    # Gemini & Vision API Integration
│   │   ├── inventoryService.js # Inventory Management
│   │   └── shoppingListService.js # Shopping List Logic
│   ├── data/              # JSON-Datenbank Dateien
│   ├── uploads/           # Temporäre Bild-Uploads
│   ├── .env               # Environment Variables (API Keys)
│   ├── google-credentials.json  # Google Cloud Credentials
│   └── server.js          # Haupt-Server mit REST API
├── frontend/              # React/TypeScript/Vite Frontend
│   ├── src/
│   │   ├── components/    # Modern React Components
│   │   │   ├── InventoryView.tsx    # Bulk-Delete UI
│   │   │   ├── ImageUpload.tsx      # AI Upload Interface
│   │   │   └── ShoppingListView.tsx # Smart Lists
│   │   ├── types.ts       # TypeScript Definitionen
│   │   └── App.css        # Modern Styling
│   └── package.json
├── README.md              # Haupt-Dokumentation
├── PROJECT_README.md      # Projekt-Übersicht
├── original_spec.md       # Original Spezifikation
└── updated_spec.md        # Aktualisierte Spezifikation
```

## 🔧 Funktionen & Features

### ✅ Implementiert (v1.0)

- **🔮 Gemini Vision AI**: Hochpräzise Lebensmittelerkennung mit Custom Prompts
- **🗑️ Bulk-Delete**: Mehrfachauswahl und gruppenweises Löschen von Inventar-Items
- **⚡ Fallback-System**: Gemini → Vision API → Demo Mode für 100% Verfügbarkeit
- **📦 Smart Inventar**: Automatische Kategorisierung, Mengen- und Einheitenerkennung
- **🛒 Einkaufslisten**: Intelligente Listen-Generierung und -Verwaltung
- **🎨 Moderne UI**: Responsive React-Interface mit Lucide Icons
- **💾 JSON Database**: Lokale Speicherung mit automatischer Persistierung
- **🔧 Developer Tools**: Umfassendes Logging und Error Handling

### 🚧 Geplante Erweiterungen (v1.1)

- Erweiterte Bulk-Operationen (Edit, Move, Copy)
- Bessere Filter- und Suchfunktionen
- Export/Import Funktionalität (CSV, JSON)
- Performance-Optimierungen und Caching

### 🎯 Roadmap (v2.0)

- PWA-Funktionalität für Offline-Nutzung
- Automatische Haltbarkeitsdatum-Erkennung
- Rezeptempfehlungen basierend auf Inventar
- Barcode-Scanner Integration
- Multi-User Support

## 🛠 Tech Stack

**Frontend:**

- React 19 mit TypeScript
- Vite (Build Tool & Dev Server)
- Lucide React (Modern Icons)
- CSS3 mit responsivem Design
- ES6+ Features

**Backend:**

- Node.js 18+ mit Express.js
- Google Gemini Vision API (Primary)
- Google Cloud Vision API (Fallback)
- Multer (File Upload & Processing)
- dotenv (Environment Management)
- JSON-basierte Datenhaltung

**Development:**

- ESLint & TypeScript für Code Quality
- VS Code Tasks für Development Workflow
- Nodemon für Hot Reloading
- Console-based Logging für Debugging

## 🔗 API Endpoints

### Health & Status

- `GET /api/health` - Backend Status und System-Info

### AI Bildanalyse

- `POST /api/upload-image` - Bild hochladen und analysieren (Gemini → Vision API → Fallback)

### Inventar Management

- `GET /api/inventory` - Komplettes Inventar abrufen
- `POST /api/inventory` - Neues Item hinzufügen
- `PUT /api/inventory/:id` - Item aktualisieren
- `DELETE /api/inventory/:id` - Einzelnes Item löschen
- `DELETE /api/inventory/bulk` - Mehrere Items gleichzeitig löschen

### Einkaufsliste

- `GET /api/shopping-list` - Einkaufsliste abrufen
- `POST /api/shopping-list` - Item zur Liste hinzufügen
- `DELETE /api/shopping-list/:id` - Item von Liste entfernen

## 🎯 Entwicklung & Debugging

### Local Development

```bash
# Backend mit Logging
cd backend && npm run dev

# Frontend mit Hot Reload  
cd frontend && npm run dev
```

### VS Code Integration

### VS Code Integration

Das Projekt enthält vorkonfigurierte VS Code Tasks:

- **Start Backend** - `Ctrl+Shift+P` → "Tasks: Run Task" → "Start Backend"
- **Start Frontend** - Automatisch konfiguriert für parallele Entwicklung

### Debugging & Logging

```bash
# Backend Logs zeigen:
# - API Request/Response Details
# - Gemini Vision Raw Responses  
# - Vision API Fallback Status
# - File Upload/Processing Info
# - Error Stack Traces

# Frontend zeigt:
# - Component State Changes
# - API Call Results
# - User Interaction Events
```

### Environment Configuration

```env
# backend/.env
PORT=3001
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

## 🚀 Deployment

### Production Build

```bash
# Frontend Production Build
cd frontend
npm run build
npm run preview  # Test production build

# Backend Production Start
cd backend  
NODE_ENV=production npm start
```

### Environment Setup

1. **Development**: Lokale JSON-Dateien + API Keys
2. **Production**: Erweiterte Umgebungsvariablen + Cloud Storage

## 📊 Performance Metrics

- **Backend API Response**: < 500ms (ohne externe API-Calls)
- **Gemini Vision Analysis**: 2-5 Sekunden (abhängig von Bildgröße)
- **Frontend Load Time**: < 2 Sekunden
- **Image Upload**: Unterstützt bis 10MB

## 🔒 Sicherheit

- **API Keys**: Sichere serverseitige Verwaltung
- **File Uploads**: Validierung und temporäre Speicherung
- **CORS**: Konfigurierte Cross-Origin-Policies
- **Input Validation**: Umfassende Eingabevalidierung

---

**💡 Entwicklungstipp**: Verwende die VS Code Tasks für effizienten Development Workflow und achte auf die Console-Logs für detaillierte System-Insights!

### Debugging

1. Backend-Logs werden in der Konsole angezeigt
2. Frontend nutzt Browser Developer Tools
3. API-Anfragen können mit dem Network Tab überwacht werden

## 📝 Lizenz

Dieses Projekt ist für Entwicklungs- und Testzwecke erstellt.

---

## Viel Spaß beim Entwickeln! 🎉
