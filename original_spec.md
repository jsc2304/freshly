# specification.md

# Spezifikation: Smarte Kühlschrank- und Einkaufslisten-App (Lokal testbare Web-App)

---

## 1. Ziele der App

Die App bietet Nutzern eine innovative Lösung zur Lebensmittelverwaltung im Haushalt. Ziel ist es, Lebensmittelverschwendung zu reduzieren, Einkäufe zu optimieren und die Haushaltsorganisation zu verbessern. Dies wird durch den intelligenten Einsatz von KI-Technologien und ein minimalistisches, intuitives User Interface (UI) erreicht.

---

## 2. Hauptfunktionen

### 2.1. Intelligente Kühlschrankverwaltung

* **AI-gestützte Bilderkennung:** Nutzung der **Google Cloud Vision API** zur Erkennung von Lebensmitteln, Mengen und Haltbarkeitsdaten (falls sichtbar). Der Upload der Bilder erfolgt über das Frontend zum lokalen Backend, welches die Kommunikation mit der Google Cloud Vision API übernimmt.
* **Digitale Bestandsaufnahme:** Automatische Inventarisierung der durch die Vision API erkannten Artikel. Eine einfache manuelle Anpassung des Bestands ist ebenfalls möglich.
* **Visueller Überblick:** Ein modernes, minimalistisches und responsives UI ermöglicht eine schnelle und klare Übersicht über den aktuellen Kühlschrankinhalt.

### 2.2. Automatisierte Einkaufslistenerstellung

* **Intelligente Bedarfsanalyse:** Eine regelbasierte oder einfache KI-basierte Differenzanalyse zwischen dem aktuellen und einem Referenz-Inventar (oder einem vorherigen Zustand) ermittelt den Bedarf an neuen Lebensmitteln.
* **Automatische Einkaufslisten:** Basierend auf der Bedarfsanalyse wird automatisch eine Einkaufsliste generiert. Diese Liste ist für den Nutzer einfach manuell anpassbar.

### 2.3. Effizienter Einkaufsabgleich

* **Automatischer Einkaufswagen-Abgleich:** Erneute Nutzung der **Google Cloud Vision API**, um gekaufte Artikel zu erkennen (z.B. durch ein Foto des Kassenbons oder der eingekauften Artikel). Das lokale Backend verarbeitet das Bild über die Vision API und aktualisiert anschließend automatisch die Einkaufslisten und das Inventar.

---

## 3. Technische Anforderungen

### 3.1. Frontend

* **Technologien:** **React** in Kombination mit **Vite** für einen schnellen Entwicklungsstart und optimale Performance in der lokalen Entwicklungsumgebung. Eine spätere Migration zu Next.js für spezifische Server-Side-Rendering-Anforderungen ist denkbar, ist aber für die initiale Entwicklung nicht notwendig.
* **Architektur:** Implementierung als **Progressive Web App (PWA)**, um zukünftig Offline-Funktionalität und eine installierbare Erfahrung zu ermöglichen.
* **Sprache:** **TypeScript** für verbesserte Code-Qualität und Skalierbarkeit.

### 3.2. Backend

* **Lokal ausgeführtes Backend:** Ein **Node.js-Server** (z.B. mit **Express.js**) läuft lokal und stellt eine **REST-API** bereit. Dieses Backend dient als zentraler Vermittler (Proxy) zwischen dem Frontend und den externen Cloud-Diensten.
* **Bildanalyse-Integration:** Das Node.js-Backend integriert das **Google Cloud Vision API SDK/Client Library**. Es empfängt Bilder vom Frontend, sendet diese sicher an die Google Cloud Vision API und leitet die Ergebnisse zurück an das Frontend.
    * **Wichtig:** Google Cloud API-Schlüssel oder Service Account-Informationen dürfen **niemals** direkt im Frontend-Code oder öffentlich zugänglich abgelegt werden. Sie müssen sicher auf dem Backend-Server (z.B. über Umgebungsvariablen) verwaltet werden.
