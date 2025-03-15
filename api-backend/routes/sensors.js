const express = require('express');
const { connect } = require('../blockchain/connection');

const router = express.Router();

// Route to add sensor data to the blockchain
router.post('/add', async (req, res) => {
  const { sensorId, value } = req.body;

  try {
    // Connect to the Fabric network and get the contract instance
    const { gateway, contract } = await connect();
    // Submit the transaction to add sensor data (ensure your chaincode has this function)
    await contract.submitTransaction('addSensorData', sensorId, value.toString());
    // Disconnect the gateway after transaction is submitted
    await gateway.disconnect();
    res.json({ message: 'Sensor data stored' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to query sensor data from the blockchain
router.get('/:sensorId', async (req, res) => {
  try {
    // Connect to the Fabric network and get the contract instance
    const { gateway, contract } = await connect();
    // Evaluate the transaction to get sensor data (ensure your chaincode has this function)
    const result = await contract.evaluateTransaction('getSensorData', req.params.sensorId);
    // Disconnect the gateway after querying
    await gateway.disconnect();
    res.json(JSON.parse(result.toString()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

