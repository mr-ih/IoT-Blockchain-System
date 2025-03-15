const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sensorRoutes = require('./routes/sensors');

const app = express();

// Enable Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse JSON request bodies
app.use(bodyParser.json());

// Route requests for sensor data
app.use('/sensors', sensorRoutes);

// Basic health-check endpoint
app.get('/', (req, res) => {
  res.send('API is running. Use /sensors to access sensor endpoints.');
});

// Start the server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API is running on port ${PORT}`);
});