* **Intelligente Logik:** Für die Bedarfsanalyse wird zunächst eine **regelbasierte Logik** im Node.js-Backend implementiert. Die Integration komplexerer KI-Modelle (wie OpenAI GPT API) ist als zukünftige Erweiterung geplant und für die initiale lokale Testphase nicht erforderlich.
* **Benutzerauthentifizierung:** Eine **einfache lokale Benutzerverwaltung** im Node.js-Backend mit simulierten Anmeldedaten oder einer lokalen Datenbank zur Benutzerverwaltung.

### 3.3. Datenbank

* **Lokale NoSQL-Datenbank:** **NeDB** oder **LowDB** werden für die lokale Speicherung von Inventar, Einkaufslisten und Benutzerdaten verwendet. Diese Datenbanken bieten eine einfache, dateibasierte oder In-Memory-Speicherung, die ideal für die lokale Entwicklung und das Testen ist.
* **Bildspeicherung (temporär):** Hochgeladene Bilder werden temporär im **lokalen Dateisystem** des Servers gespeichert, bevor sie zur Google Cloud Vision API gesendet werden. Nach der Verarbeitung können sie bei Bedarf gelöscht oder archiviert werden.

---

## 4. Architektur

* **Modulare Trennung:** Klare Trennung von UI (Frontend), Geschäftslogik (Backend) und Datenhaltung (lokale Datenbank).
* **REST-API:** Das Frontend kommuniziert über eine **REST-API** mit dem Node.js-Backend.
* **Backend als Proxy:** Das Backend agiert als **Proxy** für alle Anfragen an die **Google Cloud Vision API**, um Authentifizierungsdetails sicher zu verwalten und die Kommunikation zu steuern.

---

## 5. Entwicklungsumgebung & Lokale Ausführung

Das AI-Agent sollte in der Lage sein, die Anwendung lokal zu starten und zu testen.

1.  **Google Cloud Projekt:** Ein Google Cloud Projekt muss vorhanden sein und die **Cloud Vision API** aktiviert sein.
2.  **Service Account:** Ein Service Account mit den notwendigen Berechtigungen für die Vision API muss erstellt und die JSON-Key-Datei heruntergeladen werden. Diese Datei muss sicher im Backend-Projekt abgelegt und über Umgebungsvariablen geladen werden (z.B. `GOOGLE_APPLICATION_CREDENTIALS`).
3.  **Node.js & npm/yarn:** Sicherstellen, dass Node.js und ein Paketmanager (npm oder yarn) installiert sind.
4.  **Projekt-Setup:**
    * Frontend- und Backend-Komponenten sollten in getrennten Ordnern organisiert sein.
    * Abhängigkeiten (z.B. `@google-cloud/vision` für das Backend, `react`, `vite` für das Frontend) müssen installiert werden.
5.  **Start-Skripte:** Skripte zum Starten des Frontend-Entwicklungsservers und des Node.js-Backends sollten in der `package.json` definiert sein (z.B. `npm run dev` für Frontend, `npm run start-backend` für Backend).
6.  **Zugriff:** Die Web-App sollte nach dem Start über `http://localhost:PORT` im Browser zugänglich sein.

---

## 6. Zukünftige Erweiterungen (Roadmap)

* Automatische Rezeptempfehlungen (initial regelbasiert, später KI-gestützt).
* Automatisches Haltbarkeitsmanagement mit Benachrichtigungen.
* Verbrauchsanalysen und Berichte.
* Preisvergleiche und Familien-Sharing-Funktionen.
* IoT-Integration (z.B. mit smarten Kühlschränken).

---

## 7. Monetarisierung

Für die lokale Test-App nicht relevant.

---

## 8. Datenschutz und Sicherheit

* **Datensparsamkeit:** Nur notwendige Daten werden verarbeitet.
* **Sicherer Umgang mit API-Schlüsseln:** Google Cloud API-Schlüssel müssen **serverseitig** gehandhabt werden und dürfen nicht im Frontend exponiert werden.
* **Sensible Daten:** Für lokale Tests sollten keine echten, sensiblen Benutzerdaten verwendet werden.
* **Transparente Richtlinien:** Für eine produktive Version sind klare Datenschutzrichtlinien erforderlich.

