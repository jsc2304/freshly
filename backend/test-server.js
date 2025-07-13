const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/health', (req, res) => {
  console.log('Health check requested');
  res.json({ status: 'OK', message: 'Freshly Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Freshly Backend running on http://localhost:${PORT}`);
});

console.log('Starting server...');
