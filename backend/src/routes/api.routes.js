// Import Express and sensorController dependencies
const express = require('express');
const sensorController = require('../controllers/sensorController');

// Create an Express Router instance
const router = express.Router();

// Define the HTTP POST route at '/sensor-events'
// When a POST request is received at this endpoint,
// the submitSensorEvent method in sensorController is called.
router.post('/sensor-events', sensorController.submitSensorEvent);

// Export the router instance for use in the main application.
module.exports = router;
