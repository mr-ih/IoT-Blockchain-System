'use strict';

const dgram = require('dgram');
const axios = require('axios');

// IPv6 address and port configuration for the CCTV sensor receiver
const HOST_IPV6 = 'aaaa::1';  // IPv6 address to listen on
const RECEIVER_PORT = 8842;    // UDP port assigned to receive CCTV sensor messages

// Backend API endpoint to forward the sensor events
const API_ENDPOINT = 'http://localhost:5000/api/sensor-events';

// Create an IPv6 UDP socket
const udpSocket = dgram.createSocket('udp6');

// When the UDP socket starts listening, log the address and port
udpSocket.on('listening', () => {
  const address = udpSocket.address();
  console.log(`[CCTV UDP Receiver] Listening on [${address.address}]:${address.port}`);
});

// Handle incoming UDP messages
udpSocket.on('message', (message, remote) => {
  console.log(`\n########## Received UDP Message ##########`);
  console.log(`From: ${remote.address}:${remote.port}`);

  let sensorData;
  try {
    // Attempt to parse the incoming UDP message as JSON
    sensorData = JSON.parse(message.toString());
    
    // Log key details of the event
    console.log(`Sensor Type: ${sensorData.deviceType}`);
    console.log(`Event ID:    ${sensorData.eventID}`);
    console.log(`Event Type:  ${sensorData.eventType}`);
  } catch (parseError) {
    console.error('Error parsing UDP message as JSON:', parseError.message);
    return;  // Stop processing if the message is not valid JSON
  }

  // Forward the parsed event data via HTTP POST to the backend API
  axios.post(API_ENDPOINT, sensorData)
    .then(response => {
      console.log('HTTP POST successful:');
      console.log(`Backend response: ${response.data}`);
      console.log('Confirmation: CCTV event forwarded successfully.');
    })
    .catch(httpError => {
      console.error('Error forwarding event via HTTP POST:', httpError.message);
    });
});

// Handle UDP socket errors
udpSocket.on('error', (err) => {
  console.error(`UDP socket error: ${err.message}`);
  udpSocket.close();
});

// Bind the socket to the specified IPv6 address and port
udpSocket.bind(RECEIVER_PORT, HOST_IPV6);
