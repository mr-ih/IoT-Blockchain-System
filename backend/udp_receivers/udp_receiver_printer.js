'use strict';

const dgram = require('dgram');
const axios = require('axios');

// UDP and API configuration (matching the printer sensor C example)
const HOST_IPV6 = 'aaaa::1';               // IPv6 address for binding (and destination in sender)
const UDP_PORT = 8845;                     // UDP port to receive printer sensor data
const API_ENDPOINT = 'http://localhost:5000/api/sensor-events'; // Backend API endpoint

// Create an IPv6 UDP socket for the printer sensor receiver
const udpSocket = dgram.createSocket('udp6');

// When the UDP socket starts listening, log the active address and port
udpSocket.on('listening', () => {
  const address = udpSocket.address();
  console.log(`[Printer Sensor UDP Receiver] Listening on [${address.address}]:${address.port}`);
});

// Handle incoming UDP messages (acting like the cb_receive_udp() callback in the C code)
udpSocket.on('message', (message, remote) => {
  console.log(`\n########## UDP Message Received ##########`);
  console.log(`From: ${remote.address}:${remote.port}`);
  
  let eventData;
  try {
    // Parse the incoming message as JSON
    eventData = JSON.parse(message.toString());

    // Log key details specific to the printer event
    console.log(`Device Type: ${eventData.deviceType}`);
    console.log(`Event ID:    ${eventData.eventID}`);
    console.log(`Event Type:  ${eventData.eventType}`);
    console.log(`Metadata:    ${eventData.metadata}`);
  } catch (parseError) {
    console.error('Error parsing UDP message as JSON:', parseError.message);
    return; // Skip further processing if JSON parsing fails
  }

  // Forward the parsed printer event via HTTP POST to the backend API
  axios.post(API_ENDPOINT, eventData)
    .then(response => {
      console.log('HTTP POST successful. Server responded with:', response.data);
      console.log('Confirmation: Printer event forwarded successfully.');
    })
    .catch(httpError => {
      console.error('Error forwarding printer event via HTTP POST:', httpError.message);
    });
});

// Handle any UDP socket errors explicitly
udpSocket.on('error', (err) => {
  console.error(`UDP socket error: ${err.message}`);
  udpSocket.close();
});

// Bind the UDP socket to the specified IPv6 address and UDP port
udpSocket.bind(UDP_PORT, HOST_IPV6, () => {
  console.log(`[Printer Sensor UDP Receiver] Socket bound to [${HOST_IPV6}]:${UDP_PORT}`);
});
