# 🔐 API Key Verschlüsselung - Sicherheitsguide

## 🎯 Warum Verschlüsselung?

**Problem:** API Keys im Klartext in `.env` Dateien sind ein Sicherheitsrisiko
**Lösung:** Hardware-gebundene Verschlüsselung mit AES-256

## 🔧 Setup Instructions

### 1. **Teste das System**
```bash
cd webApp/backend
node encrypt-keys.js test
```

### 2. **Interaktive Einrichtung** (Empfohlen)
```bash
node encrypt-keys.js setup
```
Folge den Anweisungen zur sicheren API Key Verschlüsselung.

### 3. **Manuelle Verschlüsselung**
```bash
# Einzelnen API Key verschlüsseln
node encrypt-keys.js encrypt "your-gemini-api-key-here"

# Komplette .env Datei verschlüsseln
node encrypt-keys.js encrypt-env
```

## 🔐 Sicherheitsfeatures

### **Hardware-Bound Encryption**
- **CPU Model**: Prozessor-spezifische Eigenschaften
- **Hostname**: Computer-Name
- **Platform**: Betriebssystem
- **Architecture**: System-Architektur

→ **API Keys funktionieren nur auf dem ursprünglichen Computer!**

### **Zusätzliche Sicherheit**
```bash
# Optional: Zusätzlicher Verschlüsselungsschlüssel
export ENCRYPTION_SECRET="your-super-secret-phrase"
```

## 📋 Verwendung

### **Verschlüsselte .env Struktur**
```env
# Original
GEMINI_API_KEY=your-api-key-here

# Verschlüsselt
GEMINI_API_KEY_ENCRYPTED=U2FsdGVkX1/xyz123...encrypted...
```

### **Automatische Fallbacks**
1. **Encrypted Key** → Wird bevorzugt verwendet
2. **Plain Key** → Fallback für Rückwärtskompatibilität  
3. **No Key** → Vision API Fallback

## ⚡ Commands Reference

```bash
# Hilfe anzeigen
node encrypt-keys.js

# Verschlüsselung testen
node encrypt-keys.js test

# Interaktives Setup
node encrypt-keys.js setup

# Einzelnen Key verschlüsseln
node encrypt-keys.js encrypt "api-key"

# Verschlüsselten Key entschlüsseln (Debug)
node encrypt-keys.js decrypt "encrypted-string"

# .env Datei verschlüsseln
node encrypt-keys.js encrypt-env
```

## 🚨 Wichtige Hinweise

### **Backup Strategy**
1. **Original .env sichern** vor Verschlüsselung
2. **Hardware-Wechsel**: API Keys neu verschlüsseln
3. **Team-Arbeit**: Jeder Entwickler muss eigene Keys verschlüsseln

### **Development vs Production**
- **Development**: Hardware-gebundene Verschlüsselung OK
- **Production**: Zusätzlich `ENCRYPTION_SECRET` verwenden
- **CI/CD**: Plain Keys oder Key-Management Service

### **Troubleshooting**
```bash
# Falls Entschlüsselung fehlschlägt:
# 1. Prüfe Hardware-Änderungen
# 2. Verwende Plain API Key als Fallback
# 3. Re-encrypt API Keys auf neuer Hardware
```

## 🔧 Integration in bestehende App

Das System ist **rückwärtskompatibel**:
- Bestehende Plain Keys funktionieren weiterhin
- Neue Encrypted Keys werden bevorzugt verwendet
- Kein Breaking Change für bestehende Setups

## 🎯 Produktions-Setup

```env
# Production .env
PORT=3001
NODE_ENV=production

# Encrypted API Keys (Hardware + Secret)
GEMINI_API_KEY_ENCRYPTED=U2FsdGVkX1/...
ENCRYPTION_SECRET=production-super-secret-key

# Cloud Credentials (unchanged)
GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
```

---

**💡 Pro-Tipp**: Für maximale Sicherheit kombiniere Hardware-Binding mit einem starken `ENCRYPTION_SECRET` in der Produktionsumgebung!