---

## 9. Technische Dokumentation & Referenzen

* [React Documentation](https://react.dev/docs/getting-started.html)
* [Vite Documentation](https://vitejs.dev/guide/)
* [Express.js Documentation](https://expressjs.com/)
* [NeDB Documentation](https://github.com/louischatriot/nedb)
* [LowDB Documentation](https://github.com/typicode/lowdb)
* [Google Cloud Vision API Documentation](https://cloud.google.com/vision/docs)
* [Google Cloud Node.js Client Libraries (für Vision API)](https://cloud.google.com/nodejs/docs/reference/libraries)

---

## 10. Design und UI-Prinzipien

* **Minimalistisch & Intuitiv:** Ein klares, aufgeräumtes Design, das die Benutzerfreundlichkeit in den Vordergrund stellt.
* **Schnelle Ladezeiten:** Optimierung der Assets und des Codes für schnelle Ladezeiten.
* **Flüssige Animationen:** Einsatz von Animationen zur Verbesserung des Nutzererlebnisses, ohne die Performance zu beeinträchtigen.

---

## 11. Performance

* **Bildanalyse:** Ziel < 5 Sekunden für die gesamte Roundtrip-Zeit (Frontend -> Backend -> Vision API -> Backend -> Frontend).
* **Bildladezeiten:** Optimierung für schnelle Ladezeiten von Bildern im UI (< 2 Sekunden).
* **API-Antwortzeiten (lokales Backend):** Das lokale Backend sollte API-Anfragen (ohne die Zeit für externe Cloud-Aufrufe) in < 500 ms verarbeiten können.
* **Gleichzeitige Nutzer:** Für lokale Tests nicht relevant.

---

## 12. Fehlerbehandlung & Logging

* **Lokales Logging:** Implementierung von robustem Logging im Node.js-Backend (z.B. mit `console.log` oder einer einfachen Logging-Bibliothek), um Fehler und wichtige Ereignisse zu protokollieren, insbesondere bei der Kommunikation mit der Google Cloud Vision API.
* **Standardisierte API-Fehlerantworten:** Das Backend sollte klare und standardisierte Fehlerantworten für das Frontend bereitstellen.
* **Klare Fehlermeldungen:** Das Frontend sollte nutzerfreundliche Fehlermeldungen anzeigen.

---

## Nächste Schritte für den AI-Agent:

1.  **Initiales Setup:** Richte ein neues Projektverzeichnis ein, das getrennte Ordner für `frontend` und `backend` enthält.
2.  **Backend-Grundgerüst:** Erstelle ein Node.js/Express.js-Projekt im `backend`-Ordner. Implementiere eine grundlegende REST-API, die zumindest eine Route für den Bild-Upload bereitstellt.
3.  **Google Cloud Vision API-Integration (Backend):** Integriere die Google Cloud Vision API in das Backend. Achte darauf, dass die Authentifizierung über eine Service Account JSON-Key-Datei erfolgt, die über Umgebungsvariablen geladen wird.
4.  **Frontend-Grundgerüst:** Erstelle ein React-Projekt mit Vite im `frontend`-Ordner. Implementiere eine einfache UI für den Bild-Upload.
5.  **Kommunikation Frontend-Backend:** Stelle sicher, dass das Frontend Bilder an die entsprechende Backend-Route senden kann.
6.  **Lokale Datenbank-Integration:** Richte NeDB oder LowDB im Backend ein, um grundlegende Inventardaten zu speichern.
7.  **Testen:** Stelle sicher, dass die lokale Anwendung gestartet werden kann, Bilder hochgeladen werden können, die Vision API korrekt aufgerufen wird und die Ergebnisse im Frontend angezeigt werden.

Fragen zur Klärung vor der Implementierung?