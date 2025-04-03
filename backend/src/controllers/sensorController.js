// Import environment variables (if needed for further configuration)
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

// Import FabricClient from the services folder
const FabricClient = require('../services/fabricClient');

// Instantiate FabricClient
const fabricClient = new FabricClient();

/**
 * Helper function to validate required fields.
 * Returns a string detailing the missing fields if any exist, or null if all are present.
 *
 * @param {Object} obj - The object to validate.
 * @param {Array} requiredFields - The list of required field names.
 * @returns {string|null} - Error message if missing fields, otherwise null.
 */
const validateRequiredFields = (obj, requiredFields) => {
  const missingFields = requiredFields.filter(field => obj[field] == null);
  if (missingFields.length > 0) {
    return `Missing required fields: ${missingFields.join(', ')}`;
  }
  return null;
};

/**
 * Express controller function to handle incoming sensor event submissions.
 * It expects a POST request with a JSON body containing:
 *   - eventID
 *   - deviceID
 *   - eventType
 *   - metadata
 *   - location
 *
 * On success, it records the sensor data onto the blockchain via FabricClient.
 * On error, it returns appropriate HTTP response statuses with a clear message.
 *
 * Success response example:
 * {
 *   "status": "success",
 *   "message": "Sensor event successfully recorded on blockchain.",
 *   "result": "<transaction-result>"
 * }
 *
 * Error response example:
 * {
 *   "status": "error",
 *   "message": "<error-description>"
 * }
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
const submitSensorEvent = async (req, res) => {
  // Define the required fields for the sensor data
  const requiredFields = ['eventID', 'deviceID', 'eventType', 'metadata', 'location'];
  // Validate request body for required fields
  const validationError = validateRequiredFields(req.body, requiredFields);
  if (validationError) {
    return res.status(400).json({
      status: 'error',
      message: validationError
    });
  }

  try {
    // Extract sensor data from the request body
    const sensorData = req.body;
    console.log('Received sensor data:', sensorData);

    // Submit the sensor data to the blockchain using FabricClient
    const result = await fabricClient.submitSensorData(sensorData);
    
    // Return a clear success response with the transaction result
    return res.status(200).json({
      status: 'success',
      message: 'Sensor event successfully recorded on blockchain.',
      result: result
    });
  } catch (error) {
    console.error('Error recording sensor event:', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'An error occurred while recording the sensor event.'
    });
  }
};

module.exports = {
  submitSensorEvent
};
