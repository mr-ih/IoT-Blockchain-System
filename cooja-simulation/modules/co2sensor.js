'use strict';

const dgram = require('dgram');
const udpSocket = dgram.createSocket('udp6');

// Define UDP ports and IPv6 address to match the C CO₂ sensor example:
const UDP_PORT_CENTRAL = 8849;   // Destination (central) UDP port for CO₂ sensor data
const UDP_PORT_OUT = 5555;       // Local (outgoing) UDP port (matches UDP_PORT_OUT)
const HOST_IPV6 = 'aaaa::1';     // IPv6 address for both binding and destination

// Event counter (mimicking "event_counter" in the C example)
let eventCounter = 1;

// When the socket starts listening, log the active address & port
udpSocket.on('listening', () => {
  const address = udpSocket.address();
  console.log(`[UDP - IPv6] Socket is listening on ${address.address}:${address.port}`);
});

// The "message" event handler mimics the cb_receive_udp() callback in the C code
udpSocket.on('message', (message, remote) => {
  console.log("########## UDP #########");
  console.log(`Received from ${remote.address}:${remote.port} - ${message}`);
});

// Bind the UDP socket to the local port and IPv6 address
udpSocket.bind(UDP_PORT_OUT, HOST_IPV6, () => {
  console.log(`[UDP - IPv6] Socket bound to ${HOST_IPV6}:${UDP_PORT_OUT}`);
});

/**
 * Generate a random CO₂ level between 400 and 2000 PPM.
 *
 * @returns {number} Random CO₂ level.
 */
function getRandomCO2() {
  return Math.floor(Math.random() * (2000 - 400 + 1)) + 400;
}

/**
 * Generate a random temperature between 15 and 30 °C.
 *
 * @returns {number} Random temperature.
 */
function getRandomTemperature() {
  return Math.floor(Math.random() * (30 - 15 + 1)) + 15;
}

/**
 * Function to send a CO₂ sensor event (similar to the periodic JSON payload in the C example).
 */
function sendCO2SensorEvent() {
  // Generate random sensor readings.
  const co2Level = getRandomCO2();
  const temperature = getRandomTemperature();

  // Dynamic sensor event payload:
  const eventData = {
    eventID: `sensor_${String(eventCounter).padStart(3, '0')}`,
    deviceType: "co2_sensor",
    deviceID: "sensor_03",
    timestamp: "2025-03-14T20:00:00Z",  // You can replace with new Date().toISOString() for current time
    eventType: "reading",
    location: "Building C - Lab",
    metadata: `co2Level:${co2Level}; temperature:${temperature}`
  };

  // Convert the JSON object to a Buffer
  const messageBuffer = Buffer.from(JSON.stringify(eventData));

  console.log("Sending CO₂ sensor event to UDP Server at border router...", eventData);

  // Send the UDP message to the server using the designated IPv6 address and port
  udpSocket.send(messageBuffer, 0, messageBuffer.length, UDP_PORT_CENTRAL, HOST_IPV6, (err) => {
    if (err) {
      console.error("Error sending UDP message:", err);
    } else {
      console.log("Message sent successfully.");
    }
  });

  eventCounter++; // Increment the event counter for the next event
}

// Set a periodic timer (every 2000 ms = 2 seconds) to send the event
setInterval(sendCO2SensorEvent, 2000);
