'use strict';

const dgram = require('dgram');
const axios = require('axios');

// Smart Light receiver configuration (matching the C example)
// IPv6 address and UDP port for receiving smart light events.
const HOST_IPV6 = 'aaaa::1';
const UDP_PORT = 8843;
// API endpoint to forward smart light event data.
const API_ENDPOINT = 'http://localhost:5000/api/sensor-events';

// Create an IPv6 UDP socket.
const udpSocket = dgram.createSocket('udp6');

// When the UDP socket starts listening, log the active address and port.
udpSocket.on('listening', () => {
  const address = udpSocket.address();
  console.log(`[Smart Light UDP Receiver] Listening on [${address.address}]:${address.port}`);
});

// Handle incoming UDP messages.
udpSocket.on('message', (message, remoteInfo) => {
  console.log(`\n########## UDP Message Received ##########`);
  console.log(`From: ${remoteInfo.address}:${remoteInfo.port}`);
  
  let eventData;
  try {
    // Parse the incoming message as JSON.
    eventData = JSON.parse(message.toString());

    // Log key details from the smart light event payload.
    console.log(`Device Type: ${eventData.deviceType}`);
    console.log(`Event ID:    ${eventData.eventID}`);
    console.log(`Event Type:  ${eventData.eventType}`);
    console.log(`Metadata:    ${eventData.metadata}`);
  } catch (parseError) {
    console.error('Error parsing UDP message as JSON:', parseError.message);
    return; // Skip further processing if JSON parsing fails.
  }

  // Forward the parsed smart light event via HTTP POST to the backend API.
  axios.post(API_ENDPOINT, eventData)
    .then(response => {
      console.log('HTTP POST successful. Server responded with:', response.data);
      console.log('Confirmation: Smart light event forwarded successfully.');
    })
    .catch(httpError => {
      console.error('Error forwarding smart light event via HTTP POST:', httpError.message);
    });
});

// Handle any UDP socket errors explicitly.
udpSocket.on('error', (err) => {
  console.error(`UDP socket error: ${err.message}`);
  udpSocket.close();
});

// Bind the UDP socket to the specified IPv6 address and UDP port.
udpSocket.bind(UDP_PORT, HOST_IPV6, () => {
  console.log(`[Smart Light UDP Receiver] Socket bound to [${HOST_IPV6}]:${UDP_PORT}`);
});
