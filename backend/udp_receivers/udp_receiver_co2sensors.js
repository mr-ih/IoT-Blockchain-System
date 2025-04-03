'use strict';

const dgram = require('dgram');
const axios = require('axios');

// UDP and API configuration (matching the CO₂ sensor C example)
const HOST_IPV6 = 'aaaa::1';               // IPv6 address for binding and as destination
const UDP_PORT = 8849;                     // UDP port to receive CO₂ sensor data
const API_ENDPOINT = 'http://localhost:5000/api/sensor-events'; // Backend API endpoint

// Create an IPv6 UDP socket
const udpSocket = dgram.createSocket('udp6');

// When the UDP socket starts listening, log the active address and port
udpSocket.on('listening', () => {
  const address = udpSocket.address();
  console.log(`[CO₂ Sensor UDP Receiver] Listening on [${address.address}]:${address.port}`);
});

// Handle incoming UDP messages
udpSocket.on('message', (message, remote) => {
  console.log(`\n########## UDP Message Received ##########`);
  console.log(`From: ${remote.address}:${remote.port}`);
  
  let sensorData;
  try {
    // Attempt to parse the incoming UDP message as JSON
    sensorData = JSON.parse(message.toString());
    
    // Log key details from the CO₂ sensor event payload
    console.log(`Sensor Type: ${sensorData.deviceType}`);
    console.log(`Event ID:    ${sensorData.eventID}`);
    console.log(`Event Type:  ${sensorData.eventType}`);
    console.log(`Metadata:    ${sensorData.metadata}`);
  } catch (parseError) {
    console.error('Error parsing UDP message as JSON:', parseError.message);
    return; // Skip further processing if JSON parsing fails
  }

  // Forward the parsed CO₂ sensor event via HTTP POST to the backend API
  axios.post(API_ENDPOINT, sensorData)
    .then(response => {
      console.log('HTTP POST successful. Server responded with:', response.data);
      console.log('Confirmation: CO₂ sensor event forwarded successfully.');
    })
    .catch(httpError => {
      console.error('Error forwarding CO₂ sensor event via HTTP POST:', httpError.message);
    });
});

// Handle any UDP socket errors explicitly
udpSocket.on('error', (err) => {
  console.error(`UDP socket error: ${err.message}`);
  udpSocket.close();
});

// Bind the UDP socket to the specified IPv6 address and port
udpSocket.bind(UDP_PORT, HOST_IPV6, () => {
  console.log(`[CO₂ Sensor UDP Receiver] Socket bound to [${HOST_IPV6}]:${UDP_PORT}`);
});
