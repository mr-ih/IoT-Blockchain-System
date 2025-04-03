'use strict';

const dgram = require('dgram');
const axios = require('axios');

// Create an IPv6 UDP socket
const udpSocket = dgram.createSocket('udp6');

// Configuration
const SENSOR_UDP_PORT = 8844; // Unique UDP port assigned to this sensor
const HOST_IPV6 = 'aaaa::1';  // IPv6 address to listen on
const API_ENDPOINT = 'http://localhost:5000/api/sensor-events';  // Backend API endpoint

// When a UDP message is received, handle it
udpSocket.on('message', (message, remote) => {
  console.log(`Received UDP message from ${remote.address}:${remote.port}`);
  
  let parsedData;
  try {
    // Attempt to parse the incoming UDP message as JSON
    parsedData = JSON.parse(message.toString());
    
    // Log detailed sensor event information
    console.log(`Sensor type: ${parsedData.deviceType}`);
    console.log(`Event ID: ${parsedData.eventID}`);
    console.log(`Event type: ${parsedData.eventType}`);
  } catch (parseError) {
    console.error('Error parsing UDP message as JSON:', parseError.message);
    return; // Skip further processing if parsing fails
  }
  
  // Forward the parsed message via an HTTP POST request using axios
  axios.post(API_ENDPOINT, parsedData)
    .then((response) => {
      console.log(`HTTP POST successful. Server responded with: ${response.data}`);
      console.log('Confirmation: Event forwarded successfully to backend API.');
    })
    .catch((httpError) => {
      console.error('Error forwarding message via HTTP POST:', httpError.message);
    });
});

// Handle UDP socket errors explicitly
udpSocket.on('error', (err) => {
  console.error(`UDP socket error: ${err.message}`);
  udpSocket.close();
});

// Bind the UDP socket to the specified IPv6 address and unique UDP port
udpSocket.bind(SENSOR_UDP_PORT, HOST_IPV6, () => {
  console.log(`UDP Receiver is listening on [${HOST_IPV6}]:${SENSOR_UDP_PORT}`);
});
