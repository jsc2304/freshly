# Freshly Backend

Node.js/Express.js backend for the Freshly smart fridge and shopping list application.

## Features

- **Image Analysis**: Integration with Google Cloud Vision API for food recognition
- **Inventory Management**: Local database for tracking fridge contents
- **Shopping List Generation**: Automatic list generation based on inventory analysis
- **RESTful API**: Clean API endpoints for frontend communication
- **Local Database**: LowDB for simple, file-based data storage
- **Logging**: Winston for structured logging
- **File Upload**: Multer for handling image uploads

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Project with Vision API enabled
- Service Account JSON key file

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Configure Google Cloud Vision API:
   - Place your service account JSON key file in the project root
   - Update the `GOOGLE_APPLICATION_CREDENTIALS` path in `.env`

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

The server will start on `http://localhost:3001` by default.

## API Endpoints

### Health Check
- `GET /api/health` - Server health status

### Image Analysis
- `POST /api/upload-image` - Upload and analyze image
  - Body: `multipart/form-data` with `image` field
  - Returns: Analysis results and processed items

### Inventory Management
- `GET /api/inventory` - Get all inventory items
- `POST /api/inventory` - Add new inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### Shopping List
- `GET /api/shopping-list` - Get shopping list items
- `POST /api/shopping-list/generate` - Generate shopping list based on inventory
- `PUT /api/shopping-list/:id` - Update shopping list item

## Project Structure

```
backend/
├── services/
│   ├── visionService.js      # Google Cloud Vision API integration
│   ├── inventoryService.js   # Inventory management logic
│   └── shoppingListService.js # Shopping list generation
├── data/                     # Local database files
├── uploads/                  # Temporary file uploads
├── logs/                     # Application logs
├── server.js                 # Main server file
└── package.json             # Dependencies and scripts
```

## Configuration

### Environment Variables

- `GOOGLE_APPLICATION_CREDENTIALS` - Path to service account JSON key
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Frontend URL for CORS (default: http://localhost:5173)

### Google Cloud Setup

1. Create a Google Cloud Project
2. Enable the Vision API
3. Create a Service Account with Vision API permissions
4. Download the JSON key file
5. Set the file path in environment variables

## Development

The backend uses:
- **Express.js** for the web server
- **LowDB** for local JSON database
- **Google Cloud Vision API** for image analysis
- **Winston** for logging
- **Multer** for file uploads
- **CORS** for cross-origin requests

## Error Handling

The API returns standardized error responses:
```json
{
  "error": "Error description",
  "message": "Detailed error message",
  "code": "ERROR_CODE"
}
```

## Logging

Logs are written to:
- Console (development)
- `error.log` (errors only)
- `combined.log` (all logs)

## Mock Data

If Google Cloud Vision API is not configured, the service will return mock data for testing purposes.
