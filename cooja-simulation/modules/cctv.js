'use strict';

const dgram = require('dgram');
const socket = dgram.createSocket('udp6');

// Define network parameters to align with the C code
const HOST_IPV6 = 'aaaa::1';    // IPv6 address for both binding and destination
const PORT_OUT = 5555;          // Local port (similar to UDP_PORT_OUT)
const PORT_CENTRAL = 8842;      // Destination UDP port (similar to UDP_PORT_CENTRAL)

let eventCounter = 1;

// Bind the socket to our local IPv6 address and port.
socket.bind(PORT_OUT, HOST_IPV6, () => {
  const address = socket.address();
  console.log(`[UDP Sender] Bound to ${address.address}:${address.port}`);
});

// This function prepares and sends a CCTV event as a JSON payload over UDP.
function sendCctvEvent() {
  // Build the JSON payload dynamically.
  const payload = {
    eventID: `cctv_${String(eventCounter).padStart(3, '0')}`,
    deviceType: "cctv",
    deviceID: "cam_101",
    timestamp: "2025-03-14T11:00:00Z",
    eventType: "motion_detected",
    location: "Parking Lot A",
    metadata: `imageReference:img_202503141100_${String(eventCounter).padStart(3, '0')}.jpg`
  };

  const message = Buffer.from(JSON.stringify(payload));

  console.log("Sending CCTV event data to UDP Server:", payload);

  // Send the message to the UDP server (the border router or similar device).
  socket.send(message, 0, message.length, PORT_CENTRAL, HOST_IPV6, (err) => {
    if (err) {
      console.error("Error sending UDP message:", err);
    }
  });

  eventCounter++;  // Increment the event counter for subsequent events.
}

// Set a periodic timer – every 2 seconds (similar to CLOCK_REPORT in C).
setInterval(sendCctvEvent, 2000);